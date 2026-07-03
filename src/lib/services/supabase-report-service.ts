import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRow } from "./supabase-marketplace-types";
import type {
  CreateReportInput,
  ReportItem,
  ReportRow,
  UpdateReportStatusInput,
} from "./report-types";
import { mapReportRowToItem } from "./report-types";

const MAX_DETAILS_LENGTH = 1000;

function mapSupabaseError(error: { message?: string } | null): string {
  const message = error?.message?.trim();
  if (!message) return "Something went wrong. Please try again.";
  if (message.toLowerCase().includes("row-level security")) {
    return "You do not have permission to perform this action.";
  }
  return "Something went wrong. Please try again.";
}

async function fetchProfilesByIds(ids: string[]): Promise<Map<string, ProfileRow>> {
  const client = getSupabaseBrowserClient();
  const map = new Map<string, ProfileRow>();
  if (!client || ids.length === 0) return map;
  const { data } = await client.from("profiles").select("*").in("id", [...new Set(ids)]);
  for (const row of (data ?? []) as ProfileRow[]) {
    map.set(row.id, row);
  }
  return map;
}

function withReporterDetails(
  reports: ReportItem[],
  profiles: Map<string, ProfileRow>
): ReportItem[] {
  return reports.map((report) => {
    const profile = profiles.get(report.reporterId);
    return {
      ...report,
      reporterEmail: profile?.email ?? undefined,
      reporterName: profile?.full_name?.trim() || "Verified student",
    };
  });
}

export async function createReport(input: CreateReportInput): Promise<{
  success: boolean;
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const reason = input.reason.trim();
  const details = (input.details ?? "").trim();
  if (!reason) return { success: false, error: "Please select a reason." };
  if (details.length > MAX_DETAILS_LENGTH) {
    return { success: false, error: "Details must be 1000 characters or fewer." };
  }

  const { error } = await client.from("reports").insert({
    reporter_id: input.reporterId,
    target_type: input.targetType,
    target_id: input.targetId,
    reason,
    details: details || null,
    status: "open",
  });

  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}

export async function getMyReports(userId: string): Promise<{
  reports: ReportItem[];
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) return { reports: [], error: "Supabase is not configured." };

  const { data, error } = await client
    .from("reports")
    .select("*")
    .eq("reporter_id", userId)
    .order("created_at", { ascending: false });
  if (error) return { reports: [], error: mapSupabaseError(error) };
  return { reports: ((data ?? []) as ReportRow[]).map(mapReportRowToItem) };
}

export async function getAdminReports(): Promise<{
  reports: ReportItem[];
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) return { reports: [], error: "Supabase is not configured." };

  const { data, error } = await client
    .from("reports")
    .select("*")
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { reports: [], error: mapSupabaseError(error) };

  const reports = ((data ?? []) as ReportRow[]).map(mapReportRowToItem);
  const profiles = await fetchProfilesByIds(reports.map((report) => report.reporterId));
  return { reports: withReporterDetails(reports, profiles) };
}

export async function updateReportStatus(
  input: UpdateReportStatusInput
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const note = input.resolutionNote?.trim();
  if (note && note.length > MAX_DETAILS_LENGTH) {
    return { success: false, error: "Resolution note must be 1000 characters or fewer." };
  }

  const { error } = await client
    .from("reports")
    .update({
      status: input.status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: null,
      resolution_note: note || null,
    })
    .eq("id", input.reportId);

  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}

export async function hideListingForModeration(
  listingId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };
  const { error } = await client.from("listings").update({ status: "removed" }).eq("id", listingId);
  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}

export async function hideMessageForModeration(
  messageId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };
  const { error } = await client
    .from("messages")
    .update({
      is_hidden: true,
      hidden_at: new Date().toISOString(),
      hidden_by: null,
    })
    .eq("id", messageId);
  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}

export const supabaseReportService = {
  createReport,
  getMyReports,
  getAdminReports,
  updateReportStatus,
  hideListingForModeration,
  hideMessageForModeration,
};
