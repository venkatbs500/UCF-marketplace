"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Knight Market global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ErrorState
          title="Knight Market is having trouble"
          description="A critical error occurred. Reload the app or return home."
          onRetry={reset}
        />
      </body>
    </html>
  );
}
