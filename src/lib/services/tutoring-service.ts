import type { Tutor } from "@/lib/types";
import { tutors } from "@/lib/mock-data";
import { usesSupabaseTutoring } from "@/lib/tutoring-mode";
import type {
  CreateTutorProfileInput,
  TutorProfileFilters,
  TutorProfileItem,
  TutorOwner,
  UpdateTutorProfileInput,
} from "./tutoring-types";
import { mapTutorProfileRow } from "./tutoring-types";
import {
  createTutorProfile as createSupabaseTutorProfile,
  deleteTutorProfile as deleteSupabaseTutorProfile,
  getMyTutorProfile as getSupabaseMyTutorProfile,
  getTutorProfileById as getSupabaseTutorProfileById,
  getTutorProfiles as getSupabaseTutorProfiles,
  hideTutorProfileForModeration,
  markTutorProfileInactive as markSupabaseTutorProfileInactive,
  updateTutorProfile as updateSupabaseTutorProfile,
} from "./supabase-tutoring-service";

export { usesSupabaseTutoring, hideTutorProfileForModeration };

function stableMockTutorTimestamp(tutorId: string): string {
  const index = tutors.findIndex((entry) => entry.id === tutorId);
  const dayOffset = index >= 0 ? index : 0;
  return new Date(Date.UTC(2025, 0, 1 + dayOffset)).toISOString();
}

function mapMockTutorToItem(tutor: Tutor): TutorProfileItem {
  const owner: TutorOwner = {
    id: tutor.user.id,
    name: tutor.user.name,
    avatarInitials: tutor.user.avatar,
    isVerifiedStudent: tutor.user.verified,
    major: tutor.user.major,
    year: tutor.user.year,
  };
  const createdAt = stableMockTutorTimestamp(tutor.id);

  return mapTutorProfileRow(
    {
      id: tutor.id,
      user_id: tutor.user.id,
      display_name: tutor.user.name,
      subjects: tutor.subjects,
      bio: tutor.bio,
      hourly_rate: tutor.hourlyRate,
      availability: tutor.availability,
      tutoring_format: "both",
      experience: "",
      meeting_preference: "",
      rating: tutor.rating,
      review_count: tutor.reviewCount,
      status: "active",
      created_at: createdAt,
      updated_at: createdAt,
    },
    owner
  );
}

export function mapMockTutorProfileToItem(tutor: Tutor): TutorProfileItem {
  return mapMockTutorToItem(tutor);
}

export async function getTutorProfiles(filters: TutorProfileFilters = {}): Promise<{
  profiles: TutorProfileItem[];
  error?: string;
}> {
  if (!usesSupabaseTutoring()) return { profiles: [] };
  return getSupabaseTutorProfiles(filters);
}

export async function getTutorProfileById(
  id: string,
  userId?: string | null
): Promise<{ profile: TutorProfileItem | null; error?: string }> {
  if (!usesSupabaseTutoring()) {
    const mock = tutors.find((tutor) => tutor.id === id);
    if (!mock) return { profile: null };
    return { profile: mapMockTutorToItem(mock) };
  }
  return getSupabaseTutorProfileById(id, userId);
}

export async function getMyTutorProfile(userId: string): Promise<{
  profile: TutorProfileItem | null;
  error?: string;
}> {
  if (!usesSupabaseTutoring()) return { profile: null };
  return getSupabaseMyTutorProfile(userId);
}

export async function createTutorProfile(
  input: CreateTutorProfileInput
): Promise<{ profile: TutorProfileItem | null; error?: string }> {
  if (!usesSupabaseTutoring()) {
    return { profile: null, error: "Tutor profiles are available in Supabase real mode." };
  }
  return createSupabaseTutorProfile(input);
}

export async function updateTutorProfile(
  id: string,
  userId: string,
  input: UpdateTutorProfileInput
): Promise<{ profile: TutorProfileItem | null; error?: string }> {
  if (!usesSupabaseTutoring()) {
    return { profile: null, error: "Tutor profiles are available in Supabase real mode." };
  }
  return updateSupabaseTutorProfile(id, userId, input);
}

export async function deleteTutorProfile(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!usesSupabaseTutoring()) {
    return { success: false, error: "Supabase tutoring is not enabled." };
  }
  return deleteSupabaseTutorProfile(id, userId);
}

export async function markTutorProfileInactive(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!usesSupabaseTutoring()) {
    return { success: false, error: "Supabase tutoring is not enabled." };
  }
  return markSupabaseTutorProfileInactive(id, userId);
}
