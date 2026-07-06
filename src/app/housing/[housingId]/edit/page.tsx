"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Home } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { HousingPostForm } from "@/components/housing/housing-post-form";
import { useAuth } from "@/components/providers/auth-provider";
import { usesSupabaseHousing } from "@/lib/housing-mode";
import { getHousingPostById } from "@/lib/services/housing-service";
import type { HousingPostItem } from "@/lib/services/housing-types";

function EditHousingSupabaseForm({
  housingId,
  userId,
}: {
  housingId: string;
  userId: string;
}) {
  const [post, setPost] = useState<HousingPostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getHousingPostById(housingId, userId).then((result) => {
      if (cancelled) return;
      setPost(result.post);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [housingId, userId]);

  if (loading) {
    return (
      <AppShell>
        <LoadingSpinner className="min-h-[40vh]" label="Loading housing post..." />
      </AppShell>
    );
  }

  if (!post || post.userId !== userId) {
    return (
      <AppShell>
        <EmptyState
          icon={Home}
          title="You can only edit your own housing posts"
          description={error ?? "This post may not exist or is no longer available."}
          action={
            <Link href="/housing">
              <Button>Back to housing</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SectionHeading title="Edit housing post" subtitle={post.title} />
      <div className="mx-auto max-w-2xl">
        <HousingPostForm userId={userId} mode="edit" initialPost={post} />
      </div>
    </AppShell>
  );
}

function EditHousingContent() {
  const params = useParams();
  const housingId = params.housingId as string;
  const { user } = useAuth();
  const supabaseMode = usesSupabaseHousing();

  if (!supabaseMode) {
    return (
      <AppShell>
        <EmptyState
          icon={Home}
          title="Edit unavailable in demo mode"
          description="Housing editing is enabled in Supabase real mode."
          action={
            <Link href="/housing">
              <Button>Back to housing</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  if (!user?.id) return null;

  return <EditHousingSupabaseForm housingId={housingId} userId={user.id} />;
}

export default function EditHousingPage() {
  return (
    <AuthGuard>
      <EditHousingContent />
    </AuthGuard>
  );
}
