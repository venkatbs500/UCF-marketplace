"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { LostFoundItemForm } from "@/components/lost-found/lost-found-item-form";
import { useAuth } from "@/components/providers/auth-provider";
import { usesSupabaseLostFound } from "@/lib/lost-found-mode";

function NewLostFoundContent() {
  const { user } = useAuth();
  const supabaseMode = usesSupabaseLostFound();

  if (!supabaseMode) {
    return (
      <AppShell>
        <SectionHeading
          title="Post lost/found item"
          subtitle="Lost & Found posts save to Supabase in real product mode"
        />
        <DemoModeBadge />
        <div className="mt-6 rounded-2xl border border-gold/20 bg-gold/5 p-6 text-sm text-muted">
          Demo preview only. Switch to Supabase real mode to publish lost & found items.
        </div>
        <Link href="/lost-found" className="mt-4 inline-block">
          <Button variant="secondary">Back to Lost & Found</Button>
        </Link>
      </AppShell>
    );
  }

  if (!user?.id) return null;

  return (
    <AppShell>
      <SectionHeading
        title="Post lost/found item"
        subtitle="Share what you lost or found with verified students"
      />
      <div className="mx-auto max-w-2xl">
        <LostFoundItemForm userId={user.id} mode="create" />
      </div>
    </AppShell>
  );
}

export default function NewLostFoundPage() {
  return (
    <AuthGuard>
      <NewLostFoundContent />
    </AuthGuard>
  );
}
