"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { TutorProfileForm } from "@/components/tutoring/tutor-profile-form";
import { useAuth } from "@/components/providers/auth-provider";
import { usesSupabaseTutoring } from "@/lib/tutoring-mode";
import { getTutorProfileById } from "@/lib/services/tutoring-service";
import type { TutorProfileItem } from "@/lib/services/tutoring-types";

function EditTutorSupabaseForm({
  tutorId,
  userId,
}: {
  tutorId: string;
  userId: string;
}) {
  const [profile, setProfile] = useState<TutorProfileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getTutorProfileById(tutorId, userId).then((result) => {
      if (cancelled) return;
      setProfile(result.profile);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [tutorId, userId]);

  if (loading) {
    return (
      <AppShell>
        <LoadingSpinner className="min-h-[40vh]" label="Loading tutor profile..." />
      </AppShell>
    );
  }

  if (!profile || profile.userId !== userId) {
    return (
      <AppShell>
        <EmptyState
          icon={BookOpen}
          title="You can only edit your own tutor profile"
          description={error ?? "This profile may not exist or is no longer available."}
          action={
            <Link href="/tutoring">
              <Button>Back to tutoring</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SectionHeading title="Edit tutor profile" subtitle={profile.displayName} />
      <div className="mx-auto max-w-2xl">
        <TutorProfileForm userId={userId} mode="edit" initialProfile={profile} />
      </div>
    </AppShell>
  );
}

function EditTutorContent() {
  const params = useParams();
  const tutorId = params.tutorId as string;
  const { user } = useAuth();
  const supabaseMode = usesSupabaseTutoring();

  if (!supabaseMode) {
    return (
      <AppShell>
        <EmptyState
          icon={BookOpen}
          title="Edit unavailable in demo mode"
          description="Tutor editing is enabled in Supabase real mode."
          action={
            <Link href="/tutoring">
              <Button>Back to tutoring</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  if (!user?.id) return null;

  return <EditTutorSupabaseForm tutorId={tutorId} userId={user.id} />;
}

export default function EditTutorPage() {
  return (
    <AuthGuard>
      <EditTutorContent />
    </AuthGuard>
  );
}
