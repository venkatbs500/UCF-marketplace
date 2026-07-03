export type ReportTargetType = "listing" | "message" | "user" | "conversation";
export type ReportReason =
  | "spam"
  | "scam"
  | "harassment"
  | "inappropriate"
  | "unsafe"
  | "other";
export type ReportStatus = "open" | "reviewed" | "resolved" | "dismissed";

export type ReportRow = {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  resolution_note: string | null;
};

export type ReportItem = {
  id: string;
  reporterId: string;
  reporterName?: string;
  reporterEmail?: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details: string;
  status: ReportStatus;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  resolutionNote: string | null;
};

export type CreateReportInput = {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
};

export type UpdateReportStatusInput = {
  reportId: string;
  status: ReportStatus;
  resolutionNote?: string;
};

export function mapReportRowToItem(row: ReportRow): ReportItem {
  return {
    id: row.id,
    reporterId: row.reporter_id,
    targetType: row.target_type,
    targetId: row.target_id,
    reason: row.reason,
    details: row.details ?? "",
    status: row.status,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    resolutionNote: row.resolution_note,
  };
}
