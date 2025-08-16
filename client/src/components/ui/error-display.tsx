import { AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  type?: "error" | "warning" | "info";
  showRetry?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({ 
  title, 
  message, 
  type = "error", 
  showRetry = false, 
  onRetry, 
  className = "" 
}: ErrorDisplayProps) {
  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-8 w-8 text-amber-500" />;
      case "info":
        return <AlertTriangle className="h-8 w-8 text-blue-500" />;
      default:
        return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "warning":
        return "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800";
      case "info":
        return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";
      default:
        return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800";
    }
  };

  return (
    <Card className={`${getColors()} ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {getIcon()}
          <div className="flex-1">
            {title && (
              <h3 className="font-semibold text-lg mb-2 text-foreground">
                {title}
              </h3>
            )}
            <p className="text-muted-foreground leading-relaxed">
              {message}
            </p>
            {showRetry && onRetry && (
              <Button 
                onClick={onRetry} 
                variant="outline" 
                size="sm" 
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}