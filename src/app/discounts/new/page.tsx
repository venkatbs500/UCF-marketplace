"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { StudentDiscountForm } from "@/components/discounts/student-discount-form";
import { useAuth } from "@/components/providers/auth-provider";
import { usesSupabaseDiscounts } from "@/lib/discounts-mode";

function NewDiscountContent() {
  const { user } = useAuth();
  const supabaseMode = usesSupabaseDiscounts();

  if (!supabaseMode) {
    return (
      <AppShell>
        <SectionHeading
          title="Post a discount"
          subtitle="Student discounts save to Supabase in real product mode"
        />
        <DemoModeBadge />
        <div className="mt-6 rounded-2xl border border-gold/20 bg-gold/5 p-6 text-sm text-muted">
          Demo preview only. Switch to Supabase real mode to publish student discounts.
        </div>
        <Link href="/discounts" className="mt-4 inline-block">
          <Button variant="secondary">Back to discounts</Button>
        </Link>
      </AppShell>
    );
  }

  if (!user?.id) return null;

  return (
    <AppShell>
      <SectionHeading
        title="Post a discount"
        subtitle="Share a student deal, promo code, or local offer with campus"
      />
      <div className="mx-auto max-w-2xl">
        <StudentDiscountForm userId={user.id} mode="create" />
      </div>
    </AppShell>
  );
}

export default function NewDiscountPage() {
  return (
    <AuthGuard>
      <NewDiscountContent />
    </AuthGuard>
  );
}
