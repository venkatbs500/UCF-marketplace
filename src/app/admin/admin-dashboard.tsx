"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { getActiveReportService } from "@/lib/services/report-service";
import type { ReportItem, ReportStatus } from "@/lib/services/report-types";
import { isModerationRealtimeMode, REPORT_STATUS_OPTIONS } from "@/lib/services/report-service";
import { formatRelativeTime } from "@/lib/utils";
import { Shield, Lock } from "lucide-react";
import type { getAdminDebugInfo } from "@/lib/admin";

export function AdminDashboard() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    destructive?: boolean;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => undefined,
  });

  const service = getActiveReportService();
  const supabaseMode = isModerationRealtimeMode();

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    const result = await service.getAdminReports();
    setReports(result.reports);
    setError(result.error ?? null);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    void service.getAdminReports().then((result) => {
      if (cancelled) return;
      setReports(result.reports);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [service]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return reports;
    return reports.filter((report) => report.status === statusFilter);
  }, [reports, statusFilter]);

  const askConfirm = (options: {
    title: string;
    description: string;
    onConfirm: () => void;
    destructive?: boolean;
  }) => {
    setConfirm({
      open: true,
      title: options.title,
      description: options.description,
      onConfirm: options.onConfirm,
      destructive: options.destructive,
    });
  };

  const runStatusUpdate = async (reportId: string, status: ReportStatus) => {
    const result = await service.updateReportStatus({ reportId, status });
    if (!result.success) {
      setError(result.error ?? "We could not update this report.");
      return;
    }
    await loadReports();
  };

  const runHideListing = async (report: ReportItem) => {
    const result = await service.hideListingForModeration(report.targetId);
    if (!result.success) {
      setError(result.error ?? "We could not hide this listing.");
      return;
    }
    await runStatusUpdate(report.id, "resolved");
  };

  const runHideMessage = async (report: ReportItem) => {
    const result = await service.hideMessageForModeration(report.targetId);
    if (!result.success) {
      setError(result.error ?? "We could not hide this message.");
      return;
    }
    await runStatusUpdate(report.id, "resolved");
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-gold" />
        <Badge variant={supabaseMode ? "success" : "warning"}>
          {supabaseMode ? "Supabase Moderation" : "Demo moderation preview"}
        </Badge>
        {!supabaseMode && <DemoModeBadge />}
      </div>

      <SectionHeading
        title="Moderation Dashboard"
        subtitle="Review reports and apply basic moderation actions"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "secondary"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          All
        </Button>
        {REPORT_STATUS_OPTIONS.map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "secondary"}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </Button>
        ))}
        <Button variant="outline" size="sm" onClick={() => void loadReports()}>
          Refresh
        </Button>
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted">
            Loading moderation reports...
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted">
            No reports for this filter.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((report) => (
            <Card key={report.id}>
              <CardContent className="space-y-3 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{report.targetType}</Badge>
                    <Badge variant="secondary">{report.reason}</Badge>
                    <Badge variant="warning">{report.status}</Badge>
                  </div>
                  <p className="text-xs text-muted">{formatRelativeTime(report.createdAt)}</p>
                </div>

                <p className="text-sm text-muted">
                  Target: <span className="font-mono">{report.targetId}</span>
                </p>
                {report.details && <p className="text-sm">{report.details}</p>}
                <p className="text-xs text-muted">
                  Reporter: {report.reporterName ?? "Verified student"}{" "}
                  {report.reporterEmail ? `(${report.reporterEmail})` : ""}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void askConfirm({
                        title: "Mark as reviewed?",
                        description: "This report will be marked as reviewed.",
                        onConfirm: () => void runStatusUpdate(report.id, "reviewed"),
                      })
                    }
                  >
                    Mark reviewed
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      void askConfirm({
                        title: "Resolve report?",
                        description: "This report will be marked as resolved.",
                        onConfirm: () => void runStatusUpdate(report.id, "resolved"),
                      })
                    }
                  >
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      void askConfirm({
                        title: "Dismiss report?",
                        description: "This report will be dismissed.",
                        onConfirm: () => void runStatusUpdate(report.id, "dismissed"),
                      })
                    }
                  >
                    Dismiss
                  </Button>
                  {report.targetType === "listing" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        void askConfirm({
                          title: "Hide listing?",
                          description:
                            "This will set listing status to removed and hide it from public marketplace views.",
                          onConfirm: () => void runHideListing(report),
                          destructive: true,
                        })
                      }
                    >
                      Hide listing
                    </Button>
                  )}
                  {report.targetType === "message" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        void askConfirm({
                          title: "Hide message?",
                          description: "This message body will be hidden from normal users.",
                          onConfirm: () => void runHideMessage(report),
                          destructive: true,
                        })
                      }
                    >
                      Hide message
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        description={confirm.description}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        destructive={confirm.destructive}
        onConfirm={() => {
          setConfirm((current) => ({ ...current, open: false }));
          confirm.onConfirm();
        }}
        onCancel={() => setConfirm((current) => ({ ...current, open: false }))}
      />
    </>
  );
}

type AdminDebugInfo = ReturnType<typeof getAdminDebugInfo>;

type AdminLockedStateProps = {
  debugInfo: AdminDebugInfo;
};

export function AdminLockedState({ debugInfo }: AdminLockedStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl glass-card p-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10">
        <Lock className="h-8 w-8 text-gold" />
      </div>
      <h2 className="mb-2 text-2xl font-bold">Admin Access Required</h2>
      <div className="mb-5 w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm">
        <p className="mb-2 text-muted">
          Signed-in email:{" "}
          <span className="font-mono text-foreground">{debugInfo.currentEmail ?? "none"}</span>
        </p>
        <p className="mb-1 text-muted">
          NEXT_PUBLIC_ADMIN_EMAILS configured:{" "}
          <span className="text-foreground">
            {debugInfo.hasConfiguredEnv ? "yes" : "no"}
          </span>
        </p>
        <p className="mb-1 text-muted">
          Normalized admin email count:{" "}
          <span className="text-foreground">{debugInfo.adminEmailCount}</span>
        </p>
        <p className="text-muted">
          Current email matched allowlist:{" "}
          <span className="text-foreground">
            {debugInfo.matchedAllowlist ? "yes" : "no"}
          </span>
        </p>
      </div>
      <p className="mb-6 max-w-md text-sm text-muted">
        Admin access is configured through Vercel NEXT_PUBLIC_ADMIN_EMAILS and Supabase
        public.admin_users.
      </p>
      <Badge variant="warning">Private beta moderation tools</Badge>
    </div>
  );
}
