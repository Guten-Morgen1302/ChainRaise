import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PaymentModal } from "@/components/PaymentModal";
import { AvalanchePaymentModal } from "@/components/payment/AvalanchePaymentModal";
import { WalletConnection } from "@/components/WalletConnection";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CampaignStats from "@/components/campaign/campaign-stats";
import { ErrorDisplay } from "@/components/ui/error-display";
import { 
  Calendar, 
  Users, 
  Target, 
  ExternalLink, 
  Heart, 
  Share2, 
  Flag,
  Wallet,
  TrendingUp,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function CampaignDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionMessage, setContributionMessage] = useState("");
  const [activeTab, setActiveTab] = useState("story");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAvalanchePayment, setShowAvalanchePayment] = useState(false);
  
  const { isConnected } = useWallet();

  const { data: campaign, isLoading } = useQuery({
    queryKey: [`/api/campaigns/${id}`],
    retry: false,
  });

  // Handle case when campaign data is loading or not found
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-blue mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading campaign...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Campaign Not Found</h2>
            <p className="text-muted-foreground">The campaign you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Ensure campaign has required properties with defaults
  const campaignData = {
    id: (campaign as any)?.id || '',
    title: (campaign as any)?.title || 'Untitled Campaign',
    description: (campaign as any)?.description || 'No description available',
    imageUrl: (campaign as any)?.imageUrl || "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
    category: (campaign as any)?.category || 'General',
    currentAmount: parseFloat((campaign as any)?.currentAmount || '0'),
    goalAmount: parseFloat((campaign as any)?.goalAmount || '1000'),
    currency: (campaign as any)?.currency || 'ETH',
    backerCount: parseInt((campaign as any)?.backerCount || '0'),
    deadline: (campaign as any)?.deadline || new Date().toISOString(),
    status: (campaign as any)?.status || 'active',
    creatorId: (campaign as any)?.creatorId || '',
    credibilityScore: parseFloat((campaign as any)?.credibilityScore || '0'),
    smartContractAddress: (campaign as any)?.smartContractAddress || '',
    updates: (campaign as any)?.updates || [],
    ...(campaign as any)
  };

  const { data: contributions = [] } = useQuery({
    queryKey: [`/api/contributions/${id}`],
    retry: false,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: [`/api/transactions/${id}`],
    retry: false,
  });

  const progress = (campaignData.currentAmount / campaignData.goalAmount) * 100;
  const deadline = new Date(campaignData.deadline);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isCompleted = campaignData.status === 'completed' || daysLeft === 0;
  const isOwner = user?.id === campaignData.creatorId;

  const contributeMutation = useMutation({
    mutationFn: async (data: {
      campaignId: string;
      amount: string;
      message?: string;
      paymentMethod: string;
    }) => {
      return await apiRequest("POST", "/api/contributions", data);
    },
    onSuccess: () => {
      toast({
        title: "Contribution Successful!",
        description: "Thank you for supporting this campaign.",
      });
      setContributionAmount("");
      setContributionMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/contributions/${id}`] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You need to log in to contribute to campaigns.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 2000);
        return;
      }
      
      // Enhanced error handling for blockchain-related issues
      let errorTitle = "Contribution Failed";
      let errorDescription = error.message;
      
      if (error.message?.includes("insufficient funds")) {
        errorTitle = "Insufficient Funds";
        errorDescription = "You don't have enough funds to complete this transaction, including gas fees. Please add more ETH to your wallet.";
      } else if (error.message?.includes("gas")) {
        errorTitle = "Gas Fee Error";
        errorDescription = "There was an issue with gas fees. The network might be congested. Try again with higher gas fees.";
      } else if (error.message?.includes("rejected")) {
        errorTitle = "Transaction Cancelled";
        errorDescription = "You cancelled the transaction in your wallet.";
      } else if (error.message?.includes("network")) {
        errorTitle = "Network Error";
        errorDescription = "There was a network connectivity issue. Please check your connection and try again.";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    },
  });

  // Remove duplicate definitions since they're already defined above

  const handleContribute = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to contribute to this campaign.",
        variant: "destructive",
      });
      return;
    }

    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount.",
        variant: "destructive",
      });
      return;
    }

    contributeMutation.mutate({
      campaignId: campaignData.id,
      amount: contributionAmount,
      message: contributionMessage,
      paymentMethod: "crypto",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative py-12 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  {/* Campaign Image */}
                  <div className="relative rounded-2xl overflow-hidden mb-6 h-80">
                    <img 
                      src={campaignData.imageUrl} 
                      alt={campaignData.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={`bg-cyber-green/90 px-3 py-1 text-sm font-medium`}>
                        {campaignData.category}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button variant="outline" size="icon" className="glass-morphism">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="glass-morphism">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="glass-morphism">
                        <Flag className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Campaign Title and Meta */}
                  <div className="mb-6">
                    <h1 className="text-3xl md:text-4xl font-black mb-4 gradient-text">
                      {campaignData.title}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      {campaignData.description}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="sticky top-24"
                >
                  <Card className="glass-morphism">
                    <CardContent className="p-6">
                      {/* Progress */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-2xl font-bold">
                            {campaignData.currentAmount} {campaignData.currency}
                          </span>
                          <Badge variant="secondary" className="font-mono">
                            {Math.round(progress)}%
                          </Badge>
                        </div>
                        <Progress value={progress} className="h-3 mb-2 progress-glow" />
                        <div className="text-sm text-muted-foreground">
                          raised of {campaignData.goalAmount} {campaignData.currency} goal
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-cyber-blue">
                            {campaignData.backerCount}
                          </div>
                          <div className="text-sm text-muted-foreground">Backers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-cyber-green">
                            {daysLeft}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {isCompleted ? "Completed" : "Days left"}
                          </div>
                        </div>
                      </div>

                      {/* Contribution Form */}
                      {!isCompleted && !isOwner && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Contribution Amount (ETH)
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.1"
                              value={contributionAmount}
                              onChange={(e) => setContributionAmount(e.target.value)}
                              className="form-focus"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Message (Optional)
                            </label>
                            <Textarea
                              placeholder="Leave a message of support..."
                              value={contributionMessage}
                              onChange={(e) => setContributionMessage(e.target.value)}
                              className="form-focus"
                              rows={3}
                            />
                          </div>

                          <Button
                            className="w-full bg-gradient-to-r from-cyber-blue to-cyber-green hover:scale-105 transition-all duration-300"
                            onClick={handleContribute}
                            disabled={contributeMutation.isPending}
                          >
                            {contributeMutation.isPending ? (
                              <>
                                <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                Contributing...
                              </>
                            ) : (
                              <>
                                <Wallet className="w-4 h-4 mr-2" />
                                Back This Project
                              </>
                            )}
                          </Button>
                          
                          {/* Avalanche Payment Section */}
                          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border">
                            <div className="flex items-center gap-2 mb-3">
                              <Wallet className="h-5 w-5 text-blue-600" />
                              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                                Pay with Avalanche
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                Instant & Secure
                              </Badge>
                            </div>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                              Pay instantly with AVAX from your connected wallet
                            </p>
                            
                            {isConnected && (
                              <WalletConnection compact={true} />
                            )}
                            
                            <Button
                              onClick={() => setShowAvalanchePayment(true)}
                              disabled={!isAuthenticated}
                              className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              data-testid="button-avalanche-pay"
                            >
                              <Wallet className="h-4 w-4 mr-2" />
                              {isConnected ? 'Pay with AVAX' : 'Connect Wallet to Pay'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Owner Actions */}
                      {isOwner && (
                        <div className="space-y-2">
                          <Button className="w-full" variant="outline">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            View Analytics
                          </Button>
                          <Button className="w-full" variant="outline">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Post Update
                          </Button>
                        </div>
                      )}

                      {/* Credibility Score */}
                      {campaignData.credibilityScore > 0 && (
                        <div className="mt-6 pt-4 border-t border-muted">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Credibility Score</span>
                            <Badge className="bg-cyber-green/20 text-cyber-green">
                              {campaignData.credibilityScore}/10
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Campaign Details Tabs */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="glass-morphism w-full justify-start mb-8">
                <TabsTrigger value="story">Story</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
                <TabsTrigger value="backers">Backers</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="blockchain">On-Chain</TabsTrigger>
              </TabsList>

              <TabsContent value="story">
                <Card className="glass-morphism">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-6">About This Project</h3>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        {campaignData.description}
                      </p>
                      
                      {/* Sample story content */}
                      <div className="mt-8 space-y-6">
                        <div>
                          <h4 className="text-xl font-semibold mb-3">The Problem</h4>
                          <p className="text-muted-foreground">
                            Traditional solutions lack the innovation and blockchain integration needed for modern users.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-xl font-semibold mb-3">Our Solution</h4>
                          <p className="text-muted-foreground">
                            This project represents the next evolution in {campaignData.category.toLowerCase()} technology, 
                            combining cutting-edge features with user-friendly design.
                          </p>
                        </div>

                        <div>
                          <h4 className="text-xl font-semibold mb-3">Why Support Us?</h4>
                          <ul className="text-muted-foreground space-y-2">
                            <li>• Experienced team with proven track record</li>
                            <li>• Transparent development process</li>
                            <li>• Community-driven approach</li>
                            <li>• Sustainable and scalable solution</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="updates">
                <Card className="glass-morphism">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-6">Project Updates</h3>
                    {campaignData.updates && campaignData.updates.length > 0 ? (
                      <div className="space-y-6">
                        {campaignData.updates.map((update: any, index: number) => (
                          <div key={index} className="border-l-2 border-cyber-blue pl-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-cyber-blue" />
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(update.createdAt || Date.now()), { addSuffix: true })}
                              </span>
                            </div>
                            <h4 className="font-semibold mb-2">{update.title}</h4>
                            <p className="text-muted-foreground">{update.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No updates yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="backers">
                <Card className="glass-morphism">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-6">Backers ({Array.isArray(contributions) ? contributions.length : 0})</h3>
                    {Array.isArray(contributions) && contributions.length > 0 ? (
                      <div className="space-y-4">
                        {contributions.map((contribution: any) => (
                          <div key={contribution.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {contribution.isAnonymous ? "?" : "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {contribution.isAnonymous ? "Anonymous" : "Backer"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDistanceToNow(new Date(contribution.createdAt), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono font-bold">
                                {contribution.amount} {contribution.currency}
                              </div>
                              {contribution.message && (
                                <div className="text-sm text-muted-foreground italic">
                                  "{contribution.message}"
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No backers yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments">
                <Card className="glass-morphism">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-6">Comments</h3>
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Comments feature coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="blockchain">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="glass-morphism">
                    <CardHeader>
                      <CardTitle>Smart Contract</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-muted-foreground">Contract Address</label>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                              {campaignData.smartContractAddress || "Not deployed"}
                            </code>
                            {campaignData.smartContractAddress && (
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <label className="text-sm text-muted-foreground">Network</label>
                          <div className="mt-1">
                            <Badge className="bg-purple-500/20 text-purple-400">
                              Polygon Mumbai Testnet
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-morphism">
                    <CardHeader>
                      <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(transactions) && transactions.length > 0 ? (
                        <div className="space-y-3">
                          {(transactions as any[]).slice(0, 5).map((tx: any) => (
                            <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div>
                                <div className="text-sm font-medium">
                                  {tx.transactionType === "contribution" ? "+" : "-"}{tx.amount} ETH
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">
                                  {tx.hash.slice(0, 10)}...{tx.hash.slice(-6)}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className={
                                  tx.transactionType === "contribution" 
                                    ? "bg-cyber-green/20 text-cyber-green" 
                                    : "bg-cyber-purple/20 text-cyber-purple"
                                }>
                                  {tx.transactionType}
                                </Badge>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No transactions yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>

      <Footer />
      
      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        campaignId={campaignData.id}
        campaignTitle={campaignData.title}
        minAmount={0.001}
        maxAmount={10}
      />

      {/* Avalanche Payment Modal */}
      <AvalanchePaymentModal
        isOpen={showAvalanchePayment}
        onClose={() => setShowAvalanchePayment(false)}
        campaign={{
          id: campaignData.id,
          title: campaignData.title,
          goalAmount: campaignData.goalAmount.toString(),
          currentAmount: campaignData.currentAmount.toString(),
          currency: campaignData.currency,
        }}
        onPaymentSuccess={(transaction) => {
          // Update campaign data and show success message
          queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${id}`] });
          queryClient.invalidateQueries({ queryKey: ["/api/transactions", id] });
          toast({
            title: "Payment Successful!",
            description: `Successfully contributed ${transaction.amount} AVAX to ${campaignData.title}`,
          });
        }}
      />
    </div>
  );
}
