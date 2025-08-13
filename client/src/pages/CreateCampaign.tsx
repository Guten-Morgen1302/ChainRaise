import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Sparkles, TrendingUp, Target, Plus, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const campaignSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  category: z.string().min(1, "Please select a category"),
  fundingType: z.enum(["donation", "reward", "equity"], {
    errorMap: () => ({ message: "Please select a funding type" }),
  }),
  goalAmount: z.string().min(1, "Goal amount is required"),
  currency: z.string().default("ETH"),
  deadline: z.string().min(1, "Deadline is required"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).max(10, "Maximum 10 tags allowed"),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface RewardTier {
  tier: string;
  amount: string;
  description: string;
  estimatedDelivery?: string;
  limit?: number;
}

export default function CreateCampaign() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [currentTag, setCurrentTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [rewardTiers, setRewardTiers] = useState<RewardTier[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<{
    title?: string[];
    description?: string;
    credibilityScore?: number;
    fundingPrediction?: any;
  }>({});
  
  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      fundingType: "reward",
      goalAmount: "",
      currency: "ETH",
      deadline: "",
      imageUrl: "",
      tags: [],
    },
  });

  // AI Title Optimization
  const titleOptimization = useMutation({
    mutationFn: async (title: string) => {
      return apiRequest("POST", "/api/ai/optimize-title", { title });
    },
    onSuccess: (data) => {
      setAiSuggestions(prev => ({ ...prev, title: data.suggestions }));
    },
  });

  // AI Description Enhancement
  const descriptionEnhancement = useMutation({
    mutationFn: async (description: string, category: string) => {
      return apiRequest("POST", "/api/ai/enhance-description", { description, category });
    },
    onSuccess: (data) => {
      setAiSuggestions(prev => ({ ...prev, description: data.enhanced }));
    },
  });

  // AI Credibility Analysis
  const credibilityAnalysis = useMutation({
    mutationFn: async (campaignData: any) => {
      return apiRequest("POST", "/api/ai/analyze-credibility", { campaignData });
    },
    onSuccess: (data) => {
      setAiSuggestions(prev => ({ ...prev, credibilityScore: data.score }));
    },
  });

  // AI Funding Prediction
  const fundingPrediction = useMutation({
    mutationFn: async (campaignData: any) => {
      return apiRequest("POST", "/api/ai/predict-funding", { campaignData });
    },
    onSuccess: (data) => {
      setAiSuggestions(prev => ({ ...prev, fundingPrediction: data }));
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData & { rewards?: RewardTier[] }) => {
      return apiRequest("POST", "/api/campaigns", {
        ...data,
        tags: tags,
        rewards: rewardTiers.length > 0 ? rewardTiers : undefined,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Campaign Created Successfully!",
        description: "Your campaign is now live and accepting contributions.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setLocation(`/campaigns/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addTag = () => {
    if (currentTag && !tags.includes(currentTag) && tags.length < 10) {
      setTags([...tags, currentTag]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addRewardTier = () => {
    setRewardTiers([...rewardTiers, {
      tier: `Tier ${rewardTiers.length + 1}`,
      amount: "",
      description: "",
    }]);
  };

  const removeRewardTier = (index: number) => {
    setRewardTiers(rewardTiers.filter((_, i) => i !== index));
  };

  const updateRewardTier = (index: number, field: keyof RewardTier, value: string | number) => {
    setRewardTiers(prev => prev.map((tier, i) => 
      i === index ? { ...tier, [field]: value } : tier
    ));
  };

  // Check if user is verified for KYC
  if (!user) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (user.kycStatus !== "verified") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to complete KYC verification before creating campaigns.{" "}
            <a href="/kyc" className="text-blue-600 hover:underline">
              Complete verification here
            </a>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="create-campaign-page">
      <div className="max-w-4xl mx-auto">
        <Card className="glass-morphism border-cyan-200 dark:border-cyan-800">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Create New Campaign
            </CardTitle>
            <CardDescription>
              Launch your project with blockchain transparency and AI-powered optimization
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit((data) => createCampaignMutation.mutate({ ...data, rewards: rewardTiers }))} className="space-y-8">
              {/* Campaign Title with AI Optimization */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title">Campaign Title *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => titleOptimization.mutate(form.watch("title"))}
                    disabled={!form.watch("title") || titleOptimization.isPending}
                    data-testid="button-optimize-title"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {titleOptimization.isPending ? "Optimizing..." : "AI Optimize"}
                  </Button>
                </div>
                
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Enter your campaign title"
                  className="text-lg"
                  data-testid="input-campaign-title"
                />
                
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
                )}

                {/* AI Title Suggestions */}
                {aiSuggestions.title && aiSuggestions.title.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      ✨ AI-Optimized Title Suggestions:
                    </h4>
                    <div className="space-y-2">
                      {aiSuggestions.title.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => form.setValue("title", suggestion)}
                          className="block w-full text-left p-2 hover:bg-blue-100 dark:hover:bg-blue-800 rounded text-sm"
                          data-testid={`button-title-suggestion-${index}`}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Campaign Description with AI Enhancement */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Campaign Description *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => descriptionEnhancement.mutate(form.watch("description"), form.watch("category"))}
                    disabled={!form.watch("description") || !form.watch("category") || descriptionEnhancement.isPending}
                    data-testid="button-enhance-description"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {descriptionEnhancement.isPending ? "Enhancing..." : "AI Enhance"}
                  </Button>
                </div>

                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Describe your project, goals, and why people should support it..."
                  rows={6}
                  data-testid="textarea-campaign-description"
                />

                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
                )}

                {/* AI Enhanced Description */}
                {aiSuggestions.description && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                      ✨ AI-Enhanced Description:
                    </h4>
                    <div className="prose dark:prose-invert text-sm max-w-none">
                      <p className="whitespace-pre-wrap">{aiSuggestions.description}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => form.setValue("description", aiSuggestions.description!)}
                      className="mt-3"
                      data-testid="button-use-enhanced-description"
                    >
                      Use Enhanced Version
                    </Button>
                  </div>
                )}
              </div>

              {/* Category and Funding Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={form.watch("category")} 
                    onValueChange={(value) => form.setValue("category", value)}
                  >
                    <SelectTrigger data-testid="select-campaign-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Gaming">Gaming</SelectItem>
                      <SelectItem value="Art">Art & Design</SelectItem>
                      <SelectItem value="Film">Film & Video</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Publishing">Publishing</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Fashion">Fashion</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Environment">Environment</SelectItem>
                      <SelectItem value="Community">Community</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-red-500 text-sm">{form.formState.errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="funding-type">Funding Type *</Label>
                  <Select 
                    value={form.watch("fundingType")} 
                    onValueChange={(value) => form.setValue("fundingType", value as "donation" | "reward" | "equity")}
                  >
                    <SelectTrigger data-testid="select-funding-type">
                      <SelectValue placeholder="Select funding type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="donation">Donation-based</SelectItem>
                      <SelectItem value="reward">Reward-based</SelectItem>
                      <SelectItem value="equity">Equity-based</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.fundingType && (
                    <p className="text-red-500 text-sm">{form.formState.errors.fundingType.message}</p>
                  )}
                </div>
              </div>

              {/* Funding Goal and Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="goal-amount">Funding Goal *</Label>
                  <Input
                    id="goal-amount"
                    type="number"
                    step="0.001"
                    {...form.register("goalAmount")}
                    placeholder="100"
                    data-testid="input-goal-amount"
                  />
                  {form.formState.errors.goalAmount && (
                    <p className="text-red-500 text-sm">{form.formState.errors.goalAmount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={form.watch("currency")} 
                    onValueChange={(value) => form.setValue("currency", value)}
                  >
                    <SelectTrigger data-testid="select-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">ETH (Ethereum)</SelectItem>
                      <SelectItem value="MATIC">MATIC (Polygon)</SelectItem>
                      <SelectItem value="USDC">USDC (Stable)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Campaign Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    {...form.register("deadline")}
                    min={new Date().toISOString().split('T')[0]}
                    data-testid="input-campaign-deadline"
                  />
                  {form.formState.errors.deadline && (
                    <p className="text-red-500 text-sm">{form.formState.errors.deadline.message}</p>
                  )}
                </div>
              </div>

              {/* Campaign Image */}
              <div className="space-y-2">
                <Label htmlFor="image-url">Campaign Image URL (Optional)</Label>
                <Input
                  id="image-url"
                  type="url"
                  {...form.register("imageUrl")}
                  placeholder="https://example.com/your-image.jpg"
                  data-testid="input-image-url"
                />
                {form.formState.errors.imageUrl && (
                  <p className="text-red-500 text-sm">{form.formState.errors.imageUrl.message}</p>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-4">
                <Label>Tags (Optional, max 10)</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    data-testid="input-campaign-tag"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={!currentTag || tags.length >= 10}
                    data-testid="button-add-tag"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Display Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => removeTag(tag)}
                          data-testid={`button-remove-tag-${index}`}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Reward Tiers (for reward-based campaigns) */}
              {form.watch("fundingType") === "reward" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Reward Tiers</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addRewardTier}
                      data-testid="button-add-reward-tier"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Reward Tier
                    </Button>
                  </div>

                  {rewardTiers.map((tier, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Reward Tier {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRewardTier(index)}
                          data-testid={`button-remove-reward-tier-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Tier name"
                          value={tier.tier}
                          onChange={(e) => updateRewardTier(index, "tier", e.target.value)}
                          data-testid={`input-tier-name-${index}`}
                        />
                        <Input
                          placeholder="Minimum amount"
                          value={tier.amount}
                          onChange={(e) => updateRewardTier(index, "amount", e.target.value)}
                          data-testid={`input-tier-amount-${index}`}
                        />
                      </div>

                      <Textarea
                        placeholder="Reward description"
                        value={tier.description}
                        onChange={(e) => updateRewardTier(index, "description", e.target.value)}
                        className="mt-4"
                        data-testid={`textarea-tier-description-${index}`}
                      />
                    </Card>
                  ))}
                </div>
              )}

              {/* AI Analysis Section */}
              <div className="space-y-4">
                <Separator />
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => credibilityAnalysis.mutate({
                      title: form.watch("title"),
                      description: form.watch("description"),
                      category: form.watch("category"),
                      goalAmount: form.watch("goalAmount"),
                    })}
                    disabled={credibilityAnalysis.isPending}
                    data-testid="button-analyze-credibility"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    {credibilityAnalysis.isPending ? "Analyzing..." : "Analyze Credibility"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fundingPrediction.mutate({
                      title: form.watch("title"),
                      description: form.watch("description"),
                      category: form.watch("category"),
                      goalAmount: form.watch("goalAmount"),
                      tags: tags,
                    })}
                    disabled={fundingPrediction.isPending}
                    data-testid="button-predict-funding"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {fundingPrediction.isPending ? "Predicting..." : "Predict Success"}
                  </Button>
                </div>

                {/* AI Analysis Results */}
                {(aiSuggestions.credibilityScore || aiSuggestions.fundingPrediction) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiSuggestions.credibilityScore && (
                      <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20">
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                          Credibility Score: {aiSuggestions.credibilityScore}/10
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          Based on campaign details and creator profile
                        </p>
                      </Card>
                    )}

                    {aiSuggestions.fundingPrediction && (
                      <Card className="p-4 bg-purple-50 dark:bg-purple-900/20">
                        <h4 className="font-medium text-purple-800 dark:text-purple-200">
                          Success Probability: {Math.round(aiSuggestions.fundingPrediction.probability * 100)}%
                        </h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                          {aiSuggestions.fundingPrediction.recommendation}
                        </p>
                      </Card>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-lg"
                disabled={createCampaignMutation.isPending}
                data-testid="button-create-campaign"
              >
                {createCampaignMutation.isPending ? "Creating Campaign..." : "Create Campaign"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}