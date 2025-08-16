import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, RefreshCw, X } from 'lucide-react';

interface WalletConnectionProps {
  showBalance?: boolean;
  compact?: boolean;
}

export function WalletConnection({ showBalance = true, compact = false }: WalletConnectionProps) {
  const { isConnected, address, balance, loading, error, connectWallet, disconnectWallet, refreshBalance } = useWallet();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isConnected ? (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Wallet className="h-3 w-3 mr-1" />
              Connected
            </Badge>
            {showBalance && (
              <span className="text-sm font-mono text-foreground">
                {parseFloat(balance).toFixed(4)} AVAX
              </span>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshBalance}
              disabled={loading}
              data-testid="button-refresh-balance"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={disconnectWallet}
              className="text-red-500 hover:text-red-600"
              data-testid="button-disconnect-wallet"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button 
            onClick={connectWallet} 
            disabled={loading}
            size="sm"
            data-testid="button-connect-wallet"
          >
            <Wallet className="h-4 w-4 mr-2" />
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Avalanche Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-500 text-sm">
            {error}
          </div>
        )}
        
        {isConnected ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Wallet Address
              </label>
              <div className="p-2 bg-muted rounded font-mono text-sm break-all text-foreground">
                {address}
              </div>
            </div>
            
            {showBalance && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Balance
                </label>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-muted rounded font-mono text-sm">
                    <span data-testid="text-wallet-balance" className="text-foreground">
                      {parseFloat(balance).toFixed(4)} AVAX
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={refreshBalance}
                    disabled={loading}
                    data-testid="button-refresh-balance"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={disconnectWallet}
                data-testid="button-disconnect-wallet"
              >
                Disconnect
              </Button>
              <Button 
                variant="ghost" 
                onClick={refreshBalance}
                disabled={loading}
                data-testid="button-refresh-balance"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Connect your Avalanche wallet to make payments and track transactions.
            </p>
            <Button 
              onClick={connectWallet} 
              disabled={loading}
              className="w-full"
              data-testid="button-connect-wallet"
            >
              <Wallet className="h-4 w-4 mr-2" />
              {loading ? 'Connecting...' : 'Connect Avalanche Wallet'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}