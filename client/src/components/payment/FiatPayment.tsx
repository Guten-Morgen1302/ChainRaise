import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  DollarSign, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface FiatPaymentProps {
  campaignId: string;
  onSuccess?: () => void;
}

export function FiatPayment({ campaignId, onSuccess }: FiatPaymentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"input" | "processing" | "success">("input");

  const contributeMutation = useMutation({
    mutationFn: async ({ amount }: { amount: string }) => {
      return apiRequest("POST", "/api/contributions", {
        campaignId,
        amount,
        currency: "USD",
        paymentMethod: "fiat",
        transactionHash: `fiat_${Math.random().toString(36).substr(2, 9)}`,
      });
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful!",
        description: "Your fiat contribution has been processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["/api/contributions"] });
      setStep("success");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process fiat payment.",
        variant: "destructive",
      });
      setStep("input");
    },
  });

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount.",
        variant: "destructive",
      });
      return;
    }

    setStep("processing");
    
    // Simulate payment processing
    setTimeout(() => {
      contributeMutation.mutate({ amount });
    }, 2000);
  };

  const resetForm = () => {
    setAmount("");
    setStep("input");
  };

  if (step === "success") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
          <p className="text-muted-foreground mb-4">
            Your contribution of ${amount} USD has been processed.
          </p>
          <Button onClick={resetForm} className="w-full">
            Make Another Contribution
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Fiat Payment
        </CardTitle>
        <CardDescription>
          Support this campaign with traditional payment methods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Method Notice */}
        <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Demo Mode
            </span>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            This is a demonstration. Real payments require Stripe integration.
          </p>
        </div>

        {step === "input" && (
          <>
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="fiat-amount">Contribution Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fiat-amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 pr-16"
                />
                <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2">
                  USD
                </Badge>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {["10", "50", "100"].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount)}
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>

            {/* Mock Payment Form */}
            <div className="space-y-4">
              <Separator />
              <div className="space-y-3">
                <Label>Payment Details (Demo)</Label>
                <Input placeholder="Card Number: 4242 4242 4242 4242" disabled />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="MM/YY: 12/25" disabled />
                  <Input placeholder="CVC: 123" disabled />
                </div>
                <Input placeholder="Name on Card: John Doe" disabled />
              </div>
            </div>

            <Button onClick={handlePayment} className="w-full" disabled={!amount}>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay ${amount || "0.00"} USD
            </Button>
          </>
        )}

        {step === "processing" && (
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <div>
              <h4 className="font-medium">Processing Payment</h4>
              <p className="text-sm text-muted-foreground">
                Please wait while your payment is being processed...
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}