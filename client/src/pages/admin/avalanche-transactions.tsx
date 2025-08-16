import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Wallet, ExternalLink, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function AvalancheTransactionsPage() {
  const [filters, setFilters] = useState({
    userId: '',
    campaignId: '',
    status: '',
    startDate: '',
    endDate: '',
    limit: 50,
    offset: 0,
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/transactions/avalanche', filters],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['/api/admin/campaigns'],
  });

  // Real-time updates via WebSocket (with error handling)
  useEffect(() => {
    let ws: WebSocket | null = null;
    
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Connected to admin WebSocket for transaction updates');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.event === 'transaction_created') {
            // Refresh transaction data when new transactions come in
            queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions/avalanche'] });
          }
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('Disconnected from admin WebSocket');
      };
      
      ws.onerror = (error) => {
        console.warn('WebSocket connection failed:', error);
      };
    } catch (error) {
      console.warn('Failed to create WebSocket connection:', error);
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
  }, [queryClient]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }));
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      campaignId: '',
      status: '',
      startDate: '',
      endDate: '',
      limit: 50,
      offset: 0,
    });
    setSearchTerm('');
  };

  const exportTransactions = () => {
    // Create CSV export
    const headers = ['Date', 'Transaction Hash', 'User', 'Campaign', 'Amount (AVAX)', 'Wallet Address', 'Status'];
    const csvData = transactions.map((tx: any) => [
      format(new Date(tx.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      tx.transactionHash,
      getUserName(tx.userId),
      getCampaignTitle(tx.campaignId),
      parseFloat(tx.amount).toFixed(4),
      tx.walletAddress,
      tx.status
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avalanche-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getUserName = (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    return user ? user.username : 'Unknown User';
  };

  const getCampaignTitle = (campaignId: string) => {
    const campaign = campaigns.find((c: any) => c.id === campaignId);
    return campaign ? campaign.title : 'Unknown Campaign';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredTransactions = transactions.filter((tx: any) =>
    searchTerm === '' || 
    tx.transactionHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getUserName(tx.userId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCampaignTitle(tx.campaignId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Avalanche Transactions</h1>
            <p className="text-gray-600 mt-2">
              Monitor all AVAX payments and wallet transactions in real-time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportTransactions} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold" data-testid="stat-total-transactions">
                    {transactions.length}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Volume</p>
                  <p className="text-2xl font-bold" data-testid="stat-total-volume">
                    {transactions.reduce((sum: number, tx: any) => sum + parseFloat(tx.amount || 0), 0).toFixed(4)} AVAX
                  </p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">Σ</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Successful</p>
                  <p className="text-2xl font-bold text-green-600" data-testid="stat-successful-transactions">
                    {transactions.filter((tx: any) => tx.status === 'completed').length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Volume</p>
                  <p className="text-2xl font-bold" data-testid="stat-today-volume">
                    {transactions
                      .filter((tx: any) => {
                        const today = new Date();
                        const txDate = new Date(tx.createdAt);
                        return txDate.toDateString() === today.toDateString();
                      })
                      .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount || 0), 0)
                      .toFixed(4)} AVAX
                  </p>
                </div>
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">📊</span>
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
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  data-testid="input-search-transactions"
                />
              </div>

              <Select value={filters.userId} onValueChange={(value) => handleFilterChange('userId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Users</SelectItem>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.campaignId} onValueChange={(value) => handleFilterChange('campaignId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Campaigns</SelectItem>
                  {campaigns.map((campaign: any) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                placeholder="Start Date"
                data-testid="input-start-date"
              />

              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  placeholder="End Date"
                  data-testid="input-end-date"
                />
                <Button onClick={clearFilters} variant="outline" size="sm" data-testid="button-clear-filters">
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading transactions...</span>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-500">
                  {searchTerm || Object.values(filters).some(f => f !== '' && f !== 0) 
                    ? 'Try adjusting your search or filters' 
                    : 'Avalanche transactions will appear here once users make payments'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Transaction Hash</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Wallet Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction: any) => (
                      <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(transaction.createdAt), 'HH:mm:ss')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {transaction.transactionHash.slice(0, 8)}...{transaction.transactionHash.slice(-6)}
                          </div>
                        </TableCell>
                        <TableCell data-testid={`user-${transaction.id}`}>
                          {getUserName(transaction.userId)}
                        </TableCell>
                        <TableCell data-testid={`campaign-${transaction.id}`}>
                          <div className="max-w-xs truncate">
                            {getCampaignTitle(transaction.campaignId)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono font-semibold" data-testid={`amount-${transaction.id}`}>
                            {parseFloat(transaction.amount).toFixed(4)} AVAX
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {transaction.walletAddress.slice(0, 6)}...{transaction.walletAddress.slice(-4)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)} data-testid={`status-${transaction.id}`}>
                            {transaction.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://testnet.snowtrace.io/tx/${transaction.transactionHash}`, '_blank')}
                            data-testid={`button-view-explorer-${transaction.id}`}
                          >
                            <ExternalLink className="h-4 w-4" />
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

        {/* Live Status Indicator */}
        <div className="fixed bottom-4 right-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">Live Updates Active</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}