import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
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
  Clock
} from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: userCampaigns = [] } = useQuery({
    queryKey: ["/api/campaigns"],
    retry: false,
  });

  const { data: userContributions = [] } = useQuery({
    queryKey: ["/api/contributions"],
    retry: false,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
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

  const myCampaigns = userCampaigns.filter(campaign => campaign.creatorId === user?.id);
  const myContributions = userContributions.filter(contribution => contribution.backerId === user?.id);
  
  const totalRaised = myCampaigns.reduce((sum, campaign) => sum + parseFloat(campaign.currentAmount), 0);
  const totalContributed = myContributions.reduce((sum, contribution) => sum + parseFloat(contribution.amount), 0);
  const activeCampaigns = myCampaigns.filter(campaign => campaign.status === "active").length;

  return (
    <div className="min-h-screen bg-background relative">
      <ThreeBackground />
      <MainNavigation />
      
      <div className="relative z-10 pt-16">
        {/* Header */}
        <section className="py-12 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
            >
              <div>
                <h1 className="text-4xl md:text-5xl font-black mb-4">
                  Welcome back, <span className="gradient-text">{user?.firstName || "Creator"}</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  Manage your campaigns and track your impact
                </p>
                
                {/* User Profile with KYC Status */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>@{user?.username}</span>
                    <span>•</span>
                    <span>{user?.email}</span>
                  </div>
                  <Badge 
                    variant={user?.kycStatus === 'approved' ? 'default' : 
                            user?.kycStatus === 'pending' || user?.kycStatus === 'under_review' ? 'secondary' : 'destructive'}
                    className={`${
                      user?.kycStatus === 'approved' ? 'text-green-600 border-green-600 bg-green-50' : 
                      user?.kycStatus === 'pending' || user?.kycStatus === 'under_review' ? 'text-yellow-600 border-yellow-600 bg-yellow-50' : 'text-red-600 border-red-600 bg-red-50'
                    }`}
                  >
                    {user?.kycStatus === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {(user?.kycStatus === 'pending' || user?.kycStatus === 'under_review') && <Clock className="w-3 h-3 mr-1" />}
                    {user?.kycStatus === 'rejected' && <AlertCircle className="w-3 h-3 mr-1" />}
                    KYC: {user?.kycStatus?.replace('_', ' ').toUpperCase() || 'NOT SUBMITTED'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4 md:mt-0">
                <Link href="/create">
                  <Button className="bg-gradient-to-r from-cyber-blue to-cyber-purple hover:scale-105 transition-all duration-300">
                    <Plus className="w-4 h-4 mr-2" />
                    New Campaign
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* KYC Status Banner */}
            {user?.kycStatus !== "approved" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <Card className={`glass-morphism ${
                  user?.kycStatus === "pending" || user?.kycStatus === "under_review" 
                    ? "border-cyber-yellow/50" 
                    : user?.kycStatus === "rejected"
                    ? "border-red-500/50"
                    : "border-blue-500/50"
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${
                          user?.kycStatus === "pending" || user?.kycStatus === "under_review" ? "bg-cyber-yellow" : 
                          user?.kycStatus === "rejected" ? "bg-red-500" : "bg-blue-500"
                        }`}></div>
                        <div>
                          <h3 className={`font-semibold ${
                            user?.kycStatus === "pending" || user?.kycStatus === "under_review" ? "text-cyber-yellow" : 
                            user?.kycStatus === "rejected" ? "text-red-400" : "text-blue-400"
                          }`}>
                            {user?.kycStatus === "pending" || user?.kycStatus === "under_review" ? "KYC Under Review" : 
                             user?.kycStatus === "rejected" ? "KYC Rejected" : "KYC Required"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {user?.kycStatus === "pending" || user?.kycStatus === "under_review" 
                              ? "Your identity verification is being processed (1-3 business days)"
                              : user?.kycStatus === "rejected"
                              ? "Your KYC application was rejected. Please resubmit with corrections."
                              : "Complete KYC verification to create campaigns"
                            }
                          </p>
                        </div>
                      </div>
                      <Link href="/kyc">
                        <Button className={
                          user?.kycStatus === "pending" || user?.kycStatus === "under_review"
                            ? "bg-cyber-yellow text-black hover:bg-cyber-yellow/90" 
                            : user?.kycStatus === "rejected"
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-blue-500 hover:bg-blue-600"
                        }>
                          {user?.kycStatus === "pending" || user?.kycStatus === "under_review" ? "Check Status" : 
                           user?.kycStatus === "rejected" ? "Resubmit KYC" : "Complete KYC"}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              <Card className="glass-morphism border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Campaigns Created</p>
                      <p className="text-2xl font-bold">{myCampaigns.length}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-cyber-blue" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Raised</p>
                      <p className="text-2xl font-bold">{totalRaised.toFixed(2)} ETH</p>
                    </div>
                    <Wallet className="w-8 h-8 text-cyber-green" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Backed Projects</p>
                      <p className="text-2xl font-bold">{myContributions.length}</p>
                    </div>
                    <Heart className="w-8 h-8 text-cyber-pink" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Contributed</p>
                      <p className="text-2xl font-bold">{totalContributed.toFixed(2)} ETH</p>
                    </div>
                    <Users className="w-8 h-8 text-cyber-purple" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Dashboard Tabs */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="glass-morphism w-full justify-start mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="my-campaigns">My Campaigns</TabsTrigger>
                <TabsTrigger value="backed-projects">Backed Projects</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Activity */}
                  <Card className="glass-morphism">
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {myCampaigns.slice(0, 3).map((campaign) => (
                          <div key={campaign.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-cyber-blue rounded-full"></div>
                              <div>
                                <div className="font-medium">{campaign.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                            <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                              {campaign.status}
                            </Badge>
                          </div>
                        ))}
                        
                        {myCampaigns.length === 0 && (
                          <div className="text-center py-8">
                            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No campaigns yet</p>
                            <Link href="/create">
                              <Button className="mt-4">Create Your First Campaign</Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Summary */}
                  <Card className="glass-morphism">
                    <CardHeader>
                      <CardTitle>Performance Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Active Campaigns</span>
                            <span className="font-mono">{activeCampaigns}</span>
                          </div>
                          <Progress value={(activeCampaigns / Math.max(myCampaigns.length, 1)) * 100} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Average Funding</span>
                            <span className="font-mono">
                              {myCampaigns.length > 0 ? (totalRaised / myCampaigns.length).toFixed(2) : "0.00"} ETH
                            </span>
                          </div>
                          <Progress value={75} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Success Rate</span>
                            <span className="font-mono">
                              {myCampaigns.length > 0 
                                ? Math.round((myCampaigns.filter(c => c.status === "completed").length / myCampaigns.length) * 100)
                                : 0
                              }%
                            </span>
                          </div>
                          <Progress value={85} className="h-2" />
                        </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {myCampaigns.map((campaign) => (
                        <div key={campaign.id} className="relative">
                          <CampaignCard campaign={campaign} />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button variant="outline" size="icon" className="w-8 h-8 glass-morphism">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="w-8 h-8 glass-morphism">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="w-8 h-8 glass-morphism">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
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
                      {myContributions.map((contribution) => {
                        const campaign = userCampaigns.find(c => c.id === contribution.campaignId);
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
                                      Contributed {formatDistanceToNow(new Date(contribution.createdAt), { addSuffix: true })}
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
