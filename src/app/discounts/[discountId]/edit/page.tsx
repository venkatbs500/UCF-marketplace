"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Tag } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StudentDiscountForm } from "@/components/discounts/student-discount-form";
import { useAuth } from "@/components/providers/auth-provider";
import { usesSupabaseDiscounts } from "@/lib/discounts-mode";
import { getStudentDiscountById } from "@/lib/services/discounts-service";
import type { StudentDiscountRecord } from "@/lib/services/discounts-types";

function EditDiscountSupabaseForm({
  discountId,
  userId,
}: {
  discountId: string;
  userId: string;
}) {
  const [discount, setDiscount] = useState<StudentDiscountRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getStudentDiscountById(discountId, userId).then((result) => {
      if (cancelled) return;
      setDiscount(result.discount);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [discountId, userId]);

  if (loading) {
    return (
      <AppShell>
        <LoadingSpinner className="min-h-[40vh]" label="Loading discount..." />
      </AppShell>
    );
  }

  if (!discount || discount.postedBy !== userId) {
    return (
      <AppShell>
        <EmptyState
          icon={Tag}
          title="You can only edit your own discounts"
          description={error ?? "This discount may not exist or is no longer available."}
          action={
            <Link href="/discounts">
              <Button>Back to discounts</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SectionHeading title="Edit discount" subtitle={discount.title} />
      <div className="mx-auto max-w-2xl">
        <StudentDiscountForm userId={userId} mode="edit" initialDiscount={discount} />
      </div>
    </AppShell>
  );
}

function EditDiscountContent() {
  const params = useParams();
  const discountId = params.discountId as string;
  const { user } = useAuth();
  const supabaseMode = usesSupabaseDiscounts();

  if (!supabaseMode) {
    return (
      <AppShell>
        <EmptyState
          icon={Tag}
          title="Edit unavailable in demo mode"
          description="Discount editing is enabled in Supabase real mode."
          action={
            <Link href="/discounts">
              <Button>Back to discounts</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  if (!user?.id) return null;

  return <EditDiscountSupabaseForm discountId={discountId} userId={user.id} />;
}

export default function EditDiscountPage() {
  return (
    <AuthGuard>
      <EditDiscountContent />
    </AuthGuard>
  );
}
