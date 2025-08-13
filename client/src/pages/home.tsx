import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CampaignCard from "@/components/campaign/campaign-card";
import { useAuth } from "@/hooks/useAuth";
import { Plus, TrendingUp, Users, Wallet } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16">
        {/* Welcome Section */}
        <section className="py-12 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-6xl font-black mb-4">
                Welcome back, <span className="gradient-text">{user?.firstName || "Creator"}</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Ready to launch your next revolutionary project or discover amazing campaigns?
              </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              <Link href="/create">
                <Button size="lg" className="bg-gradient-to-r from-cyber-blue to-cyber-purple hover:scale-105 transform transition-all duration-300">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Campaign
                </Button>
              </Link>
              <Link href="/campaigns">
                <Button variant="outline" size="lg" className="glass-morphism hover:bg-white/20">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Browse Campaigns
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="glass-morphism hover:bg-white/20">
                  <Users className="w-5 h-5 mr-2" />
                  My Dashboard
                </Button>
              </Link>
            </motion.div>

            {/* KYC Status Alert */}
            {user?.kycStatus !== "verified" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <Card className="glass-morphism border-cyber-yellow/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-cyber-yellow rounded-full animate-pulse"></div>
                        <div>
                          <h3 className="font-semibold text-cyber-yellow">Complete KYC Verification</h3>
                          <p className="text-sm text-muted-foreground">
                            Verify your identity to create campaigns and unlock all features
                          </p>
                        </div>
                      </div>
                      <Link href="/kyc">
                        <Button className="bg-cyber-yellow text-black hover:bg-cyber-yellow/90">
                          Start KYC
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </section>

        {/* Dashboard Overview */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <Card className="glass-morphism border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Your Contributions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-cyber-blue" />
                    <span className="text-2xl font-bold">{userContributions.length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Raised</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyber-green" />
                    <span className="text-2xl font-bold">{stats?.totalRaised || "0"} ETH</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyber-purple" />
                    <span className="text-2xl font-bold">{stats?.activeCampaigns || "0"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-cyber-green/20 text-cyber-green">
                      {stats?.successRate || "0"}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Featured Campaigns */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-8 gradient-text">Featured Campaigns</h2>
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
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
