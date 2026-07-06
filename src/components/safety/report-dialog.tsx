"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { AUTH_ROUTES } from "@/lib/auth";
import { getActiveReportService } from "@/lib/services/report-service";
import type { ReportReason, ReportTargetType } from "@/lib/services/report-types";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

const REPORT_REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: "spam", label: "Spam" },
  { value: "scam", label: "Scam / fraud" },
  { value: "harassment", label: "Harassment" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "unsafe", label: "Unsafe behavior" },
  { value: "other", label: "Other" },
];

function titleForTarget(targetType: ReportTargetType): string {
  if (targetType === "listing") return "Report listing";
  if (targetType === "message") return "Report message";
  if (targetType === "user") return "Report user";
  if (targetType === "housing_post") return "Report housing post";
  if (targetType === "tutor_profile") return "Report tutor profile";
  return "Report conversation";
}

interface ReportDialogProps extends ButtonVariantProps {
  targetType: ReportTargetType;
  targetId: string;
  className?: string;
  size?: ButtonVariantProps["size"];
  variant?: ButtonVariantProps["variant"];
  buttonLabel?: string;
  onSuccess?: () => void;
}

export function ReportDialog({
  targetType,
  targetId,
  className,
  size = "sm",
  variant = "ghost",
  buttonLabel = "Report",
  onSuccess,
}: ReportDialogProps) {
  const router = useRouter();
  const { user, isAuthenticated, hasCompletedOnboarding, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const title = useMemo(() => titleForTarget(targetType), [targetType]);

  const openWithAuthCheck = () => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push(AUTH_ROUTES.signIn);
      return;
    }
    if (!hasCompletedOnboarding) {
      router.push(AUTH_ROUTES.onboarding);
      return;
    }
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setError(null);
    setSuccess(false);
    setSubmitting(false);
    setReason("");
    setDetails("");
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    if (!reason) {
      setError("Please select a reason.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await getActiveReportService().createReport({
      reporterId: user.id,
      targetType,
      targetId,
      reason,
      details,
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "We could not submit your report. Please try again.");
      return;
    }

    setSuccess(true);
    onSuccess?.();
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn("gap-1.5", className)}
        onClick={openWithAuthCheck}
      >
        <Flag className="h-3.5 w-3.5" />
        {buttonLabel}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="presentation"
          onClick={closeDialog}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-dialog-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 glass-card p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="report-dialog-title" className="mb-2 text-lg font-semibold">
              {title}
            </h2>

            {success ? (
              <div className="space-y-4">
                <p className="text-sm text-muted">Thanks — your report was submitted.</p>
                <div className="flex justify-end">
                  <Button onClick={closeDialog}>Done</Button>
                </div>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-muted">
                  Share why this content should be reviewed by moderators.
                </p>
                <div className="mb-3">
                  <label htmlFor="report-reason" className="mb-1 block text-xs text-muted">
                    Reason
                  </label>
                  <select
                    id="report-reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value as ReportReason)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  >
                    <option value="">Select reason</option>
                    {REPORT_REASONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="report-details" className="mb-1 block text-xs text-muted">
                    Details (optional)
                  </label>
                  <textarea
                    id="report-details"
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    maxLength={1000}
                    rows={4}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    placeholder="Add any helpful context for moderators."
                  />
                </div>
                {error && (
                  <p role="alert" className="mb-3 text-xs text-red-400">
                    {error}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button onClick={() => void handleSubmit()} disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit report"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </>
  );
}
