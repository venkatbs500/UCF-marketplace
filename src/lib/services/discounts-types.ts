export type StudentDiscountType =
  | "food"
  | "tech"
  | "books"
  | "services"
  | "fitness"
  | "entertainment"
  | "housing"
  | "other";

export type StudentDiscountStatus = "active" | "expired" | "draft" | "removed";

export type StudentDiscountPoster = {
  id: string;
  name: string;
  avatarInitials: string;
  isVerifiedStudent: boolean;
};

export type StudentDiscountRecord = {
  id: string;
  postedBy: string;
  title: string;
  businessName: string;
  description: string;
  discountType: StudentDiscountType;
  discountValue: string;
  promoCode: string | null;
  redemptionUrl: string | null;
  location: string;
  isOnline: boolean;
  expiresAt: string | null;
  redemptionInstructions: string;
  status: StudentDiscountStatus;
  createdAt: string;
  updatedAt: string;
  poster: StudentDiscountPoster;
};

export type StudentDiscountRow = {
  id: string;
  posted_by: string;
  title: string;
  business_name: string;
  description: string;
  discount_text: string;
  discount_type: string;
  discount_value: string | null;
  promo_code: string | null;
  redemption_url: string | null;
  category: string;
  location: string;
  is_online: boolean;
  expires_at: string | null;
  redemption_instructions: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type StudentDiscountFilters = {
  query?: string;
  discountType?: StudentDiscountType | "all";
  onlineOnly?: boolean;
  localOnly?: boolean;
  expiringSoon?: boolean;
  sort?: StudentDiscountSortOption;
};

export type StudentDiscountSortOption = "newest" | "expiring-soonest";

export const STUDENT_DISCOUNT_SORT_OPTIONS: Array<{ id: StudentDiscountSortOption; label: string }> = [
  { id: "newest", label: "Newest" },
  { id: "expiring-soonest", label: "Expiring soonest" },
];

export type CreateStudentDiscountInput = {
  postedBy: string;
  title: string;
  businessName: string;
  description: string;
  discountType: StudentDiscountType;
  discountValue: string;
  promoCode?: string | null;
  redemptionUrl?: string | null;
  location: string;
  isOnline?: boolean;
  expiresAt?: string | null;
  redemptionInstructions?: string;
  status?: "active" | "draft";
};

export type UpdateStudentDiscountInput = Partial<
  Omit<CreateStudentDiscountInput, "postedBy">
> & {
  status?: StudentDiscountStatus;
};

export const STUDENT_DISCOUNT_TYPE_OPTIONS: Array<{
  value: StudentDiscountType;
  label: string;
}> = [
  { value: "food", label: "Food" },
  { value: "tech", label: "Tech" },
  { value: "books", label: "Books" },
  { value: "services", label: "Services" },
  { value: "fitness", label: "Fitness" },
  { value: "entertainment", label: "Entertainment" },
  { value: "housing", label: "Housing" },
  { value: "other", label: "Other" },
];

export const STUDENT_DISCOUNT_TYPE_LABELS: Record<StudentDiscountType, string> = {
  food: "Food",
  tech: "Tech",
  books: "Books",
  services: "Services",
  fitness: "Fitness",
  entertainment: "Entertainment",
  housing: "Housing",
  other: "Other",
};

function isStudentDiscountType(value: string): value is StudentDiscountType {
  return (
    value === "food" ||
    value === "tech" ||
    value === "books" ||
    value === "services" ||
    value === "fitness" ||
    value === "entertainment" ||
    value === "housing" ||
    value === "other"
  );
}

function isStudentDiscountStatus(value: string): value is StudentDiscountStatus {
  return (
    value === "active" ||
    value === "expired" ||
    value === "draft" ||
    value === "removed"
  );
}

export function mapMockDiscountCategoryToType(
  category: string
): StudentDiscountType {
  if (category === "food" || category === "coffee") return "food";
  if (category === "gym") return "fitness";
  if (category === "printing") return "services";
  if (category === "tech-repair") return "tech";
  if (category === "entertainment") return "entertainment";
  return "other";
}

export function mapStudentDiscountRow(
  row: StudentDiscountRow,
  poster: StudentDiscountPoster
): StudentDiscountRecord {
  const discountType = isStudentDiscountType(row.discount_type)
    ? row.discount_type
    : "other";
  const status = isStudentDiscountStatus(row.status) ? row.status : "draft";
  const discountValue =
    row.discount_value?.trim() || row.discount_text?.trim() || "";

  return {
    id: row.id,
    postedBy: row.posted_by,
    title: row.title,
    businessName: row.business_name,
    description: row.description,
    discountType,
    discountValue,
    promoCode: row.promo_code?.trim() || null,
    redemptionUrl: row.redemption_url?.trim() || null,
    location: row.location,
    isOnline: row.is_online,
    expiresAt: row.expires_at,
    redemptionInstructions: row.redemption_instructions?.trim() || "",
    status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    poster,
  };
}

function isExpired(discount: StudentDiscountRecord): boolean {
  if (!discount.expiresAt) return false;
  return new Date(discount.expiresAt).getTime() < Date.now();
}

function isExpiringSoon(discount: StudentDiscountRecord): boolean {
  if (!discount.expiresAt) return false;
  const expires = new Date(discount.expiresAt).getTime();
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return expires >= now && expires <= now + sevenDays;
}

export function filterStudentDiscounts(
  discounts: StudentDiscountRecord[],
  filters: StudentDiscountFilters
): StudentDiscountRecord[] {
  const query = filters.query?.trim().toLowerCase();

  return discounts.filter((discount) => {
    if (discount.status === "active" && isExpired(discount)) return false;
    if (filters.discountType && filters.discountType !== "all") {
      if (discount.discountType !== filters.discountType) return false;
    }
    if (filters.onlineOnly && !discount.isOnline) return false;
    if (filters.localOnly && discount.isOnline) return false;
    if (filters.expiringSoon && !isExpiringSoon(discount)) return false;
    if (!query) return true;
    const haystack = [
      discount.title,
      discount.businessName,
      discount.description,
      discount.discountValue,
      discount.promoCode,
      discount.location,
      discount.redemptionInstructions,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function sortStudentDiscounts(
  discounts: StudentDiscountRecord[],
  sort: StudentDiscountSortOption = "newest"
): StudentDiscountRecord[] {
  const copy = [...discounts];
  switch (sort) {
    case "expiring-soonest":
      return copy.sort((a, b) => {
        const aExpires = a.expiresAt ? new Date(a.expiresAt).getTime() : Number.MAX_SAFE_INTEGER;
        const bExpires = b.expiresAt ? new Date(b.expiresAt).getTime() : Number.MAX_SAFE_INTEGER;
        if (aExpires !== bExpires) return aExpires - bExpires;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    case "newest":
    default:
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

export function filterAndSortStudentDiscounts(
  discounts: StudentDiscountRecord[],
  filters: StudentDiscountFilters
): StudentDiscountRecord[] {
  const { sort, ...rest } = filters;
  return sortStudentDiscounts(filterStudentDiscounts(discounts, rest), sort ?? "newest");
}

export function isStudentDiscountFilterActive(filters: StudentDiscountFilters): boolean {
  return Boolean(
    filters.query?.trim() ||
      (filters.discountType && filters.discountType !== "all") ||
      filters.onlineOnly ||
      filters.localOnly ||
      filters.expiringSoon
  );
}
