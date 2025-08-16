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

// Real-time Status Component - Hacker Style
function LiveStatusIndicator() {
  const { isConnected, connectionStatus, lastUpdate, refreshData, reconnect } = useAdminWebSocket();
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'connected': 
        return { 
          color: 'text-green-400', 
          bg: 'bg-green-500/10', 
          border: 'border-green-400/40',
          icon: <Wifi className="h-4 w-4" />,
          label: '[ONLINE]',
          pulse: true
        };
      case 'connecting': 
        return { 
          color: 'text-yellow-400', 
          bg: 'bg-yellow-500/10', 
          border: 'border-yellow-400/40',
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
          label: '[CONNECTING]',
          pulse: true
        };
      case 'disconnected': 
      case 'error': 
      default: 
        return { 
          color: 'text-red-400', 
          bg: 'bg-red-500/10', 
          border: 'border-red-400/40',
          icon: <WifiOff className="h-4 w-4" />,
          label: '[OFFLINE]',
          pulse: false
        };
    }
  };

  const statusConfig = getStatusConfig(connectionStatus);

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '00:00:00';
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="relative overflow-hidden bg-black border border-green-400/30 shadow-2xl shadow-green-400/10 font-mono">
        {/* Animated border */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-green-400/5 to-green-400/10 animate-pulse"></div>
        
        <CardContent className="relative z-10 pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Status Indicator */}
              <div className={`flex items-center space-x-3 px-3 py-1 ${statusConfig.bg} ${statusConfig.border} border`}>
                <div className={`${statusConfig.color} ${statusConfig.pulse ? 'animate-pulse' : ''}`}>
                  {statusConfig.icon}
                </div>
                <span className={`font-bold text-xs tracking-wider ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
                {statusConfig.pulse && (
                  <div className={`w-1 h-1 ${statusConfig.color.replace('text-', 'bg-')} animate-ping`}></div>
                )}
              </div>
              
              {/* Divider */}
              <div className="h-6 w-px bg-green-400/30"></div>
              
              {/* Last Update */}
              <div className="flex items-center space-x-2 text-green-400/80">
                <Activity className="h-3 w-3" />
                <span className="text-xs tracking-wide">
                  LAST_SYNC: <span className="text-green-400">{formatTime(lastUpdate)}</span>
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  className="bg-black border-green-400/40 text-green-400 hover:bg-green-400/10 transition-all duration-300 text-xs font-mono tracking-wider"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  REFRESH
                </Button>
              </motion.div>
              
              {!isConnected && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={reconnect}
                    className="bg-black border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10 text-xs font-mono tracking-wider"
                  >
                    <Wifi className="h-3 w-3 mr-1" />
                    RECONNECT
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Status Messages */}
          <AnimatePresence>
            {isConnected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 px-3 py-2 bg-green-500/5 border border-green-400/20 text-xs text-green-400 flex items-center tracking-wide"
              >
                <Zap className="h-3 w-3 mr-2 animate-pulse" />
                &gt;&gt; REAL_TIME_MONITORING_ACTIVE :: SECURE_CHANNEL_ESTABLISHED
              </motion.div>
            )}
            
            {!isConnected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 px-3 py-2 bg-yellow-500/5 border border-yellow-400/20 text-xs text-yellow-400 flex items-center tracking-wide"
              >
                <AlertTriangle className="h-3 w-3 mr-2" />
                &gt;&gt; CONNECTION_LOST :: SWITCHING_TO_MANUAL_MODE
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Hacker Terminal Stats Card Component
function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'up',
  delay = 0 
}: { 
  title: string; 
  value: string | number; 
  change?: string; 
  icon: any; 
  trend?: 'up' | 'down' | 'neutral';
  delay?: number;
}) {
  const getTrendConfig = () => {
    switch (trend) {
      case 'up': return { color: 'text-green-400', bg: 'bg-green-500/5', border: 'border-green-400/30' };
      case 'down': return { color: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-400/30' };
      default: return { color: 'text-cyan-400', bg: 'bg-cyan-500/5', border: 'border-cyan-400/30' };
    }
  };

  const trendConfig = getTrendConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.05, y: -3 }}
      className="group cursor-pointer"
    >
      <Card className={`relative overflow-hidden bg-black ${trendConfig.border} border hover:border-green-400/50 transition-all duration-300 h-full font-mono`}>
        {/* Terminal-style animated border */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-transparent to-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <CardContent className="relative z-10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 ${trendConfig.bg} ${trendConfig.border} border rounded`}>
              <Icon className={`h-4 w-4 ${trendConfig.color}`} />
            </div>
            {change && (
              <Badge className={`${trendConfig.color} bg-black ${trendConfig.border} border text-xs font-mono tracking-wider`}>
                {change}
              </Badge>
            )}
          </div>
          
          <div>
            <h3 className={`text-xl md:text-2xl font-bold ${trendConfig.color} mb-1 group-hover:animate-pulse transition-all duration-300 font-mono tracking-wider`}>
              {value}
            </h3>
            <p className="text-green-400/70 text-xs uppercase tracking-widest">[{title.toUpperCase()}]</p>
          </div>
          
          {/* Terminal cursor effect */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-2 h-2 bg-green-400 animate-ping"></div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Terminal User Activity View
function UserCampaignsView({ userId }: { userId: string }) {
  const { data: userCampaigns = [] } = useQuery<any[]>({
    queryKey: [`/api/admin/users/${userId}/campaigns`],
  });

  const { data: userContributions = [] } = useQuery<any[]>({
    queryKey: [`/api/admin/users/${userId}/contributions`],
  });

  return (
    <div className="space-y-6 font-mono">
      <div>
        <h4 className="font-bold text-sm text-green-400 mb-4 flex items-center tracking-wider">
          <Crown className="h-4 w-4 mr-2 text-yellow-400" />
          [CAMPAIGNS_CREATED: {userCampaigns.length}]
        </h4>
        {userCampaigns.length === 0 ? (
          <p className="text-green-400/60 text-xs">// NO_CAMPAIGNS_FOUND</p>
        ) : (
          <div className="space-y-2">
            {userCampaigns.map((campaign: any) => (
              <motion.div 
                key={campaign.id} 
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-3 bg-black border border-green-400/30 hover:border-green-400/50 transition-all duration-300"
              >
                <div>
                  <p className="font-semibold text-green-400 text-sm">{campaign.title}</p>
                  <p className="text-xs text-green-400/70">
                    GOAL: ${campaign.goalAmount} | RAISED: ${campaign.currentAmount || '0'}
                  </p>
                </div>
                <Badge className={`font-mono text-xs ${
                  campaign.status === "active" 
                    ? "bg-green-500/20 text-green-400 border-green-400/30" 
                    : campaign.status === "pending_approval" 
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-400/30" 
                    : "bg-red-500/20 text-red-400 border-red-400/30"
                } border`}>
                  [{campaign.status.toUpperCase().replace('_', '_')}]
                </Badge>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h4 className="font-bold text-sm text-green-400 mb-4 flex items-center tracking-wider">
          <Wallet className="h-4 w-4 mr-2 text-cyan-400" />
          [CONTRIBUTIONS_MADE: {userContributions.length}]
        </h4>
        {userContributions.length === 0 ? (
          <p className="text-green-400/60 text-xs">// NO_CONTRIBUTIONS_FOUND</p>
        ) : (
          <div className="space-y-2">
            {userContributions.map((contribution: any) => (
              <motion.div 
                key={contribution.id} 
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-3 bg-black border border-green-400/30 hover:border-green-400/50 transition-all duration-300"
              >
                <div>
                  <p className="font-semibold text-green-400 text-sm">${contribution.amount} {contribution.currency}</p>
                  <p className="text-xs text-green-400/70">
                    {new Date(contribution.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30 border font-mono text-xs">
                  [{contribution.paymentMethod.toUpperCase()}]
                </Badge>
              </motion.div>
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
  
  // State management
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

  // User management mutations (keeping all existing functionality)
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
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      return apiRequest("PUT", `/api/admin/users/${userId}/reset-password`, { newPassword });
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

  const notifyUserMutation = useMutation({
    mutationFn: async ({ userId, notification }: { userId: string; notification: any }) => {
      return apiRequest("POST", `/api/admin/users/${userId}/notify`, notification);
    },
    onSuccess: () => {
      toast({ title: "Notification sent successfully" });
      setNotifyUserDialog(false);
      setNotificationTitle("");
      setNotificationMessage("");
    },
    onError: () => {
      toast({ title: "Failed to send notification", variant: "destructive" });
    }
  });

  // Campaign management mutations
  const approveCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      return apiRequest("PUT", `/api/admin/campaigns/${campaignId}/approve`, {});
    },
    onSuccess: () => {
      toast({ title: "Campaign approved successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
    },
    onError: () => {
      toast({ title: "Failed to approve campaign", variant: "destructive" });
    }
  });

  const rejectCampaignMutation = useMutation({
    mutationFn: async ({ campaignId, reason }: { campaignId: string; reason: string }) => {
      return apiRequest("PUT", `/api/admin/campaigns/${campaignId}/reject`, { reason });
    },
    onSuccess: () => {
      toast({ title: "Campaign rejected successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
    },
    onError: () => {
      toast({ title: "Failed to reject campaign", variant: "destructive" });
    }
  });

  return (
    <div className="min-h-screen text-green-400 font-mono">
      {/* Terminal Header */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black border-b border-green-400/30 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-400/10 border border-green-400/30 rounded">
                  <Command className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-green-400 tracking-wider">
                    [ADMIN_CONTROL_MATRIX]
                  </h1>
                  <p className="text-xs text-green-400/70 uppercase tracking-widest">SYSTEM_ACCESS_LEVEL_9</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="bg-black border-green-400/40 text-green-400 hover:bg-green-400/10 text-xs font-mono tracking-wider">
                <Bell className="h-3 w-3 mr-1" />
                ALERTS
              </Button>
              <Button variant="outline" size="sm" className="bg-black border-green-400/40 text-green-400 hover:bg-green-400/10 text-xs font-mono tracking-wider">
                <Settings className="h-3 w-3 mr-1" />
                CONFIG
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <LiveStatusIndicator />

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TabsList className="grid w-full grid-cols-7 mb-6 bg-black border border-green-400/30 p-1">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-green-400/20 data-[state=active]:border-green-400/50 data-[state=active]:text-green-400 text-green-400/60 font-mono text-xs tracking-wider transition-all duration-300 border border-transparent"
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                SYS_OVERVIEW
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="data-[state=active]:bg-green-400/20 data-[state=active]:border-green-400/50 data-[state=active]:text-green-400 text-green-400/60 font-mono text-xs tracking-wider transition-all duration-300 border border-transparent"
              >
                <Users className="h-3 w-3 mr-1" />
                USER_DB
              </TabsTrigger>
              <TabsTrigger 
                value="campaigns" 
                className="data-[state=active]:bg-green-400/20 data-[state=active]:border-green-400/50 data-[state=active]:text-green-400 text-green-400/60 font-mono text-xs tracking-wider transition-all duration-300 border border-transparent"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                CAMPAIGNS
              </TabsTrigger>
              <TabsTrigger 
                value="flagged" 
                className="data-[state=active]:bg-red-400/20 data-[state=active]:border-red-400/50 data-[state=active]:text-red-400 text-green-400/60 font-mono text-xs tracking-wider transition-all duration-300 border border-transparent"
              >
                <Flag className="h-3 w-3 mr-1" />
                FLAGGED
              </TabsTrigger>
              <TabsTrigger 
                value="reinstatements" 
                className="data-[state=active]:bg-yellow-400/20 data-[state=active]:border-yellow-400/50 data-[state=active]:text-yellow-400 text-green-400/60 font-mono text-xs tracking-wider transition-all duration-300 border border-transparent"
              >
                <UserCheck className="h-3 w-3 mr-1" />
                APPEALS
              </TabsTrigger>
              <TabsTrigger 
                value="kyc" 
                className="data-[state=active]:bg-cyan-400/20 data-[state=active]:border-cyan-400/50 data-[state=active]:text-cyan-400 text-green-400/60 font-mono text-xs tracking-wider transition-all duration-300 border border-transparent"
              >
                <Shield className="h-3 w-3 mr-1" />
                KYC_VERIFY
              </TabsTrigger>
              <TabsTrigger 
                value="transactions" 
                className="data-[state=active]:bg-purple-400/20 data-[state=active]:border-purple-400/50 data-[state=active]:text-purple-400 text-green-400/60 font-mono text-xs tracking-wider transition-all duration-300 border border-transparent"
              >
                <Wallet className="h-3 w-3 mr-1" />
                BLOCKCHAIN
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <StatsCard
                title="Total Users"
                value={adminStats.totalUsers.toLocaleString()}
                change="+12.5%"
                icon={Users}
                trend="up"
                delay={0}
              />
              <StatsCard
                title="Active Campaigns"
                value={adminStats.totalCampaigns}
                change="+8.2%"
                icon={TrendingUp}
                trend="up"
                delay={0.1}
              />
              <StatsCard
                title="Pending KYC"
                value={adminStats.pendingKyc}
                change={adminStats.pendingKyc > 0 ? "Needs attention" : "All clear"}
                icon={Shield}
                trend={adminStats.pendingKyc > 0 ? "neutral" : "up"}
                delay={0.2}
              />
              <StatsCard
                title="Flagged Users"
                value={adminStats.flaggedUsers}
                change={adminStats.flaggedUsers > 0 ? "Monitor closely" : "All good"}
                icon={Flag}
                trend={adminStats.flaggedUsers > 0 ? "down" : "up"}
                delay={0.3}
              />
              <StatsCard
                title="Appeals Pending"
                value={adminStats.pendingReinstatements}
                change="Review required"
                icon={UserCheck}
                trend="neutral"
                delay={0.4}
              />
              <StatsCard
                title="Total Raised"
                value={`₹${(parseFloat(adminStats.totalRaised) * 75).toFixed(0)}L`}
                change="+24.7%"
                icon={DollarSign}
                trend="up"
                delay={0.5}
              />
            </div>

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="backdrop-blur-xl bg-black/20 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-400" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Latest platform events and admin actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.slice(0, 5).map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center space-x-4 p-3 bg-black/20 rounded-lg border border-white/5"
                      >
                        <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
                          <Users className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">
                            New user registration: {user.firstName} {user.lastName}
                          </p>
                          <p className="text-gray-400 text-sm">
                            KYC Status: {user.kycStatus} • {user.email}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-blue-400/50 text-blue-400">
                          {new Date().toLocaleDateString()}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-black/20 p-6 rounded-xl border border-white/10"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">User Management</h2>
                <p className="text-gray-400">Manage all platform users and their permissions</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="pl-10 bg-black/20 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 min-w-[250px]"
                  />
                </div>
                
                <Select value={flaggedFilter} onValueChange={setFlaggedFilter}>
                  <SelectTrigger className="bg-black/20 border-white/20 text-white min-w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20">
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="flagged">Flagged Only</SelectItem>
                    <SelectItem value="normal">Normal Only</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </motion.div>

            {/* Enhanced Users Table */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="backdrop-blur-xl bg-black/20 border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-gray-300 font-semibold">User</TableHead>
                      <TableHead className="text-gray-300 font-semibold">KYC Status</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Status</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Joined</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {user.firstName?.charAt(0) || user.username.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-semibold">
                                {user.firstName} {user.lastName} 
                                {user.role === 'admin' && <Crown className="inline h-4 w-4 ml-1 text-amber-400" />}
                              </p>
                              <p className="text-gray-400 text-sm">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.kycStatus === "approved" ? "default" : user.kycStatus === "pending" ? "secondary" : "destructive"}
                            className="capitalize"
                          >
                            {user.kycStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.isFlagged ? (
                            <Badge variant="destructive" className="flex items-center w-fit">
                              <Flag className="h-3 w-3 mr-1" />
                              Flagged
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-green-400/50 text-green-400">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setUserCampaignsDialog(true);
                              }}
                              className="bg-black/20 border-white/20 text-white hover:bg-white/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {user.isFlagged ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => unflagUserMutation.mutate(user.id)}
                                className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setFlagUserDialog(true);
                                }}
                                className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                              >
                                <Flag className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setEditedUser({
                                  firstName: user.firstName,
                                  lastName: user.lastName,
                                  email: user.email,
                                });
                                setEditUserDialog(true);
                              }}
                              className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/20 p-6 rounded-xl border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Campaign Management</h2>
              <p className="text-gray-400">Review and manage all crowdfunding campaigns</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid gap-6"
            >
              {campaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="backdrop-blur-xl bg-black/20 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-xl font-bold text-white">{campaign.title}</h3>
                            <Badge variant={campaign.status === "active" ? "default" : campaign.status === "pending_approval" ? "secondary" : "destructive"}>
                              {campaign.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-gray-400 mb-4">{campaign.description}</p>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Goal</p>
                              <p className="text-white font-semibold">${campaign.goalAmount}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Raised</p>
                              <p className="text-green-400 font-semibold">${campaign.currentAmount || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Category</p>
                              <p className="text-white font-semibold capitalize">{campaign.category}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Created</p>
                              <p className="text-white font-semibold">
                                {new Date(campaign.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {campaign.status === "pending_approval" && (
                          <div className="flex space-x-2 ml-4">
                            <Button
                              onClick={() => approveCampaignMutation.mutate(campaign.id)}
                              className="bg-green-500 hover:bg-green-600"
                              disabled={approveCampaignMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => rejectCampaignMutation.mutate({ campaignId: campaign.id, reason: "Policy violation" })}
                              disabled={rejectCampaignMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="flagged" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/20 p-6 rounded-xl border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                <Flag className="h-6 w-6 mr-2 text-red-400" />
                Flagged Users Management
              </h2>
              <p className="text-gray-400">Monitor and manage users requiring attention</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid gap-4"
            >
              {users.filter(user => user.isFlagged).map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="backdrop-blur-xl bg-red-500/5 border border-red-500/20 hover:border-red-500/30 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {user.firstName?.charAt(0) || user.username.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-white font-bold">{user.firstName} {user.lastName}</h3>
                            <p className="text-gray-400">{user.email}</p>
                            <p className="text-red-400 text-sm">Reason: {user.flagReason || "Policy violation"}</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => unflagUserMutation.mutate(user.id)}
                            className="bg-green-500 hover:bg-green-600"
                            disabled={unflagUserMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Unflag
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              setSelectedUser(user);
                              setDeleteUserDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              {users.filter(user => user.isFlagged).length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">All Clear!</h3>
                  <p className="text-gray-400">No flagged users at the moment</p>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="reinstatements" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/20 p-6 rounded-xl border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                <UserCheck className="h-6 w-6 mr-2 text-amber-400" />
                Reinstatement Appeals
              </h2>
              <p className="text-gray-400">Review and process user appeal requests</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid gap-4"
            >
              {reinstatementRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="backdrop-blur-xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/30 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-bold">Appeal Request</h3>
                            <p className="text-amber-400 text-sm">
                              Status: {request.status} • {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="border-amber-400/50 text-amber-400">
                            {request.status}
                          </Badge>
                        </div>
                        
                        <div className="bg-black/20 p-4 rounded-lg">
                          <p className="text-gray-300">{request.reason}</p>
                        </div>
                        
                        {request.status === "pending" && (
                          <div className="flex space-x-2">
                            <Button className="bg-green-500 hover:bg-green-600">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve Appeal
                            </Button>
                            <Button variant="destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject Appeal
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              {reinstatementRequests.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <UserCheck className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Appeals</h3>
                  <p className="text-gray-400">No reinstatement requests pending</p>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="kyc" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/20 p-6 rounded-xl border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                <Shield className="h-6 w-6 mr-2 text-cyan-400" />
                KYC Verification Center
              </h2>
              <p className="text-gray-400">Verify user identities and approve KYC applications</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <KYCManagement />
            </motion.div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/20 p-6 rounded-xl border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                <Wallet className="h-6 w-6 mr-2 text-purple-400" />
                Blockchain Transactions
              </h2>
              <p className="text-gray-400">Monitor all Avalanche blockchain transactions</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AdminAvalancheTransactions />
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Dialogs - Enhanced with dark theme */}
        <Dialog open={userCampaignsDialog} onOpenChange={setUserCampaignsDialog}>
          <DialogContent className="bg-black/90 border-white/20 text-white backdrop-blur-xl max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                User Details: {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Complete overview of user activity and campaigns
              </DialogDescription>
            </DialogHeader>
            {selectedUser && <UserCampaignsView userId={selectedUser.id} />}
          </DialogContent>
        </Dialog>

        <Dialog open={flagUserDialog} onOpenChange={setFlagUserDialog}>
          <DialogContent className="bg-black/90 border-white/20 text-white backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Flag User</DialogTitle>
              <DialogDescription className="text-gray-400">
                Provide a reason for flagging this user
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter reason for flagging..."
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="bg-black/20 border-white/20 text-white placeholder:text-gray-400"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setFlagUserDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedUser && flagUserMutation.mutate({ userId: selectedUser.id, reason: flagReason })}
                  disabled={!flagReason.trim() || flagUserMutation.isPending}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Flag User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={editUserDialog} onOpenChange={setEditUserDialog}>
          <DialogContent className="bg-black/90 border-white/20 text-white backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update user information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="First Name"
                value={editedUser.firstName || ""}
                onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                className="bg-black/20 border-white/20 text-white placeholder:text-gray-400"
              />
              <Input
                placeholder="Last Name"
                value={editedUser.lastName || ""}
                onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
                className="bg-black/20 border-white/20 text-white placeholder:text-gray-400"
              />
              <Input
                placeholder="Email"
                value={editedUser.email || ""}
                onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                className="bg-black/20 border-white/20 text-white placeholder:text-gray-400"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditUserDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedUser && editUserMutation.mutate({ userId: selectedUser.id, updates: editedUser })}
                  disabled={editUserMutation.isPending}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Update User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteUserDialog} onOpenChange={setDeleteUserDialog}>
          <DialogContent className="bg-black/90 border-white/20 text-white backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-red-400">Delete User</DialogTitle>
              <DialogDescription className="text-gray-400">
                This action cannot be undone. This will permanently delete the user account and all associated data.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeleteUserDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedUser && deleteUserMutation.mutate(selectedUser.id)}
                disabled={deleteUserMutation.isPending}
              >
                Delete User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}