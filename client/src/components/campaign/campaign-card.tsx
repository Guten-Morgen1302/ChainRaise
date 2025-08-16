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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          scale: 1.02, 
          y: -8,
          rotateX: 2,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="cursor-pointer group relative"
      >
        <Card className="card-premium overflow-hidden relative backdrop-blur-xl border-white/10">
          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-success/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            initial={false}
            animate={{ 
              background: [
                "linear-gradient(45deg, rgba(124, 58, 237, 0.1), rgba(34, 211, 238, 0.05), rgba(16, 185, 129, 0.1))",
                "linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(16, 185, 129, 0.05), rgba(124, 58, 237, 0.1))",
                "linear-gradient(225deg, rgba(16, 185, 129, 0.1), rgba(124, 58, 237, 0.05), rgba(34, 211, 238, 0.1))"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <motion.img 
              src={campaign.imageUrl || "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"} 
              alt={campaign.title || "Campaign Image"}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            {/* Shimmer overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
              initial={{ x: '-100%' }}
              whileHover={{ 
                x: '100%',
                transition: { duration: 0.8, ease: "easeInOut" }
              }}
            />
            <motion.div 
              className="absolute top-4 left-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Badge className={`${getCategoryColor(campaign.category)} px-3 py-1 rounded-full text-sm font-medium shadow-lg border border-white/20`}>
                  {campaign.category}
                </Badge>
              </motion.div>
            </motion.div>
            <motion.div 
              className="absolute top-4 right-4 glass px-3 py-1 rounded-full text-sm font-mono border border-white/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.span
                key={progress}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {Math.round(progress)}% funded
              </motion.span>
            </motion.div>
          </div>

          <CardContent className="p-6 relative z-10">
            <motion.h3 
              className="text-xl font-bold mb-2 transition-colors duration-300"
              whileHover={{ 
                color: "hsl(var(--primary))",
                transition: { duration: 0.2 }
              }}
            >
              {campaign.title}
            </motion.h3>
            <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
              {campaign.description}
            </p>

            {/* Progress */}
            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <motion.span 
                  className="font-mono font-bold gradient-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {campaign.currentAmount} / {campaign.goalAmount} {campaign.currency}
                </motion.span>
              </div>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              >
                <Progress 
                  value={progress} 
                  className="h-2 progress-glow relative overflow-hidden"
                />
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="flex justify-between items-center text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <motion.div 
                className="flex items-center gap-2 text-muted-foreground group-hover:text-accent transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Users className="w-4 h-4" />
                </motion.div>
                <span className="font-mono">{campaign.backerCount} backers</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ 
                    rotate: isCompleted ? 0 : [0, 5, -5, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: isCompleted ? 0 : Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Calendar className="w-4 h-4" />
                </motion.div>
                <span className="font-mono">
                  {isCompleted ? "Successfully funded!" : `${daysLeft} days left`}
                </span>
              </motion.div>
            </motion.div>

            {/* Credibility Score */}
            {campaign.credibilityScore && parseFloat(campaign.credibilityScore) > 0 && (
              <motion.div 
                className="mt-4 pt-4 border-t border-muted"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Credibility Score</span>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Badge 
                      variant="secondary" 
                      className="bg-success/20 text-success border-success/30 shadow-md"
                    >
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                      >
                        {campaign.credibilityScore}/10
                      </motion.span>
                    </Badge>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
