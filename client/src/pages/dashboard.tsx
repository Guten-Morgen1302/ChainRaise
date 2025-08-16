import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { KYCBadge } from "@/components/ui/kyc-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Campaign, Contribution } from "@shared/schema";
import { MainNavigation } from "@/components/navigation/MainNavigation";
import { ThreeBackground } from "@/components/three/ThreeBackground";
import Footer from "@/components/layout/footer";
import CampaignCard from "@/components/campaign/campaign-card";
import { 
  Plus, 
  TrendingUp, 
  Users, 
  Wallet, 
  Eye,
  Edit,
  Share2,
  BarChart3,
  Calendar,
  Target,
  Heart,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Lock,
  Settings,
  History,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: userCampaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/user/campaigns"],
    retry: false,
  });

  const { data: userContributions = [] } = useQuery<Contribution[]>({
    queryKey: ["/api/contributions"],
    retry: false,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    retry: false,
  });

  const { data: userNotifications = [] } = useQuery<{id: string, title: string, message: string, type: string, isRead: boolean, createdAt: string}[]>({
    queryKey: ["/api/notifications"],
    retry: false,
  });

  const { data: reinstatementRequest } = useQuery<{status: string}>({
    queryKey: ["/api/reinstatement-requests"],
    retry: false,
    enabled: user?.isFlagged || false,
  });

  const { data: canCreateCampaign } = useQuery<{canCreate: boolean, reason?: string}>({
    queryKey: ["/api/user/can-create-campaign"],
    retry: false,
    enabled: !!user && !user.isFlagged,
  });

  const { data: profileCompletion } = useQuery<{
    completionScore: number;
    completionItems: Array<{field: string, label: string, completed: boolean}>;
    isProfileComplete: boolean;
  }>({
    queryKey: ["/api/user/profile-completion"],
    retry: false,
  });

  const { data: financialOverview } = useQuery<{
    totalRaised: string;
    totalContributed: string;
    totalGoalAmount: string;
    averageFunding: string;
    fundingGoalProgress: number;
    campaignStats: {
      total: number;
      active: number;
      pending: number;
      completed: number;
      rejected: number;
    };
    contributionStats: {
      totalContributions: number;
      averageContribution: number;
    };
  }>({
    queryKey: ["/api/user/financial-overview"],
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background relative">
        <ThreeBackground />
        <MainNavigation />
        <div className="relative z-10 pt-16 flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin border-2 border-cyber-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const myCampaigns = userCampaigns.filter((campaign: Campaign) => campaign.creatorId === user?.id);
  const myContributions = userContributions.filter((contribution: Contribution) => contribution.backerId === user?.id);
  
  const totalRaised = myCampaigns.reduce((sum: number, campaign: Campaign) => sum + parseFloat(campaign.currentAmount || "0"), 0);
  const totalContributed = myContributions.reduce((sum: number, contribution: Contribution) => sum + parseFloat(contribution.amount || "0"), 0);
  const activeCampaigns = myCampaigns.filter((campaign: Campaign) => campaign.status === "active").length;

  return (
    <div className="min-h-screen bg-background relative noise-bg">
      <ThreeBackground />
      <MainNavigation />
      
      <div className="relative z-10 pt-16">
        {/* Header */}
        <section className="py-16 noise-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="card-premium p-8 mb-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center gap-6 mb-6 md:mb-0">
                  <Avatar className="h-20 w-20 border-2 border-primary/20">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xl heading-display">
                      {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-4xl md:text-5xl heading-display mb-2">
                      <span className="gradient-text">{user?.firstName || "Creator"}</span>
                    </h1>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="body-text text-lg opacity-80">@{user?.username}</span>
                      <span className="body-text opacity-50">•</span>
                      <span className="body-text opacity-80">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {user?.kycStatus && (
                        <KYCBadge status={user.kycStatus as "approved" | "pending" | "rejected"} />
                      )}
                      <Badge className="bg-secondary/50 text-secondary-foreground">
                        Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
                      </Badge>
                    </div>
                  </div>
                </div>
              
                <div className="flex flex-col sm:flex-row gap-3">
                  {user?.isFlagged ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button disabled className="bg-danger/20 text-danger border-danger/30">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Account Flagged
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Your account is flagged. Please contact support.</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : canCreateCampaign?.canCreate ? (
                    <Link href="/create">
                      <Button className="gradient-primary text-white hover:shadow-lg hover:shadow-primary/25 transition-all duration-200">
                        <Plus className="w-4 h-4 mr-2" />
                        New Campaign
                      </Button>
                    </Link>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button disabled className="bg-muted/50 text-muted-foreground">
                          <Lock className="w-4 h-4 mr-2" />
                          Create Campaign
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{canCreateCampaign?.reason || "KYC verification required"}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <Link href="/profile">
                    <Button variant="outline" className="btn-glass">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Flagged User Banner */}
            {user?.isFlagged && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="card-premium p-6 border-danger/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-danger/20 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-danger" />
                      </div>
                      <div>
                        <h3 className="heading-display text-lg text-danger mb-1">Account Flagged</h3>
                        <p className="body-text opacity-80">
                          Your account is flagged. Please submit a reinstatement request to regain full access.
                        </p>
                        {user.flaggedReason && (
                          <p className="body-text text-sm text-danger/80 mt-2">
                            Reason: {user.flaggedReason}
                          </p>
                        )}
                      </div>
                    </div>
                    {!reinstatementRequest || reinstatementRequest.status === "rejected" ? (
                      <Button 
                        className="bg-danger text-white hover:bg-danger/90" 
                        onClick={() => {
                          console.log("Open reinstatement request modal");
                        }}
                      >
                        Appeal
                      </Button>
                    ) : (
                      <Badge className="bg-warning/20 text-warning border-warning/30">
                        {reinstatementRequest.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* KYC Status Banner */}
            {!user?.isFlagged && user?.kycStatus !== "approved" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className={`card-premium p-6 ${
                  user?.kycStatus === "pending" || user?.kycStatus === "under_review" 
                    ? "border-warning/30" 
                    : user?.kycStatus === "rejected"
                    ? "border-danger/30"
                    : "border-primary/30"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        user?.kycStatus === "pending" || user?.kycStatus === "under_review" ? "bg-warning/20" : 
                        user?.kycStatus === "rejected" ? "bg-danger/20" : "bg-primary/20"
                      }`}>
                        <div className={`w-4 h-4 rounded-full animate-pulse ${
                          user?.kycStatus === "pending" || user?.kycStatus === "under_review" ? "bg-warning" : 
                          user?.kycStatus === "rejected" ? "bg-danger" : "bg-primary"
                        }`}></div>
                      </div>
                      <div>
                        <h3 className={`heading-display text-lg mb-1 ${
                          user?.kycStatus === "pending" || user?.kycStatus === "under_review" ? "text-warning" : 
                          user?.kycStatus === "rejected" ? "text-danger" : "text-primary"
                        }`}>
                          {user?.kycStatus === "pending" || user?.kycStatus === "under_review" ? "KYC Under Review" : 
                           user?.kycStatus === "rejected" ? "KYC Rejected" : "KYC Required"}
                        </h3>
                        <p className="body-text opacity-80">
                          {user?.kycStatus === "pending" || user?.kycStatus === "under_review" 
                            ? "Your identity verification is being processed (1-3 business days)"
                            : user?.kycStatus === "rejected"
                            ? "Your KYC application was rejected. Please resubmit with corrections."
                            : "Complete KYC verification to unlock all features"
                          }
                        </p>
                      </div>
                    </div>
                    <Link href="/kyc">
                      <Button className={
                        user?.kycStatus === "pending" || user?.kycStatus === "under_review"
                          ? "bg-warning text-background hover:bg-warning/90" 
                          : user?.kycStatus === "rejected"
                          ? "bg-danger text-white hover:bg-danger/90"
                          : "bg-primary text-white hover:bg-primary/90"
                      }>
                        {user?.kycStatus === "pending" || user?.kycStatus === "under_review" ? "View Status" : 
                         user?.kycStatus === "rejected" ? "Resubmit" : "Start KYC"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0 }}
                className="card-premium p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <Badge className="bg-success/20 text-success border-success/30">
                    +{myCampaigns.length > 0 ? '12%' : '0%'}
                  </Badge>
                </div>
                <h3 className="body-text text-sm opacity-70 mb-1">Created</h3>
                <p className="heading-display text-3xl mb-2">
                  {myCampaigns.length}
                </p>
                <div className="h-8 bg-gradient-to-r from-primary/20 to-transparent rounded" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="card-premium p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-success" />
                  </div>
                  <Badge className="bg-success/20 text-success border-success/30">
                    +{totalRaised > 0 ? '8%' : '0%'}
                  </Badge>
                </div>
                <h3 className="body-text text-sm opacity-70 mb-1">Total Raised (ETH)</h3>
                <p className="heading-display text-3xl mb-2">
                  {totalRaised.toFixed(1)}
                </p>
                <div className="h-8 bg-gradient-to-r from-success/20 to-transparent rounded" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="card-premium p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-accent" />
                  </div>
                  <Badge className="bg-warning/20 text-warning border-warning/30">
                    +{myContributions.length > 0 ? '3%' : '0%'}
                  </Badge>
                </div>
                <h3 className="body-text text-sm opacity-70 mb-1">Backed Count</h3>
                <p className="heading-display text-3xl mb-2">
                  {myContributions.length}
                </p>
                <div className="h-8 bg-gradient-to-r from-accent/20 to-transparent rounded" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="card-premium p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-warning" />
                  </div>
                  <Badge className="bg-success/20 text-success border-success/30">
                    +{totalContributed > 0 ? '5%' : '0%'}
                  </Badge>
                </div>
                <h3 className="body-text text-sm opacity-70 mb-1">Total Contributed (ETH)</h3>
                <p className="heading-display text-3xl mb-2">
                  {totalContributed.toFixed(1)}
                </p>
                <div className="h-8 bg-gradient-to-r from-warning/20 to-transparent rounded" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Dashboard Tabs */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="glass w-full justify-start mb-8 p-2">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="my-campaigns" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  My Campaigns
                </TabsTrigger>
                <TabsTrigger value="backed-projects" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  Backed
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  Notifications 
                  {userNotifications.filter((n: any) => !n.isRead).length > 0 && (
                    <Badge className="ml-2 bg-danger/20 text-danger border-danger/30 text-xs">
                      {userNotifications.filter((n: any) => !n.isRead).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Recent Activity */}
                  <Card className="glass-morphism">
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {myCampaigns.slice(0, 3).map((campaign: Campaign) => (
                          <div key={campaign.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-cyber-blue rounded-full"></div>
                              <div>
                                <div className="font-medium text-sm">{campaign.title.length > 20 ? campaign.title.substring(0, 20) + '...' : campaign.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(campaign.createdAt || ""), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                            <Badge variant={campaign.status === "active" ? "default" : "secondary"} className="text-xs">
                              {campaign.status === "pending_approval" ? "Review" : campaign.status}
                            </Badge>
                          </div>
                        ))}
                        
                        {myCampaigns.length === 0 && (
                          <div className="text-center py-8">
                            <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">No campaigns yet</p>
                            <Link href="/create">
                              <Button className="mt-4 text-sm">Create Your First Campaign</Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Overview */}
                  <Card className="glass-morphism">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Financial Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Total Raised</span>
                            <span className="font-mono">{financialOverview?.totalRaised || "0.0000"} ETH</span>
                          </div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Goal Progress</span>
                            <span className="font-mono">{financialOverview?.fundingGoalProgress || 0}%</span>
                          </div>
                          <Progress value={financialOverview?.fundingGoalProgress || 0} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Active</div>
                            <div className="font-mono text-green-400">{financialOverview?.campaignStats.active || 0}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Pending</div>
                            <div className="font-mono text-yellow-400">{financialOverview?.campaignStats.pending || 0}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Completed</div>
                            <div className="font-mono text-blue-400">{financialOverview?.campaignStats.completed || 0}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Rejected</div>
                            <div className="font-mono text-red-400">{financialOverview?.campaignStats.rejected || 0}</div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Avg Funding</span>
                            <span className="font-mono">{financialOverview?.averageFunding || "0.0000"} ETH</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Contributions</span>
                            <span className="font-mono">{financialOverview?.contributionStats.totalContributions || 0}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Profile Completion */}
                  <Card className="glass-morphism">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Profile Completion
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Profile Complete</span>
                            <span className="font-mono">{profileCompletion?.completionScore || 0}%</span>
                          </div>
                          <Progress value={profileCompletion?.completionScore || 0} className="h-2" />
                        </div>
                        
                        {profileCompletion && profileCompletion.completionScore < 100 && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Missing items:</p>
                            {profileCompletion.completionItems
                              .filter(item => !item.completed)
                              .slice(0, 3)
                              .map((item, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <XCircle className="w-3 h-3 text-red-400" />
                                <span>{item.label}</span>
                              </div>
                            ))}
                            {profileCompletion.completionItems.filter(item => !item.completed).length > 3 && (
                              <p className="text-xs text-muted-foreground">+{profileCompletion.completionItems.filter(item => !item.completed).length - 3} more...</p>
                            )}
                          </div>
                        )}
                        
                        {profileCompletion?.isProfileComplete && (
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            <span>Profile Complete!</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="my-campaigns">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold">My Campaigns ({myCampaigns.length})</h3>
                    <Link href="/create">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Campaign
                      </Button>
                    </Link>
                  </div>

                  {myCampaigns.length > 0 ? (
                    <div className="space-y-6">
                      {myCampaigns.map((campaign: Campaign) => (
                        <Card key={campaign.id} className="glass-morphism">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start gap-4">
                                <div className="w-20 h-20 rounded-lg overflow-hidden">
                                  <img 
                                    src={campaign.imageUrl || "/api/placeholder/80/80"} 
                                    alt={campaign.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg mb-2">{campaign.title}</h4>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge 
                                      variant={campaign.status === "active" ? "default" : 
                                              campaign.status === "pending_approval" ? "secondary" : 
                                              campaign.status === "rejected" ? "destructive" : "secondary"}
                                      className={`${
                                        campaign.status === "pending_approval" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
                                        campaign.status === "active" ? "bg-green-100 text-green-800 border-green-300" :
                                        campaign.status === "rejected" ? "bg-red-100 text-red-800 border-red-300" : ""
                                      }`}
                                    >
                                      {campaign.status === "pending_approval" ? "Under Review" :
                                       campaign.status === "active" ? "Approved" :
                                       campaign.status === "rejected" ? "Rejected" : 
                                       campaign.status?.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    {campaign.isEditedAfterApproval && campaign.status === "pending_approval" && (
                                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Pending Re-approval
                                      </Badge>
                                    )}
                                    {campaign.status === "rejected" && (
                                      <Badge variant="destructive">
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Rejected
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Funding Progress</span>
                                      <span className="font-mono">
                                        {((parseFloat(campaign.currentAmount || "0") / parseFloat(campaign.goalAmount || "1")) * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                    <Progress 
                                      value={(parseFloat(campaign.currentAmount || "0") / parseFloat(campaign.goalAmount || "1")) * 100} 
                                      className="h-2" 
                                    />
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                      <span>{campaign.currentAmount || "0"} {campaign.currency} raised</span>
                                      <span>{campaign.goalAmount} {campaign.currency} goal</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button variant="outline" size="sm" className="glass-morphism">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                                {campaign.status !== "rejected" && !user?.isFlagged && (
                                  <Button variant="outline" size="sm" className="glass-morphism">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </Button>
                                )}
                                <Button variant="outline" size="sm" className="glass-morphism">
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share
                                </Button>
                              </div>
                            </div>
                            
                            {campaign.adminComments && (
                              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <MessageCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                                  <div>
                                    <div className="text-sm font-medium text-muted-foreground">Admin Notes:</div>
                                    <div className="text-sm">{campaign.adminComments}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="glass-morphism">
                      <CardContent className="p-8 text-center">
                        <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Create your first campaign to start raising funds for your project
                        </p>
                        <Link href="/create">
                          <Button className="bg-gradient-to-r from-cyber-blue to-cyber-purple">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Campaign
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="backed-projects">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Backed Projects ({myContributions.length})</h3>

                  {myContributions.length > 0 ? (
                    <div className="space-y-4">
                      {myContributions.map((contribution: Contribution) => {
                        const campaign = userCampaigns.find((c: Campaign) => c.id === contribution.campaignId);
                        return (
                          <Card key={contribution.id} className="glass-morphism">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                                    <img 
                                      src={campaign?.imageUrl || "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                                      alt={campaign?.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{campaign?.title || "Campaign"}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Contributed {formatDistanceToNow(new Date(contribution.createdAt || ""), { addSuffix: true })}
                                    </p>
                                    {contribution.message && (
                                      <p className="text-sm text-muted-foreground italic mt-1">
                                        "{contribution.message}"
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold font-mono">
                                    {contribution.amount} {contribution.currency}
                                  </div>
                                  <Badge variant={contribution.status === "confirmed" ? "default" : "secondary"}>
                                    {contribution.status}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="glass-morphism">
                      <CardContent className="p-8 text-center">
                        <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No backed projects yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Discover amazing campaigns and support innovative projects
                        </p>
                        <Link href="/campaigns">
                          <Button className="bg-gradient-to-r from-cyber-blue to-cyber-purple">
                            Browse Campaigns
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="notifications">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold">Notifications ({userNotifications.length})</h3>
                    {userNotifications.some((n: any) => !n.isRead) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // TODO: Mark all as read
                          console.log("Mark all as read");
                        }}
                      >
                        Mark All Read
                      </Button>
                    )}
                  </div>

                  {userNotifications.length > 0 ? (
                    <div className="space-y-4">
                      {userNotifications.map((notification: any) => (
                        <Card key={notification.id} className={`glass-morphism transition-all duration-200 ${
                          !notification.isRead ? "border-cyber-blue/50 bg-cyber-blue/5" : ""
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  !notification.isRead ? "bg-cyber-blue animate-pulse" : "bg-muted"
                                }`}></div>
                                <div className="flex-1">
                                  <h4 className="font-semibold mb-1">{notification.title}</h4>
                                  <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                                    <Badge 
                                      variant="outline" 
                                      className={`${
                                        notification.type === "success" ? "text-green-600 border-green-300" :
                                        notification.type === "error" ? "text-red-600 border-red-300" :
                                        notification.type === "warning" ? "text-yellow-600 border-yellow-300" :
                                        "text-blue-600 border-blue-300"
                                      }`}
                                    >
                                      {notification.type}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              {!notification.isRead && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    // TODO: Mark as read
                                    console.log("Mark as read:", notification.id);
                                  }}
                                >
                                  Mark Read
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="glass-morphism">
                      <CardContent className="p-8 text-center">
                        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
                        <p className="text-muted-foreground">
                          You'll see updates about your campaigns, KYC status, and other important information here.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Analytics</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="glass-morphism">
                      <CardHeader>
                        <CardTitle>Funding Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center">
                          <div className="text-center">
                            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Analytics charts coming soon</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-morphism">
                      <CardHeader>
                        <CardTitle>Backer Demographics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center">
                          <div className="text-center">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Demographic analysis coming soon</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
