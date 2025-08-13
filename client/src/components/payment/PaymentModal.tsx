import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Zap, X } from "lucide-react";
import { CryptoPayment } from "@/components/web3/CryptoPayment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: string;
    title: string;
    currentAmount: string;
    goalAmount: string;
    currency: string;
    smartContractAddress?: string;
  };
}

export function PaymentModal({ isOpen, onClose, campaign }: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState("crypto");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const recordContributionMutation = useMutation({
    mutationFn: async (contributionData: any) => {
      return apiRequest("POST", "/api/contributions", contributionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaign.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onClose();
    },
  });

  const handleCryptoSuccess = async (transactionHash: string) => {
    try {
      // Record the contribution in the database
      await recordContributionMutation.mutateAsync({
        campaignId: campaign.id,
        amount: "0.1", // This would come from the payment component
        currency: campaign.currency,
        transactionHash: transactionHash,
        paymentMethod: "crypto",
        status: "confirmed",
      });

      toast({
        title: "Contribution Recorded!",
        description: "Your crypto contribution has been successfully recorded on-chain.",
      });
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Payment succeeded but failed to record. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const FiatPayment = () => (
    <div className="space-y-6 p-4" data-testid="fiat-payment-section">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Fiat Payment Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            Credit card and bank transfer payments will be available soon
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-4 border rounded-lg opacity-50">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5" />
            <div>
              <p className="font-medium">Credit/Debit Cards</p>
              <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
            </div>
            <Badge variant="secondary">Soon</Badge>
          </div>
        </div>

        <div className="p-4 border rounded-lg opacity-50">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5" />
            <div>
              <p className="font-medium">Digital Wallets</p>
              <p className="text-sm text-muted-foreground">PayPal, Apple Pay, Google Pay</p>
            </div>
            <Badge variant="secondary">Soon</Badge>
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full" disabled data-testid="button-fiat-payment-disabled">
        Fiat Payments Coming Soon
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl" data-testid="payment-modal">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Support This Campaign
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-payment-modal">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Campaign Info */}
        <div className="border rounded-lg p-4 bg-muted/30">
          <h4 className="font-semibold truncate" data-testid="modal-campaign-title">{campaign.title}</h4>
          <div className="flex items-center justify-between mt-2 text-sm">
            <span>Progress:</span>
            <span data-testid="modal-campaign-progress">
              {campaign.currentAmount} / {campaign.goalAmount} {campaign.currency}
            </span>
          </div>
        </div>

        {/* Payment Options */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="crypto" className="flex items-center gap-2" data-testid="tab-crypto-payment">
              <Zap className="w-4 h-4" />
              Crypto
            </TabsTrigger>
            <TabsTrigger value="fiat" className="flex items-center gap-2" data-testid="tab-fiat-payment">
              <CreditCard className="w-4 h-4" />
              Fiat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crypto" className="mt-6">
            <CryptoPayment
              campaignId={campaign.id}
              campaignTitle={campaign.title}
              onSuccess={handleCryptoSuccess}
              onCancel={onClose}
            />
          </TabsContent>

          <TabsContent value="fiat" className="mt-6">
            <FiatPayment />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}