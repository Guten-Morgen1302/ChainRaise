import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Shield, LogOut, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuickUser {
  username: string;
  password: string;
  role: string;
  displayName: string;
}

const QUICK_USERS: QuickUser[] = [
  { username: "johntech", password: "password", role: "admin", displayName: "Admin User" },
  { username: "admin", password: "password", role: "admin", displayName: "Admin Account" },
];

export function UserSwitcher() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<string>("");
  
  const { data: currentUser } = useQuery({
    queryKey: ["/api/user"],
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      return apiRequest("POST", "/api/login", credentials);
    },
    onSuccess: (user) => {
      toast({
        title: "Login Successful",
        description: `Logged in as ${user.username} (${user.role || 'user'})`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc/applications"] });
      window.location.reload(); // Force full refresh to clear any cached data
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/logout", {});
    },
    onSuccess: () => {
      toast({
        title: "Logged Out",
        description: "Successfully logged out",
      });
      queryClient.clear();
      window.location.reload(); // Force full refresh
    }
  });

  const handleQuickLogin = (userKey: string) => {
    const user = QUICK_USERS.find(u => `${u.username}-${u.role}` === userKey);
    if (user) {
      loginMutation.mutate({
        username: user.username,
        password: user.password,
      });
    }
  };

  const getCurrentUserRole = () => {
    if (!currentUser) return null;
    return (currentUser as any).role || 'user';
  };

  const isAdmin = getCurrentUserRole() === 'admin';

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Account Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current User Info */}
        {currentUser ? (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{(currentUser as any).username}</p>
                <p className="text-sm text-muted-foreground">{(currentUser as any).email}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {isAdmin ? (
                    <>
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3 mr-1" />
                      User
                    </>
                  )}
                </Badge>
                {isAdmin && (
                  <Badge variant="outline" className="text-xs">
                    Full Access
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-muted-foreground">Not logged in</p>
          </div>
        )}

        {/* Quick Switch Options */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quick Login As:</label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Select account to switch to" />
            </SelectTrigger>
            <SelectContent>
              {QUICK_USERS.map((user) => (
                <SelectItem key={`${user.username}-${user.role}`} value={`${user.username}-${user.role}`}>
                  {user.displayName} ({user.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => handleQuickLogin(selectedUser)}
            disabled={!selectedUser || loginMutation.isPending}
            className="w-full"
            size="sm"
          >
            <LogIn className="h-4 w-4 mr-2" />
            {loginMutation.isPending ? "Switching..." : "Switch Account"}
          </Button>
        </div>

        {/* Admin Access Info */}
        {isAdmin && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              Admin Access Enabled
            </p>
            <p className="text-xs text-green-600 mt-1">
              You can access /admin, delete users, approve KYC, and manage campaigns
            </p>
          </div>
        )}

        {!isAdmin && currentUser && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              Regular User Access
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Limited to user functions. Switch to admin account for admin access.
            </p>
          </div>
        )}

        {/* Logout Button */}
        {currentUser && (
          <Button 
            variant="outline" 
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="w-full"
            size="sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        )}

        {/* Helpful Tips */}
        <div className="p-2 bg-muted/50 rounded text-xs text-muted-foreground">
          <p><strong>Tip:</strong> Use different browser windows (regular + incognito) to test both admin and user accounts simultaneously.</p>
        </div>
      </CardContent>
    </Card>
  );
}