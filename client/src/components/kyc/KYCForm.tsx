import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileText, User, Building, Shield, AlertCircle } from "lucide-react";

const kycFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(10, "Please enter your complete address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  zipCode: z.string().min(3, "ZIP/Postal code is required"),
  country: z.string().min(2, "Country is required"),
  idType: z.enum(["passport", "driver_license", "national_id"], {
    required_error: "Please select an ID type",
  }),
  idNumber: z.string().min(5, "ID number is required"),
  occupation: z.string().min(2, "Occupation is required"),
  sourceOfFunds: z.string().min(2, "Source of funds is required"),
  monthlyIncome: z.string().min(1, "Monthly income range is required"),
});

type KycFormData = z.infer<typeof kycFormSchema>;

interface KYCFormProps {
  onSubmitSuccess: () => void;
}

export default function KYCForm({ onSubmitSuccess }: KYCFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState({
    idFront: null as File | null,
    idBack: null as File | null,
    selfie: null as File | null,
  });

  const form = useForm<KycFormData>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      idType: "passport",
      idNumber: "",
      occupation: "",
      sourceOfFunds: "",
      monthlyIncome: "",
    },
  });

  const submitKycMutation = useMutation({
    mutationFn: async (data: KycFormData) => {
      // Convert uploaded files to base64 for storage
      const processFile = (file: File): Promise<string> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      };

      const formData = {
        ...data,
        idFrontImageUrl: uploadedFiles.idFront ? await processFile(uploadedFiles.idFront) : null,
        idBackImageUrl: uploadedFiles.idBack ? await processFile(uploadedFiles.idBack) : null,
        selfieImageUrl: uploadedFiles.selfie ? await processFile(uploadedFiles.selfie) : null,
      };
      
      return await apiRequest("POST", "/api/kyc/submit", formData);
    },
    onSuccess: () => {
      toast({
        title: "KYC Application Submitted",
        description: "Your verification documents have been submitted for review. You'll be notified within 1-3 business days.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/kyc/status"] });
      onSubmitSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit KYC application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (type: 'idFront' | 'idBack' | 'selfie', file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: file,
    }));
  };

  const validateCurrentStep = (data: KycFormData): boolean => {
    if (currentStep === 1) {
      // Validate personal information fields
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'address', 'city', 'state', 'zipCode', 'country'];
      return requiredFields.every(field => {
        const value = data[field as keyof KycFormData];
        return value && value.toString().trim() !== '';
      });
    } else if (currentStep === 2) {
      // Validate identity verification fields
      const requiredFields = ['idType', 'idNumber', 'occupation', 'sourceOfFunds', 'monthlyIncome'];
      return requiredFields.every(field => {
        const value = data[field as keyof KycFormData];
        return value && value.toString().trim() !== '';
      });
    }
    return true;
  };

  const handleNextStep = () => {
    // Get current form values
    const formData = form.getValues();
    console.log('Current form data:', formData);
    console.log('Current step:', currentStep);
    
    // Validate current step without triggering full form validation
    const stepValid = validateCurrentStep(formData);
    console.log('Step valid:', stepValid);
    
    if (stepValid) {
      setCurrentStep(currentStep + 1);
      toast({
        title: `Step ${currentStep} completed!`,
        description: "Proceeding to the next step.",
      });
    } else {
      toast({
        title: "Please fill all required fields",
        description: "Complete all fields in this step before proceeding.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: KycFormData) => {
    console.log('Final form submitted with data:', data);
    
    // This should only be called on the final step
    if (currentStep !== 3) {
      handleNextStep();
      return;
    }
    
    // Final step - validate documents and submit
    if (!uploadedFiles.idFront || !uploadedFiles.selfie) {
      toast({
        title: "Documents Required",
        description: "Please upload your ID document and selfie before submitting.",
        variant: "destructive",
      });
      return;
    }

    submitKycMutation.mutate(data);
  };

  const steps = [
    { number: 1, title: "Personal Information", icon: User },
    { number: 2, title: "Identity Verification", icon: FileText },
    { number: 3, title: "Document Upload", icon: Upload },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8" data-testid="kyc-form">
      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((step) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  currentStep >= step.number
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground text-muted-foreground"
                }`}
              >
                <step.icon className="w-5 h-5" />
              </div>
              <div className="ml-3 text-sm font-medium">{step.title}</div>
              {step.number < steps.length && (
                <div
                  className={`ml-4 w-16 h-0.5 ${
                    currentStep > step.number ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card data-testid="personal-info-step">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-firstName" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-lastName" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-dateOfBirth" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} data-testid="input-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-state" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP/Postal Code</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-zipCode" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-country" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Identity Verification */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card data-testid="identity-verification-step">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Identity Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="idType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Document Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-idType">
                              <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="driver_license">Driver's License</SelectItem>
                            <SelectItem value="national_id">National ID</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-idNumber" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-occupation" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sourceOfFunds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source of Funds</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Employment, Business, Investment" data-testid="input-sourceOfFunds" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Income Range</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-monthlyIncome">
                              <SelectValue placeholder="Select income range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0-1000">$0 - $1,000</SelectItem>
                            <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                            <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                            <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
                            <SelectItem value="25000+">$25,000+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Document Upload */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card data-testid="document-upload-step">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Document Upload
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ID Front */}
                    <div className="space-y-2">
                      <Label>ID Document (Front)</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload front side of your ID
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('idFront', file);
                          }}
                          className="hidden"
                          id="id-front-upload"
                          data-testid="upload-idFront"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => document.getElementById('id-front-upload')?.click()}
                        >
                          Choose File
                        </Button>
                        {uploadedFiles.idFront && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ {uploadedFiles.idFront.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ID Back */}
                    <div className="space-y-2">
                      <Label>ID Document (Back) - Optional</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload back side of your ID (if applicable)
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('idBack', file);
                          }}
                          className="hidden"
                          id="id-back-upload"
                          data-testid="upload-idBack"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => document.getElementById('id-back-upload')?.click()}
                        >
                          Choose File
                        </Button>
                        {uploadedFiles.idBack && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ {uploadedFiles.idBack.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Selfie */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>Selfie with ID</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center max-w-md mx-auto">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload a selfie holding your ID document
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('selfie', file);
                          }}
                          className="hidden"
                          id="selfie-upload"
                          data-testid="upload-selfie"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => document.getElementById('selfie-upload')?.click()}
                        >
                          Choose File
                        </Button>
                        {uploadedFiles.selfie && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ {uploadedFiles.selfie.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Document Guidelines
                        </h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                          <li>• Ensure all text is clearly visible and readable</li>
                          <li>• Photos should be well-lit and in focus</li>
                          <li>• Accepted formats: JPG, PNG, PDF</li>
                          <li>• Maximum file size: 10MB per document</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              data-testid="button-previous"
            >
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                data-testid="button-next"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={submitKycMutation.isPending}
                data-testid="button-submit"
              >
                {submitKycMutation.isPending ? "Submitting..." : "Submit KYC Application"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}