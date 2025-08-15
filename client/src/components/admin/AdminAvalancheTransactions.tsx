import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, Search, Filter, RefreshCw, TrendingUp, Users, Wallet } from 'lucide-react';
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
  user?: {
    username: string;
    email: string;
  };
  campaign?: {
    title: string;
  };
}

export function AdminAvalancheTransactions() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: '7d'
  });

  const { data: transactions = [], isLoading, refetch } = useQuery<AvalancheTransaction[]>({
    queryKey: ['/api/admin/transactions/avalanche', filters],
    refetchInterval: 5000, // Auto-refresh every 5 seconds for real-time updates
  });

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toFixed(4);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !filters.search || 
      transaction.user?.username.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.campaign?.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.transactionHash.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || transaction.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalTransactions: transactions.length,
    totalVolume: transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0),
    successfulTransactions: transactions.filter(t => t.status === 'completed').length,
    uniqueContributors: new Set(transactions.map(t => t.walletAddress)).size
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Avalanche Transactions</h2>
          <p className="text-gray-600">Real-time blockchain payment monitoring</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{stats.totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Wallet className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold">{formatAmount(stats.totalVolume.toString())} AVAX</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">
                  {stats.totalTransactions > 0 
                    ? Math.round((stats.successfulTransactions / stats.totalTransactions) * 100) 
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-orange-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Unique Contributors</p>
                <p className="text-2xl font-bold">{stats.uniqueContributors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by user, campaign, or transaction hash..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <div className="text-sm text-gray-600">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-600 mt-2">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No transactions found</p>
              <p className="text-sm text-gray-500 mt-1">
                {filters.search || filters.status ? 'Try adjusting your filters' : 'Transactions will appear here when users make payments'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Transaction Hash</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
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
                        <div>
                          <div className="font-medium">
                            {transaction.user?.username || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.user?.email}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="max-w-[200px]">
                          <div className="font-medium truncate">
                            {transaction.campaign?.title || 'Unknown Campaign'}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {transaction.campaignId.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-mono font-medium">
                          {formatAmount(transaction.amount)} AVAX
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-mono text-xs">
                          {transaction.walletAddress.slice(0, 6)}...
                          {transaction.walletAddress.slice(-4)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-mono text-xs">
                          {transaction.transactionHash.slice(0, 10)}...
                          {transaction.transactionHash.slice(-6)}
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
                            View
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
  );
}