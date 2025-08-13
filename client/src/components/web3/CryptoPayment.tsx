import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Wallet, AlertCircle, CheckCircle, Zap } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useToast } from "@/hooks/use-toast";

interface CryptoPaymentProps {
  campaignId: string;
  campaignTitle: string;
  onSuccess?: (transactionHash: string) => void;
  onCancel?: () => void;
}

export function CryptoPayment({ campaignId, campaignTitle, onSuccess, onCancel }: CryptoPaymentProps) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ETH");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const {
    isConnected,
    account,
    balance,
    formatBalance,
    connectWallet,
    sendTransaction,
    getNetworkName,
    chainId,
  } = useWeb3();

  const handlePayment = async () => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to proceed",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create smart contract address for the campaign (mock for development)
      const contractAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      
      const result = await sendTransaction(contractAddress, amount, campaignId);
      
      if (result && result.status === 'confirmed') {
        toast({
          title: "Payment Successful!",
          description: `Successfully contributed ${amount} ${currency} to ${campaignTitle}`,
        });
        
        if (onSuccess) {
          onSuccess(result.hash);
        }
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Transaction failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getEstimatedGas = () => {
    return "0.002 ETH"; // Mock gas estimation
  };

  const getUSDValue = (cryptoAmount: string, cryptoCurrency: string) => {
    // Mock USD conversion rates
    const rates = {
      ETH: 2000,
      MATIC: 0.8,
      USDC: 1.0,
    };
    
    const rate = rates[cryptoCurrency as keyof typeof rates] || 0;
    return (parseFloat(cryptoAmount || "0") * rate).toFixed(2);
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto" data-testid="crypto-payment-connect-card">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="w-5 h-5" />
            Connect Wallet to Contribute
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connect your Web3 wallet to contribute cryptocurrency to this campaign.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={connectWallet} 
            className="w-full" 
            size="lg"
            data-testid="button-connect-wallet-payment"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Supports MetaMask, WalletConnect, and other Web3 wallets
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="crypto-payment-form">
      {/* Wallet Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Wallet Connected</p>
                <p className="text-sm text-muted-foreground" data-testid="connected-wallet-address">
                  {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'N/A'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" data-testid="connected-network">
                {getNetworkName(chainId)}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1" data-testid="wallet-balance-display">
                Balance: {formatBalance(balance)} ETH
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Crypto Contribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount and Currency */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="amount">Contribution Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.001"
                  placeholder="0.1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  data-testid="input-contribution-amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger data-testid="select-payment-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="MATIC">MATIC</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* USD Conversion */}
            {amount && (
              <div className="text-center">
                <p className="text-lg font-semibold text-muted-foreground">
                  ≈ ${getUSDValue(amount, currency)} USD
                </p>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Input
              id="message"
              placeholder="Leave a message of support..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              data-testid="input-contribution-message"
            />
          </div>

          <Separator />

          {/* Transaction Summary */}
          <div className="space-y-3">
            <h4 className="font-medium">Transaction Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Contribution:</span>
                <span>{amount || "0"} {currency}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Gas:</span>
                <span>{getEstimatedGas()}</span>
              </div>
              <div className="flex justify-between">
                <span>Network:</span>
                <span>{getNetworkName(chainId)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total Cost:</span>
                <span>
                  {amount ? (parseFloat(amount) + 0.002).toFixed(3) : "0"} ETH
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onCancel && (
              <Button 
                variant="outline" 
                onClick={onCancel}
                disabled={isProcessing}
                className="flex-1"
                data-testid="button-cancel-payment"
              >
                Cancel
              </Button>
            )}
            
            <Button
              onClick={handlePayment}
              disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
              className="flex-1"
              data-testid="button-submit-crypto-payment"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Contribute {amount ? `${amount} ${currency}` : "Now"}
                </>
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              All transactions are secured by blockchain technology. Your contribution will be recorded 
              on-chain for full transparency. Transaction fees may apply based on network congestion.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}