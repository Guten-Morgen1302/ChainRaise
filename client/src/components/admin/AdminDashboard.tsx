import { useState } from "react";
import KYCManagement from "./KYCManagement";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Shield,
  DollarSign,
  Flag,
  UserX,
  Edit,
  Trash2,
  Mail,
  RefreshCw,
  Download,
  Search,
  Filter,
  Wifi,
  WifiOff
} from "lucide-react";
import type { User, Campaign, ReinstatementRequest } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/navigation/BackButton";
import { useAdminWebSocket } from "@/hooks/useAdminWebSocket";

// Component to display user's campaigns
function UserCampaignsView({ userId }: { userId: string }) {
  const { data: userCampaigns = [] } = useQuery<any[]>({
    queryKey: [`/api/admin/users/${userId}/campaigns`],
  });

  const { data: userContributions = [] } = useQuery<any[]>({
    queryKey: [`/api/admin/users/${userId}/contributions`],
  });

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-4">Created Campaigns ({userCampaigns.length})</h4>
        {userCampaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No campaigns created</p>
        ) : (
          <div className="space-y-2">
            {userCampaigns.map((campaign: any) => (
              <div key={campaign.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{campaign.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Goal: ${campaign.goalAmount} | Raised: ${campaign.currentAmount || '0'}
                  </p>
                </div>
                <Badge variant={campaign.status === "active" ? "default" : campaign.status === "pending_approval" ? "secondary" : "destructive"}>
                  {campaign.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h4 className="font-medium mb-4">Contributions Made ({userContributions.length})</h4>
        {userContributions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contributions made</p>
        ) : (
          <div className="space-y-2">
            {userContributions.map((contribution: any) => (
              <div key={contribution.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">${contribution.amount} {contribution.currency}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(contribution.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">{contribution.paymentMethod}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface AdminStats {
  totalUsers: number;
  totalCampaigns: number;
  pendingKyc: number;
  flaggedUsers: number;
  pendingReinstatements: number;
  totalRaised: string;
}

export function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("overview");
  
  // WebSocket connection for real-time updates
  const { isConnected, lastUpdate } = useAdminWebSocket();
  const [userFilter, setUserFilter] = useState("");
  const [flaggedFilter, setFlaggedFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [flagUserDialog, setFlagUserDialog] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [notifyUserDialog, setNotifyUserDialog] = useState(false);
  const [suspendUserDialog, setSuspendUserDialog] = useState(false);
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState(false);
  const [userCampaignsDialog, setUserCampaignsDialog] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("info");
  const [suspendReason, setSuspendReason] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [editedUser, setEditedUser] = useState<any>({});

  // Fetch real data from APIs
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/admin/campaigns"],
  });

  const { data: reinstatementRequests = [] } = useQuery<ReinstatementRequest[]>({
    queryKey: ["/api/admin/reinstatement-requests"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Calculate admin stats from real data
  const adminStats: AdminStats = {
    totalUsers: users.length,
    totalCampaigns: campaigns.length,
    pendingKyc: users.filter(user => user.kycStatus === "pending").length,
    flaggedUsers: users.filter(user => user.isFlagged).length,
    pendingReinstatements: reinstatementRequests.filter(req => req.status === "pending").length,
    totalRaised: (stats as any)?.totalRaised || "0"
  };

  // Filter users based on search and flags
  const filteredUsers = users.filter(user => {
    const matchesSearch = userFilter === "" || 
      user.email.toLowerCase().includes(userFilter.toLowerCase()) ||
      (user.firstName + " " + user.lastName).toLowerCase().includes(userFilter.toLowerCase());
    
    const matchesFlag = flaggedFilter === "all" ||
      (flaggedFilter === "flagged" && user.isFlagged) ||
      (flaggedFilter === "normal" && !user.isFlagged);
      
    return matchesSearch && matchesFlag;
  });

  // User management mutations
  const flagUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      return apiRequest("PUT", `/api/admin/users/${userId}/flag`, { reason });
    },
    onSuccess: () => {
      toast({ title: "User flagged successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setFlagUserDialog(false);
      setFlagReason("");
    },
    onError: () => {
      toast({ title: "Failed to flag user", variant: "destructive" });
    }
  });

  const unflagUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("PUT", `/api/admin/users/${userId}/unflag`, {});
    },
    onSuccess: () => {
      toast({ title: "User unflagged successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({ title: "Failed to unflag user", variant: "destructive" });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/admin/users/${userId}`, {});
    },
    onSuccess: () => {
      toast({ title: "User deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setDeleteUserDialog(false);
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    }
  });

  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      return apiRequest("PUT", `/api/admin/users/${userId}/suspend`, { reason });
    },
    onSuccess: () => {
      toast({ title: "User suspended successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSuspendUserDialog(false);
      setSuspendReason("");
    },
    onError: () => {
      toast({ title: "Failed to suspend user", variant: "destructive" });
    }
  });

  const unsuspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("PUT", `/api/admin/users/${userId}/unsuspend`, {});
    },
    onSuccess: () => {
      toast({ title: "User unsuspended successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({ title: "Failed to unsuspend user", variant: "destructive" });
    }
  });

  const editUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      return apiRequest("PUT", `/api/admin/users/${userId}`, updates);
    },
    onSuccess: () => {
      toast({ title: "User updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditUserDialog(false);
      setEditedUser({});
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    }
  });

  const notifyUserMutation = useMutation({
    mutationFn: async ({ userId, title, message, type }: { userId: string; title: string; message: string; type: string }) => {
      return apiRequest("POST", `/api/admin/users/${userId}/notify`, { title, message, type });
    },
    onSuccess: () => {
      toast({ title: "Notification sent successfully" });
      setNotifyUserDialog(false);
      setNotificationTitle("");
      setNotificationMessage("");
      setNotificationType("info");
    },
    onError: () => {
      toast({ title: "Failed to send notification", variant: "destructive" });
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      return apiRequest("POST", `/api/admin/users/${userId}/reset-password`, { newPassword });
    },
    onSuccess: () => {
      toast({ title: "Password reset successfully" });
      setResetPasswordDialog(false);
      setNewPassword("");
    },
    onError: () => {
      toast({ title: "Failed to reset password", variant: "destructive" });
    }
  });

  const reinstatementMutation = useMutation({
    mutationFn: async ({ id, status, adminComments }: { id: string; status: string; adminComments?: string }) => {
      return apiRequest("PUT", `/api/admin/reinstatement-requests/${id}`, { status, adminComments });
    },
    onSuccess: () => {
      toast({ title: "Reinstatement request updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reinstatement-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({ title: "Failed to update reinstatement request", variant: "destructive" });
    }
  });

  const handleCampaignAction = async (campaignId: string, action: "approve" | "reject") => {
    try {
      await apiRequest("PUT", `/api/admin/campaigns/${campaignId}/status`, { 
        status: action === "approve" ? "active" : "rejected" 
      });
      toast({
        title: "Campaign Updated",
        description: `Campaign has been ${action}ed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update campaign.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, campaigns, and platform settings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Live Updates</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 font-medium">Offline</span>
              </>
            )}
          </div>
          <BackButton to="/dashboard" label="Back to Dashboard" />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">All campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.pendingKyc}</div>
            <p className="text-xs text-muted-foreground">Requires review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Users</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{adminStats.flaggedUsers}</div>
            <p className="text-xs text-muted-foreground">Restricted access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalRaised} ETH</div>
            <p className="text-xs text-muted-foreground">Platform lifetime</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns ({campaigns.length})</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Users ({adminStats.flaggedUsers})</TabsTrigger>
          <TabsTrigger value="reinstatements">Reinstatements ({adminStats.pendingReinstatements})</TabsTrigger>
          <TabsTrigger value="kyc">KYC Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>
                Recent activity and platform health metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Activity</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• 5 new campaigns submitted today</p>
                      <p>• 12 users completed KYC verification</p>
                      <p>• $45,230 raised in the last 24 hours</p>
                      <p>• 23 successful transactions processed</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">System Health</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Database: Healthy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Payment Processing: Online</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Blockchain Sync: Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Comprehensive user account management and monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={flaggedFilter} onValueChange={setFlaggedFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="normal">Normal Users</SelectItem>
                    <SelectItem value="flagged">Flagged Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.kycStatus === "approved" ? "default" : 
                                  user.kycStatus === "pending" ? "secondary" : "destructive"}
                        >
                          {user.kycStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isFlagged ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Flag className="h-3 w-3" />
                            Flagged
                          </Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt || "").toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>User Profile: {user.firstName} {user.lastName}</DialogTitle>
                                <DialogDescription>
                                  Detailed user information and activity
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">KYC Status</label>
                                    <p className="text-sm text-muted-foreground">{user.kycStatus}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Wallet Address</label>
                                    <p className="text-sm text-muted-foreground font-mono">{user.walletAddress || "Not connected"}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Join Date</label>
                                    <p className="text-sm text-muted-foreground">{new Date(user.createdAt || "").toLocaleDateString()}</p>
                                  </div>
                                </div>
                                {user.isFlagged && (
                                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                                    <div className="flex items-center gap-2">
                                      <Flag className="h-4 w-4 text-red-600" />
                                      <span className="font-medium text-red-800">Account Flagged</span>
                                    </div>
                                    <p className="text-sm text-red-700 mt-1">
                                      Reason: {user.flaggedReason}
                                    </p>
                                    <p className="text-xs text-red-600 mt-1">
                                      Flagged by: {user.flaggedBy} on {new Date(user.flaggedAt || "").toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          {!user.isFlagged ? (
                            <Dialog open={flagUserDialog && selectedUser?.id === user.id} onOpenChange={(open) => {
                              setFlagUserDialog(open);
                              if (open) setSelectedUser(user);
                              else { setSelectedUser(null); setFlagReason(""); }
                            }}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600">
                                  <Flag className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Flag User Account</DialogTitle>
                                  <DialogDescription>
                                    Flag this user account to restrict their access to platform features.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Reason for flagging</label>
                                    <Textarea
                                      value={flagReason}
                                      onChange={(e) => setFlagReason(e.target.value)}
                                      placeholder="Explain why this user is being flagged..."
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setFlagUserDialog(false)}>
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => flagUserMutation.mutate({ userId: user.id, reason: flagReason })}
                                      disabled={!flagReason.trim() || flagUserMutation.isPending}
                                    >
                                      {flagUserMutation.isPending ? "Flagging..." : "Flag User"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => unflagUserMutation.mutate(user.id)}
                              disabled={unflagUserMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Dialog open={editUserDialog && selectedUser?.id === user.id} onOpenChange={(open) => {
                            setEditUserDialog(open);
                            if (open) {
                              setSelectedUser(user);
                              setEditedUser({
                                firstName: user.firstName || "",
                                lastName: user.lastName || "",
                                email: user.email,
                                walletAddress: user.walletAddress || ""
                              });
                            } else {
                              setSelectedUser(null);
                              setEditedUser({});
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" data-testid={`button-edit-user-${user.id}`}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit User Details</DialogTitle>
                                <DialogDescription>
                                  Update user's basic information
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">First Name</label>
                                    <Input
                                      value={editedUser.firstName || ""}
                                      onChange={(e) => setEditedUser((prev: any) => ({ ...prev, firstName: e.target.value }))}
                                      data-testid="input-edit-firstname"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Last Name</label>
                                    <Input
                                      value={editedUser.lastName || ""}
                                      onChange={(e) => setEditedUser((prev: any) => ({ ...prev, lastName: e.target.value }))}
                                      data-testid="input-edit-lastname"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Email</label>
                                  <Input
                                    value={editedUser.email || ""}
                                    onChange={(e) => setEditedUser((prev: any) => ({ ...prev, email: e.target.value }))}
                                    data-testid="input-edit-email"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Wallet Address</label>
                                  <Input
                                    value={editedUser.walletAddress || ""}
                                    onChange={(e) => setEditedUser((prev: any) => ({ ...prev, walletAddress: e.target.value }))}
                                    placeholder="0x..."
                                    data-testid="input-edit-wallet"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setEditUserDialog(false)}>
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => editUserMutation.mutate({ userId: user.id, updates: editedUser })}
                                    disabled={editUserMutation.isPending}
                                    data-testid="button-save-user-edit"
                                  >
                                    {editUserMutation.isPending ? "Saving..." : "Save Changes"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog open={notifyUserDialog && selectedUser?.id === user.id} onOpenChange={(open) => {
                            setNotifyUserDialog(open);
                            if (open) setSelectedUser(user);
                            else {
                              setSelectedUser(null);
                              setNotificationTitle("");
                              setNotificationMessage("");
                              setNotificationType("info");
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" data-testid={`button-notify-user-${user.id}`}>
                                <Mail className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Send Notification</DialogTitle>
                                <DialogDescription>
                                  Send a direct message to {user.firstName} {user.lastName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Title</label>
                                  <Input
                                    value={notificationTitle}
                                    onChange={(e) => setNotificationTitle(e.target.value)}
                                    placeholder="Notification title"
                                    data-testid="input-notification-title"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Message</label>
                                  <Textarea
                                    value={notificationMessage}
                                    onChange={(e) => setNotificationMessage(e.target.value)}
                                    placeholder="Your message..."
                                    rows={4}
                                    data-testid="textarea-notification-message"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Type</label>
                                  <Select value={notificationType} onValueChange={setNotificationType}>
                                    <SelectTrigger data-testid="select-notification-type">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="info">Info</SelectItem>
                                      <SelectItem value="success">Success</SelectItem>
                                      <SelectItem value="warning">Warning</SelectItem>
                                      <SelectItem value="error">Error</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setNotifyUserDialog(false)}>
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => notifyUserMutation.mutate({ 
                                      userId: user.id, 
                                      title: notificationTitle, 
                                      message: notificationMessage, 
                                      type: notificationType 
                                    })}
                                    disabled={!notificationTitle || !notificationMessage || notifyUserMutation.isPending}
                                    data-testid="button-send-notification"
                                  >
                                    {notifyUserMutation.isPending ? "Sending..." : "Send Notification"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog open={userCampaignsDialog && selectedUser?.id === user.id} onOpenChange={(open) => {
                            setUserCampaignsDialog(open);
                            if (open) setSelectedUser(user);
                            else setSelectedUser(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" data-testid={`button-view-campaigns-${user.id}`}>
                                <TrendingUp className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>User Campaigns: {user.firstName} {user.lastName}</DialogTitle>
                                <DialogDescription>
                                  All campaigns created by this user
                                </DialogDescription>
                              </DialogHeader>
                              <UserCampaignsView userId={user.id} />
                            </DialogContent>
                          </Dialog>
                          
                          {user.isFlagged && user.flaggedReason?.startsWith("SUSPENDED:") ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => unsuspendUserMutation.mutate(user.id)}
                              disabled={unsuspendUserMutation.isPending}
                              data-testid={`button-unsuspend-user-${user.id}`}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Dialog open={suspendUserDialog && selectedUser?.id === user.id} onOpenChange={(open) => {
                              setSuspendUserDialog(open);
                              if (open) setSelectedUser(user);
                              else {
                                setSelectedUser(null);
                                setSuspendReason("");
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-orange-600" data-testid={`button-suspend-user-${user.id}`}>
                                  <UserX className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Suspend User Account</DialogTitle>
                                  <DialogDescription>
                                    Temporarily suspend this user's account access
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Reason for suspension</label>
                                    <Textarea
                                      value={suspendReason}
                                      onChange={(e) => setSuspendReason(e.target.value)}
                                      placeholder="Explain why this user is being suspended..."
                                      data-testid="textarea-suspend-reason"
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setSuspendUserDialog(false)}>
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => suspendUserMutation.mutate({ userId: user.id, reason: suspendReason })}
                                      disabled={!suspendReason.trim() || suspendUserMutation.isPending}
                                      data-testid="button-confirm-suspend"
                                    >
                                      {suspendUserMutation.isPending ? "Suspending..." : "Suspend User"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          
                          <Dialog open={resetPasswordDialog && selectedUser?.id === user.id} onOpenChange={(open) => {
                            setResetPasswordDialog(open);
                            if (open) setSelectedUser(user);
                            else {
                              setSelectedUser(null);
                              setNewPassword("");
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" data-testid={`button-reset-password-${user.id}`}>
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reset User Password</DialogTitle>
                                <DialogDescription>
                                  Set a new password for {user.firstName} {user.lastName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">New Password</label>
                                  <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password (min 6 characters)"
                                    data-testid="input-new-password"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setResetPasswordDialog(false)}>
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => resetPasswordMutation.mutate({ userId: user.id, newPassword })}
                                    disabled={newPassword.length < 6 || resetPasswordMutation.isPending}
                                    data-testid="button-confirm-reset-password"
                                  >
                                    {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              window.open(`/api/admin/users/${user.id}/export`, '_blank');
                            }}
                            data-testid={`button-export-user-${user.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          <Dialog open={deleteUserDialog && selectedUser?.id === user.id} onOpenChange={(open) => {
                            setDeleteUserDialog(open);
                            if (open) setSelectedUser(user);
                            else setSelectedUser(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600" data-testid={`button-delete-user-${user.id}`}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete User Account</DialogTitle>
                                <DialogDescription>
                                  This action cannot be undone. This will permanently delete {user.firstName} {user.lastName}'s account and all associated data.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setDeleteUserDialog(false)}>
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => deleteUserMutation.mutate(user.id)}
                                  disabled={deleteUserMutation.isPending}
                                  data-testid="button-confirm-delete-user"
                                >
                                  {deleteUserMutation.isPending ? "Deleting..." : "Delete Permanently"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Management</CardTitle>
              <CardDescription>
                Review and manage campaign submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Goal</TableHead>
                    <TableHead>Raised</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.slice(0, 5).map((campaign: any) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="font-medium">{campaign.title}</div>
                      </TableCell>
                      <TableCell>{campaign.creatorId}</TableCell>
                      <TableCell>${campaign.goalAmount}</TableCell>
                      <TableCell>${campaign.currentAmount}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={campaign.status === "active" ? "default" : 
                                  campaign.status === "pending_approval" ? "secondary" : "destructive"}
                        >
                          {campaign.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {campaign.status === "pending_approval" && (
                            <>
                              <Button 
                                size="sm"
                                onClick={() => handleCampaignAction(campaign.id, "approve")}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleCampaignAction(campaign.id, "reject")}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Users</CardTitle>
              <CardDescription>
                Manage users with restricted access and review flagging reasons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Flagged Reason</TableHead>
                    <TableHead>Flagged By</TableHead>
                    <TableHead>Date Flagged</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(user => user.isFlagged).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm truncate" title={user.flaggedReason || ""}>
                          {user.flaggedReason}
                        </p>
                      </TableCell>
                      <TableCell>{user.flaggedBy}</TableCell>
                      <TableCell>
                        {user.flaggedAt ? new Date(user.flaggedAt).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600"
                            onClick={() => unflagUserMutation.mutate(user.id)}
                            disabled={unflagUserMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Unflag
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {users.filter(user => user.isFlagged).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No flagged users</p>
                  <p className="text-sm">All users currently have normal access</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reinstatements">
          <Card>
            <CardHeader>
              <CardTitle>Reinstatement Requests</CardTitle>
              <CardDescription>
                Review and process user reinstatement requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Additional Info</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reinstatementRequests.map((request) => {
                    const user = users.find(u => u.id === request.userId);
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="font-medium">
                            {user ? `${user.firstName} ${user.lastName}` : "Unknown User"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user?.email}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm truncate" title={request.reason}>
                            {request.reason}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm truncate" title={request.additionalInfo || ""}>
                            {request.additionalInfo || "N/A"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={request.status === "approved" ? "default" : 
                                    request.status === "pending" ? "secondary" : "destructive"}
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(request.createdAt || "").toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {request.status === "pending" && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => reinstatementMutation.mutate({ id: request.id, status: "approved" })}
                                disabled={reinstatementMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => reinstatementMutation.mutate({ id: request.id, status: "rejected" })}
                                disabled={reinstatementMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {request.status !== "pending" && (
                            <Badge variant="outline">
                              {request.status === "approved" ? "Approved" : "Rejected"}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {reinstatementRequests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reinstatement requests</p>
                  <p className="text-sm">User reinstatement requests will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc">
          <KYCManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}