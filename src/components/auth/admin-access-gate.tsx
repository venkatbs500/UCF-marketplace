"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AdminDashboard, AdminLockedState } from "@/app/admin/admin-dashboard";
import { getAdminDebugInfo, isAdminEmail } from "@/lib/admin";
import {
  AUTH_ROUTES,
  buildOnboardingUrl,
  buildSignInUrl,
  rememberAuthRedirect,
} from "@/lib/auth";

export function AdminAccessGate() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, hasCompletedOnboarding } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      rememberAuthRedirect(AUTH_ROUTES.admin);
      router.replace(buildSignInUrl(AUTH_ROUTES.admin));
      return;
    }

    if (!hasCompletedOnboarding) {
      rememberAuthRedirect(AUTH_ROUTES.admin);
      router.replace(buildOnboardingUrl(AUTH_ROUTES.admin));
    }
  }, [isLoading, isAuthenticated, hasCompletedOnboarding, router]);

  if (isLoading) {
    return (
      <LoadingSpinner className="min-h-[50vh]" label="Checking admin access..." />
    );
  }

  if (!isAuthenticated || !hasCompletedOnboarding) {
    return (
      <LoadingSpinner className="min-h-[50vh]" label="Redirecting..." />
    );
  }

  const email = user?.email ?? null;
  const debugInfo = getAdminDebugInfo(email);

  if (!isAdminEmail(email)) {
    return <AdminLockedState debugInfo={debugInfo} />;
  }

  return <AdminDashboard />;
}
