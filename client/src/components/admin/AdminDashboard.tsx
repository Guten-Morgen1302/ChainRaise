import { useState } from "react";
import KYCManagement from "./KYCManagement";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Shield,
  DollarSign
} from "lucide-react";
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

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  kycStatus: string;
  createdAt: string;
}

interface Campaign {
  id: string;
  title: string;
  creatorId: string;
  status: string;
  goalAmount: string;
  currentAmount: string;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalCampaigns: number;
  pendingKyc: number;
  totalRaised: string;
}

export function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Mock admin stats - in real app would come from API
  const adminStats: AdminStats = {
    totalUsers: 1247,
    totalCampaigns: 89,
    pendingKyc: 23,
    totalRaised: "2,456,789"
  };

  // Mock users data - in real app would come from API
  const mockUsers: User[] = [
    {
      id: "1",
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      kycStatus: "pending",
      createdAt: new Date().toISOString()
    },
    {
      id: "2", 
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Smith",
      kycStatus: "approved",
      createdAt: new Date().toISOString()
    }
  ];

  // Mock campaigns data - in real app would come from API
  const { data: campaigns = [] } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  const handleKycUpdate = async (userId: string, status: "approved" | "rejected") => {
    try {
      await apiRequest("PUT", `/api/admin/kyc/${userId}`, { status });
      toast({
        title: "KYC Status Updated",
        description: `User KYC status has been ${status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update KYC status.",
        variant: "destructive",
      });
    }
  };

  const handleCampaignAction = async (campaignId: string, action: "approve" | "reject") => {
    try {
      await apiRequest("PUT", `/api/admin/campaigns/${campaignId}`, { 
        status: action === "approve" ? "active" : "rejected" 
      });
      toast({
        title: "Campaign Updated",
        description: `Campaign has been ${action}ed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.pendingKyc}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${adminStats.totalRaised}</div>
            <p className="text-xs text-muted-foreground">Platform lifetime</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
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
              <CardTitle>User Management & KYC</CardTitle>
              <CardDescription>
                Manage user accounts and KYC verification status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
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
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.kycStatus === "pending" && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleKycUpdate(user.id, "approved")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleKycUpdate(user.id, "rejected")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
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
                        <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {campaign.status === "pending" && (
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

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Monitoring</CardTitle>
              <CardDescription>
                Monitor blockchain and fiat transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Transaction monitoring interface</p>
                <p className="text-sm">Real-time transaction data will appear here</p>
              </div>
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