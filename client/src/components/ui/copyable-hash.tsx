import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyableHashProps {
  hash: string;
  shorten?: boolean;
  className?: string;
}

export function CopyableHash({ hash, shorten = true, className }: CopyableHashProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const displayHash = shorten && hash.length > 12 
    ? `${hash.slice(0, 6)}...${hash.slice(-4)}`
    : hash;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <code className="font-mono text-sm bg-muted/30 px-2 py-1 rounded">
        {displayHash}
      </code>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0"
          >
            {copied ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Copied!" : "Copy to clipboard"}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}