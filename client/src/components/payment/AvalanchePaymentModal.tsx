import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Wallet, ArrowRight, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { WalletConnection } from '@/components/WalletConnection';

interface AvalanchePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: string;
    title: string;
    goalAmount: string;
    currentAmount: string;
    currency: string;
  };
  onPaymentSuccess: (transaction: {
    hash: string;
    amount: string;
    timestamp: string;
  }) => void;
}

export function AvalanchePaymentModal({ 
  isOpen, 
  onClose, 
  campaign, 
  onPaymentSuccess 
}: AvalanchePaymentModalProps) {
  const { isConnected, address, balance, makePayment } = useWallet();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handlePayment = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Avalanche wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough AVAX for this payment",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const transaction = await makePayment(campaign.id, amount);
      setTxHash(transaction.hash);
      setPaymentComplete(true);
      onPaymentSuccess(transaction);
      
      toast({
        title: "Payment Successful!",
        description: `Successfully contributed ${amount} AVAX to ${campaign.title}`,
      });
    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Transaction failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setAmount('');
    setIsProcessing(false);
    setTxHash('');
    setPaymentComplete(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toFixed(4);
  };

  const progress = (parseFloat(campaign.currentAmount) / parseFloat(campaign.goalAmount)) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Avalanche Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{campaign.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{formatAmount(campaign.currentAmount)} / {formatAmount(campaign.goalAmount)} {campaign.currency}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all" 
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {progress.toFixed(1)}% funded
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Connection */}
          {!isConnected && (
            <Card>
              <CardContent className="pt-6">
                <WalletConnection compact={false} />
              </CardContent>
            </Card>
          )}

          {/* Payment Form */}
          {isConnected && !paymentComplete && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Make Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Wallet Info */}
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Wallet className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                    <span className="text-sm font-mono text-green-700">
                      {formatAmount(balance)} AVAX
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-1 font-mono">
                    {address?.slice(0, 10)}...{address?.slice(-8)}
                  </p>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (AVAX)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.001"
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAmount('0.1')}
                    >
                      0.1 AVAX
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAmount('0.5')}
                    >
                      0.5 AVAX
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAmount('1')}
                    >
                      1 AVAX
                    </Button>
                  </div>
                </div>

                {/* Transaction Preview */}
                {amount && parseFloat(amount) > 0 && (
                  <div className="p-3 bg-gray-50 rounded-md space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Payment Amount:</span>
                      <span className="font-mono">{formatAmount(amount)} AVAX</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Estimated Gas:</span>
                      <span className="font-mono">~0.001 AVAX</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total Cost:</span>
                      <span className="font-mono">{formatAmount((parseFloat(amount) + 0.001).toString())} AVAX</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  onClick={handlePayment} 
                  disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      Pay {amount ? formatAmount(amount) : '0'} AVAX
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Payment Success */}
          {paymentComplete && (
            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Payment Successful!
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Your contribution of {formatAmount(amount)} AVAX has been processed
                  </p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="text-sm text-gray-600">Transaction Hash:</div>
                  <div className="font-mono text-xs break-all text-blue-600">
                    {txHash}
                  </div>
                  <a 
                    href={`https://testnet.snowtrace.io/tx/${txHash}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm underline mt-1 block"
                  >
                    View on Explorer
                  </a>
                </div>
                
                <Button onClick={handleClose} className="w-full">
                  Close
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}