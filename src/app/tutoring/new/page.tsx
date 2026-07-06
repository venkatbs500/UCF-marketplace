"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { TutorProfileForm } from "@/components/tutoring/tutor-profile-form";
import { useAuth } from "@/components/providers/auth-provider";
import { usesSupabaseTutoring } from "@/lib/tutoring-mode";
import { getMyTutorProfile } from "@/lib/services/tutoring-service";

function NewTutorSupabaseForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getMyTutorProfile(userId).then((result) => {
      if (cancelled) return;
      if (result.profile) {
        router.replace(`/tutoring/${result.profile.id}/edit`);
        return;
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, router]);

  if (!ready) {
    return (
      <AppShell>
        <LoadingSpinner className="min-h-[40vh]" label="Checking tutor profile..." />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SectionHeading
        title="Become a tutor"
        subtitle="Share your subjects and availability with verified students"
      />
      <div className="mx-auto max-w-2xl">
        <TutorProfileForm userId={userId} mode="create" />
      </div>
    </AppShell>
  );
}

function NewTutorContent() {
  const { user } = useAuth();
  const supabaseMode = usesSupabaseTutoring();

  if (!supabaseMode) {
    return (
      <AppShell>
        <SectionHeading
          title="Become a tutor"
          subtitle="Tutor profiles save to Supabase in real product mode"
        />
        <DemoModeBadge />
        <div className="mt-6 rounded-2xl border border-gold/20 bg-gold/5 p-6 text-sm text-muted">
          Demo preview only. Switch to Supabase real mode to publish a tutor profile.
        </div>
        <Link href="/tutoring" className="mt-4 inline-block">
          <Button variant="secondary">Back to tutoring</Button>
        </Link>
      </AppShell>
    );
  }

  if (!user?.id) return null;

  return <NewTutorSupabaseForm userId={user.id} />;
}

export default function NewTutorPage() {
  return (
    <AuthGuard>
      <NewTutorContent />
    </AuthGuard>
  );
}
