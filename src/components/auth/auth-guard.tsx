"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { AUTH_ROUTES } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isLoading, isAuthenticated, hasCompletedOnboarding } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(AUTH_ROUTES.signIn);
      return;
    }
    if (!hasCompletedOnboarding) {
      router.replace(AUTH_ROUTES.onboarding);
    }
  }, [isLoading, isAuthenticated, hasCompletedOnboarding, router]);

  if (isLoading || !isAuthenticated || !hasCompletedOnboarding) {
    return <LoadingSpinner className="min-h-[50vh]" label="Checking access..." />;
  }

  return <>{children}</>;
}
