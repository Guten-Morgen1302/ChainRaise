import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Zap,
  Brain,
  Sparkles,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";

interface CampaignAssistantProps {
  title?: string;
  description?: string;
  category?: string;
  goalAmount?: number;
  onTitleSuggestion?: (title: string) => void;
  onDescriptionSuggestion?: (description: string) => void;
}

interface AISuggestion {
  type: "info" | "warning" | "success";
  title: string;
  content: string;
  action?: string;
}

export default function CampaignAssistant({ 
  title = "", 
  description = "", 
  category = "", 
  goalAmount = 0,
  onTitleSuggestion,
  onDescriptionSuggestion 
}: CampaignAssistantProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [credibilityScore, setCredibilityScore] = useState(0);
  const [fundingPrediction, setFundingPrediction] = useState<{
    successProbability: number;
    recommendedGoal: number;
    marketInsights: string[];
  } | null>(null);

  // Title optimization mutation
  const optimizeTitleMutation = useMutation({
    mutationFn: async (title: string) => {
      return await apiRequest("POST", "/api/ai/optimize-title", { title });
    },
    onSuccess: (data) => {
      setSuggestions(prev => [
        ...prev.filter(s => s.title !== "Title Optimization"),
        {
          type: "info",
          title: "Title Optimization",
          content: `AI suggests: "${data.suggestions[0]}" for ${data.engagementBoost} higher engagement`,
          action: "Apply Suggestion"
        }
      ]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to use AI assistance.",
          variant: "destructive",
        });
        return;
      }
      console.error("Title optimization failed:", error);
    },
  });

  // Description enhancement mutation
  const enhanceDescriptionMutation = useMutation({
    mutationFn: async (data: { description: string; category: string }) => {
      return await apiRequest("POST", "/api/ai/enhance-description", data);
    },
    onSuccess: (data) => {
      setSuggestions(prev => [
        ...prev.filter(s => s.title !== "Description Enhancement"),
        {
          type: "success",
          title: "Description Enhancement",
          content: `AI enhanced description: "${data.enhancedDescription?.slice(0, 100)}..."`,
          action: "Apply Enhancement"
        }
      ]);
      
      // Store the enhanced description for later use
      (window as any).lastEnhancedDescription = data.enhancedDescription;
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to use AI assistance.",
          variant: "destructive",
        });
        return;
      }
      console.error("Description enhancement failed:", error);
    },
  });

  // Credibility analysis mutation
  const analyzeCredibilityMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      return await apiRequest("POST", "/api/ai/analyze-credibility", { campaignData });
    },
    onSuccess: (data) => {
      setCredibilityScore(data.score);
      setSuggestions(prev => [
        ...prev.filter(s => s.title !== "Credibility Analysis"),
        ...data.recommendations.map((rec: string, index: number) => ({
          type: data.score > 7 ? "success" : data.score > 5 ? "warning" : "info",
          title: "Credibility Analysis",
          content: rec,
        }))
      ]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to use AI assistance.",
          variant: "destructive",
        });
        return;
      }
      console.error("Credibility analysis failed:", error);
    },
  });

  // Funding prediction mutation
  const predictFundingMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      return await apiRequest("POST", "/api/ai/predict-funding", { campaignData });
    },
    onSuccess: (data) => {
      setFundingPrediction(data);
      setSuggestions(prev => [
        ...prev.filter(s => s.title !== "Funding Prediction"),
        {
          type: data.successProbability > 0.7 ? "success" : data.successProbability > 0.4 ? "warning" : "info",
          title: "Funding Prediction",
          content: `${Math.round(data.successProbability * 100)}% success probability. Recommended goal: ${data.recommendedGoal} ETH`,
          action: "View Insights"
        }
      ]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to use AI assistance.",
          variant: "destructive",
        });
        return;
      }
      console.error("Funding prediction failed:", error);
    },
  });

  // Auto-analyze when campaign data changes
  useEffect(() => {
    if (isAuthenticated && title && description && category) {
      const campaignData = {
        title,
        description,
        category,
        goalAmount,
        duration: 30, // Default 30 days
      };

      // Debounce AI calls
      const timer = setTimeout(() => {
        analyzeCredibilityMutation.mutate(campaignData);
        predictFundingMutation.mutate(campaignData);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [title, description, category, goalAmount, isAuthenticated]);

  const handleOptimizeTitle = () => {
    if (title) {
      optimizeTitleMutation.mutate(title);
    }
  };

  const handleEnhanceDescription = () => {
    if (description && category) {
      enhanceDescriptionMutation.mutate({ description, category });
    }
  };

  const handleApplySuggestion = (suggestion: AISuggestion) => {
    if (suggestion.title === "Title Optimization" && onTitleSuggestion) {
      // Extract suggested title from content
      const match = suggestion.content.match(/AI suggests: "([^"]+)"/);
      if (match) {
        onTitleSuggestion(match[1]);
        toast({
          title: "Title Updated",
          description: "AI-optimized title has been applied.",
        });
      }
    } else if (suggestion.title === "Description Enhancement" && onDescriptionSuggestion) {
      // Apply the enhanced description
      const enhancedDescription = (window as any).lastEnhancedDescription;
      if (enhancedDescription) {
        onDescriptionSuggestion(enhancedDescription);
        toast({
          title: "Enhancement Applied",
          description: "AI-enhanced description has been applied to your campaign.",
        });
      }
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "success": return CheckCircle;
      case "warning": return AlertCircle;
      default: return Lightbulb;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case "success": return "text-cyber-green";
      case "warning": return "text-cyber-yellow";
      default: return "text-cyber-blue";
    }
  };

  const getSuggestionBg = (type: string) => {
    switch (type) {
      case "success": return "bg-cyber-green/10 border-cyber-green/30";
      case "warning": return "bg-cyber-yellow/10 border-cyber-yellow/30";
      default: return "bg-cyber-blue/10 border-cyber-blue/30";
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="glass-morphism border-white/20">
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Log in to access AI assistance</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Assistant Header */}
      <Card className="glass-morphism border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            AI Campaign Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOptimizeTitle}
              disabled={!title || optimizeTitleMutation.isPending}
              className="glass-morphism border-cyber-blue/50 hover:bg-cyber-blue/20"
            >
              {optimizeTitleMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span className="ml-2">Optimize Title</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnhanceDescription}
              disabled={!description || !category || enhanceDescriptionMutation.isPending}
              className="glass-morphism border-cyber-purple/50 hover:bg-cyber-purple/20"
            >
              {enhanceDescriptionMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span className="ml-2">Enhance Text</span>
            </Button>
          </div>

          {/* Credibility Score */}
          {credibilityScore > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-muted/30 rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium">Campaign Credibility Score</span>
                <Badge className={credibilityScore > 7 ? "bg-cyber-green/20 text-cyber-green" : 
                                credibilityScore > 5 ? "bg-cyber-yellow/20 text-cyber-yellow" : 
                                "bg-red-500/20 text-red-400"}>
                  {credibilityScore.toFixed(1)}/10
                </Badge>
              </div>
              <Progress 
                value={(credibilityScore / 10) * 100} 
                className="h-2 progress-glow" 
              />
              <div className="text-xs text-muted-foreground mt-2">
                Based on content quality, market analysis, and best practices
              </div>
            </motion.div>
          )}

          {/* Funding Prediction */}
          {fundingPrediction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-muted/30 rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium">Success Probability</span>
                <Badge className={fundingPrediction.successProbability > 0.7 ? "bg-cyber-green/20 text-cyber-green" : 
                                fundingPrediction.successProbability > 0.4 ? "bg-cyber-yellow/20 text-cyber-yellow" : 
                                "bg-red-500/20 text-red-400"}>
                  {Math.round(fundingPrediction.successProbability * 100)}%
                </Badge>
              </div>
              <Progress 
                value={fundingPrediction.successProbability * 100} 
                className="h-2 progress-glow" 
              />
              <div className="text-xs text-muted-foreground mt-2">
                Recommended goal: {fundingPrediction.recommendedGoal} ETH
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <Card className="glass-morphism border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyber-green" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.map((suggestion, index) => {
              const Icon = getSuggestionIcon(suggestion.type);
              return (
                <motion.div
                  key={`${suggestion.title}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${getSuggestionBg(suggestion.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${getSuggestionColor(suggestion.type)} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1">
                      <div className={`font-medium mb-1 ${getSuggestionColor(suggestion.type)}`}>
                        {suggestion.title}
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        {suggestion.content}
                      </div>
                      {suggestion.action && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApplySuggestion(suggestion)}
                          className="text-xs border-current hover:bg-current/10"
                        >
                          {suggestion.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Market Insights */}
      {fundingPrediction?.marketInsights && fundingPrediction.marketInsights.length > 0 && (
        <Card className="glass-morphism border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyber-purple" />
              Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fundingPrediction.marketInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <Target className="w-4 h-4 text-cyber-purple flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">{insight}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {suggestions.length === 0 && !credibilityScore && !fundingPrediction && (
        <Card className="glass-morphism border-white/20">
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">AI Assistant Ready</p>
            <p className="text-sm text-muted-foreground">
              Fill in your campaign details to get personalized AI recommendations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
