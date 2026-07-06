"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bed, Bath, Calendar, Home, MapPin, Pencil, Trash2 } from "lucide-react";
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
import { MessageHousingPosterButton } from "@/components/housing/message-housing-poster-button";
import { useAuth } from "@/components/providers/auth-provider";
import {
  deleteHousingPost,
  getHousingPostById,
  markHousingPostInactive,
} from "@/lib/services/housing-service";
import { HOUSING_TYPE_LABELS, type HousingPostItem } from "@/lib/services/housing-types";
import { formatDate, formatPrice, formatRelativeTime } from "@/lib/utils";

function isImageUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function HousingDetailView({ housingId }: { housingId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<HousingPostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getHousingPostById(housingId, user?.id).then((result) => {
      if (cancelled) return;
      setPost(result.post);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [housingId, user?.id]);

  const isOwner = Boolean(user?.id && post?.userId === user.id);

  const handleMarkInactive = async () => {
    if (!user?.id || !post) return;
    const result = await markHousingPostInactive(post.id, user.id);
    if (!result.success) {
      setActionError(result.error ?? "We could not update this post.");
      return;
    }
    router.push("/housing");
  };

  const handleDelete = async () => {
    if (!user?.id || !post) return;
    const result = await deleteHousingPost(post.id, user.id);
    if (!result.success) {
      setActionError(result.error ?? "We could not delete this post.");
      return;
    }
    router.push("/housing");
  };

  if (loading) {
    return (
      <AppShell>
        <LoadingSpinner className="min-h-[40vh]" label="Loading housing post..." />
      </AppShell>
    );
  }

  if (!post) {
    return (
      <AppShell>
        <EmptyState
          icon={Home}
          title="Housing post not found"
          description={error ?? "This post may have been removed or is no longer available."}
          action={
            <Link href="/housing">
              <Button>Back to housing</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  const images = post.images.filter(isImageUrl);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading title={post.title} subtitle="Housing near UCF" />
        <Link href="/housing">
          <Button variant="secondary" size="sm">
            Back to housing
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {images.length > 0 ? (
              images.map((image) => (
                <div
                  key={image}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="" className="h-48 w-full object-cover sm:h-56" />
                </div>
              ))
            ) : (
              <div className="flex h-48 items-center justify-center rounded-2xl bg-white/5 text-5xl sm:col-span-2">
                🏠
              </div>
            )}
          </div>

          <Card data-testid="housing-detail">
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">{HOUSING_TYPE_LABELS[post.type]}</Badge>
                {isOwner && <Badge variant="outline">Your post</Badge>}
                {post.status !== "active" && <Badge variant="warning">{post.status}</Badge>}
              </div>

              <p className="text-3xl font-bold text-gold">
                {post.rent != null ? `${formatPrice(post.rent)}/mo` : "Rent TBD"}
              </p>

              <div className="grid gap-2 text-sm text-muted sm:grid-cols-2">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold" />
                  {post.location}
                  {post.apartmentName ? ` · ${post.apartmentName}` : ""}
                </span>
                {post.bedrooms != null && (
                  <span className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-gold" />
                    {post.bedrooms} bedrooms
                  </span>
                )}
                {post.bathrooms != null && (
                  <span className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-gold" />
                    {post.bathrooms} bathrooms
                  </span>
                )}
                {post.moveInDate && (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gold" />
                    Available from {formatDate(post.moveInDate)}
                  </span>
                )}
                {post.moveOutDate && (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gold" />
                    Lease ends {formatDate(post.moveOutDate)}
                  </span>
                )}
              </div>

              <div>
                <h2 className="mb-2 font-semibold">Description</h2>
                <p className="text-sm leading-relaxed text-muted">{post.description}</p>
              </div>

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted">
                Posted {formatRelativeTime(post.createdAt)} · Updated{" "}
                {formatRelativeTime(post.updatedAt)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center gap-3">
                <Avatar
                  initials={post.poster.avatarInitials}
                  verified={post.poster.isVerifiedStudent}
                />
                <div>
                  <p className="font-semibold">{post.poster.name}</p>
                  <p className="text-xs text-muted">Verified student poster</p>
                </div>
              </div>

              {isOwner ? (
                <div className="space-y-2">
                  <Link href={`/housing/${post.id}/edit`}>
                    <Button variant="secondary" className="w-full">
                      <Pencil className="h-4 w-4" />
                      Edit post
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full" onClick={() => void handleMarkInactive()}>
                    Mark inactive
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete post
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <MessageHousingPosterButton
                    housingPostId={post.id}
                    posterId={post.userId}
                    housingTitle={post.title}
                    className="w-full"
                  />
                  <p className="text-xs text-muted">
                    Ask about availability, lease dates, roommates, or tour details.
                  </p>
                  <p className="text-xs text-muted">
                    Keep payments and tours safe. Meet in public places first.
                  </p>
                  <ReportDialog
                    targetType="housing_post"
                    targetId={post.id}
                    buttonLabel="Report housing post"
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
        title="Delete housing post?"
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
