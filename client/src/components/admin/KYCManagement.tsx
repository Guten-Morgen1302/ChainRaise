import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Eye, 
  Edit,
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Search,
  Filter,
  Download,
  User,
  Calendar,
  MessageSquare,
  FileText
} from "lucide-react";
import { format } from "date-fns";

interface KycApplication {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  idType: string;
  idNumber: string;
  occupation: string;
  sourceOfFunds: string;
  monthlyIncome: string;
  idFrontImageUrl?: string;
  idBackImageUrl?: string;
  selfieImageUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  adminComments?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function KYCManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<KycApplication | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string>("");
  const [adminComments, setAdminComments] = useState("");

  const { data: applications, isLoading } = useQuery<KycApplication[]>({
    queryKey: ["/api/admin/kyc/applications", selectedStatus],
    queryFn: () => apiRequest("GET", `/api/admin/kyc/applications?status=${selectedStatus === 'all' ? '' : selectedStatus}`),
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, comments }: { id: string; status: string; comments: string }) => {
      return await apiRequest("PUT", `/api/admin/kyc/applications/${id}`, {
        status,
        adminComments: comments,
      });
    },
    onSuccess: () => {
      toast({
        title: "Application Updated",
        description: "KYC application has been reviewed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc/applications"] });
      setSelectedApplication(null);
      setReviewStatus("");
      setAdminComments("");
    },
    onError: (error: any) => {
      toast({
        title: "Review Failed",
        description: error.message || "Failed to update KYC application.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: Clock },
      under_review: { color: "bg-blue-100 text-blue-800 border-blue-300", icon: AlertCircle },
      approved: { color: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800 border-red-300", icon: XCircle },
    };
    
    const config = configs[status as keyof typeof configs] || configs.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filteredApplications = applications?.filter(app => {
    const matchesSearch = searchTerm === "" || 
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || app.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleReview = () => {
    if (!selectedApplication || !reviewStatus) return;
    
    reviewMutation.mutate({
      id: selectedApplication.id,
      status: reviewStatus,
      comments: adminComments,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="kyc-management">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">KYC Management</h2>
          <p className="text-muted-foreground">Review and manage user verification applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Applications</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40" data-testid="select-status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['pending', 'under_review', 'approved', 'rejected'].map((status) => {
          const count = applications?.filter(app => app.status === status).length || 0;
          const configs = {
            pending: { color: "text-yellow-600", bg: "bg-yellow-50", label: "Pending" },
            under_review: { color: "text-blue-600", bg: "bg-blue-50", label: "Under Review" },
            approved: { color: "text-green-600", bg: "bg-green-50", label: "Approved" },
            rejected: { color: "text-red-600", bg: "bg-red-50", label: "Rejected" },
          };
          const config = configs[status as keyof typeof configs];
          
          return (
            <Card key={status}>
              <CardContent className={`p-4 ${config.bg}`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${config.color}`}>{count}</div>
                  <div className="text-sm text-muted-foreground">{config.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Applications ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Reviewed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id} data-testid={`row-application-${application.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {application.firstName} {application.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {application.country}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{application.email}</TableCell>
                  <TableCell>{getStatusBadge(application.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(application.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {application.reviewedAt ? (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(application.reviewedAt), 'MMM dd, yyyy')}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(application);
                            setReviewStatus(application.status);
                            setAdminComments(application.adminComments || "");
                          }}
                          data-testid={`button-view-${application.id}`}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View & Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            KYC Application Review - {application.firstName} {application.lastName}
                          </DialogTitle>
                        </DialogHeader>
                        
                        {selectedApplication && (
                          <div className="space-y-6">
                            {/* Personal Information */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Personal Information</CardTitle>
                              </CardHeader>
                              <CardContent className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Full Name</Label>
                                  <p className="text-sm">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                                </div>
                                <div>
                                  <Label>Date of Birth</Label>
                                  <p className="text-sm">{selectedApplication.dateOfBirth}</p>
                                </div>
                                <div>
                                  <Label>Email</Label>
                                  <p className="text-sm">{selectedApplication.email}</p>
                                </div>
                                <div>
                                  <Label>Phone</Label>
                                  <p className="text-sm">{selectedApplication.phone}</p>
                                </div>
                                <div className="col-span-2">
                                  <Label>Address</Label>
                                  <p className="text-sm">
                                    {selectedApplication.address}, {selectedApplication.city}, {selectedApplication.state} {selectedApplication.zipCode}, {selectedApplication.country}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Identity Information */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Identity & Financial Information</CardTitle>
                              </CardHeader>
                              <CardContent className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>ID Type</Label>
                                  <p className="text-sm">{selectedApplication.idType.replace('_', ' ').toUpperCase()}</p>
                                </div>
                                <div>
                                  <Label>ID Number</Label>
                                  <p className="text-sm">{selectedApplication.idNumber}</p>
                                </div>
                                <div>
                                  <Label>Occupation</Label>
                                  <p className="text-sm">{selectedApplication.occupation}</p>
                                </div>
                                <div>
                                  <Label>Monthly Income</Label>
                                  <p className="text-sm">{selectedApplication.monthlyIncome}</p>
                                </div>
                                <div className="col-span-2">
                                  <Label>Source of Funds</Label>
                                  <p className="text-sm">{selectedApplication.sourceOfFunds}</p>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Document Images */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {[
                                    { label: "ID Front", url: selectedApplication.idFrontImageUrl },
                                    { label: "ID Back", url: selectedApplication.idBackImageUrl },
                                    { label: "Selfie", url: selectedApplication.selfieImageUrl },
                                  ].map((doc, index) => (
                                    <div key={index} className="text-center">
                                      <Label className="text-sm font-medium">{doc.label}</Label>
                                      <div className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                                        {doc.url ? (
                                          <div className="space-y-2">
                                            {doc.url.startsWith('data:image') ? (
                                              <img 
                                                src={doc.url} 
                                                alt={doc.label}
                                                className="w-full h-32 object-cover rounded border"
                                              />
                                            ) : (
                                              <FileText className="w-8 h-8 mx-auto text-green-600" />
                                            )}
                                            <p className="text-sm text-green-600">Document uploaded</p>
                                            {doc.url.startsWith('data:image') && (
                                              <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => window.open(doc.url, '_blank')}
                                              >
                                                View Full Size
                                              </Button>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="space-y-2">
                                            <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">No document</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Review Section */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Application Review</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div>
                                  <Label htmlFor="review-status">Review Decision</Label>
                                  <Select value={reviewStatus} onValueChange={setReviewStatus}>
                                    <SelectTrigger data-testid="select-review-status">
                                      <SelectValue placeholder="Select decision" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="under_review">Under Review</SelectItem>
                                      <SelectItem value="approved">Approve</SelectItem>
                                      <SelectItem value="rejected">Reject</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label htmlFor="admin-comments">Admin Comments</Label>
                                  <Textarea
                                    id="admin-comments"
                                    placeholder="Add comments about this application..."
                                    value={adminComments}
                                    onChange={(e) => setAdminComments(e.target.value)}
                                    rows={4}
                                    data-testid="textarea-admin-comments"
                                  />
                                </div>

                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedApplication(null)}
                                    data-testid="button-cancel-review"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleReview}
                                    disabled={!reviewStatus || reviewMutation.isPending}
                                    data-testid="button-submit-review"
                                  >
                                    {reviewMutation.isPending ? "Updating..." : "Submit Review"}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredApplications.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No applications found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedStatus !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "No KYC applications have been submitted yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}