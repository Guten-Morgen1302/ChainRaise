import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KYCBadge } from "@/components/ui/kyc-badge";
import { PageLayout } from "@/components/layout/PageLayout";
import CampaignCard from "@/components/campaign/campaign-card";
import { useAuth } from "@/hooks/useAuth";
import { Plus, TrendingUp, Users, Wallet, Eye, Heart, ArrowUp, Star, Clock, Activity, Target } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import type { Campaign, Contribution } from "@shared/schema";

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Count-up animation hook
function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(target * progress));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return count;
}

// Stat Tile Component with count-up animation
function StatTile({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  sparklineData,
  delay = 0 
}: {
  title: string;
  value: number;
  icon: any;
  trend?: string;
  sparklineData?: number[];
  delay?: number;
}) {
  const animatedValue = useCountUp(value, 2000);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ 
        y: -5, 
        transition: { duration: 0.2 } 
      }}
      className="relative group"
    >
      <Card className="glass-morphism border-white/10 overflow-hidden h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            {trend && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.5, duration: 0.3 }}
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  trend.startsWith('+') 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {trend}
              </motion.div>
            )}
          </div>
          
          <div className="space-y-2">
            <motion.h3 
              className="text-3xl font-bold gradient-text"
              key={animatedValue}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {title === 'Total Raised' ? `$${animatedValue.toLocaleString()}` : animatedValue.toLocaleString()}
            </motion.h3>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
          </div>
          
          {sparklineData && (
            <div className="mt-4 h-8">
              <svg width="100%" height="100%" className="overflow-visible">
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                <motion.polyline
                  fill="none"
                  stroke={`url(#gradient-${title})`}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={sparklineData.map((value, index) => 
                    `${(index / (sparklineData.length - 1)) * 100},${32 - (value / Math.max(...sparklineData)) * 24}`
                  ).join(' ')}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: delay + 1, duration: 1.5, ease: "easeInOut" }}
                />
              </svg>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

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

  // Mock sparkline data for demonstration
  const sparklineData = {
    contributions: [12, 19, 15, 27, 32, 28, 35],
    raised: [1200, 1900, 1500, 2700, 3200, 2800, 3500],
    campaigns: [3, 4, 3, 5, 6, 5, 7],
    success: [45, 52, 48, 61, 67, 63, 72]
  };

  // Featured campaigns (limit to 6)
  const featuredCampaigns = campaigns.slice(0, 6);

  // Recent activity data
  const recentActivity = [
    {
      type: 'contribution',
      message: 'You contributed $500 to "Blockchain Gaming Platform"',
      time: '2 hours ago',
      icon: Wallet
    },
    {
      type: 'campaign',
      message: 'Your campaign "DeFi Protocol" received a new backer',
      time: '1 day ago',
      icon: Heart
    },
    {
      type: 'milestone',
      message: 'Campaign "Sustainable Fashion" reached 75% funding',
      time: '2 days ago',
      icon: Target
    }
  ];

  return (
    <PageLayout>
      <div className="relative z-10 pt-20 pb-16">
        {/* Hero Section */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="py-12 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Welcome Header */}
            <motion.div variants={itemVariants} className="text-center mb-12">
              <div className="relative inline-block">
                <motion.h1 
                  className="text-4xl md:text-6xl font-black gradient-text mb-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Welcome back, <span className="relative">
                    {user?.firstName || "Creator"}
                    <motion.div
                      className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur-xl"
                      animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-muted-foreground/80 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  Ready to bring your next big idea to life?
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="inline-flex items-center gap-3"
                >
                  <KYCBadge status={(user?.kycStatus as "pending" | "approved" | "rejected") || "pending"} />
                  {user?.kycStatus === 'approved' && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <Star className="w-3 h-3 mr-1" />
                      Verified Creator
                    </Badge>
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="mb-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {[
                  { 
                    title: "Create Campaign", 
                    icon: Plus, 
                    href: "/create",
                    gradient: "from-primary to-accent",
                    description: "Launch your next project"
                  },
                  { 
                    title: "Browse Campaigns", 
                    icon: Eye, 
                    href: "/campaigns",
                    gradient: "from-accent to-success",
                    description: "Discover amazing projects"
                  },
                  { 
                    title: "My Dashboard", 
                    icon: Activity, 
                    href: "/dashboard",
                    gradient: "from-success to-primary",
                    description: "Track your progress"
                  }
                ].map((action, index) => (
                  <motion.div
                    key={action.title}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href={action.href}>
                      <Card className="glass-morphism border-white/10 overflow-hidden cursor-pointer group h-full">
                        <CardContent className="p-8 text-center relative">
                          <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                          
                          <div className="relative z-10">
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${action.gradient} p-4 group-hover:scale-110 transition-transform duration-300`}>
                              <action.icon className="w-full h-full text-white" />
                            </div>
                            
                            <h3 className="text-xl font-bold mb-2 gradient-text">
                              {action.title}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {action.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* KYC Banner (if needed) */}
            {user?.kycStatus === 'pending' && (
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <Card className="glass-morphism border-amber-500/30 bg-amber-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-amber-400 mb-2">
                          Complete Your Verification
                        </h3>
                        <p className="text-muted-foreground">
                          Verify your identity to unlock full campaign creation features and build trust with backers.
                        </p>
                      </div>
                      <Link href="/kyc">
                        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                          Continue KYC
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatTile 
                  title="Contributions" 
                  value={userContributions.length}
                  icon={Heart}
                  trend="+12%"
                  sparklineData={sparklineData.contributions}
                  delay={0}
                />
                <StatTile 
                  title="Total Raised" 
                  value={parseInt(stats?.totalRaised || "0")}
                  icon={TrendingUp}
                  trend="+24%"
                  sparklineData={sparklineData.raised}
                  delay={0.1}
                />
                <StatTile 
                  title="Active Campaigns" 
                  value={stats?.activeCampaigns || 0}
                  icon={Activity}
                  trend="+8%"
                  sparklineData={sparklineData.campaigns}
                  delay={0.2}
                />
                <StatTile 
                  title="Success Rate" 
                  value={Math.round(stats?.successRate || 0)}
                  icon={Target}
                  trend="+15%"
                  sparklineData={sparklineData.success}
                  delay={0.3}
                />
              </div>
            </motion.div>

            {/* Featured Campaigns Grid */}
            <motion.div variants={itemVariants} className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold gradient-text">Featured Campaigns</h2>
                <Link href="/campaigns">
                  <Button variant="ghost" className="text-primary hover:text-primary/80">
                    View All <ArrowUp className="w-4 h-4 ml-2 rotate-45" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredCampaigns.map((campaign, index) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.1, 
                      duration: 0.6,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    viewport={{ once: true, margin: "-50px" }}
                  >
                    <CampaignCard campaign={campaign} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity Feed */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold gradient-text mb-6">Recent Activity</h2>
              <Card className="glass-morphism border-white/10">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-200"
                      >
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                          <activity.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">{activity.message}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activity.time}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </PageLayout>
  );
}