import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, Wallet, ArrowUpRight, RefreshCw } from 'lucide-react';
import { WalletConnection } from '@/components/WalletConnection';
import { useWallet } from '@/hooks/useWallet';
import { format } from 'date-fns';

interface AvalancheTransaction {
  id: string;
  transactionHash: string;
  amount: string;
  walletAddress: string;
  campaignId: string;
  status: string;
  blockNumber?: string;
  gasUsed?: string;
  gasPrice?: string;
  createdAt: string;
  campaign?: {
    title: string;
  };
}

export default function TransactionHistory() {
  const { isConnected } = useWallet();

  const { data: transactions = [], isLoading, refetch } = useQuery<AvalancheTransaction[]>({
    queryKey: ['/api/transactions/avalanche'],
    enabled: isConnected,
  });

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toFixed(4);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Connect your Avalanche wallet to view your transaction history
                </p>
                <WalletConnection />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-gray-600 mt-1">
              Your Avalanche blockchain payment history
            </p>
          </div>
          <div className="flex items-center gap-4">
            <WalletConnection compact />
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {transactions.length}
                </div>
                <div className="text-sm text-gray-600">Total Transactions</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatAmount(
                    transactions
                      .filter(t => t.status === 'completed')
                      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                      .toString()
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Contributed (AVAX)</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {transactions.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Successful Payments</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="text-gray-600 mt-2">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No transactions found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Your Avalanche payments will appear here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Transaction</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                            <div className="text-xs text-gray-500">
                              {format(new Date(transaction.createdAt), 'HH:mm:ss')}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="max-w-[200px]">
                            <div className="font-medium truncate">
                              {transaction.campaign?.title || 'Unknown Campaign'}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              ID: {transaction.campaignId.slice(0, 8)}...
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3 text-red-500" />
                            <span className="font-mono">
                              {formatAmount(transaction.amount)} AVAX
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="font-mono text-xs">
                            {transaction.transactionHash.slice(0, 12)}...
                            {transaction.transactionHash.slice(-8)}
                          </div>
                          {transaction.blockNumber && (
                            <div className="text-xs text-gray-500">
                              Block: {transaction.blockNumber}
                            </div>
                          )}
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a
                              href={`https://testnet.snowtrace.io/tx/${transaction.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Explorer
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}