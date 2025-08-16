import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  WifiOff,
  Wallet,
  BarChart3,
  Activity,
  UserCheck,
  Zap,
  Globe,
  Crown,
  Settings,
  Bell,
  Command
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
import { useAdminWebSocket } from "@/hooks/useAdminWebSocket";
import { AdminAvalancheTransactions } from "./AdminAvalancheTransactions";

// Clean Status Component
function LiveStatusIndicator() {
  const { isConnected, connectionStatus, lastUpdate, refreshData, reconnect } = useAdminWebSocket();
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'connected': 
        return { 
          color: 'text-green-600', 
          bg: 'bg-green-50', 
          border: 'border-green-200',
          icon: <Wifi className="h-4 w-4" />,
          label: 'Online'
        };
      case 'connecting': 
        return { 
          color: 'text-yellow-600', 
          bg: 'bg-yellow-50', 
          border: 'border-yellow-200',
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
          label: 'Connecting'
        };
      case 'disconnected': 
      default:
        return { 
          color: 'text-red-600', 
          bg: 'bg-red-50', 
          border: 'border-red-200',
          icon: <WifiOff className="h-4 w-4" />,
          label: 'Offline'
        };
    }
  };

  const config = getStatusConfig(connectionStatus);

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bg} ${config.border}`}>
      <div className={config.color}>
        {config.icon}
      </div>
      <span className={`text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
      {lastUpdate && (
        <span className="text-xs text-gray-500 ml-2">
          Last update: {new Date(lastUpdate).toLocaleTimeString()}
        </span>
      )}
      {!isConnected && (
        <Button
          size="sm"
          variant="outline"
          onClick={reconnect}
          className="ml-2 h-6 px-2 text-xs"
        >
          Retry
        </Button>
      )}
    </div>
  );
}

export function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users = [], refetch: refetchUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: campaigns = [], refetch: refetchCampaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/admin/campaigns"],
  });

  const { data: reinstatementRequests = [] } = useQuery<ReinstatementRequest[]>({
    queryKey: ["/api/admin/reinstatement-requests"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const flagUserMutation = useMutation({
    mutationFn: async ({ userId, flag }: { userId: string; flag: boolean }) => {
      return apiRequest("POST", `/api/admin/users/${userId}/flag`, { flag });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
  });

  const approveCampaignMutation = useMutation({
    mutationFn: async ({ campaignId, approved }: { campaignId: string; approved: boolean }) => {
      return apiRequest("POST", `/api/admin/campaigns/${campaignId}/approve`, { approved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      toast({
        title: "Success",
        description: "Campaign status updated successfully",
      });
    },
  });

  const handleFlagUser = (userId: string, flag: boolean) => {
    flagUserMutation.mutate({ userId, flag });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleApproveCampaign = (campaignId: string, approved: boolean) => {
    approveCampaignMutation.mutate({ campaignId, approved });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Status</h2>
        <LiveStatusIndicator />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-gray-500">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCampaigns || 0}</div>
            <p className="text-xs text-gray-500">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalRaised || '0'}</div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.kycStatus === 'pending').length}</div>
            <p className="text-xs text-gray-500">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      {getStatusBadge(user.kycStatus || 'pending')}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Campaigns</CardTitle>
                <CardDescription>Latest campaign submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{campaign.title}</p>
                          <p className="text-xs text-gray-500">${campaign.fundingGoal} goal</p>
                        </div>
                      </div>
                      {getStatusBadge(campaign.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.kycStatus || 'pending')}</TableCell>
                      <TableCell>
                        <Badge variant={user.isFlagged ? 'destructive' : 'outline'}>
                          {user.isFlagged ? 'Flagged' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFlagUser(user.id, !user.isFlagged)}
                          >
                            {user.isFlagged ? <UserCheck className="h-4 w-4" /> : <Flag className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Management</CardTitle>
              <CardDescription>Review and approve campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Goal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campaign.title}</p>
                          <p className="text-sm text-gray-500 max-w-xs truncate">{campaign.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{campaign.creatorId}</TableCell>
                      <TableCell>${campaign.fundingGoal}</TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveCampaign(campaign.id, true)}
                            disabled={campaign.status === 'approved'}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveCampaign(campaign.id, false)}
                            disabled={campaign.status === 'rejected'}
                          >
                            <XCircle className="h-4 w-4" />
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

        <TabsContent value="kyc" className="space-y-6">
          <KYCManagement />
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-6">
          <AdminAvalancheTransactions />
        </TabsContent>
      </Tabs>
    </div>
  );
}