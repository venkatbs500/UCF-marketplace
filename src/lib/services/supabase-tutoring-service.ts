import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRow } from "./supabase-marketplace-types";
import {
  filterTutorProfiles,
  mapTutorProfileRow,
  type CreateTutorProfileInput,
  type TutorOwner,
  type TutorProfileFilters,
  type TutorProfileItem,
  type TutorProfileRow,
  type UpdateTutorProfileInput,
} from "./tutoring-types";

function mapSupabaseError(error: { message?: string } | null): string {
  const message = error?.message?.trim();
  if (!message) return "Something went wrong. Please try again.";
  if (message.toLowerCase().includes("row-level security")) {
    return "You do not have permission to perform this action.";
  }
  if (message.toLowerCase().includes("duplicate key")) {
    return "You already have a tutor profile.";
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

function mapProfileToTutorOwner(
  profile: ProfileRow | null | undefined,
  userId: string
): TutorOwner {
  return {
    id: userId,
    name: profile?.full_name?.trim() || "Verified student",
    avatarInitials: profile?.avatar_initials?.trim() || "VS",
    isVerifiedStudent: profile?.is_verified_student ?? true,
    major: profile?.major ?? null,
    year: profile?.year ?? null,
  };
}

async function mapRowsToProfiles(rows: TutorProfileRow[]): Promise<TutorProfileItem[]> {
  const profiles = await fetchProfilesByIds(rows.map((row) => row.user_id));
  return rows.map((row) =>
    mapTutorProfileRow(row, mapProfileToTutorOwner(profiles.get(row.user_id), row.user_id))
  );
}

export async function getTutorProfiles(filters: TutorProfileFilters = {}): Promise<{
  profiles: TutorProfileItem[];
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) return { profiles: [], error: "Supabase is not configured." };

  const { data, error } = await client
    .from("tutoring_profiles")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) return { profiles: [], error: mapSupabaseError(error) };

  const profiles = await mapRowsToProfiles((data ?? []) as TutorProfileRow[]);
  return { profiles: filterTutorProfiles(profiles, filters) };
}

export async function getTutorProfileById(
  id: string,
  userId?: string | null
): Promise<{ profile: TutorProfileItem | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { profile: null, error: "Supabase is not configured." };

  const { data, error } = await client
    .from("tutoring_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return { profile: null, error: mapSupabaseError(error) };
  if (!data) return { profile: null };

  const row = data as TutorProfileRow;
  if (row.status !== "active" && row.user_id !== userId) {
    return { profile: null };
  }

  const profiles = await fetchProfilesByIds([row.user_id]);
  return {
    profile: mapTutorProfileRow(
      row,
      mapProfileToTutorOwner(profiles.get(row.user_id), row.user_id)
    ),
  };
}

export async function getMyTutorProfile(userId: string): Promise<{
  profile: TutorProfileItem | null;
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) return { profile: null, error: "Supabase is not configured." };

  const { data, error } = await client
    .from("tutoring_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { profile: null, error: mapSupabaseError(error) };
  if (!data) return { profile: null };

  const row = data as TutorProfileRow;
  const profiles = await fetchProfilesByIds([userId]);
  return {
    profile: mapTutorProfileRow(
      row,
      mapProfileToTutorOwner(profiles.get(userId), userId)
    ),
  };
}

export async function createTutorProfile(
  input: CreateTutorProfileInput
): Promise<{ profile: TutorProfileItem | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { profile: null, error: "Supabase is not configured." };

  const existing = await getMyTutorProfile(input.userId);
  if (existing.profile) {
    return { profile: null, error: "You already have a tutor profile." };
  }

  const { data, error } = await client
    .from("tutoring_profiles")
    .insert({
      user_id: input.userId,
      display_name: input.displayName?.trim() || null,
      subjects: input.subjects,
      bio: input.bio.trim(),
      hourly_rate: input.hourlyRate,
      availability: input.availability,
      tutoring_format: input.tutoringFormat,
      experience: input.experience?.trim() ?? "",
      meeting_preference: input.meetingPreference?.trim() ?? "",
      status: input.status ?? "active",
    })
    .select("*")
    .single();

  if (error || !data) return { profile: null, error: mapSupabaseError(error) };

  const profiles = await fetchProfilesByIds([input.userId]);
  return {
    profile: mapTutorProfileRow(
      data as TutorProfileRow,
      mapProfileToTutorOwner(profiles.get(input.userId), input.userId)
    ),
  };
}

export async function updateTutorProfile(
  id: string,
  userId: string,
  input: UpdateTutorProfileInput
): Promise<{ profile: TutorProfileItem | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { profile: null, error: "Supabase is not configured." };

  const patch: Record<string, unknown> = {};
  if (input.displayName !== undefined) patch.display_name = input.displayName?.trim() || null;
  if (input.subjects !== undefined) patch.subjects = input.subjects;
  if (input.bio !== undefined) patch.bio = input.bio.trim();
  if (input.hourlyRate !== undefined) patch.hourly_rate = input.hourlyRate;
  if (input.availability !== undefined) patch.availability = input.availability;
  if (input.tutoringFormat !== undefined) patch.tutoring_format = input.tutoringFormat;
  if (input.experience !== undefined) patch.experience = input.experience.trim();
  if (input.meetingPreference !== undefined) {
    patch.meeting_preference = input.meetingPreference.trim();
  }
  if (input.status !== undefined) patch.status = input.status;

  const { data, error } = await client
    .from("tutoring_profiles")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) return { profile: null, error: mapSupabaseError(error) };
  if (!data) return { profile: null, error: "Tutor profile not found." };

  const profiles = await fetchProfilesByIds([userId]);
  return {
    profile: mapTutorProfileRow(
      data as TutorProfileRow,
      mapProfileToTutorOwner(profiles.get(userId), userId)
    ),
  };
}

export async function deleteTutorProfile(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const { error } = await client
    .from("tutoring_profiles")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}

export async function markTutorProfileInactive(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const { error } = await client
    .from("tutoring_profiles")
    .update({ status: "inactive" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}

export async function hideTutorProfileForModeration(
  tutorProfileId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const { error } = await client
    .from("tutoring_profiles")
    .update({ status: "removed" })
    .eq("id", tutorProfileId);

  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}
