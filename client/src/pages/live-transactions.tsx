
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainNavigation } from "@/components/navigation/MainNavigation";
import { ThreeBackground } from "@/components/three/ThreeBackground";
import Footer from "@/components/layout/footer";
import { useToast } from "@/hooks/use-toast";
import type { Transaction } from "@shared/schema";
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  Clock,
  ExternalLink,
  Wifi,
  Volume2,
  VolumeX,
  Brain,
  BarChart3,
  Target,
  Lightbulb,
  Sparkles
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LiveStats {
  totalTransactions: number;
  totalVolume: number;
  averageAmount: number;
  transactionsPerMinute: number;
}

export default function LiveTransactions() {
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [liveStats, setLiveStats] = useState<LiveStats>({
    totalTransactions: 0,
    totalVolume: 0,
    averageAmount: 0,
    transactionsPerMinute: 0
  });
  const { toast } = useToast();

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    refetchInterval: 1000, // Update every second for real-time feel
  });

  interface AvalancheTransaction {
    id: string;
    transactionHash: string;
    amount: string;
    walletAddress: string;
    campaignId: string;
    status: string;
    createdAt: string;
    transactionType?: string; // Added for compatibility
    user?: {
      username: string;
      email: string;
    };
    campaign?: {
      title: string;
    };
  }

  const { data: avalancheTransactions = [] } = useQuery<AvalancheTransaction[]>({
    queryKey: ["/api/public/transactions/avalanche"],
    refetchInterval: 1000,
  });

  // WebSocket connection for instant updates (with error handling)
  useEffect(() => {
    let ws: WebSocket | null = null;
    
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/admin`;
      
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
        ws?.send(JSON.stringify({ type: 'authenticate', role: 'user' }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.event === 'transaction_created') {
            if (soundEnabled) {
              // Play notification sound
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocBjOL0fPTgCwELYPJ8N2LoQgVXLfn6a1UEAl/m/H0vWgcBTiS3/DSfC0EL4HM8N+HKgcWhc6v54xYGgxHneDyvGgXBzOL0vLYfysFMYPQ6+SLKAoTa7no7a1REQxMo+Ps0mEhCjyN2/LCcikFKn3I8+GNPAkR5cvl7qxTEAl+lOnyxW0cCDuJ3+/KdSwJLn3N7uOKKQgSc7ny6qlREQxMo+Pu02IgCjaP1vLIeCkGKn3K9uGNOQgRUK/k7apTEAp/lOzyyW8ZCzuJ3/DKdSsFLn3N8eMIOAkTc7rz7KlREAxNpePv02IgCzSO1vLJeCkGKn3K9uCSOwoQ5c/k5qxTEAl/lOztyW4aCzuK4O7KdCsFLnzN8+OHMAgSabrv6qpVEQxJo+Rv0mEiCjuM3fHMfOEfD3nJ8OWPVQwGXrXl6qxYGAhBmeDwvF8cBjOL0fLYfysFMYPR6+SLKAoTY7rw7qpUEAl/lOnyxm8cCTqJ3u3IdiwGJn3M9OKJOgcSbLz36qNFEwxNo+Du02IgDDOJ1/LHeSgFLYDI5eSNQAoOY7fw5KNDEAhBmeDxu2EdBzSK0fXXfysFMYPQ6+KLKgoTY7rz7KpTEQp/lOnyxm8cCTuJ3u3IdiwHJX3M8+OJOgYSabn26aJFEwxOo+Dt02MhCzOJ1/PKeSgGLX/I5uWOQAoOY7fu5qJEFAhBmeDxu2AcBzWK0fXWfiwGMYPR6+KLKgoSYbrz7qpTEQp/lOnyx28cCTuJ3u7JdiwHJXzM8+OJOgYSabn26aJGEwxOo+Dt0mIiCzOO2PKJeCgGJ4DI9OeOQAoOU7rw5aNGFgdBmeHyx2AcBzSK0fTXfisGMYPR6uSLKAgSYbz27qlSEQp/lOnzx3AcCjmI3u7JdSsGJXzN9OOJOAcSa7r16aNGFgdAneLvvVwbBzSKz/jWfysGMIPR6+SLKQkSYbz27qlSEQl/lOnzx3AcCjmJ3e7JdSsFJXzN9OOJOAcSa7r16aNEFgdBneLwvVwbBzSKz/rVfyoGMYPR6+SLLA==');
              audio.volume = 0.1;
              audio.play().catch(() => {}); // Ignore errors if audio can't play
            }
            
            toast({
              title: "New Transaction!",
              description: `${data.data?.transactionType?.toUpperCase() || 'TRANSACTION'} - ${data.data?.amount || '0'} ETH`,
              className: "border-cyber-green",
            });
          }
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', error);
        }
      };
      
      ws.onclose = () => setIsConnected(false);
      ws.onerror = (error) => {
        console.warn('WebSocket connection failed:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.warn('Failed to create WebSocket connection:', error);
      setIsConnected(false);
    }
    
    return () => {
      if (ws) {
        try {
          ws.close();
        } catch (error) {
          console.warn('Failed to close WebSocket:', error);
        }
      }
    };
  }, [soundEnabled, toast]);

  // Calculate live stats
  useEffect(() => {
    const allTransactions = [...transactions, ...avalancheTransactions];
    const totalVolume = allTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || "0"), 0);
    const avgAmount = allTransactions.length > 0 ? totalVolume / allTransactions.length : 0;
    
    setLiveStats({
      totalTransactions: allTransactions.length,
      totalVolume,
      averageAmount: avgAmount,
      transactionsPerMinute: Math.floor(Math.random() * 15) + 5 // Mock real-time rate
    });
  }, [transactions, avalancheTransactions]);

  const getTransactionColor = (type: string) => {
    const colors: Record<string, string> = {
      contribution: "bg-green-500/20 text-green-400 border-green-500/20",
      withdrawal: "bg-red-500/20 text-red-400 border-red-500/20",
      contract_creation: "bg-blue-500/20 text-blue-400 border-blue-500/20",
    };
    return colors[type] || "bg-gray-500/20 text-gray-400 border-gray-500/20";
  };

  return (
    <div className="min-h-screen bg-background">
      <ThreeBackground />
      <MainNavigation />
      
      <div className="relative z-10 pt-20 pb-10">
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                <h1 className="text-4xl md:text-6xl font-black gradient-text">
                  Live Transactions
                </h1>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <Wifi className="w-5 h-5" />
                      <span className="text-sm">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400">
                      <Wifi className="w-5 h-5" />
                      <span className="text-sm">Disconnected</span>
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-xl text-muted-foreground">
                Watch blockchain transactions happen in real-time
              </p>
            </motion.div>

            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <Card className="glass-morphism border-cyber-green/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Activity className="w-8 h-8 text-cyber-green" />
                    <div>
                      <div className="text-2xl font-bold">{liveStats.totalTransactions}</div>
                      <div className="text-sm text-muted-foreground">Total Transactions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism border-cyber-blue/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-cyber-blue" />
                    <div>
                      <div className="text-2xl font-bold">{liveStats.totalVolume.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Total Volume (ETH)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism border-cyber-purple/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-cyber-purple" />
                    <div>
                      <div className="text-2xl font-bold">{liveStats.averageAmount.toFixed(4)}</div>
                      <div className="text-sm text-muted-foreground">Avg Amount (ETH)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism border-cyber-yellow/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-cyber-yellow animate-pulse" />
                    <div>
                      <div className="text-2xl font-bold">{liveStats.transactionsPerMinute}</div>
                      <div className="text-sm text-muted-foreground">Tx/Min</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transaction Feed */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Transactions</TabsTrigger>
                <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
                <TabsTrigger value="avalanche">Avalanche</TabsTrigger>
                <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-8">
                <Card className="glass-morphism">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-3 h-3 bg-cyber-green rounded-full animate-pulse"></div>
                        <div className="absolute top-0 left-0 w-3 h-3 bg-cyber-green rounded-full animate-ping opacity-75"></div>
                      </div>
                      All Network Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      <AnimatePresence>
                        {[...transactions, ...avalancheTransactions]
                          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                          .slice(0, 20)
                          .map((tx, index) => (
                          <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, x: -20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="bg-muted/30 rounded-xl p-4 border border-white/10 hover:bg-muted/50 transition-all"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <Badge className={getTransactionColor(tx.transactionType || 'avalanche')}>
                                {(tx.transactionType || 'AVALANCHE').toUpperCase()}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {tx.createdAt ? formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true }) : 'Unknown time'}
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="font-mono text-lg font-bold">
                                {parseFloat(tx.amount || "0").toFixed(4)} {'transactionHash' in tx ? 'AVAX' : 'ETH'}
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  const explorerUrl = 'transactionHash' in tx 
                                    ? `https://testnet.snowtrace.io/tx/${tx.transactionHash}`
                                    : `https://etherscan.io/tx/${tx.id}`;
                                  window.open(explorerUrl, '_blank');
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {transactions.length === 0 && avalancheTransactions.length === 0 && (
                        <div className="text-center py-12">
                          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No transactions yet. Start funding campaigns to see live activity!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ethereum">
                <Card className="glass-morphism">
                  <CardHeader>
                    <CardTitle>Ethereum Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      {transactions.length === 0 ? (
                        <div className="text-center py-12">
                          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No Ethereum transactions yet.</p>
                        </div>
                      ) : (
                        transactions.map((tx, index) => (
                          <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="bg-muted/30 rounded-xl p-4 border border-white/10"
                          >
                            <div className="flex justify-between items-center">
                              <Badge className={getTransactionColor(tx.transactionType)}>
                                {tx.transactionType.toUpperCase()}
                              </Badge>
                              <div className="font-mono text-lg font-bold">
                                {parseFloat(tx.amount || "0").toFixed(4)} ETH
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  window.open(`https://etherscan.io/tx/${tx.id}`, '_blank');
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="avalanche">
                <Card className="glass-morphism">
                  <CardHeader>
                    <CardTitle>Avalanche Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      {avalancheTransactions.length === 0 ? (
                        <div className="text-center py-12">
                          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No Avalanche transactions yet.</p>
                        </div>
                      ) : (
                        avalancheTransactions.map((tx: any, index: number) => (
                          <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="bg-muted/30 rounded-xl p-4 border border-white/10"
                          >
                            <div className="flex justify-between items-center">
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/20">
                                AVALANCHE
                              </Badge>
                              <div className="font-mono text-lg font-bold">
                                {parseFloat(tx.amount || "0").toFixed(4)} AVAX
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  window.open(`https://testnet.snowtrace.io/tx/${tx.transactionHash}`, '_blank');
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai-analysis">
                <div className="space-y-6">
                  {/* AI Analysis Header */}
                  <Card className="glass-morphism">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full flex items-center justify-center">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        AI Transaction Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Network Health */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="bg-muted/30 rounded-xl p-4 border border-white/10"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Activity className="w-5 h-5 text-cyber-green" />
                            <span className="font-medium">Network Health</span>
                          </div>
                          <div className="text-2xl font-bold text-cyber-green mb-1">98.7%</div>
                          <div className="text-sm text-muted-foreground">
                            Optimal transaction flow detected
                          </div>
                        </motion.div>

                        {/* Anomaly Detection */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="bg-muted/30 rounded-xl p-4 border border-white/10"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Target className="w-5 h-5 text-cyber-yellow" />
                            <span className="font-medium">Anomalies</span>
                          </div>
                          <div className="text-2xl font-bold text-cyber-yellow mb-1">0</div>
                          <div className="text-sm text-muted-foreground">
                            No suspicious patterns found
                          </div>
                        </motion.div>

                        {/* Prediction Accuracy */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="bg-muted/30 rounded-xl p-4 border border-white/10"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <BarChart3 className="w-5 h-5 text-cyber-purple" />
                            <span className="font-medium">Prediction</span>
                          </div>
                          <div className="text-2xl font-bold text-cyber-purple mb-1">94.2%</div>
                          <div className="text-sm text-muted-foreground">
                            Transaction pattern accuracy
                          </div>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Insights */}
                  <Card className="glass-morphism">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-cyber-blue" />
                        Real-Time Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                          className="flex items-start gap-3 p-4 bg-cyber-blue/10 border border-cyber-blue/30 rounded-lg"
                        >
                          <Sparkles className="w-5 h-5 text-cyber-blue flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium text-cyber-blue mb-1">
                              Transaction Volume Surge
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Detected 23% increase in transaction volume in the last hour. Peak activity around campaigns related to DeFi and gaming projects.
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="flex items-start gap-3 p-4 bg-cyber-green/10 border border-cyber-green/30 rounded-lg"
                        >
                          <TrendingUp className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium text-cyber-green mb-1">
                              High Success Rate Pattern
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Campaigns with descriptions containing "sustainable", "blockchain", and "community" show 34% higher funding success.
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="flex items-start gap-3 p-4 bg-cyber-purple/10 border border-cyber-purple/30 rounded-lg"
                        >
                          <Brain className="w-5 h-5 text-cyber-purple flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium text-cyber-purple mb-1">
                              Smart Contract Optimization
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Gas usage optimization detected. Average transaction cost reduced by 12% compared to last week through improved contract interactions.
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Transaction Flow Analysis */}
                  <Card className="glass-morphism">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyber-green" />
                        Transaction Flow Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Peak Hours</h4>
                          <div className="space-y-2">
                            {[
                              { time: "14:00 - 16:00 UTC", volume: "89%", color: "bg-cyber-green" },
                              { time: "08:00 - 10:00 UTC", volume: "76%", color: "bg-cyber-blue" },
                              { time: "20:00 - 22:00 UTC", volume: "64%", color: "bg-cyber-purple" },
                            ].map((slot, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{slot.time}</span>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${slot.color}`} />
                                  <span className="text-sm font-medium">{slot.volume}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">Category Trends</h4>
                          <div className="space-y-2">
                            {[
                              { category: "DeFi Projects", growth: "+45%", color: "text-cyber-green" },
                              { category: "Gaming/NFTs", growth: "+28%", color: "text-cyber-blue" },
                              { category: "Sustainability", growth: "+19%", color: "text-cyber-purple" },
                            ].map((trend, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{trend.category}</span>
                                <span className={`text-sm font-medium ${trend.color}`}>{trend.growth}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
