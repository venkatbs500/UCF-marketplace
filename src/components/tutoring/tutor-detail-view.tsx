"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, MapPin, Pencil, Star, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ReportDialog } from "@/components/safety/report-dialog";
import { MessageTutorButton } from "@/components/tutoring/message-tutor-button";
import { useAuth } from "@/components/providers/auth-provider";
import { usesSupabaseTutoring } from "@/lib/tutoring-mode";
import { isDemoDataEnabled } from "@/lib/product-mode";
import {
  deleteTutorProfile,
  getTutorProfileById,
  markTutorProfileInactive,
} from "@/lib/services/tutoring-service";
import {
  TUTORING_FORMAT_LABELS,
  type TutorProfileItem,
} from "@/lib/services/tutoring-types";
import { formatPrice, formatRelativeTime } from "@/lib/utils";

export function TutorDetailView({ tutorId }: { tutorId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const supabaseMode = usesSupabaseTutoring();
  const demoRatings = isDemoDataEnabled() && !supabaseMode;
  const [profile, setProfile] = useState<TutorProfileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getTutorProfileById(tutorId, user?.id).then((result) => {
      if (cancelled) return;
      setProfile(result.profile);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [tutorId, user?.id]);

  const isOwner = Boolean(user?.id && profile?.userId === user.id);
  const showRating =
    profile &&
    (demoRatings ? profile.reviewCount > 0 : profile.reviewCount > 0 && profile.rating > 0);

  const handleMarkInactive = async () => {
    if (!user?.id || !profile) return;
    const result = await markTutorProfileInactive(profile.id, user.id);
    if (!result.success) {
      setActionError(result.error ?? "We could not update this profile.");
      return;
    }
    router.push("/tutoring");
  };

  const handleDelete = async () => {
    if (!user?.id || !profile) return;
    const result = await deleteTutorProfile(profile.id, user.id);
    if (!result.success) {
      setActionError(result.error ?? "We could not delete this profile.");
      return;
    }
    router.push("/tutoring");
  };

  if (loading) {
    return (
      <AppShell>
        <LoadingSpinner className="min-h-[40vh]" label="Loading tutor profile..." />
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <EmptyState
          icon={BookOpen}
          title="Tutor profile not found"
          description={error ?? "This profile may have been removed or is no longer available."}
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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading title={profile.displayName} subtitle="Student tutor at UCF" />
        <Link href="/tutoring">
          <Button variant="secondary" size="sm">
            Back to tutoring
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card data-testid="tutor-detail">
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">{TUTORING_FORMAT_LABELS[profile.tutoringFormat]}</Badge>
                {isOwner && <Badge variant="outline">Your profile</Badge>}
                {profile.status !== "active" && <Badge variant="warning">{profile.status}</Badge>}
              </div>

              <p className="text-3xl font-bold text-gold">
                {profile.hourlyRate != null
                  ? `${formatPrice(profile.hourlyRate)}/hr`
                  : "Rate TBD"}
              </p>

              {showRating && (
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="font-medium">{profile.rating.toFixed(1)}</span>
                  <span className="text-muted">({profile.reviewCount} reviews)</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {profile.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary">
                    {subject}
                  </Badge>
                ))}
              </div>

              {profile.availability.length > 0 && (
                <div className="text-sm text-muted">
                  <p className="mb-1 flex items-center gap-2 font-medium text-foreground">
                    <Clock className="h-4 w-4 text-gold" />
                    Availability
                  </p>
                  <p>{profile.availability.join(" · ")}</p>
                </div>
              )}

              <div>
                <h2 className="mb-2 font-semibold">About</h2>
                <p className="text-sm leading-relaxed text-muted">{profile.bio}</p>
              </div>

              {profile.experience && (
                <div>
                  <h2 className="mb-2 font-semibold">Experience</h2>
                  <p className="text-sm leading-relaxed text-muted">{profile.experience}</p>
                </div>
              )}

              {profile.meetingPreference && (
                <div className="text-sm text-muted">
                  <p className="mb-1 flex items-center gap-2 font-medium text-foreground">
                    <MapPin className="h-4 w-4 text-gold" />
                    Meeting preference
                  </p>
                  <p>{profile.meetingPreference}</p>
                </div>
              )}

              <p className="text-xs text-muted">
                Listed {formatRelativeTime(profile.createdAt)} · Updated{" "}
                {formatRelativeTime(profile.updatedAt)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center gap-3">
                <Avatar
                  initials={profile.tutor.avatarInitials}
                  verified={profile.tutor.isVerifiedStudent}
                />
                <div>
                  <p className="font-semibold">{profile.tutor.name}</p>
                  <p className="text-xs text-muted">Verified student tutor</p>
                </div>
              </div>

              {isOwner ? (
                <div className="space-y-2">
                  <Link href={`/tutoring/${profile.id}/edit`}>
                    <Button variant="secondary" className="w-full">
                      <Pencil className="h-4 w-4" />
                      Edit profile
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => void handleMarkInactive()}
                  >
                    Mark inactive
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete profile
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <MessageTutorButton
                    tutorProfileId={profile.id}
                    tutorUserId={profile.userId}
                    tutorName={profile.displayName}
                    className="w-full"
                  />
                  <p className="text-xs text-muted">
                    Ask about subjects, availability, or session details. Booking and payments are
                    coming later.
                  </p>
                  <p className="text-xs text-muted">
                    Keep sessions safe. Meet in public campus spaces first.
                  </p>
                  <ReportDialog
                    targetType="tutor_profile"
                    targetId={profile.id}
                    buttonLabel="Report tutor profile"
                    variant="outline"
                    className="w-full"
                  />
                </div>
              )}

              {actionError && (
                <p role="alert" className="text-xs text-red-400">
                  {actionError}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete tutor profile?"
        description="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          setConfirmDelete(false);
          void handleDelete();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </AppShell>
  );
}
