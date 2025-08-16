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
          color: 'text-green-400 dark:text-green-300', 
          bg: 'bg-green-50 dark:bg-green-900/20', 
          border: 'border-green-200 dark:border-green-700',
          icon: <Wifi className="h-4 w-4" />,
          label: 'Online'
        };
      case 'connecting': 
        return { 
          color: 'text-yellow-500 dark:text-yellow-300', 
          bg: 'bg-yellow-50 dark:bg-yellow-900/20', 
          border: 'border-yellow-200 dark:border-yellow-700',
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
          label: 'Connecting'
        };
      case 'disconnected': 
      default:
        return { 
          color: 'text-red-500 dark:text-red-400', 
          bg: 'bg-red-50 dark:bg-red-900/20', 
          border: 'border-red-200 dark:border-red-700',
          icon: <WifiOff className="h-4 w-4" />,
          label: 'Offline'
        };
    }
  };

  const config = getStatusConfig(connectionStatus);

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm bg-gray-800/40 border border-gray-600/30 shadow-xl ${config.color}`}>
      <div className={config.color}>
        {config.icon}
      </div>
      <span className={`text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
      {lastUpdate && (
        <span className="text-xs text-gray-400 ml-2">
          {new Date(lastUpdate).toLocaleTimeString()}
        </span>
      )}
      {!isConnected && (
        <Button
          size="sm"
          variant="outline"
          onClick={reconnect}
          className="ml-2 h-6 px-2 text-xs bg-gray-700/50 border-gray-600 hover:bg-gray-600/50"
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
        return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white drop-shadow-sm">System Overview</h2>
        <LiveStatusIndicator />
      </div>

      {/* Glassmorphism Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="backdrop-blur-xl bg-gray-800/40 border border-gray-600/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-300">Total Users</h3>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{users.length}</div>
          <p className="text-xs text-gray-400">Registered accounts</p>
        </div>

        <div className="backdrop-blur-xl bg-gray-800/40 border border-gray-600/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-300">Active Campaigns</h3>
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{(stats as any)?.activeCampaigns || 0}</div>
          <p className="text-xs text-gray-400">Currently running</p>
        </div>

        <div className="backdrop-blur-xl bg-gray-800/40 border border-gray-600/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-300">Total Raised</h3>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">${(stats as any)?.totalRaised || '0'}</div>
          <p className="text-xs text-gray-400">All time</p>
        </div>

        <div className="backdrop-blur-xl bg-gray-800/40 border border-gray-600/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-300">Pending KYC</h3>
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{users.filter(u => u.kycStatus === 'pending').length}</div>
          <p className="text-xs text-gray-400">Awaiting review</p>
        </div>
      </div>

      {/* Glassmorphism Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
        <div className="backdrop-blur-xl bg-gray-800/40 border border-gray-600/30 rounded-2xl p-2 shadow-xl">
          <TabsList className="grid w-full grid-cols-5 bg-transparent gap-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700/70 data-[state=active]:text-white text-gray-400 transition-all duration-200">Overview</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gray-700/70 data-[state=active]:text-white text-gray-400 transition-all duration-200">Users</TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-gray-700/70 data-[state=active]:text-white text-gray-400 transition-all duration-200">Campaigns</TabsTrigger>
            <TabsTrigger value="kyc" className="data-[state=active]:bg-gray-700/70 data-[state=active]:text-white text-gray-400 transition-all duration-200">KYC</TabsTrigger>
            <TabsTrigger value="blockchain" className="data-[state=active]:bg-gray-700/70 data-[state=active]:text-white text-gray-400 transition-all duration-200">Blockchain</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Users - Glassmorphism */}
            <div className="backdrop-blur-xl bg-gray-800/40 border border-gray-600/30 rounded-2xl p-6 shadow-xl">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">Recent Users</h3>
                <p className="text-gray-400 text-sm">Latest user registrations</p>
              </div>
              <div className="space-y-4">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-700/30 border border-gray-600/20 hover:bg-gray-700/50 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.username}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    {getStatusBadge(user.kycStatus || 'pending')}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Campaigns - Glassmorphism */}
            <div className="backdrop-blur-xl bg-gray-800/40 border border-gray-600/30 rounded-2xl p-6 shadow-xl">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">Recent Campaigns</h3>
                <p className="text-gray-400 text-sm">Latest campaign submissions</p>
              </div>
              <div className="space-y-4">
                {campaigns.slice(0, 5).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-700/30 border border-gray-600/20 hover:bg-gray-700/50 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{campaign.title}</p>
                        <p className="text-xs text-gray-400">${campaign.goalAmount} goal</p>
                      </div>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>
                ))}
              </div>
            </div>
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
                          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{campaign.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{campaign.creatorId}</TableCell>
                      <TableCell>${campaign.goalAmount}</TableCell>
                      <TableCell>{getStatusBadge(campaign.status || 'pending')}</TableCell>
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