import { AUTH_MODE } from "@/lib/supabase/config";
import { isRealDataMode } from "@/lib/product-mode";
import type {
  CreateReportInput,
  ReportItem,
  ReportStatus,
  UpdateReportStatusInput,
} from "./report-types";
import { supabaseReportService } from "./supabase-report-service";

export type ReportService = {
  createReport: (input: CreateReportInput) => Promise<{ success: boolean; error?: string }>;
  getMyReports: (userId: string) => Promise<{ reports: ReportItem[]; error?: string }>;
  getAdminReports: () => Promise<{ reports: ReportItem[]; error?: string }>;
  updateReportStatus: (
    input: UpdateReportStatusInput
  ) => Promise<{ success: boolean; error?: string }>;
  hideListingForModeration: (
    listingId: string
  ) => Promise<{ success: boolean; error?: string }>;
  hideMessageForModeration: (
    messageId: string
  ) => Promise<{ success: boolean; error?: string }>;
  hideHousingPostForModeration: (
    housingPostId: string
  ) => Promise<{ success: boolean; error?: string }>;
  hideTutorProfileForModeration: (
    tutorProfileId: string
  ) => Promise<{ success: boolean; error?: string }>;
  hideLostFoundItemForModeration: (
    itemId: string
  ) => Promise<{ success: boolean; error?: string }>;
  hideCampusJobForModeration: (
    jobId: string
  ) => Promise<{ success: boolean; error?: string }>;
};

function isSupabaseModerationMode(): boolean {
  return AUTH_MODE === "supabase" && isRealDataMode();
}

const mockReportService: ReportService = {
  async createReport() {
    return { success: true };
  },
  async getMyReports() {
    return { reports: [] };
  },
  async getAdminReports() {
    return { reports: [] };
  },
  async updateReportStatus() {
    return { success: true };
  },
  async hideListingForModeration() {
    return { success: true };
  },
  async hideMessageForModeration() {
    return { success: true };
  },
  async hideHousingPostForModeration() {
    return { success: true };
  },
  async hideTutorProfileForModeration() {
    return { success: true };
  },
  async hideLostFoundItemForModeration() {
    return { success: true };
  },
  async hideCampusJobForModeration() {
    return { success: true };
  },
};

export function getActiveReportService(): ReportService {
  return isSupabaseModerationMode() ? supabaseReportService : mockReportService;
}

export function isModerationRealtimeMode(): boolean {
  return isSupabaseModerationMode();
}

export const REPORT_STATUS_OPTIONS: ReportStatus[] = [
  "open",
  "reviewed",
  "resolved",
  "dismissed",
];
