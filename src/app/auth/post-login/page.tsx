"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

export default function PostLoginPage() {
  const router = useRouter();
  const {
    authMode,
    refreshSession,
    isAuthenticated,
    hasCompletedOnboarding,
  } = useAuth();
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (authMode !== "supabase") {
      router.replace("/sign-in");
      return;
    }

    let cancelled = false;

    async function syncSession() {
      await refreshSession();
      if (cancelled) return;
      await new Promise((resolve) => setTimeout(resolve, 400));
      if (cancelled) return;
      await refreshSession();
      if (!cancelled) setSynced(true);
    }

    void syncSession();
    return () => {
      cancelled = true;
    };
  }, [authMode, refreshSession, router]);

  useEffect(() => {
    if (!synced || !isAuthenticated) return;
    router.replace(hasCompletedOnboarding ? "/marketplace" : "/onboarding");
  }, [synced, isAuthenticated, hasCompletedOnboarding, router]);

  const showError = synced && !isAuthenticated;

  if (showError) {
    return (
      <AuthPageShell>
        <div className="w-full max-w-md">
          <Card className="border-gold/20">
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center gap-2 text-gold">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm font-semibold">Sign-in issue</p>
              </div>
              <p className="text-sm text-muted">
                We could not finish signing you in. Please request a new secure link and try
                again.
              </p>
              <Link href="/sign-in" className={cn(buttonVariants(), "w-full")}>
                <ArrowLeft className="h-4 w-4" />
                Back to sign-in
              </Link>
            </CardContent>
          </Card>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell>
      <LoadingSpinner className="min-h-[45vh]" label="Finishing sign-in..." />
    </AuthPageShell>
  );
}
