import { cn } from "@/lib/utils";

interface StatusDotProps {
  status: "online" | "warning" | "offline";
  label?: string;
  className?: string;
}

export function StatusDot({ status, label, className }: StatusDotProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "status-dot",
          {
            "status-online": status === "online",
            "status-warning": status === "warning", 
            "status-offline": status === "offline",
          }
        )}
      />
      {label && <span className="text-sm body-text">{label}</span>}
    </div>
  );
}