"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { getAdminDebugInfo, isAdminEmail } from "@/lib/admin";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AdminDashboard, AdminLockedState } from "./admin-dashboard";

function AdminContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <AppShell>
        <LoadingSpinner className="min-h-[50vh]" label="Checking admin access..." />
      </AppShell>
    );
  }

  const email = user?.email ?? null;
  const isAdminUser = isAdminEmail(email);
  const debugInfo = getAdminDebugInfo(email);

  return (
    <AppShell>
      {isAdminUser ? <AdminDashboard /> : <AdminLockedState debugInfo={debugInfo} />}
    </AppShell>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminContent />
    </AuthGuard>
  );
}
