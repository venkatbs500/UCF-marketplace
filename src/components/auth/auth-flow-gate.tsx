"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { getAuthDestination } from "@/lib/auth";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type AuthGateMode = "sign-in" | "verify" | "onboarding";

interface AuthFlowGateProps {
  mode: AuthGateMode;
  children: React.ReactNode;
}

export function AuthFlowGate({ mode, children }: AuthFlowGateProps) {
  const router = useRouter();
  const { isLoading, isAuthenticated, hasCompletedOnboarding, pendingEmail } =
    useAuth();

  useEffect(() => {
    if (isLoading) return;

    const destination = getAuthDestination({
      isAuthenticated,
      hasCompletedOnboarding,
      pendingEmail,
      mode,
    });

    if (destination) {
      router.replace(destination);
    }
  }, [
    isLoading,
    isAuthenticated,
    hasCompletedOnboarding,
    pendingEmail,
    mode,
    router,
  ]);

  if (isLoading) {
    return (
      <AuthPageShell>
        <LoadingSpinner className="min-h-[40vh]" />
      </AuthPageShell>
    );
  }

  const destination = getAuthDestination({
    isAuthenticated,
    hasCompletedOnboarding,
    pendingEmail,
    mode,
  });

  if (destination) {
    return (
      <AuthPageShell>
        <LoadingSpinner className="min-h-[40vh]" label="Redirecting..." />
      </AuthPageShell>
    );
  }

  return <AuthPageShell>{children}</AuthPageShell>;
}
