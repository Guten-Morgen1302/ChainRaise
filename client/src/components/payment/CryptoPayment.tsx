import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Wallet, 
  CreditCard, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { sendTransaction, validateAmount, estimateGas, getStoredWallet, connectWallet } from "@/lib/web3";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CryptoPaymentProps {
  campaignId: string;
  onSuccess?: () => void;
}

const SUPPORTED_TOKENS = [
  { symbol: "ETH", name: "Ethereum", address: "0x0000000000000000000000000000000000000000" },
  { symbol: "MATIC", name: "Polygon", address: "0x0000000000000000000000000000000000000001" },
  { symbol: "USDC", name: "USD Coin", address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174" },
];

export function CryptoPayment({ campaignId, onSuccess }: CryptoPaymentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState(SUPPORTED_TOKENS[0]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [gasInfo, setGasInfo] = useState<any>(null);
  const [validationError, setValidationError] = useState<string>("");
  const [transactionStep, setTransactionStep] = useState<"input" | "confirm" | "processing" | "success">("input");

  const contributeMutation = useMutation({
    mutationFn: async ({ amount, currency, transactionHash }: { 
      amount: string; 
      currency: string; 
      transactionHash: string; 
    }) => {
      return apiRequest("POST", "/api/contributions", {
        campaignId,
        amount,
        currency,
        transactionHash,
        paymentMethod: "crypto",
        fromAddress: "0x1234567890123456789012345678901234567890", // Mock wallet address
        toAddress: "0x0987654321098765432109876543210987654321", // Mock campaign address
        gasUsed: "21000",
        gasPrice: "0.02",
        blockNumber: Math.floor(Math.random() * 1000000).toString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Contribution Successful!",
        description: "Your crypto contribution has been processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["/api/contributions"] });
      setTransactionStep("success");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to process crypto contribution.",
        variant: "destructive",
      });
      setTransactionStep("input");
    },
  });

  useEffect(() => {
    // Check for existing wallet connection
    const stored = getStoredWallet();
    if (stored && stored.connected) {
      setWalletConnected(true);
      setWalletInfo(stored);
    }
  }, []);

  const connectWalletHandler = async () => {
    try {
      const wallet = await connectWallet();
      setWalletConnected(true);
      setWalletInfo(wallet);
      toast({
        title: "Wallet Connected",
        description: `Connected to ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`,
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const handleContribute = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount.",
        variant: "destructive",
      });
      return;
    }

    // Validate amount including gas fees
    try {
      const validation = await validateAmount(amount, walletInfo?.balance, true);
      if (!validation.isValid) {
        setValidationError(validation.error || "Invalid amount");
        toast({
          title: "Validation Error",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }
      setGasInfo(validation.gasInfo);
      setValidationError("");
    } catch (error: any) {
      toast({
        title: "Validation Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setTransactionStep("confirm");
  };

  const confirmTransaction = async () => {
    setTransactionStep("processing");
    
    try {
      // Send the actual blockchain transaction
      const result = await sendTransaction({
        to: `0x${campaignId.replace(/-/g, '').slice(0, 40)}`, // Mock campaign address
        amount,
        currency: selectedToken.symbol,
        gasLimit: gasInfo?.gasLimit,
        gasPrice: gasInfo?.gasPrice,
      });
      
      // Record the contribution in our database
      contributeMutation.mutate({
        amount,
        currency: selectedToken.symbol,
        transactionHash: result.hash,
      });
    } catch (error: any) {
      setTransactionStep("input");
      
      // Enhanced error handling for different blockchain errors
      let errorMessage = error.message;
      if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for transaction and gas fees. Please add more ETH to your wallet.";
      } else if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was cancelled by user.";
      } else if (error.message.includes("Network is congested")) {
        errorMessage = "Network is busy. Try again with higher gas fees or wait for less congestion.";
      }
      
      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setAmount("");
    setTransactionStep("input");
  };

  if (transactionStep === "success") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
          <p className="text-muted-foreground mb-4">
            Your contribution of {amount} {selectedToken.symbol} has been processed.
          </p>
          <div className="space-y-2">
            <Button onClick={resetForm} variant="outline" className="w-full">
              Make Another Contribution
            </Button>
            <Button asChild className="w-full">
              <a 
                href={`https://polygonscan.com/tx/0x${Math.random().toString(16).substr(2, 64)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                View on Explorer
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Crypto Payment
        </CardTitle>
        <CardDescription>
          Support this campaign with cryptocurrency
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!walletConnected ? (
          <div className="text-center space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Connect your crypto wallet to contribute
              </p>
            </div>
            <Button onClick={connectWalletHandler} className="w-full">
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        ) : (
          <>
            {/* Wallet Status */}
            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Wallet Connected
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {walletInfo?.address ? `${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}` : "Loading..."}
              </p>
              <p className="text-xs text-green-500 dark:text-green-300 mt-1">
                Balance: {walletInfo?.balance || "0.00"} ETH
              </p>
            </div>

            {transactionStep === "input" && (
              <>
                {/* Token Selection */}
                <div className="space-y-2">
                  <Label>Payment Token</Label>
                  <Select 
                    value={selectedToken.symbol} 
                    onValueChange={(value) => {
                      const token = SUPPORTED_TOKENS.find(t => t.symbol === value);
                      if (token) setSelectedToken(token);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_TOKENS.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{token.symbol}</span>
                            <span className="text-muted-foreground">- {token.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Contribution Amount</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pr-16"
                    />
                    <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2">
                      {selectedToken.symbol}
                    </Badge>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {["0.1", "0.5", "1.0"].map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount)}
                      disabled={walletInfo && parseFloat(quickAmount) > parseFloat(walletInfo.balance)}
                    >
                      {quickAmount} {selectedToken.symbol}
                    </Button>
                  ))}
                </div>
                
                {/* Validation Error */}
                {validationError && (
                  <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-2 rounded">
                    {validationError}
                  </div>
                )}

                <Button onClick={handleContribute} className="w-full" disabled={!amount}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}

            {transactionStep === "confirm" && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Transaction Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium">{amount} {selectedToken.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network:</span>
                      <span>Polygon Mumbai (Testnet)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gas Fee:</span>
                      <span>~{gasInfo?.gasCost || "0.02"} ETH (${gasInfo?.gasCostUSD || "40"})</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total Cost:</span>
                      <span>{amount} {selectedToken.symbol} + Gas</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setTransactionStep("input")} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={confirmTransaction} className="flex-1">
                    Confirm & Pay
                  </Button>
                </div>
              </div>
            )}

            {transactionStep === "processing" && (
              <div className="text-center space-y-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <div>
                  <h4 className="font-medium">Processing Transaction</h4>
                  <p className="text-sm text-muted-foreground">
                    Please wait while your transaction is being processed...
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}