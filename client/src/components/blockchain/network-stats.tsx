import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Activity, Zap, Target } from "lucide-react";

export default function NetworkStats() {
  const { data: stats } = useQuery<{
    activeCampaigns: number;
    successRate: number;
  }>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const mockNetworkData = {
    dailyVolume: "47.3",
    dailyVolumeUsd: "89,247",
    dailyVolumeChange: "+12.4",
    gasPrice: "0.02",
    gasPriceStatus: "Low",
    activeCampaigns: stats?.activeCampaigns || 1247,
    newCampaignsToday: 3,
    successRate: stats?.successRate || 73.2,
  };

  return (
    <Card className="glass-morphism rounded-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Network Statistics</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Total Volume */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-muted/30 rounded-xl p-4 border border-white/10"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                24h Volume
              </span>
              <Badge className="bg-cyber-green/20 text-cyber-green font-mono text-sm">
                {mockNetworkData.dailyVolumeChange}%
              </Badge>
            </div>
            <div className="font-mono text-2xl font-bold text-foreground">
              {mockNetworkData.dailyVolume} ETH
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              ≈ ${mockNetworkData.dailyVolumeUsd} USD
            </div>
          </motion.div>

          {/* Active Campaigns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-muted/30 rounded-xl p-4 border border-white/10"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Active Campaigns
              </span>
              <Badge className="bg-cyber-blue/20 text-cyber-blue font-mono text-sm">
                +{mockNetworkData.newCampaignsToday} today
              </Badge>
            </div>
            <div className="font-mono text-2xl font-bold text-foreground">
              {mockNetworkData.activeCampaigns.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Across 12 categories
            </div>
          </motion.div>

          {/* Gas Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-muted/30 rounded-xl p-4 border border-white/10"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Polygon Gas Price
              </span>
              <Badge className="bg-cyber-purple/20 text-cyber-purple font-mono text-sm">
                {mockNetworkData.gasPriceStatus}
              </Badge>
            </div>
            <div className="font-mono text-2xl font-bold text-foreground">
              {mockNetworkData.gasPrice} GWEI
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              ≈ $0.001 USD
            </div>
          </motion.div>

          {/* Success Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-muted/30 rounded-xl p-4 border border-white/10"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Success Rate
              </span>
              <Badge className="bg-cyber-yellow/20 text-cyber-yellow font-mono text-sm">
                This month
              </Badge>
            </div>
            <div className="font-mono text-2xl font-bold text-foreground">
              {mockNetworkData.successRate}%
            </div>
            <Progress 
              value={mockNetworkData.successRate} 
              className="mt-2 h-2 progress-glow"
            />
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
