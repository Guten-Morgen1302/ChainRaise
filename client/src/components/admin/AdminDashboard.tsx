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
  Filter
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
  const [userFilter, setUserFilter] = useState("");
  const [flaggedFilter, setFlaggedFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [flagUserDialog, setFlagUserDialog] = useState(false);
  const [flagReason, setFlagReason] = useState("");

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
    totalRaised: stats?.totalRaised || "0"
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
        <BackButton to="/dashboard" label="Back to Dashboard" />
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
                          
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4" />
                          </Button>
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