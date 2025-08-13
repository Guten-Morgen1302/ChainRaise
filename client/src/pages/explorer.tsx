import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import TransactionFeed from "@/components/blockchain/transaction-feed";
import NetworkStats from "@/components/blockchain/network-stats";
import type { Transaction, Campaign } from "@shared/schema";
import { 
  Search, 
  ExternalLink, 
  Activity, 
  Blocks, 
  Zap, 
  Globe,
  TrendingUp,
  Users,
  Wallet,
  Clock,
  Filter,
  Copy,
  CheckCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Explorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [copiedAddress, setCopiedAddress] = useState("");

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    refetchInterval: 5000,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 30000,
  });

  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
    retry: false,
  });

  const mockBlocks = [
    {
      number: 12345678,
      hash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
      timestamp: new Date(Date.now() - 30000),
      transactions: 142,
      gasUsed: "8,432,156",
      size: "47.2 KB"
    },
    {
      number: 12345677,
      hash: "0x9876543210fedcba0987654321fedcba0987654321fedcba0987654321fedcba",
      timestamp: new Date(Date.now() - 60000),
      transactions: 89,
      gasUsed: "5,124,893",
      size: "32.8 KB"
    },
    {
      number: 12345676,
      hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      timestamp: new Date(Date.now() - 90000),
      transactions: 234,
      gasUsed: "12,567,342",
      size: "68.1 KB"
    },
  ];

  const mockValidators = [
    { address: "0x1234...5678", stake: "125.4 ETH", uptime: "99.8%", rewards: "2.34 ETH" },
    { address: "0x9876...5432", stake: "98.7 ETH", uptime: "99.5%", rewards: "1.87 ETH" },
    { address: "0xabcd...efgh", stake: "156.2 ETH", uptime: "100%", rewards: "3.12 ETH" },
  ];

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = !searchQuery || 
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.fromAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.toAddress?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === "all" || tx.transactionType === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(""), 2000);
  };

  const formatAddress = (address: string) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16">
        {/* Header */}
        <section className="py-12 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-cyber-green to-cyber-blue rounded-full flex items-center justify-center">
                  <Blocks className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 gradient-text">
                Blockchain Explorer
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Real-time transparency - explore transactions, blocks, and network activity on Polygon blockchain
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search by transaction hash, address, or block number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 glass-morphism border-white/20 focus:border-cyber-blue form-focus text-lg"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Network Overview */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="glass-morphism border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Latest Block</p>
                      <p className="text-2xl font-bold">{mockBlocks[0].number.toLocaleString()}</p>
                    </div>
                    <Blocks className="w-8 h-8 text-cyber-blue" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">24h Transactions</p>
                      <p className="text-2xl font-bold">{(transactions.length * 24).toLocaleString()}</p>
                    </div>
                    <Activity className="w-8 h-8 text-cyber-green" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Gas Price</p>
                      <p className="text-2xl font-bold">0.02 GWEI</p>
                    </div>
                    <Zap className="w-8 h-8 text-cyber-purple" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Network Status</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                        <span className="text-cyber-green font-medium">Healthy</span>
                      </div>
                    </div>
                    <Globe className="w-8 h-8 text-cyber-yellow" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Explorer Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="transactions" className="space-y-6">
              <TabsList className="glass-morphism w-full justify-start">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="blocks">Blocks</TabsTrigger>
                <TabsTrigger value="campaigns">Campaign Contracts</TabsTrigger>
                <TabsTrigger value="validators">Validators</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="transactions">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <h3 className="text-2xl font-bold">Live Transactions</h3>
                    <div className="flex gap-2">
                      {["all", "contribution", "withdrawal", "contract_creation"].map((filter) => (
                        <Button
                          key={filter}
                          variant={activeFilter === filter ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveFilter(filter)}
                          className={activeFilter === filter 
                            ? "bg-cyber-blue" 
                            : "glass-morphism border-white/20"
                          }
                        >
                          {filter.charAt(0).toUpperCase() + filter.slice(1).replace("_", " ")}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Card className="glass-morphism">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="border-b border-muted">
                            <tr>
                              <th className="text-left p-4 font-medium text-muted-foreground">Hash</th>
                              <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                              <th className="text-left p-4 font-medium text-muted-foreground">From</th>
                              <th className="text-left p-4 font-medium text-muted-foreground">To</th>
                              <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                              <th className="text-left p-4 font-medium text-muted-foreground">Time</th>
                              <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTransactions.map((tx) => (
                              <tr key={tx.id} className="border-b border-muted/50 hover:bg-muted/20">
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <code className="text-cyber-blue font-mono text-sm">
                                      {formatHash(tx.hash)}
                                    </code>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-6 h-6"
                                      onClick={() => copyToClipboard(tx.hash)}
                                    >
                                      {copiedAddress === tx.hash ? (
                                        <CheckCircle className="w-3 h-3 text-cyber-green" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </Button>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge className={
                                    tx.transactionType === "contribution"
                                      ? "bg-cyber-green/20 text-cyber-green"
                                      : tx.transactionType === "withdrawal"
                                      ? "bg-cyber-purple/20 text-cyber-purple"
                                      : "bg-cyber-yellow/20 text-cyber-yellow"
                                  }>
                                    {tx.transactionType}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <code className="text-muted-foreground font-mono text-sm">
                                    {formatAddress(tx.fromAddress || "")}
                                  </code>
                                </td>
                                <td className="p-4">
                                  <code className="text-muted-foreground font-mono text-sm">
                                    {formatAddress(tx.toAddress || "")}
                                  </code>
                                </td>
                                <td className="p-4">
                                  <span className="font-mono font-bold">
                                    {tx.amount} ETH
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className="text-muted-foreground text-sm">
                                    {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <Badge className="bg-cyber-green/20 text-cyber-green">
                                    {tx.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="blocks">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Latest Blocks</h3>
                  
                  <Card className="glass-morphism">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="border-b border-muted">
                            <tr>
                              <th className="text-left p-4 font-medium text-muted-foreground">Block</th>
                              <th className="text-left p-4 font-medium text-muted-foreground">Hash</th>
                              <th className="text-left p-4 font-medium text-muted-foreground">Transactions</th>
                              <th className="text-left p-4 font-medium text-muted-foreground">Gas Used</th>
                              <th className="text-left p-4 font-medium text-muted-foreground">Size</th>
                              <th className="text-left p-4 font-medium text-muted-foreground">Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mockBlocks.map((block) => (
                              <tr key={block.number} className="border-b border-muted/50 hover:bg-muted/20">
                                <td className="p-4">
                                  <span className="text-cyber-blue font-bold">
                                    #{block.number.toLocaleString()}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <code className="text-muted-foreground font-mono text-sm">
                                      {formatHash(block.hash)}
                                    </code>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-6 h-6"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="font-medium">{block.transactions}</span>
                                </td>
                                <td className="p-4">
                                  <span className="font-mono text-sm">{block.gasUsed}</span>
                                </td>
                                <td className="p-4">
                                  <span className="text-muted-foreground">{block.size}</span>
                                </td>
                                <td className="p-4">
                                  <span className="text-muted-foreground text-sm">
                                    {formatDistanceToNow(block.timestamp, { addSuffix: true })}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="campaigns">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Campaign Smart Contracts</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.slice(0, 6).map((campaign) => (
                      <Card key={campaign.id} className="glass-morphism">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold truncate">{campaign.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {campaign.category}
                              </p>
                            </div>
                            
                            <div>
                              <label className="text-xs text-muted-foreground">Contract Address</label>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="text-xs font-mono bg-muted px-2 py-1 rounded flex-1">
                                  {campaign.smartContractAddress 
                                    ? formatAddress(campaign.smartContractAddress)
                                    : "Not deployed"
                                  }
                                </code>
                                {campaign.smartContractAddress && (
                                  <Button variant="ghost" size="icon" className="w-6 h-6">
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Raised:</span>
                              <span className="font-mono font-bold">
                                {campaign.currentAmount} {campaign.currency}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Backers:</span>
                              <span className="font-bold">{campaign.backerCount}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="validators">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Network Validators</h3>
                  
                  <Card className="glass-morphism">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="border-b border-muted">
                            <tr>
                              <th className="text-left p-4 font-medium text-muted-foreground">Validator</th>
                              <th className="text-left p-4 font-medium text-muted-foreground">Stake</th>
                              <th className="text-left p-4 font-medium text-muted-foreground">Uptime</th>
                              <th className="text-left p-4 font-medium text-muted-foreground">Rewards</th>
                              <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mockValidators.map((validator, index) => (
                              <tr key={index} className="border-b border-muted/50 hover:bg-muted/20">
                                <td className="p-4">
                                  <code className="text-cyber-blue font-mono">
                                    {validator.address}
                                  </code>
                                </td>
                                <td className="p-4">
                                  <span className="font-mono font-bold">{validator.stake}</span>
                                </td>
                                <td className="p-4">
                                  <span className="text-cyber-green font-medium">{validator.uptime}</span>
                                </td>
                                <td className="p-4">
                                  <span className="font-mono">{validator.rewards}</span>
                                </td>
                                <td className="p-4">
                                  <Badge className="bg-cyber-green/20 text-cyber-green">
                                    Active
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <TransactionFeed />
                  <NetworkStats />
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
