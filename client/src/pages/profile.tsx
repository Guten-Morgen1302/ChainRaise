import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletConnection } from '@/components/WalletConnection';
import { User, Wallet, CreditCard, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  const { data: userTransactions = [] } = useQuery({
    queryKey: ['/api/transactions/avalanche'],
    enabled: !!user,
  });

  const { data: contributions = [] } = useQuery({
    queryKey: ['/api/contributions'],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  // Ensure user has required properties with defaults
  const userData = {
    username: user.username || 'Unknown User',
    email: user.email || 'No email',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    kycStatus: user.kycStatus || 'not_submitted',
    walletAddress: user.walletAddress || null,
    joinDate: user.joinDate || user.createdAt || new Date().toISOString(),
    createdAt: user.createdAt || new Date().toISOString(),
    ...user
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Profile</h1>
            <p className="text-gray-600">Manage your account and view transaction history</p>
          </div>
          {userData.walletAddress && (
            <WalletConnection compact={true} />
          )}
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <p className="mt-1 text-sm" data-testid="text-username">{userData.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm" data-testid="text-email">{userData.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm">
                    {userData.firstName} {userData.lastName}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">KYC Status</label>
                  <div className="mt-1">
                    <Badge className={getKycStatusColor(userData.kycStatus)} data-testid="badge-kyc-status">
                      {userData.kycStatus?.toUpperCase() || 'PENDING'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Join Date</label>
                  <p className="mt-1 text-sm">
                    {format(new Date(userData.joinDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Wallet Address</label>
                  <p className="mt-1 text-sm font-mono" data-testid="text-wallet-address">
                    {userData.walletAddress ? 
                      `${userData.walletAddress.slice(0, 6)}...${userData.walletAddress.slice(-4)}` : 
                      'Not connected'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Connection */}
        {!userData.walletAddress && (
          <WalletConnection showBalance={true} />
        )}

        {/* Transactions and Activity */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions" data-testid="tab-transactions">
              <Wallet className="h-4 w-4 mr-2" />
              Avalanche Transactions
            </TabsTrigger>
            <TabsTrigger value="contributions" data-testid="tab-contributions">
              <CreditCard className="h-4 w-4 mr-2" />
              All Contributions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Avalanche Wallet Transactions</CardTitle>
                <p className="text-sm text-gray-600">
                  All payments made using your connected Avalanche wallet
                </p>
              </CardHeader>
              <CardContent>
                {!Array.isArray(userTransactions) || userTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No Avalanche transactions yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Connect your wallet and make payments to see transactions here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userTransactions.map((transaction: any) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`transaction-${transaction.id}`}
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(transaction.status)}
                          <div>
                            <p className="font-medium">Campaign Payment</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-medium" data-testid={`amount-${transaction.id}`}>
                            {parseFloat(transaction.amount).toFixed(4)} AVAX
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => window.open(`https://testnet.snowtrace.io/tx/${transaction.transactionHash}`, '_blank')}
                            data-testid={`button-view-tx-${transaction.id}`}
                          >
                            View on Explorer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contributions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Contributions</CardTitle>
                <p className="text-sm text-gray-600">
                  Your contribution history across all campaigns and payment methods
                </p>
              </CardHeader>
              <CardContent>
                {!Array.isArray(contributions) || contributions.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No contributions yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Support campaigns to see your contribution history here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contributions.map((contribution: any) => (
                      <div
                        key={contribution.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`contribution-${contribution.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-medium">Campaign Contribution</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(contribution.createdAt), 'MMM dd, yyyy HH:mm')}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {contribution.paymentMethod?.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-medium">
                            {parseFloat(contribution.amount).toFixed(4)} {contribution.currency}
                          </p>
                          <Badge className={getKycStatusColor(contribution.status)}>
                            {contribution.status?.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}