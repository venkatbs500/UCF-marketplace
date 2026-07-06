import type { StudentDiscount } from "@/lib/types";
import { studentDiscounts, users } from "@/lib/mock-data";
import { usesSupabaseDiscounts } from "@/lib/discounts-mode";
import type {
  CreateStudentDiscountInput,
  StudentDiscountFilters,
  StudentDiscountRecord,
  UpdateStudentDiscountInput,
} from "./discounts-types";
import {
  mapMockDiscountCategoryToType,
  mapStudentDiscountRow,
} from "./discounts-types";
import {
  createStudentDiscount as createSupabaseStudentDiscount,
  deleteStudentDiscount as deleteSupabaseStudentDiscount,
  getMyStudentDiscounts as getSupabaseMyStudentDiscounts,
  getStudentDiscountById as getSupabaseStudentDiscountById,
  getStudentDiscounts as getSupabaseStudentDiscounts,
  markStudentDiscountExpired as markSupabaseStudentDiscountExpired,
  updateStudentDiscount as updateSupabaseStudentDiscount,
} from "./supabase-discounts-service";

export { usesSupabaseDiscounts };

export function mapMockStudentDiscountToRecord(
  discount: StudentDiscount,
  index = 0
): StudentDiscountRecord {
  const poster = users[(index + 2) % users.length] ?? users[0];
  const discountValue = discount.discount;
  return mapStudentDiscountRow(
    {
      id: discount.id,
      posted_by: poster.id,
      title: discount.businessName,
      business_name: discount.businessName,
      description: discount.description,
      discount_text: discountValue,
      discount_type: mapMockDiscountCategoryToType(discount.category),
      discount_value: discountValue,
      promo_code: discount.code ?? null,
      redemption_url: null,
      category: discount.category,
      location: discount.location,
      is_online: false,
      expires_at: discount.expiresAt ?? null,
      redemption_instructions: "",
      status: "active",
      created_at: discount.expiresAt ?? "2025-06-01",
      updated_at: discount.expiresAt ?? "2025-06-01",
    },
    {
      id: poster.id,
      name: poster.name,
      avatarInitials: poster.avatar,
      isVerifiedStudent: poster.verified,
    }
  );
}

export async function getStudentDiscounts(filters: StudentDiscountFilters = {}): Promise<{
  discounts: StudentDiscountRecord[];
  error?: string;
}> {
  if (!usesSupabaseDiscounts()) return { discounts: [] };
  return getSupabaseStudentDiscounts(filters);
}

export async function getStudentDiscountById(
  id: string,
  userId?: string | null
): Promise<{ discount: StudentDiscountRecord | null; error?: string }> {
  if (!usesSupabaseDiscounts()) {
    const mock = studentDiscounts.find((discount) => discount.id === id);
    if (!mock) return { discount: null };
    return {
      discount: mapMockStudentDiscountToRecord(
        mock,
        studentDiscounts.indexOf(mock)
      ),
    };
  }
  return getSupabaseStudentDiscountById(id, userId);
}

export async function getMyStudentDiscounts(userId: string): Promise<{
  discounts: StudentDiscountRecord[];
  error?: string;
}> {
  if (!usesSupabaseDiscounts()) return { discounts: [] };
  return getSupabaseMyStudentDiscounts(userId);
}

export async function createStudentDiscount(
  input: CreateStudentDiscountInput
): Promise<{ discount: StudentDiscountRecord | null; error?: string }> {
  if (!usesSupabaseDiscounts()) {
    return {
      discount: null,
      error: "Student discounts are available in Supabase real mode.",
    };
  }
  return createSupabaseStudentDiscount(input);
}

export async function updateStudentDiscount(
  id: string,
  userId: string,
  input: UpdateStudentDiscountInput
): Promise<{ discount: StudentDiscountRecord | null; error?: string }> {
  if (!usesSupabaseDiscounts()) {
    return {
      discount: null,
      error: "Student discounts are available in Supabase real mode.",
    };
  }
  return updateSupabaseStudentDiscount(id, userId, input);
}

export async function markStudentDiscountExpired(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!usesSupabaseDiscounts()) {
    return { success: false, error: "Supabase discounts are not enabled." };
  }
  return markSupabaseStudentDiscountExpired(id, userId);
}

export async function deleteStudentDiscount(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!usesSupabaseDiscounts()) {
    return { success: false, error: "Supabase discounts are not enabled." };
  }
  return deleteSupabaseStudentDiscount(id, userId);
}
