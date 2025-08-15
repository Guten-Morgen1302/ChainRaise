import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const kycSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  address: z.string().min(10, "Please provide a complete address"),
  phoneNumber: z.string().min(10, "Please provide a valid phone number"),
  occupation: z.string().min(2, "Occupation is required"),
  sourceOfFunds: z.string().min(10, "Please explain your source of funds"),
});

type KycFormData = z.infer<typeof kycSchema>;

export default function KYCVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const form = useForm<KycFormData>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      documentType: "",
      fullName: "",
      dateOfBirth: "",
      nationality: "",
      address: "",
      phoneNumber: "",
      occupation: "",
      sourceOfFunds: "",
    },
  });

  const kycMutation = useMutation({
    mutationFn: async (data: KycFormData) => {
      // Convert files to base64 for storage
      const filePromises = uploadedFiles.map(file => {
        return new Promise<{ name: string; type: string; data: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({
            name: file.name,
            type: file.type,
            data: reader.result as string,
          });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const files = await Promise.all(filePromises);
      
      return apiRequest("PUT", "/api/user/kyc", {
        documents: {
          ...data,
          uploadedFiles: files,
          submissionDate: new Date().toISOString(),
        },
        status: "pending"
      });
    },
    onSuccess: () => {
      toast({
        title: "KYC Submitted Successfully",
        description: "Your documents are being reviewed. You'll receive an update within 2-3 business days.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Please upload only JPG, PNG, or PDF files under 10MB each.",
        variant: "destructive",
      });
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "text-green-600 bg-green-50";
      case "rejected": return "text-red-600 bg-red-50";
      default: return "text-yellow-600 bg-yellow-50";
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="kyc-loading">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="kyc-verification-page">
      <div className="max-w-2xl mx-auto">
        <Card className="glass-morphism border-cyan-200 dark:border-cyan-800">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              KYC Verification
            </CardTitle>
            <CardDescription>
              Complete your identity verification to create and manage campaigns
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Current Status */}
            <Alert className={`mb-6 ${getKycStatusColor(user.kycStatus || "pending")}`}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Current Status: </strong>
                {user.kycStatus === "verified" && "✅ Verified - You can create campaigns"}
                {user.kycStatus === "rejected" && "❌ Rejected - Please resubmit with correct documents"}
                {user.kycStatus === "pending" && "⏳ Pending Review - Documents submitted and under review"}
                {!user.kycStatus && "📋 Not Started - Please complete verification below"}
              </AlertDescription>
            </Alert>

            {(user.kycStatus !== "verified") && (
              <form onSubmit={form.handleSubmit((data) => kycMutation.mutate(data))} className="space-y-6">
                {/* Document Type */}
                <div className="space-y-2">
                  <Label htmlFor="document-type">Document Type *</Label>
                  <Select 
                    value={form.watch("documentType")} 
                    onValueChange={(value) => form.setValue("documentType", value)}
                  >
                    <SelectTrigger data-testid="select-document-type">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="driver_license">Driver's License</SelectItem>
                      <SelectItem value="national_id">National ID Card</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.documentType && (
                    <p className="text-red-500 text-sm">{form.formState.errors.documentType.message}</p>
                  )}
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name *</Label>
                    <Input 
                      id="full-name"
                      {...form.register("fullName")}
                      placeholder="As shown on your ID"
                      data-testid="input-full-name"
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-red-500 text-sm">{form.formState.errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date-of-birth">Date of Birth *</Label>
                    <Input 
                      id="date-of-birth"
                      type="date"
                      {...form.register("dateOfBirth")}
                      data-testid="input-date-of-birth"
                    />
                    {form.formState.errors.dateOfBirth && (
                      <p className="text-red-500 text-sm">{form.formState.errors.dateOfBirth.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Input 
                      id="nationality"
                      {...form.register("nationality")}
                      placeholder="e.g., United States"
                      data-testid="input-nationality"
                    />
                    {form.formState.errors.nationality && (
                      <p className="text-red-500 text-sm">{form.formState.errors.nationality.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone"
                      {...form.register("phoneNumber")}
                      placeholder="+1 (555) 123-4567"
                      data-testid="input-phone-number"
                    />
                    {form.formState.errors.phoneNumber && (
                      <p className="text-red-500 text-sm">{form.formState.errors.phoneNumber.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Complete Address *</Label>
                  <Textarea 
                    id="address"
                    {...form.register("address")}
                    placeholder="Street address, city, state/province, postal code, country"
                    data-testid="textarea-address"
                  />
                  {form.formState.errors.address && (
                    <p className="text-red-500 text-sm">{form.formState.errors.address.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation *</Label>
                  <Input 
                    id="occupation"
                    {...form.register("occupation")}
                    placeholder="Your current job title or profession"
                    data-testid="input-occupation"
                  />
                  {form.formState.errors.occupation && (
                    <p className="text-red-500 text-sm">{form.formState.errors.occupation.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source-of-funds">Source of Funds *</Label>
                  <Textarea 
                    id="source-of-funds"
                    {...form.register("sourceOfFunds")}
                    placeholder="Explain where your funds come from (e.g., salary, savings, investments)"
                    data-testid="textarea-source-of-funds"
                  />
                  {form.formState.errors.sourceOfFunds && (
                    <p className="text-red-500 text-sm">{form.formState.errors.sourceOfFunds.message}</p>
                  )}
                </div>

                {/* File Upload */}
                <div className="space-y-4">
                  <Label>Upload Documents *</Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                            Upload ID Documents
                          </span>
                          <input
                            id="file-upload"
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                            data-testid="input-file-upload"
                          />
                        </label>
                        <p className="mt-1 text-xs text-gray-500">
                          JPG, PNG or PDF up to 10MB each
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Files */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            data-testid={`button-remove-file-${index}`}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={kycMutation.isPending || uploadedFiles.length === 0}
                  data-testid="button-submit-kyc"
                >
                  {kycMutation.isPending ? "Submitting..." : "Submit for Verification"}
                </Button>
              </form>
            )}

            {user.kycStatus === "verified" && (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-green-700 dark:text-green-400">
                  Verification Complete!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  You can now create and manage campaigns on the platform.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}