import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
  minAmount?: number;
  maxAmount?: number;
}

export function PaymentModal({ 
  open, 
  onClose, 
  campaignId, 
  campaignTitle, 
  minAmount = 0.001, 
  maxAmount = 100 
}: PaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');
  const [transactionHash, setTransactionHash] = useState('');
  
  const { isConnected, address, balance, makePayment, connectWallet } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const paymentMutation = useMutation({
    mutationFn: async () => {
      if (!amount || parseFloat(amount) < minAmount) {
        throw new Error(`Minimum payment amount is ${minAmount} AVAX`);
      }
      
      if (parseFloat(amount) > parseFloat(balance)) {
        throw new Error('Insufficient balance');
      }

      setStep('processing');
      
      const result = await makePayment(campaignId, amount);
      setTransactionHash(result.hash);
      setStep('success');
      
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful!",
        description: `Successfully paid ${amount} AVAX to ${campaignTitle}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/contributions'] });
    },
    onError: (error: any) => {
      setStep('input');
      toast({
        title: "Payment Failed",
        description: error.message || "Transaction failed",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setStep('input');
    setAmount('');
    setTransactionHash('');
    onClose();
  };

  const handlePayment = () => {
    if (!isConnected) {
      connectWallet();
      return;
    }
    paymentMutation.mutate();
  };

  const balanceNumber = parseFloat(balance || '0');
  const amountNumber = parseFloat(amount || '0');
  const isValidAmount = amountNumber >= minAmount && amountNumber <= maxAmount && amountNumber <= balanceNumber;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Pay with Avalanche
          </DialogTitle>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Campaign</h3>
              <p className="text-sm text-gray-600">{campaignTitle}</p>
            </div>

            {!isConnected ? (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-4">
                  <div className="text-center space-y-3">
                    <p className="text-orange-800">
                      Connect your Avalanche wallet to make payments
                    </p>
                    <Button 
                      onClick={connectWallet}
                      className="w-full"
                      data-testid="button-connect-wallet"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="outline" className="text-green-600 border-green-600 mb-2">
                          Connected
                        </Badge>
                        <p className="text-sm font-mono text-green-800">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600">Balance</p>
                        <p className="font-mono font-medium text-green-800" data-testid="text-available-balance">
                          {balanceNumber.toFixed(4)} AVAX
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label htmlFor="amount">Payment Amount (AVAX)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.001"
                    min={minAmount}
                    max={Math.min(maxAmount, balanceNumber)}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min: ${minAmount} AVAX`}
                    className="font-mono"
                    data-testid="input-payment-amount"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Min: {minAmount} AVAX</span>
                    <span>Max: {Math.min(maxAmount, balanceNumber).toFixed(4)} AVAX</span>
                  </div>
                </div>

                {amount && (
                  <Card className="bg-gray-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>You will pay:</span>
                        <span className="font-mono font-medium" data-testid="text-payment-amount">
                          {amountNumber.toFixed(4)} AVAX
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                        <span>Remaining balance:</span>
                        <span className="font-mono">
                          {(balanceNumber - amountNumber).toFixed(4)} AVAX
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={!isConnected || !isValidAmount}
                className="flex-1"
                data-testid="button-confirm-payment"
              >
                {isConnected ? (
                  <>
                    Pay {amountNumber.toFixed(4)} AVAX
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  'Connect Wallet First'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center space-y-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <div>
              <h3 className="font-medium mb-2">Processing Payment</h3>
              <p className="text-sm text-gray-600">
                Please confirm the transaction in your wallet and wait for blockchain confirmation...
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4 py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <div>
              <h3 className="font-medium mb-2 text-green-800">Payment Successful!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your payment of {parseFloat(amount).toFixed(4)} AVAX has been processed.
              </p>
              
              {transactionHash && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                  <p className="font-mono text-xs break-all" data-testid="text-transaction-hash">
                    {transactionHash}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => window.open(`https://testnet.snowtrace.io/tx/${transactionHash}`, '_blank')}
                    data-testid="button-view-on-explorer"
                  >
                    View on Snowtrace
                  </Button>
                </div>
              )}
            </div>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}