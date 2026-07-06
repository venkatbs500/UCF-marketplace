"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Pencil, Search, Shield, Trash2 } from "lucide-react";
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
import { MessageLostFoundPosterButton } from "@/components/lost-found/message-lost-found-poster-button";
import { useAuth } from "@/components/providers/auth-provider";
import {
  deleteLostFoundItem,
  getLostFoundItemById,
  markLostFoundItemResolved,
} from "@/lib/services/lost-found-service";
import {
  LOST_FOUND_CATEGORY_LABELS,
  type LostFoundItemRecord,
} from "@/lib/services/lost-found-types";
import { formatDate, formatRelativeTime } from "@/lib/utils";

function isImageUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function LostFoundDetailView({ itemId }: { itemId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [item, setItem] = useState<LostFoundItemRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getLostFoundItemById(itemId, user?.id).then((result) => {
      if (cancelled) return;
      setItem(result.item);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [itemId, user?.id]);

  const isOwner = Boolean(user?.id && item?.userId === user.id);

  const handleMarkResolved = async () => {
    if (!user?.id || !item) return;
    const result = await markLostFoundItemResolved(item.id, user.id);
    if (!result.success) {
      setActionError(result.error ?? "We could not update this item.");
      return;
    }
    router.push("/lost-found");
  };

  const handleDelete = async () => {
    if (!user?.id || !item) return;
    const result = await deleteLostFoundItem(item.id, user.id);
    if (!result.success) {
      setActionError(result.error ?? "We could not delete this item.");
      return;
    }
    router.push("/lost-found");
  };

  if (loading) {
    return (
      <AppShell>
        <LoadingSpinner className="min-h-[40vh]" label="Loading item..." />
      </AppShell>
    );
  }

  if (!item) {
    return (
      <AppShell>
        <EmptyState
          icon={Search}
          title="Lost & found item not found"
          description={error ?? "This item may have been removed or is no longer available."}
          action={
            <Link href="/lost-found">
              <Button>Back to Lost & Found</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  const images = item.images.filter(isImageUrl);
  const isLost = item.itemType === "lost";

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading title={item.title} subtitle="Lost & Found on campus" />
        <Link href="/lost-found">
          <Button variant="secondary" size="sm">
            Back to Lost & Found
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
              <div className="flex h-48 items-center justify-center rounded-2xl border border-white/10 bg-white/5 sm:col-span-2">
                <span className="text-5xl opacity-30">{isLost ? "🔍" : "📦"}</span>
              </div>
            )}
          </div>

          <Card data-testid="lost-found-detail">
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={isLost ? "warning" : "success"}>
                  {isLost ? "Lost" : "Found"}
                </Badge>
                <Badge variant="outline">{LOST_FOUND_CATEGORY_LABELS[item.category]}</Badge>
                {item.status !== "active" && (
                  <Badge variant="secondary" className="capitalize">
                    {item.status}
                  </Badge>
                )}
                {isOwner && (
                  <Badge variant="outline" data-testid="lost-found-owner-badge">
                    Your post
                  </Badge>
                )}
              </div>

              <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {item.location || "Campus area"}
                </span>
                {item.itemDate && (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {isLost ? "Lost" : "Found"} on {formatDate(item.itemDate)}
                  </span>
                )}
              </div>

              <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <div className="space-y-1 text-sm text-muted">
                    <p className="font-medium text-foreground">Safe pickup guidance</p>
                    <p>Do not share full identifying details publicly.</p>
                    <p>Ask claimants to verify ownership before returning IDs or valuables.</p>
                    <p>Meet in public campus areas such as the Student Union or library lobby.</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted">
                Posted {formatRelativeTime(item.createdAt)} · Updated{" "}
                {formatRelativeTime(item.updatedAt)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center gap-3">
                <Avatar
                  initials={item.poster.avatarInitials}
                  verified={item.poster.isVerifiedStudent}
                />
                <div>
                  <p className="font-semibold">{item.poster.name}</p>
                  <p className="text-xs text-muted">Verified student poster</p>
                </div>
              </div>

              {isOwner ? (
                <div className="space-y-2">
                  <Link href={`/lost-found/${item.id}/edit`}>
                    <Button variant="secondary" className="w-full">
                      <Pencil className="h-4 w-4" />
                      Edit item
                    </Button>
                  </Link>
                  {item.status === "active" && (
                    <Button variant="outline" className="w-full" onClick={() => void handleMarkResolved()}>
                      Mark resolved
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete item
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <MessageLostFoundPosterButton
                    itemId={item.id}
                    posterId={item.userId}
                    itemTitle={item.title}
                    className="w-full"
                  />
                  <p className="text-xs text-muted">
                    Message the poster to describe identifying details privately and arrange a safe
                    pickup.
                  </p>
                  {user?.id && (
                    <ReportDialog
                      targetType="lost_found_item"
                      targetId={item.id}
                      buttonLabel="Report item"
                      variant="outline"
                      className="w-full"
                    />
                  )}
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
        title="Delete lost & found item?"
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
