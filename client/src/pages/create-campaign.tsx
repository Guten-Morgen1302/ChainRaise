import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { MainNavigation } from "@/components/navigation/MainNavigation";
import { ThreeBackground } from "@/components/three/ThreeBackground";
import Footer from "@/components/layout/footer";
import CampaignAssistant from "@/components/ai/campaign-assistant";
import KYCStatus from "@/components/kyc/kyc-status";
import { insertCampaignSchema } from "@shared/schema";
import { 
  Lightbulb, 
  Target, 
  Calendar, 
  Image as ImageIcon, 
  Tag,
  Rocket,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useLocation } from "wouter";

const createCampaignFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  fundingType: z.string().min(1, "Funding type is required"),
  goalAmount: z.string().min(1, "Goal amount is required"),
  currency: z.string().default("ETH"),
  imageUrl: z.string().optional(),
  tags: z.string().optional(),
});

type CreateCampaignForm = z.infer<typeof createCampaignFormSchema>;

export default function CreateCampaign() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [canCreateCampaign, setCanCreateCampaign] = useState<{ canCreate: boolean; reason?: string } | null>(null);

  const form = useForm<CreateCampaignForm>({
    resolver: zodResolver(createCampaignFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      fundingType: "reward",
      goalAmount: "",
      currency: "ETH",
      imageUrl: "",
      tags: "",
    },
  });

  const { data: userProfile } = useQuery({
    queryKey: ["/api/user"],
    enabled: isAuthenticated,
    refetchOnWindowFocus: true, // Ensure fresh data when coming back to the page
  });

  // Get fresh KYC status
  const { data: kycStatus } = useQuery({
    queryKey: ["/api/kyc/status"],
    enabled: isAuthenticated,
    refetchOnWindowFocus: true,
  });

  // Use the most up-to-date KYC status
  const currentKycStatus = kycStatus?.status || userProfile?.kycStatus || user?.kycStatus;

  // Check if user can create campaigns
  const { data: campaignEligibility } = useQuery({
    queryKey: ["/api/user/can-create-campaign"],
    enabled: isAuthenticated && currentKycStatus === "approved",
    onSuccess: (data) => setCanCreateCampaign(data),
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CreateCampaignForm) => {
      const { tags, ...campaignData } = data;
      const tagsArray = tags ? tags.split(",").map(tag => tag.trim()).filter(Boolean) : [];
      
      return await apiRequest("POST", "/api/campaigns", {
        ...campaignData,
        tags: tagsArray,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Campaign Created Successfully!",
        description: "Your campaign is now live and ready for backers.",
      });
      setLocation(`/campaigns/${data.id}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You need to complete KYC verification to create campaigns.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 2000);
        return;
      }
      toast({
        title: "Campaign Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateCampaignForm) => {
    console.log("Form submission triggered:", data);
    console.log("Form errors:", form.formState.errors);
    
    if (!canCreateCampaign?.canCreate) {
      toast({
        title: "Cannot Create Campaign",
        description: canCreateCampaign?.reason || "You are not eligible to create campaigns at this time.",
        variant: "destructive",
      });
      return;
    }
    
    createCampaignMutation.mutate(data);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = () => {
    const values = form.getValues();
    switch (currentStep) {
      case 1:
        return values.title && values.description;
      case 2:
        return values.category && values.fundingType;
      case 3:
        return values.goalAmount && values.currency;
      case 4:
        return true; // Optional fields in step 4
      default:
        return false;
    }
  };

  const categories = [
    { value: "Technology", label: "Technology", color: "bg-cyber-green" },
    { value: "Gaming", label: "Gaming", color: "bg-cyber-purple" },
    { value: "DeFi", label: "DeFi", color: "bg-cyber-yellow" },
    { value: "Creative", label: "Creative", color: "bg-cyber-pink" },
    { value: "GreenTech", label: "Green Technology", color: "bg-cyber-green" },
    { value: "Research", label: "Research", color: "bg-cyan-400" },
  ];

  const fundingTypes = [
    { value: "donation", label: "Donation", description: "Keep-it-all funding model" },
    { value: "reward", label: "Reward", description: "Offer rewards to backers" },
    { value: "equity", label: "Equity Simulation", description: "Share future value with backers" },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background relative">
        <ThreeBackground />
        <MainNavigation />
        <div className="relative z-10 pt-16 flex justify-center items-center min-h-screen">
          <Card className="glass-morphism max-w-md">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-cyber-yellow mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-4">
                You need to be logged in to create campaigns.
              </p>
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="bg-gradient-to-r from-cyber-blue to-cyber-purple"
              >
                Log In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background relative">
      <ThreeBackground />
      <MainNavigation />
      
      <div className="relative z-10 pt-16">
        {/* Header */}
        <section className="py-12 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-6xl font-black mb-4 gradient-text">
                Launch Your Vision
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Turn your innovative ideas into reality with our AI-powered campaign creation tools
              </p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2 progress-glow mb-6" />
              
              {/* Step Indicators */}
              <div className="flex justify-between">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step < currentStep ? "bg-cyber-green text-white" :
                      step === currentStep ? "bg-cyber-blue text-white" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                    </div>
                    <span className="text-xs mt-2 text-center max-w-20">
                      {step === 1 && "Basics"}
                      {step === 2 && "Details"}
                      {step === 3 && "Funding"}
                      {step === 4 && "Media"}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* KYC and Eligibility Status Check */}
        {currentKycStatus !== "approved" ? (
          <section className="py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <KYCStatus />
            </div>
          </section>
        ) : canCreateCampaign && !canCreateCampaign.canCreate ? (
          <section className="py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="glass-morphism border-red-500/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                    <div>
                      <h3 className="font-semibold text-red-400">Campaign Creation Restricted</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {canCreateCampaign.reason}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        ) : null}

        {/* Main Form */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Step 1: Campaign Basics */}
                    {currentStep === 1 && (
                      <Card className="glass-morphism">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-cyber-blue" />
                            Step 1: Campaign Basics
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">Tell us about your project idea and vision</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Campaign Title *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Revolutionary IoT Smart Home System"
                                    className="form-focus"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description *</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Tell the world about your innovative project. What problem does it solve? What makes it unique?"
                                    className="form-focus min-h-[120px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    )}

                    {/* Step 2: Project Details */}
                    {currentStep === 2 && (
                      <Card className="glass-morphism">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-cyber-purple" />
                            Step 2: Project Details
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">Categorize your project and choose your funding model</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category *</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="form-focus">
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {categories.map((category) => (
                                        <SelectItem key={category.value} value={category.value}>
                                          <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${category.color}/70`}></div>
                                            {category.label}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="fundingType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Funding Model *</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="form-focus">
                                        <SelectValue placeholder="Select funding type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {fundingTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                          <div>
                                            <div className="font-medium">{type.label}</div>
                                            <div className="text-xs text-muted-foreground">{type.description}</div>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Step 3: Funding Details */}
                    {currentStep === 3 && (
                      <Card className="glass-morphism">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-cyber-green" />
                            Step 3: Funding Details
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">Set your funding goal and campaign duration</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="goalAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Funding Goal *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      placeholder="100"
                                      className="form-focus"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="currency"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Currency</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                    <FormControl>
                                      <SelectTrigger className="form-focus">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="ETH">ETH</SelectItem>
                                      <SelectItem value="MATIC">MATIC</SelectItem>
                                      <SelectItem value="USDC">USDC</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Step 4: Media & Tags */}
                    {currentStep === 4 && (
                      <Card className="glass-morphism">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-cyber-purple" />
                            Step 4: Media & Tags
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">Add visual elements and tags to make your campaign discoverable</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Campaign Image URL (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://example.com/image.jpg"
                                    className="form-focus"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tags (comma separated, optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="blockchain, innovation, IoT, sustainable"
                                    className="form-focus"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={prevStep}
                        disabled={currentStep === 1}
                      >
                        Previous
                      </Button>
                      
                      {currentKycStatus !== "approved" && (
                        <div className="text-sm text-muted-foreground">
                          <AlertTriangle className="w-4 h-4 inline mr-1" />
                          KYC verification required (Current: {currentKycStatus?.replace('_', ' ').toUpperCase() || 'NOT SUBMITTED'})
                        </div>
                      )}
                      
                      {currentStep < totalSteps ? (
                        <Button 
                          type="button"
                          onClick={nextStep}
                          disabled={!validateCurrentStep()}
                          className="bg-gradient-to-r from-cyber-blue to-cyber-purple"
                        >
                          Next Step
                        </Button>
                      ) : (
                        <Button 
                          type="submit"
                          className="bg-gradient-to-r from-cyber-blue to-cyber-green hover:scale-105 transition-all duration-300"
                          disabled={createCampaignMutation.isPending || currentKycStatus !== "approved" || (canCreateCampaign && !canCreateCampaign.canCreate)}
                          data-testid="button-launch-campaign"
                        >
                          {createCampaignMutation.isPending ? (
                            <>
                              <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2"></div>
                              Creating Campaign...
                            </>
                          ) : currentKycStatus !== "approved" ? (
                            <>
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              KYC Required
                            </>
                          ) : (canCreateCampaign && !canCreateCampaign.canCreate) ? (
                            <>
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Restricted
                            </>
                          ) : (
                            <>
                              <Rocket className="w-4 h-4 mr-2" />
                              Launch Campaign
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </div>

              {/* AI Assistant Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <CampaignAssistant 
                    title={form.watch("title")}
                    description={form.watch("description")}
                    category={form.watch("category")}
                    goalAmount={parseFloat(form.watch("goalAmount") || "0")}
                    onTitleSuggestion={(title) => form.setValue("title", title)}
                    onDescriptionSuggestion={(description) => form.setValue("description", description)}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
