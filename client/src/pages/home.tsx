import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KYCBadge } from "@/components/ui/kyc-badge";
import { MainNavigation } from "@/components/navigation/MainNavigation";
import { ThreeBackground } from "@/components/three/ThreeBackground";
import CampaignCard from "@/components/campaign/campaign-card";
import { useAuth } from "@/hooks/useAuth";
import { Plus, TrendingUp, Users, Wallet, Eye, Heart, ArrowUp } from "lucide-react";
import { Link } from "wouter";
import type { Campaign, Contribution } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  
  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
    retry: false,
  });

  const { data: stats } = useQuery<{
    totalRaised: string;
    activeCampaigns: number;
    totalBackers: number;
    successRate: number;
  }>({
    queryKey: ["/api/stats"],
    retry: false,
  });

  const { data: userContributions = [] } = useQuery<Contribution[]>({
    queryKey: ["/api/contributions"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-background relative noise-bg">
      <ThreeBackground />
      <MainNavigation />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-16 noise-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <h1 className="text-4xl md:text-6xl heading-display">
                  Welcome back, <span className="gradient-text">{user?.firstName || "Creator"}</span>
                </h1>
                {user?.kycStatus && (
                  <KYCBadge status={user.kycStatus as "approved" | "pending" | "rejected"} />
                )}
              </div>
              <p className="text-xl body-text max-w-2xl mx-auto opacity-90">
                Ready to launch your next revolutionary project or discover amazing campaigns?
              </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto"
            >
              <Link href="/create">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="card-premium p-6 text-center group cursor-pointer"
                >
                  <div className="w-12 h-12 mx-auto mb-4 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="heading-display text-lg mb-2">Create Campaign</h3>
                  <p className="body-text text-sm opacity-70">Launch your revolutionary project</p>
                </motion.div>
              </Link>
              <Link href="/campaigns">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="card-premium p-6 text-center group cursor-pointer"
                >
                  <div className="w-12 h-12 mx-auto mb-4 bg-accent/20 rounded-xl flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                    <Eye className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="heading-display text-lg mb-2">Browse</h3>
                  <p className="body-text text-sm opacity-70">Discover amazing campaigns</p>
                </motion.div>
              </Link>
              <Link href="/dashboard">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="card-premium p-6 text-center group cursor-pointer"
                >
                  <div className="w-12 h-12 mx-auto mb-4 bg-success/20 rounded-xl flex items-center justify-center group-hover:bg-success/30 transition-colors">
                    <Users className="w-6 h-6 text-success" />
                  </div>
                  <h3 className="heading-display text-lg mb-2">My Dashboard</h3>
                  <p className="body-text text-sm opacity-70">Manage your campaigns</p>
                </motion.div>
              </Link>
            </motion.div>

            {/* KYC Status Banner */}
            {user?.kycStatus !== "approved" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-12"
              >
                <div className="card-premium p-6 border-warning/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-warning/20 rounded-xl flex items-center justify-center">
                        <div className="w-3 h-3 bg-warning rounded-full animate-pulse"></div>
                      </div>
                      <div>
                        <h3 className="heading-display text-lg text-warning mb-1">
                          {user?.kycStatus === 'pending' ? 'KYC Under Review' : 'Complete KYC Verification'}
                        </h3>
                        <p className="body-text text-sm opacity-80">
                          {user?.kycStatus === 'pending' 
                            ? 'Your verification is being processed. You\'ll be notified once approved.'
                            : 'Verify your identity to create campaigns and unlock all features'
                          }
                        </p>
                      </div>
                    </div>
                    <Link href="/kyc">
                      <Button className="bg-warning text-background hover:bg-warning/90 font-medium">
                        {user?.kycStatus === 'pending' ? 'View Status' : 'Start KYC'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Stats Overview */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0 }}
                className="card-premium p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <Badge className="bg-success/20 text-success border-success/30">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +12%
                  </Badge>
                </div>
                <h3 className="body-text text-sm opacity-70 mb-1">Contributions</h3>
                <p className="heading-display text-3xl mb-2">
                  {userContributions.length}
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
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <Badge className="bg-success/20 text-success border-success/30">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +8%
                  </Badge>
                </div>
                <h3 className="body-text text-sm opacity-70 mb-1">Total Raised (Platform)</h3>
                <p className="heading-display text-3xl mb-2">
                  {parseFloat(stats?.totalRaised || "0").toFixed(1)} ETH
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
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <Badge className="bg-warning/20 text-warning border-warning/30">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +3%
                  </Badge>
                </div>
                <h3 className="body-text text-sm opacity-70 mb-1">Active Campaigns</h3>
                <p className="heading-display text-3xl mb-2">
                  {stats?.activeCampaigns || "0"}
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
                  <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-success" />
                  </div>
                  <Badge className="bg-success/20 text-success border-success/30">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +5%
                  </Badge>
                </div>
                <h3 className="body-text text-sm opacity-70 mb-1">Success Rate</h3>
                <p className="heading-display text-3xl mb-2">
                  {stats?.successRate || "0"}%
                </p>
                <div className="h-8 bg-gradient-to-r from-success/20 to-transparent rounded" />
              </motion.div>
            </div>

            {/* Featured Campaigns */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-4xl heading-display gradient-text">Featured Campaigns</h2>
                <Link href="/campaigns">
                  <Button variant="outline" className="btn-glass">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {campaigns.slice(0, 6).map((campaign, index) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <CampaignCard campaign={campaign} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Recent Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-20"
            >
              <h2 className="text-3xl heading-display gradient-text mb-8">Recent Activity</h2>
              <div className="card-premium p-8">
                <div className="space-y-6">
                  {userContributions.slice(0, 5).map((contribution, index) => (
                    <motion.div
                      key={contribution.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-lg glass border border-white/5"
                    >
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="body-text font-medium">
                          You backed a campaign
                        </p>
                        <p className="body-text text-sm opacity-70">
                          {contribution.amount} ETH contribution
                        </p>
                      </div>
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        {contribution.createdAt ? new Date(contribution.createdAt).toLocaleDateString() : 'Unknown'}
                      </Badge>
                    </motion.div>
                  ))}
                  {userContributions.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="heading-display text-lg mb-2">No activity yet</h3>
                      <p className="body-text opacity-70">Start exploring campaigns to see your activity here</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
