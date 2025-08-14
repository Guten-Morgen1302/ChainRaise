import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CampaignCard from "@/components/campaign/campaign-card";
import TransactionFeed from "@/components/blockchain/transaction-feed";
import NetworkStats from "@/components/blockchain/network-stats";
import { useQuery } from "@tanstack/react-query";
import type { Campaign } from "@shared/schema";

export default function Landing() {
  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
    retry: false,
  });

  const { data: stats } = useQuery<{
    totalRaised: string;
    activeCampaigns: number;
    totalBackers: number;
  }>({
    queryKey: ["/api/stats"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 cyber-gradient">
          <div className="absolute inset-0 dot-pattern"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 gradient-text animate-float">
              The Future of<br/>
              <span className="glow-text">Crowdfunding</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Launch campaigns, raise funds transparently on blockchain, and build the next generation of innovative projects with our Web3 crowdfunding platform.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-cyber-blue to-cyber-green hover:scale-105 transform transition-all duration-300 animate-glow text-lg px-8 py-4"
              onClick={() => window.location.href = '/auth'}
            >
              Launch Campaign
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="glass-morphism hover:bg-white/20 transition-all duration-300 text-lg px-8 py-4"
              onClick={() => window.location.href = '/access-guide'}
            >
              Access All Features
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <Card className="glass-morphism border-white/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-black text-cyber-blue mb-2">
                  {stats?.totalRaised ? `${stats.totalRaised} ETH` : "$2.4M+"}
                </div>
                <div className="text-muted-foreground">Total Raised</div>
              </CardContent>
            </Card>
            <Card className="glass-morphism border-white/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-black text-cyber-green mb-2">
                  {stats?.activeCampaigns || "1,247"}
                </div>
                <div className="text-muted-foreground">Active Campaigns</div>
              </CardContent>
            </Card>
            <Card className="glass-morphism border-white/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-black text-cyber-purple mb-2">
                  {stats?.totalBackers ? `${stats.totalBackers}K+` : "45K+"}
                </div>
                <div className="text-muted-foreground">Global Backers</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Trending Campaigns Section */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 gradient-text">
              Trending Campaigns
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover groundbreaking projects backed by our global community
            </p>
          </motion.div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {["All Categories", "Technology", "Gaming", "DeFi", "Creative"].map((category) => (
              <Button
                key={category}
                variant="outline"
                className="glass-morphism hover:bg-cyber-blue/20 border-cyber-blue/50"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Campaign Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
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
          </motion.div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="glass-morphism hover:bg-white/20"
            >
              View All Campaigns
            </Button>
          </div>
        </div>
      </section>

      {/* Live Transaction Feed */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 gradient-text">
              Live Blockchain Explorer
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real-time transparency - every transaction recorded on Polygon blockchain
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TransactionFeed />
            <NetworkStats />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
