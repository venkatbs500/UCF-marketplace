import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export function LoadingSpinner({ className, label }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
      role="status"
      aria-label={label ?? "Loading"}
    >
      <Loader2 className="h-8 w-8 animate-spin text-gold" />
      {label && <p className="text-sm text-muted">{label}</p>}
    </div>
  );
}
