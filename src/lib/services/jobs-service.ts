import type { CampusJob } from "@/lib/types";
import { campusJobs } from "@/lib/mock-data";
import { usesSupabaseJobs } from "@/lib/jobs-mode";
import type {
  CampusJobFilters,
  CampusJobRecord,
  CreateCampusJobInput,
  UpdateCampusJobInput,
} from "./jobs-types";
import { mapCampusJobRow, mapMockJobTypeToCampusJobType } from "./jobs-types";
import {
  createCampusJob as createSupabaseCampusJob,
  deleteCampusJob as deleteSupabaseCampusJob,
  getCampusJobById as getSupabaseCampusJobById,
  getCampusJobs as getSupabaseCampusJobs,
  getMyCampusJobs as getSupabaseMyCampusJobs,
  markCampusJobClosed as markSupabaseCampusJobClosed,
  updateCampusJob as updateSupabaseCampusJob,
} from "./supabase-jobs-service";

export { usesSupabaseJobs };

export function mapMockCampusJobToRecord(job: CampusJob): CampusJobRecord {
  return mapCampusJobRow(
    {
      id: job.id,
      posted_by: job.postedBy.id,
      title: job.title,
      organization: job.company,
      description: job.description,
      pay: job.pay,
      location: job.location,
      time_commitment: job.timeCommitment,
      category: job.type,
      job_type: mapMockJobTypeToCampusJobType(job.type),
      is_remote: job.location.toLowerCase().includes("remote"),
      requirements: "",
      application_url: null,
      application_instructions: "",
      tags: job.tags,
      status: "active",
      created_at: job.postedAt,
      updated_at: job.postedAt,
    },
    {
      id: job.postedBy.id,
      name: job.postedBy.name,
      avatarInitials: job.postedBy.avatar,
      isVerifiedStudent: job.postedBy.verified,
    }
  );
}

export async function getCampusJobs(filters: CampusJobFilters = {}): Promise<{
  jobs: CampusJobRecord[];
  error?: string;
}> {
  if (!usesSupabaseJobs()) return { jobs: [] };
  return getSupabaseCampusJobs(filters);
}

export async function getCampusJobById(
  id: string,
  userId?: string | null
): Promise<{ job: CampusJobRecord | null; error?: string }> {
  if (!usesSupabaseJobs()) {
    const mock = campusJobs.find((job) => job.id === id);
    if (!mock) return { job: null };
    return { job: mapMockCampusJobToRecord(mock) };
  }
  return getSupabaseCampusJobById(id, userId);
}

export async function getMyCampusJobs(userId: string): Promise<{
  jobs: CampusJobRecord[];
  error?: string;
}> {
  if (!usesSupabaseJobs()) return { jobs: [] };
  return getSupabaseMyCampusJobs(userId);
}

export async function createCampusJob(
  input: CreateCampusJobInput
): Promise<{ job: CampusJobRecord | null; error?: string }> {
  if (!usesSupabaseJobs()) {
    return { job: null, error: "Campus jobs are available in Supabase real mode." };
  }
  return createSupabaseCampusJob(input);
}

export async function updateCampusJob(
  id: string,
  userId: string,
  input: UpdateCampusJobInput
): Promise<{ job: CampusJobRecord | null; error?: string }> {
  if (!usesSupabaseJobs()) {
    return { job: null, error: "Campus jobs are available in Supabase real mode." };
  }
  return updateSupabaseCampusJob(id, userId, input);
}

export async function markCampusJobClosed(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!usesSupabaseJobs()) {
    return { success: false, error: "Supabase jobs are not enabled." };
  }
  return markSupabaseCampusJobClosed(id, userId);
}

export async function deleteCampusJob(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!usesSupabaseJobs()) {
    return { success: false, error: "Supabase jobs are not enabled." };
  }
  return deleteSupabaseCampusJob(id, userId);
}
