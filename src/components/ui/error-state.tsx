import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TRUST_DISCLAIMER } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "Knight Market hit a snag. Try reloading or head back to a safe page.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center",
        className
      )}
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
        <AlertTriangle className="h-8 w-8 text-red-400" aria-hidden />
      </div>
      <h1 className="mb-3 text-2xl font-bold md:text-3xl">{title}</h1>
      <p className="mb-8 max-w-md text-sm text-muted">{description}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            Reload Page
          </Button>
        )}
        <Link href="/">
          <Button variant={onRetry ? "secondary" : "default"}>Go Home</Button>
        </Link>
        <Link href="/marketplace">
          <Button variant="outline">Back to Marketplace</Button>
        </Link>
      </div>
      <p className="mt-10 max-w-sm text-xs text-muted">{TRUST_DISCLAIMER}</p>
    </div>
  );
}
