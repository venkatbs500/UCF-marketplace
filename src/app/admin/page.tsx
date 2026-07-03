"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { isAdminEmailForUi } from "@/lib/admin";
import { AdminDashboard, AdminLockedState } from "./admin-dashboard";

function AdminContent() {
  const { user } = useAuth();
  const isAdmin = user ? isAdminEmailForUi(user.email) : false;

  return (
    <AppShell>
      {isAdmin ? <AdminDashboard /> : <AdminLockedState />}
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
