import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Users, 
  Target, 
  Calendar,
  DollarSign,
  Activity,
  Zap,
  Globe
} from "lucide-react";
import type { Campaign, Contribution } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface CampaignStatsProps {
  campaign: Campaign;
  contributions?: Contribution[];
}

export default function CampaignStats({ campaign, contributions = [] }: CampaignStatsProps) {
  const progress = (parseFloat(campaign.currentAmount || "0") / parseFloat(campaign.goalAmount || "1")) * 100;
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline || Date.now()).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  
  // Calculate statistics
  const totalContributions = contributions.length;
  const averageContribution = contributions.length > 0 
    ? contributions.reduce((sum, c) => sum + parseFloat(c.amount || "0"), 0) / contributions.length
    : 0;
  
  const dailyContributions = contributions.filter(c => 
    new Date(c.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
  ).length;

  const topContribution = contributions.length > 0
    ? Math.max(...contributions.map(c => parseFloat(c.amount || "0")))
    : 0;

  const contributionTrend = contributions
    .slice(-7)
    .reduce((acc, c) => acc + parseFloat(c.amount || "0"), 0);

  const stats = [
    {
      title: "Funding Progress",
      value: `${Math.round(progress)}%`,
      subtitle: `${campaign.currentAmount} / ${campaign.goalAmount} ${campaign.currency}`,
      icon: Target,
      color: "text-cyber-blue",
      bgColor: "bg-cyber-blue/20",
    },
    {
      title: "Total Backers",
      value: (campaign.backerCount || 0).toString(),
      subtitle: `${dailyContributions} today`,
      icon: Users,
      color: "text-cyber-green",
      bgColor: "bg-cyber-green/20",
    },
    {
      title: "Days Remaining",
      value: daysLeft.toString(),
      subtitle: `Until ${new Date(campaign.deadline).toLocaleDateString()}`,
      icon: Calendar,
      color: "text-cyber-purple",
      bgColor: "bg-cyber-purple/20",
    },
    {
      title: "Average Contribution",
      value: `${averageContribution.toFixed(2)} ${campaign.currency}`,
      subtitle: `Top: ${topContribution.toFixed(2)} ${campaign.currency}`,
      icon: DollarSign,
      color: "text-cyber-yellow",
      bgColor: "bg-cyber-yellow/20",
    },
  ];

  const performanceMetrics = [
    {
      label: "Credibility Score",
      value: parseFloat(campaign.credibilityScore),
      max: 10,
      color: "bg-gradient-to-r from-cyber-green to-cyber-blue",
    },
    {
      label: "Funding Velocity",
      value: Math.min(100, contributionTrend * 10),
      max: 100,
      color: "bg-gradient-to-r from-cyber-blue to-cyber-purple",
    },
    {
      label: "Backer Engagement",
      value: Math.min(100, (totalContributions / Math.max(campaign.backerCount, 1)) * 100),
      max: 100,
      color: "bg-gradient-to-r from-cyber-purple to-cyber-pink",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="glass-morphism border-white/20 hover:border-white/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.subtitle}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">{stat.title}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="glass-morphism border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyber-blue" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {performanceMetrics.map((metric, index) => (
              <div key={metric.label}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <span className="text-sm font-mono">
                    {metric.label === "Credibility Score" 
                      ? `${metric.value.toFixed(1)}/${metric.max}` 
                      : `${Math.round(metric.value)}%`
                    }
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${metric.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(metric.value / metric.max) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Activity Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="glass-morphism border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyber-yellow" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contributions.slice(0, 5).map((contribution, index) => (
                <div key={contribution.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                    <div>
                      <div className="font-medium">
                        {contribution.isAnonymous ? "Anonymous" : "Backer"} contributed
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(contribution.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold">
                      +{contribution.amount} {contribution.currency}
                    </div>
                    {contribution.message && (
                      <div className="text-xs text-muted-foreground italic max-w-32 truncate">
                        "{contribution.message}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {contributions.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No activity yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Campaign Health */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card className="glass-morphism border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyber-green" />
              Campaign Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-cyber-green/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-cyber-green" />
                </div>
                <div className="text-lg font-bold text-cyber-green">
                  {progress > 75 ? "Excellent" : progress > 50 ? "Good" : progress > 25 ? "Fair" : "Needs Attention"}
                </div>
                <div className="text-sm text-muted-foreground">Funding Progress</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-cyber-blue/20 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-cyber-blue" />
                </div>
                <div className="text-lg font-bold text-cyber-blue">
                  {campaign.backerCount > 100 ? "High" : campaign.backerCount > 50 ? "Medium" : "Low"}
                </div>
                <div className="text-sm text-muted-foreground">Community Interest</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-cyber-purple/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-cyber-purple" />
                </div>
                <div className="text-lg font-bold text-cyber-purple">
                  {daysLeft > 15 ? "Healthy" : daysLeft > 7 ? "Moderate" : "Critical"}
                </div>
                <div className="text-sm text-muted-foreground">Time Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
