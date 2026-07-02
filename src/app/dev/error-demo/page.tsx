"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TRUST_DISCLAIMER } from "@/lib/constants";

function ThrowOnRender({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Knight Market dev error demo");
  }
  return null;
}

export default function ErrorDemoPage() {
  const isDev = process.env.NODE_ENV === "development";
  const [shouldThrow, setShouldThrow] = useState(false);

  if (!isDev) {
    return (
      <AppShell>
        <Card className="max-w-lg mx-auto">
          <CardContent className="py-10 text-center">
            <h1 className="mb-2 text-xl font-bold">Development only</h1>
            <p className="mb-6 text-sm text-muted">
              This page is for local error boundary testing and is not available in production.
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
            <p className="mt-6 text-xs text-muted">{TRUST_DISCLAIMER}</p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ThrowOnRender shouldThrow={shouldThrow} />
      <Card className="max-w-lg mx-auto">
        <CardContent className="space-y-4 py-10 text-center">
          <h1 className="text-xl font-bold">Error Boundary Demo</h1>
          <p className="text-sm text-muted">
            Triggers a client-side error to verify Knight Market error recovery UI.
          </p>
          <Button
            data-testid="trigger-error"
            onClick={() => setShouldThrow(true)}
          >
            Trigger Error
          </Button>
          <p className="text-xs text-muted">{TRUST_DISCLAIMER}</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
