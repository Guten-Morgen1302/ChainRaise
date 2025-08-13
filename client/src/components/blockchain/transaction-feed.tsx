import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Transaction } from "@shared/schema";

export default function TransactionFeed() {
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time feel
  });

  const getTransactionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      contribution: "bg-cyber-green/20 text-cyber-green border-cyber-green/20",
      withdrawal: "bg-cyber-purple/20 text-cyber-purple border-cyber-purple/20",
      contract_creation: "bg-cyber-yellow/20 text-cyber-yellow border-cyber-yellow/20",
    };
    return colors[type] || "bg-gray-500/20 text-gray-500 border-gray-500/20";
  };

  return (
    <Card className="glass-morphism rounded-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
          <div className="w-3 h-3 bg-cyber-green rounded-full animate-pulse"></div>
          Live Transactions
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent transactions</p>
            </div>
          ) : (
            transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-muted/30 rounded-xl p-4 border border-white/10"
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getTransactionTypeColor(transaction.transactionType)}>
                    {transaction.transactionType.toUpperCase()}
                  </Badge>
                  <div className="font-mono text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                  </div>
                </div>
                
                <div className="mb-2">
                  {transaction.campaignId && (
                    <div className="text-sm text-muted-foreground mb-1">
                      Campaign Transaction
                    </div>
                  )}
                  <div className="font-mono text-lg font-bold text-foreground">
                    {transaction.transactionType === "withdrawal" ? "-" : "+"}{transaction.amount} ETH
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">
                    {transaction.fromAddress && (
                      `${transaction.fromAddress.slice(0, 6)}...${transaction.fromAddress.slice(-4)}`
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-cyber-blue hover:text-cyber-green h-auto p-0"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View on Polygonscan
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
