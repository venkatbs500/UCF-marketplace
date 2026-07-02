"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Knight Market route error:", error);
  }, [error]);

  return (
    <ErrorState
      title="Something went wrong"
      description="Knight Market hit a snag on this page. Try reloading or return to a safe area."
      onRetry={reset}
    />
  );
}
