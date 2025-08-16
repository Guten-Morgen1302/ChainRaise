import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface KYCBadgeProps {
  status: "approved" | "pending" | "rejected";
  className?: string;
}

export function KYCBadge({ status, className }: KYCBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle,
          label: "KYC Approved",
          className: "bg-success/20 text-success border-success/30",
          tooltip: "Your identity has been verified. You can now create campaigns and access all features."
        };
      case "pending":
        return {
          icon: Clock,
          label: "KYC Pending",
          className: "bg-warning/20 text-warning border-warning/30",
          tooltip: "Your KYC verification is under review. This usually takes 1-3 business days."
        };
      case "rejected":
        return {
          icon: XCircle,
          label: "KYC Rejected",
          className: "bg-danger/20 text-danger border-danger/30",
          tooltip: "Your KYC verification was rejected. Please resubmit with correct documents."
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge className={`${config.className} ${className}`}>
          <Icon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{config.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}