"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { HousingPostForm } from "@/components/housing/housing-post-form";
import { useAuth } from "@/components/providers/auth-provider";
import { usesSupabaseHousing } from "@/lib/housing-mode";

function NewHousingContent() {
  const { user } = useAuth();
  const supabaseMode = usesSupabaseHousing();

  if (!supabaseMode) {
    return (
      <AppShell>
        <SectionHeading
          title="Post housing"
          subtitle="Housing posts save to Supabase in real product mode"
        />
        <DemoModeBadge />
        <div className="mt-6 rounded-2xl border border-gold/20 bg-gold/5 p-6 text-sm text-muted">
          Demo preview only. Switch to Supabase real mode to publish housing posts.
        </div>
        <Link href="/housing" className="mt-4 inline-block">
          <Button variant="secondary">Back to housing</Button>
        </Link>
      </AppShell>
    );
  }

  if (!user?.id) return null;

  return (
    <AppShell>
      <SectionHeading
        title="Post housing"
        subtitle="Share a sublease, room, or lease transfer with verified students"
      />
      <div className="mx-auto max-w-2xl">
        <HousingPostForm userId={user.id} mode="create" />
      </div>
    </AppShell>
  );
}

export default function NewHousingPage() {
  return (
    <AuthGuard>
      <NewHousingContent />
    </AuthGuard>
  );
}
