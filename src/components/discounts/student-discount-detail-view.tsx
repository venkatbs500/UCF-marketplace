"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ExternalLink,
  Globe,
  MapPin,
  Pencil,
  Shield,
  Tag,
  Trash2,
} from "lucide-react";
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
import { MessageDiscountPosterButton } from "@/components/discounts/message-discount-poster-button";
import { useAuth } from "@/components/providers/auth-provider";
import {
  deleteStudentDiscount,
  getStudentDiscountById,
  markStudentDiscountExpired,
} from "@/lib/services/discounts-service";
import {
  STUDENT_DISCOUNT_TYPE_LABELS,
  type StudentDiscountRecord,
} from "@/lib/services/discounts-types";
import { formatDate, formatRelativeTime } from "@/lib/utils";

export function StudentDiscountDetailView({ discountId }: { discountId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [discount, setDiscount] = useState<StudentDiscountRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getStudentDiscountById(discountId, user?.id).then((result) => {
      if (cancelled) return;
      setDiscount(result.discount);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [discountId, user?.id]);

  const isOwner = Boolean(user?.id && discount?.postedBy === user.id);

  const handleMarkExpired = async () => {
    if (!user?.id || !discount) return;
    const result = await markStudentDiscountExpired(discount.id, user.id);
    if (!result.success) {
      setActionError(result.error ?? "We could not update this discount.");
      return;
    }
    router.push("/discounts");
  };

  const handleDelete = async () => {
    if (!user?.id || !discount) return;
    const result = await deleteStudentDiscount(discount.id, user.id);
    if (!result.success) {
      setActionError(result.error ?? "We could not delete this discount.");
      return;
    }
    router.push("/discounts");
  };

  if (loading) {
    return (
      <AppShell>
        <LoadingSpinner className="min-h-[40vh]" label="Loading discount..." />
      </AppShell>
    );
  }

  if (!discount) {
    return (
      <AppShell>
        <EmptyState
          icon={Tag}
          title="Discount not found"
          description={
            error ?? "This discount may have been removed or is no longer available."
          }
          action={
            <Link href="/discounts">
              <Button>Back to discounts</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  const locationLabel = discount.isOnline
    ? discount.location.trim()
      ? `Online · ${discount.location}`
      : "Online"
    : discount.location || "Near campus";

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading title={discount.title} subtitle={discount.businessName} />
        <Link href="/discounts">
          <Button variant="secondary" size="sm">
            Back to discounts
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card data-testid="discount-detail">
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {STUDENT_DISCOUNT_TYPE_LABELS[discount.discountType]}
                </Badge>
                {discount.isOnline && (
                  <Badge variant="outline">
                    <Globe className="mr-1 h-3 w-3" />
                    Online
                  </Badge>
                )}
                {discount.status !== "active" && (
                  <Badge variant="outline" className="capitalize">
                    {discount.status}
                  </Badge>
                )}
                {isOwner && (
                  <Badge variant="outline" data-testid="discount-owner-badge">
                    Your discount
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-2xl font-bold text-gold">
                <Tag className="h-6 w-6" />
                {discount.discountValue}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {locationLabel}
                </span>
                {discount.expiresAt && (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Expires {formatDate(discount.expiresAt.split("T")[0])}
                  </span>
                )}
              </div>

              {discount.promoCode && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-muted">Promo code</p>
                  <code className="text-lg font-mono text-gold">{discount.promoCode}</code>
                </div>
              )}

              <p className="whitespace-pre-wrap text-sm leading-relaxed">{discount.description}</p>

              {discount.redemptionInstructions && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-1 text-sm font-medium">How to redeem</p>
                  <p className="whitespace-pre-wrap text-sm text-muted">
                    {discount.redemptionInstructions}
                  </p>
                </div>
              )}

              {discount.redemptionUrl && (
                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <a
                    href={discount.redemptionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-gold hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open redemption page
                  </a>
                  <p className="text-xs text-muted">
                    Knight Market cannot verify external discount pages yet.
                  </p>
                  <p className="text-xs text-muted">
                    Never enter payment information unless you trust the site.
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <div className="space-y-1 text-sm text-muted">
                    <p className="font-medium text-foreground">Discount safety</p>
                    <p>Verify deals before paying.</p>
                    <p>Be careful with off-platform links.</p>
                    <p>Report suspicious discounts.</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted">
                Posted {formatRelativeTime(discount.createdAt)} · Updated{" "}
                {formatRelativeTime(discount.updatedAt)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center gap-3">
                <Avatar
                  initials={discount.poster.avatarInitials}
                  verified={discount.poster.isVerifiedStudent}
                />
                <div>
                  <p className="font-semibold">{discount.poster.name}</p>
                  <p className="text-xs text-muted">Verified student poster</p>
                </div>
              </div>

              {isOwner ? (
                <div className="space-y-2">
                  <Link href={`/discounts/${discount.id}/edit`}>
                    <Button variant="secondary" className="w-full">
                      <Pencil className="h-4 w-4" />
                      Edit discount
                    </Button>
                  </Link>
                  {discount.status === "active" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => void handleMarkExpired()}
                    >
                      Mark expired
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete discount
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <MessageDiscountPosterButton
                    discountId={discount.id}
                    posterId={discount.postedBy}
                    discountTitle={discount.title}
                    className="w-full"
                  />
                  <p className="text-xs text-muted">
                    Ask about eligibility, expiry, or how to redeem. No private email is shown
                    here.
                  </p>
                  {user?.id && (
                    <ReportDialog
                      targetType="student_discount"
                      targetId={discount.id}
                      buttonLabel="Report discount"
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
        title="Delete discount?"
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
