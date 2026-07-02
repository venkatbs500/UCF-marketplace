import Link from "next/link";
import { MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TRUST_DISCLAIMER } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface NotFoundStateProps {
  title?: string;
  description?: string;
  className?: string;
  testId?: string;
}

export function NotFoundState({
  title = "Page not found",
  description = "This page doesn't exist or may have moved. Head back to Knight Market.",
  className,
  testId = "not-found-state",
}: NotFoundStateProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center",
        className
      )}
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10">
        <MapPinOff className="h-8 w-8 text-gold" aria-hidden />
      </div>
      <h1 className="mb-3 text-2xl font-bold md:text-3xl">{title}</h1>
      <p className="mb-8 max-w-md text-sm text-muted">{description}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
        <Link href="/marketplace">
          <Button variant="secondary">Back to Marketplace</Button>
        </Link>
      </div>
      <p className="mt-10 max-w-sm text-xs text-muted">{TRUST_DISCLAIMER}</p>
    </div>
  );
}
