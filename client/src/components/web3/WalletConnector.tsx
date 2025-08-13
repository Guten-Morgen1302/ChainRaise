import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Power, RefreshCw } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";

interface WalletConnectorProps {
  onConnect?: (account: string) => void;
  onDisconnect?: () => void;
}

export function WalletConnector({ onConnect, onDisconnect }: WalletConnectorProps) {
  const {
    provider,
    isLoading,
    connectWallet,
    disconnectWallet,
    getNetworkName,
    formatBalance,
    isConnected,
    account,
    balance,
    chainId,
  } = useWeb3();

  const handleConnect = async () => {
    const success = await connectWallet();
    if (success && account && onConnect) {
      onConnect(account);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    if (onDisconnect) {
      onDisconnect();
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto" data-testid="wallet-connector-card">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Connect your Web3 wallet to contribute to campaigns and create projects
              </p>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full"
              data-testid="button-connect-wallet"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Supports MetaMask, WalletConnect, and other Web3 wallets
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="wallet-connected-card">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Wallet Connected</span>
            </div>
            <Badge variant="secondary" className="text-green-600">
              Active
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Address:</span>
              <span className="text-sm font-mono" data-testid="wallet-address">
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Network:</span>
              <Badge variant="outline" data-testid="wallet-network">
                {getNetworkName(chainId)}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Balance:</span>
              <span className="text-sm font-semibold" data-testid="wallet-balance">
                {formatBalance(balance)} ETH
              </span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleDisconnect}
              variant="outline"
              size="sm"
              className="w-full"
              data-testid="button-disconnect-wallet"
            >
              <Power className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}