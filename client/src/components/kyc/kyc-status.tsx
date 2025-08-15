import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Camera,
  CreditCard,
  Building,
  User,
  XCircle
} from "lucide-react";
import { Link } from "wouter";

interface KYCStatusProps {
  className?: string;
}

export default function KYCStatus({ className = "" }: KYCStatusProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle,
          color: "text-cyber-green",
          bgColor: "bg-cyber-green/10",
          borderColor: "border-cyber-green/30",
          title: "KYC Verified",
          description: "Your identity has been successfully verified",
          actionText: "View Certificate",
          actionVariant: "default" as const,
        };
      case "pending":
        return {
          icon: Clock,
          color: "text-cyber-yellow",
          bgColor: "bg-cyber-yellow/10",
          borderColor: "border-cyber-yellow/30",
          title: "KYC Under Review",
          description: "Your documents are being reviewed (1-3 business days)",
          actionText: "Check Status",
          actionVariant: "outline" as const,
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          title: "KYC Rejected",
          description: "Please resubmit your documents with corrections",
          actionText: "Resubmit Documents",
          actionVariant: "destructive" as const,
        };
      default:
        return {
          icon: AlertTriangle,
          color: "text-cyber-blue",
          bgColor: "bg-cyber-blue/10",
          borderColor: "border-cyber-blue/30",
          title: "KYC Required",
          description: "Complete identity verification to unlock all features",
          actionText: "Start Verification",
          actionVariant: "default" as const,
        };
    }
  };

  const statusConfig = getStatusConfig(user.kycStatus || "not_started");
  const Icon = statusConfig.icon;

  // Mock KYC steps for demonstration
  const kycSteps = [
    {
      id: "personal_info",
      title: "Personal Information",
      icon: User,
      completed: user.kycStatus !== "not_started",
      description: "Basic personal details",
    },
    {
      id: "identity_verification",
      title: "Identity Verification",
      icon: CreditCard,
      completed: user.kycStatus === "approved" || user.kycStatus === "pending",
      description: "Government-issued ID",
    },
    {
      id: "address_verification",
      title: "Address Verification",
      icon: Building,
      completed: user.kycStatus === "approved" || user.kycStatus === "pending",
      description: "Proof of address document",
    },
    {
      id: "selfie_verification",
      title: "Selfie Verification",
      icon: Camera,
      completed: user.kycStatus === "approved" || user.kycStatus === "pending",
      description: "Photo with ID document",
    },
  ];

  const completedSteps = kycSteps.filter(step => step.completed).length;
  const progress = (completedSteps / kycSteps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className={`glass-morphism border ${statusConfig.borderColor} ${statusConfig.bgColor}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${statusConfig.bgColor} flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${statusConfig.color}`} />
            </div>
            <div>
              <div className={`text-lg font-bold ${statusConfig.color}`}>
                {statusConfig.title}
              </div>
              <div className="text-sm text-muted-foreground">
                {statusConfig.description}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Verification Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2 progress-glow" />
          </div>

          {/* KYC Steps */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Verification Steps:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {kycSteps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.id}
                    className={`p-3 rounded-lg border ${
                      step.completed 
                        ? "bg-cyber-green/10 border-cyber-green/30" 
                        : "bg-muted/30 border-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? "bg-cyber-green/20" 
                          : "bg-muted"
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="w-4 h-4 text-cyber-green" />
                        ) : (
                          <StepIcon className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${
                          step.completed ? "text-cyber-green" : "text-muted-foreground"
                        }`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status-specific information */}
          {user.kycStatus === "pending" && user.kycDocuments && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Submitted Documents:</h4>
              <div className="space-y-2">
                {user.kycDocuments.map((doc: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                    <FileText className="w-4 h-4 text-cyber-blue" />
                    <span className="text-sm capitalize">{doc.type?.replace("_", " ")}</span>
                    <Badge className="ml-auto bg-cyber-yellow/20 text-cyber-yellow">
                      Under Review
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-between items-center pt-4 border-t border-muted">
            <div className="text-xs text-muted-foreground">
              {user.kycStatus === "approved" && (
                "All features unlocked"
              )}
              {user.kycStatus === "pending" && (
                "Review typically takes 1-3 business days"
              )}
              {user.kycStatus === "rejected" && (
                "Please check your email for specific requirements"
              )}
              {(!user.kycStatus || user.kycStatus === "not_started") && (
                "Required to create campaigns"
              )}
            </div>
            
            <Link href="/kyc">
              <Button 
                variant={statusConfig.actionVariant}
                size="sm"
                className={
                  statusConfig.actionVariant === "default" 
                    ? "bg-gradient-to-r from-cyber-blue to-cyber-purple" 
                    : ""
                }
              >
                {statusConfig.actionText}
              </Button>
            </Link>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
            <Shield className="w-4 h-4 text-cyber-blue flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Secure & Private:</span> Your personal information 
              is encrypted and stored securely. We comply with all data protection regulations.
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
