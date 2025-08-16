import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  XCircle,
  Calendar,
  MessageCircle,
  RefreshCw
} from "lucide-react";
import { Link } from "wouter";

interface KYCStatusProps {
  className?: string;
}

interface KYCStatusData {
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedAt?: string;
  reviewedAt?: string;
  adminComments?: string;
}

export default function KYCStatus({ className = "" }: KYCStatusProps) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: kycStatus, isLoading, refetch } = useQuery<KYCStatusData>({
    queryKey: ["/api/kyc/status"],
    enabled: isAuthenticated,
  });

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await refetch();
      // Also invalidate user query to update the user profile
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      if (data?.status !== kycStatus?.status) {
        // Status changed, show notification
        console.log('KYC status updated:', data?.status);
      } else {
        console.log('Still under review, please check back later');
      }
    } catch (error) {
      console.error('Failed to refresh status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user || isLoading) {
    return (
      <Card className={`border-muted ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30",
          title: "KYC Verified",
          description: "Your identity has been successfully verified. You can now create campaigns!",
          actionText: "Create Campaign",
          actionVariant: "default" as const,
          actionLink: "/create",
          progress: 100,
          step: 4,
        };
      case "pending":
      case "under_review":
        return {
          icon: Clock,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/30",
          title: "KYC Under Review",
          description: "Your documents are being reviewed. You'll be notified within 1-3 business days.",
          actionText: "Check Back Later",
          actionVariant: "outline" as const,
          progress: 50,
          step: 2,
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          title: "KYC Rejected",
          description: "Your application needs corrections. Please resubmit with updated documents.",
          actionText: "Resubmit Application",
          actionVariant: "destructive" as const,
          actionLink: "/kyc",
          progress: 25,
          step: 1,
        };
      default:
        return {
          icon: AlertTriangle,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30",
          title: "KYC Required",
          description: "Complete identity verification to create fundraising campaigns.",
          actionText: "Start Verification",
          actionVariant: "default" as const,
          actionLink: "/kyc",
          progress: 25,
          step: 1,
        };
    }
  };

  const getStepConfig = (stepNumber: number, currentStep: number) => {
    const steps = [
      { title: "Document Submission", description: "Submit your verification documents" },
      { title: "Under Review", description: "Documents being reviewed by our team" },
      { title: "Verification Complete", description: "Identity successfully verified" },
      { title: "Ready to Launch Campaign", description: "Create unlimited fundraising campaigns" },
    ];
    
    const isActive = stepNumber <= currentStep;
    const isCurrent = stepNumber === currentStep;
    
    return {
      ...steps[stepNumber - 1],
      isActive,
      isCurrent,
      percentage: stepNumber * 25,
    };
  };

  // Always use the KYC status from the API, fallback to user.kycStatus, then 'not_submitted'
  const status = kycStatus?.status || user?.kycStatus || 'not_submitted';
  const config = getStatusConfig(status);
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card 
        className={`border-2 ${config.borderColor} ${config.bgColor} backdrop-blur-sm`}
        data-testid="kyc-status-card"
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${config.bgColor}`}>
              <StatusIcon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{config.title}</span>
                <Badge 
                  variant={status === 'approved' ? 'default' : 'secondary'}
                  className={`${config.color} border-current`}
                  data-testid={`badge-status-${status}`}
                >
                  {status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              {/* KYC Process Steps */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Step {config.step} of 4 – {config.progress}% Complete</span>
                  {(status === 'pending' || status === 'under_review') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefreshStatus}
                      disabled={isRefreshing}
                      className="h-6 px-2 text-xs"
                    >
                      <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Refresh Status
                    </Button>
                  )}
                </div>
                
                {/* Progress Steps */}
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((stepNum) => {
                    const stepConfig = getStepConfig(stepNum, config.step);
                    return (
                      <div key={stepNum} className="text-center">
                        <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-medium ${
                          stepConfig.isCurrent 
                            ? 'bg-primary text-primary-foreground animate-pulse'
                            : stepConfig.isActive 
                            ? 'bg-green-500 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {stepConfig.isActive && !stepConfig.isCurrent ? '✓' : stepNum}
                        </div>
                        <div className={`text-xs leading-tight ${
                          stepConfig.isCurrent 
                            ? 'font-medium text-primary'
                            : stepConfig.isActive 
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-muted-foreground'
                        }`}>
                          {stepConfig.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <Progress 
                  value={config.progress} 
                  className="h-2" 
                  data-testid="progress-kyc"
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {config.description}
          </p>

          {/* Timeline Information */}
          {kycStatus && kycStatus.status !== 'not_submitted' && (
            <div className="space-y-2 text-sm">
              {kycStatus.submittedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Submitted: {new Date(kycStatus.submittedAt).toLocaleDateString()}</span>
                </div>
              )}
              
              {kycStatus.reviewedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Reviewed: {new Date(kycStatus.reviewedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Admin Comments */}
          {kycStatus?.adminComments && (
            <div className="p-3 rounded-lg bg-muted/50 border">
              <div className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Admin Feedback:</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {kycStatus.adminComments}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          {config.actionLink ? (
            <Link href={config.actionLink}>
              <Button 
                variant={config.actionVariant} 
                className="w-full"
                data-testid={`button-${config.actionText.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Shield className="w-4 h-4 mr-2" />
                {config.actionText}
              </Button>
            </Link>
          ) : (
            <Button 
              variant={config.actionVariant} 
              className="w-full" 
              disabled
              data-testid={`button-${config.actionText.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Clock className="w-4 h-4 mr-2" />
              {config.actionText}
            </Button>
          )}

          {/* KYC Benefits */}
          {status === 'not_submitted' && (
            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <h4 className="text-sm font-medium mb-2">Unlock with KYC Verification:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Create unlimited fundraising campaigns</li>
                <li>• Access to advanced analytics and insights</li>
                <li>• Higher contribution limits</li>
                <li>• Priority customer support</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}