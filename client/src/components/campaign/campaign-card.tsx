import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Calendar, Users, ExternalLink } from "lucide-react";
import type { Campaign } from "@shared/schema";

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const progress = (parseFloat(campaign.currentAmount || "0") / parseFloat(campaign.goalAmount || "1")) * 100;
  const isCompleted = campaign.status === "completed";
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Technology: "bg-cyber-green/90",
      Gaming: "bg-cyber-purple/90",
      DeFi: "bg-cyber-yellow/90 text-black",
      Creative: "bg-cyber-pink/90",
      GreenTech: "bg-cyber-green/90",
      Research: "bg-cyan-400/90 text-black",
    };
    return colors[category] || "bg-gray-500/90";
  };

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
        className="cursor-pointer"
      >
        <Card className="group glass-morphism rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-cyber-blue/20 transition-all duration-500 card-hover">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <img 
              src={campaign.imageUrl || "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"} 
              alt={campaign.title || "Campaign Image"}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            />
            <div className="absolute top-4 left-4">
              <Badge className={`${getCategoryColor(campaign.category)} px-3 py-1 rounded-full text-sm font-medium`}>
                {campaign.category}
              </Badge>
            </div>
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-mono">
              {Math.round(progress)}% funded
            </div>
          </div>

          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2 group-hover:text-cyber-blue transition-colors duration-300">
              {campaign.title}
            </h3>
            <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
              {campaign.description}
            </p>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-mono font-bold">
                  {campaign.currentAmount} / {campaign.goalAmount} {campaign.currency}
                </span>
              </div>
              <Progress 
                value={progress} 
                className="h-2 progress-glow"
              />
            </div>

            {/* Stats */}
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="font-mono">{campaign.backerCount} backers</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="font-mono">
                  {isCompleted ? "Successfully funded!" : `${daysLeft} days left`}
                </span>
              </div>
            </div>

            {/* Credibility Score */}
            {parseFloat(campaign.credibilityScore) > 0 && (
              <div className="mt-4 pt-4 border-t border-muted">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Credibility Score</span>
                  <Badge variant="secondary" className="bg-cyber-green/20 text-cyber-green">
                    {campaign.credibilityScore}/10
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
