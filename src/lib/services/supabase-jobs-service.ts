import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRow } from "./supabase-marketplace-types";
import {
  filterCampusJobs,
  mapCampusJobRow,
  type CampusJobFilters,
  type CampusJobPoster,
  type CampusJobRecord,
  type CampusJobRow,
  type CreateCampusJobInput,
  type UpdateCampusJobInput,
} from "./jobs-types";

function mapSupabaseError(error: { message?: string } | null): string {
  const message = error?.message?.trim();
  if (!message) return "Something went wrong. Please try again.";
  if (message.toLowerCase().includes("row-level security")) {
    return "You do not have permission to perform this action.";
  }
  return "Something went wrong. Please try again.";
}

function mapProfileToPoster(profile: ProfileRow | null | undefined, userId: string): CampusJobPoster {
  return {
    id: userId,
    name: profile?.full_name?.trim() || "Verified student",
    avatarInitials: profile?.avatar_initials?.trim() || "VS",
    isVerifiedStudent: profile?.is_verified_student ?? true,
  };
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

async function mapRowsToJobs(rows: CampusJobRow[]): Promise<CampusJobRecord[]> {
  const profiles = await fetchProfilesByIds(rows.map((row) => row.posted_by));
  return rows.map((row) =>
    mapCampusJobRow(row, mapProfileToPoster(profiles.get(row.posted_by), row.posted_by))
  );
}

export async function getCampusJobs(filters: CampusJobFilters = {}): Promise<{
  jobs: CampusJobRecord[];
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) return { jobs: [], error: "Supabase is not configured." };

  const { data, error } = await client
    .from("campus_jobs")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) return { jobs: [], error: mapSupabaseError(error) };

  const jobs = await mapRowsToJobs((data ?? []) as CampusJobRow[]);
  return { jobs: filterCampusJobs(jobs, filters) };
}

export async function getCampusJobById(
  id: string,
  userId?: string | null
): Promise<{ job: CampusJobRecord | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { job: null, error: "Supabase is not configured." };

  const { data, error } = await client
    .from("campus_jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return { job: null, error: mapSupabaseError(error) };
  if (!data) return { job: null };

  const row = data as CampusJobRow;
  if (row.status !== "active" && row.posted_by !== userId) {
    return { job: null };
  }

  const profiles = await fetchProfilesByIds([row.posted_by]);
  return {
    job: mapCampusJobRow(row, mapProfileToPoster(profiles.get(row.posted_by), row.posted_by)),
  };
}

export async function getMyCampusJobs(userId: string): Promise<{
  jobs: CampusJobRecord[];
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) return { jobs: [], error: "Supabase is not configured." };

  const { data, error } = await client
    .from("campus_jobs")
    .select("*")
    .eq("posted_by", userId)
    .order("created_at", { ascending: false });

  if (error) return { jobs: [], error: mapSupabaseError(error) };
  return { jobs: await mapRowsToJobs((data ?? []) as CampusJobRow[]) };
}

export async function createCampusJob(
  input: CreateCampusJobInput
): Promise<{ job: CampusJobRecord | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { job: null, error: "Supabase is not configured." };

  const { data, error } = await client
    .from("campus_jobs")
    .insert({
      posted_by: input.postedBy,
      title: input.title.trim(),
      organization: input.organization.trim(),
      description: input.description.trim(),
      pay: input.pay?.trim() || "",
      location: input.location.trim(),
      time_commitment: input.timeCommitment?.trim() || "",
      job_type: input.jobType,
      is_remote: input.isRemote ?? false,
      requirements: input.requirements?.trim() || "",
      application_url: input.applicationUrl?.trim() || null,
      application_instructions: input.applicationInstructions?.trim() || "",
      tags: input.tags ?? [],
      status: input.status ?? "active",
    })
    .select("*")
    .single();

  if (error || !data) return { job: null, error: mapSupabaseError(error) };

  const row = data as CampusJobRow;
  const profiles = await fetchProfilesByIds([row.posted_by]);
  return {
    job: mapCampusJobRow(row, mapProfileToPoster(profiles.get(row.posted_by), row.posted_by)),
  };
}

export async function updateCampusJob(
  id: string,
  userId: string,
  input: UpdateCampusJobInput
): Promise<{ job: CampusJobRecord | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { job: null, error: "Supabase is not configured." };

  const patch: Record<string, unknown> = {};
  if (input.title != null) patch.title = input.title.trim();
  if (input.organization != null) patch.organization = input.organization.trim();
  if (input.description != null) patch.description = input.description.trim();
  if (input.pay != null) patch.pay = input.pay.trim();
  if (input.location != null) patch.location = input.location.trim();
  if (input.timeCommitment != null) patch.time_commitment = input.timeCommitment.trim();
  if (input.jobType != null) patch.job_type = input.jobType;
  if (input.isRemote != null) patch.is_remote = input.isRemote;
  if (input.requirements != null) patch.requirements = input.requirements.trim();
  if (input.applicationUrl !== undefined) patch.application_url = input.applicationUrl?.trim() || null;
  if (input.applicationInstructions != null) {
    patch.application_instructions = input.applicationInstructions.trim();
  }
  if (input.tags != null) patch.tags = input.tags;
  if (input.status != null) patch.status = input.status;

  const { data, error } = await client
    .from("campus_jobs")
    .update(patch)
    .eq("id", id)
    .eq("posted_by", userId)
    .select("*")
    .maybeSingle();

  if (error) return { job: null, error: mapSupabaseError(error) };
  if (!data) return { job: null, error: "Job not found or you do not have permission." };

  const row = data as CampusJobRow;
  const profiles = await fetchProfilesByIds([row.posted_by]);
  return {
    job: mapCampusJobRow(row, mapProfileToPoster(profiles.get(row.posted_by), row.posted_by)),
  };
}

export async function markCampusJobClosed(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const { error } = await client
    .from("campus_jobs")
    .update({ status: "closed" })
    .eq("id", id)
    .eq("posted_by", userId);

  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}

export async function deleteCampusJob(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const { error } = await client.from("campus_jobs").delete().eq("id", id).eq("posted_by", userId);
  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}

export async function hideCampusJobForModeration(
  jobId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const { error } = await client
    .from("campus_jobs")
    .update({ status: "removed" })
    .eq("id", jobId);

  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}
