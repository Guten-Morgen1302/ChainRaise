import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import KYCStatus from "@/components/kyc/kyc-status";
import { 
  Upload, 
  FileText, 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Camera,
  CreditCard,
  User,
  Building,
  Globe,
  Lock
} from "lucide-react";
import { useEffect } from "react";

interface KYCDocument {
  type: string;
  url: string;
  status: string;
  uploadedAt: string;
}

export default function KYC() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    dateOfBirth: "",
    nationality: "",
    address: "",
    phoneNumber: "",
    businessName: "",
    businessType: "",
    businessAddress: "",
  });

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  const updateKYCMutation = useMutation({
    mutationFn: async (data: { documents: KYCDocument[]; status: string; personalInfo?: any }) => {
      return await apiRequest("PUT", "/api/user/kyc", data);
    },
    onSuccess: () => {
      toast({
        title: "KYC Information Updated",
        description: "Your verification documents have been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You need to log in to update KYC information.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 2000);
        return;
      }
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    if (userProfile) {
      // Initialize personal info from user profile
      setPersonalInfo({
        fullName: `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim(),
        dateOfBirth: "",
        nationality: "",
        address: "",
        phoneNumber: "",
        businessName: "",
        businessType: "",
        businessAddress: "",
      });

      // Initialize documents from KYC documents if available
      if (userProfile.kycDocuments) {
        setDocuments(userProfile.kycDocuments);
      }
    }
  }, [userProfile]);

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin border-2 border-cyber-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading KYC information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const documentTypes = [
    {
      type: "government_id",
      title: "Government ID",
      description: "Passport, Driver's License, or National ID",
      icon: CreditCard,
      required: true,
    },
    {
      type: "proof_of_address",
      title: "Proof of Address", 
      description: "Utility bill or bank statement (last 3 months)",
      icon: Building,
      required: true,
    },
    {
      type: "selfie",
      title: "Identity Verification",
      description: "Selfie holding your government ID",
      icon: Camera,
      required: true,
    },
    {
      type: "business_registration",
      title: "Business Registration",
      description: "Certificate of incorporation (if applicable)",
      icon: FileText,
      required: false,
    },
  ];

  const handleDocumentUpload = (type: string) => {
    // Mock file upload - in real implementation, this would handle file selection and upload
    const newDocument: KYCDocument = {
      type,
      url: `https://example.com/${type}_${Date.now()}.pdf`,
      status: "uploaded",
      uploadedAt: new Date().toISOString(),
    };

    setDocuments(prev => {
      const existing = prev.findIndex(doc => doc.type === type);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newDocument;
        return updated;
      }
      return [...prev, newDocument];
    });

    toast({
      title: "Document Uploaded",
      description: `${type.replace("_", " ")} has been uploaded successfully.`,
    });
  };

  const handleSubmitKYC = () => {
    const requiredDocuments = documentTypes.filter(doc => doc.required);
    const uploadedRequiredDocs = documents.filter(doc => 
      requiredDocuments.some(required => required.type === doc.type)
    );

    if (uploadedRequiredDocs.length < requiredDocuments.length) {
      toast({
        title: "Missing Required Documents",
        description: "Please upload all required documents before submitting.",
        variant: "destructive",
      });
      return;
    }

    updateKYCMutation.mutate({
      documents,
      status: "pending",
      personalInfo,
    });
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16">
        {/* Header */}
        <section className="py-12 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 gradient-text">
                Identity Verification
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Complete your KYC verification to unlock all platform features and create campaigns
              </p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-3 progress-glow" />
            </motion.div>

            {/* Current KYC Status */}
            <KYCStatus />
          </div>
        </section>

        {/* KYC Steps */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {userProfile?.kycStatus === "verified" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="glass-morphism border-cyber-green/50">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-cyber-green mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2 text-cyber-green">Verification Complete!</h3>
                    <p className="text-muted-foreground mb-6">
                      Your identity has been successfully verified. You can now create campaigns and access all platform features.
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button className="bg-gradient-to-r from-cyber-blue to-cyber-purple">
                        Create Campaign
                      </Button>
                      <Button variant="outline">
                        Back to Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : userProfile?.kycStatus === "pending" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="glass-morphism border-cyber-yellow/50">
                  <CardContent className="p-8 text-center">
                    <Clock className="w-16 h-16 text-cyber-yellow mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2 text-cyber-yellow">Verification in Progress</h3>
                    <p className="text-muted-foreground mb-6">
                      Your documents are being reviewed. This process typically takes 1-3 business days.
                    </p>
                    <div className="space-y-4">
                      <div className="text-left">
                        <h4 className="font-semibold mb-3">Submitted Documents:</h4>
                        <div className="space-y-2">
                          {documents.map((doc, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-cyber-green" />
                              <span className="capitalize">{doc.type.replace("_", " ")}</span>
                              <Badge className="ml-auto bg-cyber-yellow/20 text-cyber-yellow">
                                Under Review
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {/* Step Navigation */}
                <div className="flex justify-center">
                  <div className="flex items-center space-x-4">
                    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          getStepStatus(step) === "completed" 
                            ? "bg-cyber-green text-black"
                            : getStepStatus(step) === "active"
                            ? "bg-cyber-blue text-white"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {getStepStatus(step) === "completed" ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            step
                          )}
                        </div>
                        {step < totalSteps && (
                          <div className={`w-12 h-1 mx-2 ${
                            step < currentStep ? "bg-cyber-green" : "bg-muted"
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step Content */}
                <Card className="glass-morphism">
                  <CardContent className="p-8">
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <User className="w-12 h-12 text-cyber-blue mx-auto mb-4" />
                          <h3 className="text-2xl font-bold mb-2">Personal Information</h3>
                          <p className="text-muted-foreground">
                            Provide your basic personal details for identity verification
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              value={personalInfo.fullName}
                              onChange={(e) => setPersonalInfo(prev => ({ ...prev, fullName: e.target.value }))}
                              className="form-focus mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                              id="dateOfBirth"
                              type="date"
                              value={personalInfo.dateOfBirth}
                              onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                              className="form-focus mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="nationality">Nationality</Label>
                            <Input
                              id="nationality"
                              value={personalInfo.nationality}
                              onChange={(e) => setPersonalInfo(prev => ({ ...prev, nationality: e.target.value }))}
                              className="form-focus mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                              id="phoneNumber"
                              value={personalInfo.phoneNumber}
                              onChange={(e) => setPersonalInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
                              className="form-focus mt-1"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                              id="address"
                              value={personalInfo.address}
                              onChange={(e) => setPersonalInfo(prev => ({ ...prev, address: e.target.value }))}
                              className="form-focus mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <Building className="w-12 h-12 text-cyber-purple mx-auto mb-4" />
                          <h3 className="text-2xl font-bold mb-2">Business Information (Optional)</h3>
                          <p className="text-muted-foreground">
                            If you're representing a business, please provide business details
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="businessName">Business Name</Label>
                            <Input
                              id="businessName"
                              value={personalInfo.businessName}
                              onChange={(e) => setPersonalInfo(prev => ({ ...prev, businessName: e.target.value }))}
                              className="form-focus mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="businessType">Business Type</Label>
                            <Input
                              id="businessType"
                              value={personalInfo.businessType}
                              onChange={(e) => setPersonalInfo(prev => ({ ...prev, businessType: e.target.value }))}
                              className="form-focus mt-1"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="businessAddress">Business Address</Label>
                            <Textarea
                              id="businessAddress"
                              value={personalInfo.businessAddress}
                              onChange={(e) => setPersonalInfo(prev => ({ ...prev, businessAddress: e.target.value }))}
                              className="form-focus mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <Upload className="w-12 h-12 text-cyber-green mx-auto mb-4" />
                          <h3 className="text-2xl font-bold mb-2">Document Upload</h3>
                          <p className="text-muted-foreground">
                            Upload required documents for identity verification
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {documentTypes.map((docType) => {
                            const uploaded = documents.find(doc => doc.type === docType.type);
                            const Icon = docType.icon;

                            return (
                              <div key={docType.type} className="p-4 border border-muted rounded-lg">
                                <div className="flex items-start gap-3 mb-3">
                                  <Icon className="w-6 h-6 text-cyber-blue flex-shrink-0 mt-1" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold">{docType.title}</h4>
                                      {docType.required && (
                                        <Badge variant="destructive" className="text-xs">Required</Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {docType.description}
                                    </p>
                                  </div>
                                </div>

                                {uploaded ? (
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4 text-cyber-green" />
                                      <span className="text-sm text-cyber-green">Uploaded</span>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDocumentUpload(docType.type)}
                                    >
                                      Replace
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="outline"
                                    onClick={() => handleDocumentUpload(docType.type)}
                                    className="w-full"
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload {docType.title}
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <Shield className="w-12 h-12 text-cyber-yellow mx-auto mb-4" />
                          <h3 className="text-2xl font-bold mb-2">Review & Submit</h3>
                          <p className="text-muted-foreground">
                            Review your information and submit for verification
                          </p>
                        </div>

                        <div className="space-y-4">
                          <Card className="border-muted">
                            <CardHeader>
                              <CardTitle className="text-lg">Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Full Name:</span>
                                  <div>{personalInfo.fullName || "Not provided"}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Nationality:</span>
                                  <div>{personalInfo.nationality || "Not provided"}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-muted">
                            <CardHeader>
                              <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {documents.map((doc, index) => (
                                  <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                                    <CheckCircle className="w-4 h-4 text-cyber-green" />
                                    <span className="capitalize">{doc.type.replace("_", " ")}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          <div className="bg-muted/30 p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                              <Lock className="w-5 h-5 text-cyber-blue flex-shrink-0 mt-0.5" />
                              <div className="text-sm">
                                <p className="font-medium mb-1">Data Security</p>
                                <p className="text-muted-foreground">
                                  Your personal information and documents are encrypted and stored securely. 
                                  We comply with all data protection regulations and will never share your 
                                  information without your consent.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1}
                      >
                        Previous
                      </Button>

                      {currentStep < totalSteps ? (
                        <Button
                          onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                          className="bg-gradient-to-r from-cyber-blue to-cyber-purple"
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmitKYC}
                          disabled={updateKYCMutation.isPending}
                          className="bg-gradient-to-r from-cyber-green to-cyber-blue"
                        >
                          {updateKYCMutation.isPending ? (
                            <>
                              <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4 mr-2" />
                              Submit for Verification
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
