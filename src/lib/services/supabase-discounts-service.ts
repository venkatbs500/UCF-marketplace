import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRow } from "./supabase-marketplace-types";
import {
  filterStudentDiscounts,
  mapStudentDiscountRow,
  type CreateStudentDiscountInput,
  type StudentDiscountFilters,
  type StudentDiscountPoster,
  type StudentDiscountRecord,
  type StudentDiscountRow,
  type UpdateStudentDiscountInput,
} from "./discounts-types";

function mapSupabaseError(error: { message?: string } | null): string {
  const message = error?.message?.trim();
  if (!message) return "Something went wrong. Please try again.";
  if (message.toLowerCase().includes("row-level security")) {
    return "You do not have permission to perform this action.";
  }
  return "Something went wrong. Please try again.";
}

function mapProfileToPoster(
  profile: ProfileRow | null | undefined,
  userId: string
): StudentDiscountPoster {
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

async function mapRowsToDiscounts(rows: StudentDiscountRow[]): Promise<StudentDiscountRecord[]> {
  const profiles = await fetchProfilesByIds(rows.map((row) => row.posted_by));
  return rows.map((row) =>
    mapStudentDiscountRow(
      row,
      mapProfileToPoster(profiles.get(row.posted_by), row.posted_by)
    )
  );
}

function nowIso(): string {
  return new Date().toISOString();
}

export async function getStudentDiscounts(
  filters: StudentDiscountFilters = {}
): Promise<{ discounts: StudentDiscountRecord[]; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { discounts: [], error: "Supabase is not configured." };

  const { data, error } = await client
    .from("student_discounts")
    .select("*")
    .eq("status", "active")
    .or(`expires_at.is.null,expires_at.gte.${nowIso()}`)
    .order("created_at", { ascending: false });

  if (error) return { discounts: [], error: mapSupabaseError(error) };

  const discounts = await mapRowsToDiscounts((data ?? []) as StudentDiscountRow[]);
  return { discounts: filterStudentDiscounts(discounts, filters) };
}

export async function getStudentDiscountById(
  id: string,
  userId?: string | null
): Promise<{ discount: StudentDiscountRecord | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { discount: null, error: "Supabase is not configured." };

  const { data, error } = await client
    .from("student_discounts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return { discount: null, error: mapSupabaseError(error) };
  if (!data) return { discount: null };

  const row = data as StudentDiscountRow;
  if (row.status !== "active" && row.posted_by !== userId) {
    return { discount: null };
  }

  const profiles = await fetchProfilesByIds([row.posted_by]);
  return {
    discount: mapStudentDiscountRow(
      row,
      mapProfileToPoster(profiles.get(row.posted_by), row.posted_by)
    ),
  };
}

export async function getMyStudentDiscounts(userId: string): Promise<{
  discounts: StudentDiscountRecord[];
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) return { discounts: [], error: "Supabase is not configured." };

  const { data, error } = await client
    .from("student_discounts")
    .select("*")
    .eq("posted_by", userId)
    .order("created_at", { ascending: false });

  if (error) return { discounts: [], error: mapSupabaseError(error) };
  return { discounts: await mapRowsToDiscounts((data ?? []) as StudentDiscountRow[]) };
}

export async function createStudentDiscount(
  input: CreateStudentDiscountInput
): Promise<{ discount: StudentDiscountRecord | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { discount: null, error: "Supabase is not configured." };

  const discountValue = input.discountValue.trim();
  const { data, error } = await client
    .from("student_discounts")
    .insert({
      posted_by: input.postedBy,
      title: input.title.trim(),
      business_name: input.businessName.trim(),
      description: input.description.trim(),
      discount_text: discountValue,
      discount_value: discountValue,
      discount_type: input.discountType,
      category: input.discountType,
      promo_code: input.promoCode?.trim() || null,
      redemption_url: input.redemptionUrl?.trim() || null,
      location: input.location.trim(),
      is_online: input.isOnline ?? false,
      expires_at: input.expiresAt || null,
      redemption_instructions: input.redemptionInstructions?.trim() || "",
      status: input.status ?? "active",
    })
    .select("*")
    .single();

  if (error || !data) return { discount: null, error: mapSupabaseError(error) };

  const row = data as StudentDiscountRow;
  const profiles = await fetchProfilesByIds([row.posted_by]);
  return {
    discount: mapStudentDiscountRow(
      row,
      mapProfileToPoster(profiles.get(row.posted_by), row.posted_by)
    ),
  };
}

export async function updateStudentDiscount(
  id: string,
  userId: string,
  input: UpdateStudentDiscountInput
): Promise<{ discount: StudentDiscountRecord | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { discount: null, error: "Supabase is not configured." };

  const patch: Record<string, unknown> = {};
  if (input.title != null) patch.title = input.title.trim();
  if (input.businessName != null) patch.business_name = input.businessName.trim();
  if (input.description != null) patch.description = input.description.trim();
  if (input.discountType != null) {
    patch.discount_type = input.discountType;
    patch.category = input.discountType;
  }
  if (input.discountValue != null) {
    const value = input.discountValue.trim();
    patch.discount_value = value;
    patch.discount_text = value;
  }
  if (input.promoCode !== undefined) patch.promo_code = input.promoCode?.trim() || null;
  if (input.redemptionUrl !== undefined) {
    patch.redemption_url = input.redemptionUrl?.trim() || null;
  }
  if (input.location != null) patch.location = input.location.trim();
  if (input.isOnline != null) patch.is_online = input.isOnline;
  if (input.expiresAt !== undefined) patch.expires_at = input.expiresAt || null;
  if (input.redemptionInstructions != null) {
    patch.redemption_instructions = input.redemptionInstructions.trim();
  }
  if (input.status != null) patch.status = input.status;

  const { data, error } = await client
    .from("student_discounts")
    .update(patch)
    .eq("id", id)
    .eq("posted_by", userId)
    .select("*")
    .maybeSingle();

  if (error) return { discount: null, error: mapSupabaseError(error) };
  if (!data) {
    return { discount: null, error: "Discount not found or you do not have permission." };
  }

  const row = data as StudentDiscountRow;
  const profiles = await fetchProfilesByIds([row.posted_by]);
  return {
    discount: mapStudentDiscountRow(
      row,
      mapProfileToPoster(profiles.get(row.posted_by), row.posted_by)
    ),
  };
}

export async function markStudentDiscountExpired(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const { error } = await client
    .from("student_discounts")
    .update({ status: "expired" })
    .eq("id", id)
    .eq("posted_by", userId);

  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}

export async function deleteStudentDiscount(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const { error } = await client
    .from("student_discounts")
    .delete()
    .eq("id", id)
    .eq("posted_by", userId);

  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}

export async function hideStudentDiscountForModeration(
  discountId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const { error } = await client
    .from("student_discounts")
    .update({ status: "removed" })
    .eq("id", discountId);

  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}
