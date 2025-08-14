import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import KYCStatus from "@/components/kyc/KYCStatus";
import KYCForm from "@/components/kyc/KYCForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, ArrowLeft, Info } from "lucide-react";

interface KYCStatusData {
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedAt?: string;
  reviewedAt?: string;
  adminComments?: string;
}

export default function KYC() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [showForm, setShowForm] = useState(false);

  const { data: kycStatus, isLoading: statusLoading } = useQuery<KYCStatusData>({
    queryKey: ["/api/kyc/status"],
    enabled: isAuthenticated,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading || statusLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const status = kycStatus?.status || 'not_submitted';
  const canShowForm = status === 'not_submitted' || status === 'rejected';

  const handleFormSuccess = () => {
    setShowForm(false);
    // Status will be updated automatically via query invalidation
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">KYC Verification</h1>
                <p className="text-muted-foreground">
                  Know Your Customer identity verification
                </p>
              </div>
            </div>
          </motion.div>

          {/* Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Why do we need KYC verification?
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                      KYC (Know Your Customer) verification helps us comply with financial regulations 
                      and ensures the security of our platform. Verified users can create fundraising 
                      campaigns and access advanced features. The verification process typically takes 
                      1-3 business days.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {!showForm ? (
              <div className="space-y-6">
                {/* KYC Status */}
                <KYCStatus />

                {/* Action Buttons */}
                {canShowForm && (
                  <div className="text-center">
                    <Button
                      onClick={() => setShowForm(true)}
                      size="lg"
                      className="w-full max-w-md"
                      data-testid="button-start-kyc"
                    >
                      <Shield className="w-5 h-5 mr-2" />
                      {status === 'rejected' ? 'Resubmit KYC Application' : 'Start KYC Verification'}
                    </Button>
                  </div>
                )}

                {/* Verification Steps */}
                {status === 'not_submitted' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Verification Process</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <span className="text-lg font-semibold text-primary">1</span>
                          </div>
                          <h4 className="font-medium">Personal Information</h4>
                          <p className="text-sm text-muted-foreground">
                            Provide your basic personal details
                          </p>
                        </div>
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <span className="text-lg font-semibold text-primary">2</span>
                          </div>
                          <h4 className="font-medium">Identity Verification</h4>
                          <p className="text-sm text-muted-foreground">
                            Enter your ID details and financial information
                          </p>
                        </div>
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <span className="text-lg font-semibold text-primary">3</span>
                          </div>
                          <h4 className="font-medium">Document Upload</h4>
                          <p className="text-sm text-muted-foreground">
                            Upload photos of your ID and selfie
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Success Message */}
                {status === 'approved' && (
                  <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <div>
                          <h3 className="font-semibold text-green-900 dark:text-green-100">
                            Verification Complete!
                          </h3>
                          <p className="text-green-700 dark:text-green-300 text-sm">
                            You can now create campaigns and access all platform features.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Back Button */}
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="mb-4"
                  data-testid="button-back-to-status"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Status
                </Button>

                {/* KYC Form */}
                <KYCForm onSubmitSuccess={handleFormSuccess} />
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}