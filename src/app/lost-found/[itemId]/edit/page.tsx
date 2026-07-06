"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { LostFoundItemForm } from "@/components/lost-found/lost-found-item-form";
import { useAuth } from "@/components/providers/auth-provider";
import { usesSupabaseLostFound } from "@/lib/lost-found-mode";
import { getLostFoundItemById } from "@/lib/services/lost-found-service";
import type { LostFoundItemRecord } from "@/lib/services/lost-found-types";

function EditLostFoundSupabaseForm({
  itemId,
  userId,
}: {
  itemId: string;
  userId: string;
}) {
  const [item, setItem] = useState<LostFoundItemRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getLostFoundItemById(itemId, userId).then((result) => {
      if (cancelled) return;
      setItem(result.item);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [itemId, userId]);

  if (loading) {
    return (
      <AppShell>
        <LoadingSpinner className="min-h-[40vh]" label="Loading item..." />
      </AppShell>
    );
  }

  if (!item || item.userId !== userId) {
    return (
      <AppShell>
        <EmptyState
          icon={Search}
          title="You can only edit your own items"
          description={error ?? "This item may not exist or is no longer available."}
          action={
            <Link href="/lost-found">
              <Button>Back to Lost & Found</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SectionHeading title="Edit lost/found item" subtitle={item.title} />
      <div className="mx-auto max-w-2xl">
        <LostFoundItemForm userId={userId} mode="edit" initialItem={item} />
      </div>
    </AppShell>
  );
}

function EditLostFoundContent() {
  const params = useParams();
  const itemId = params.itemId as string;
  const { user } = useAuth();
  const supabaseMode = usesSupabaseLostFound();

  if (!supabaseMode) {
    return (
      <AppShell>
        <EmptyState
          icon={Search}
          title="Edit unavailable in demo mode"
          description="Lost & Found editing is enabled in Supabase real mode."
          action={
            <Link href="/lost-found">
              <Button>Back to Lost & Found</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  if (!user?.id) return null;

  return <EditLostFoundSupabaseForm itemId={itemId} userId={user.id} />;
}

export default function EditLostFoundPage() {
  return (
    <AuthGuard>
      <EditLostFoundContent />
    </AuthGuard>
  );
}
