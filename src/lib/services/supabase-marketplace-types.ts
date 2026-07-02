import type {
  AuthUser,
  Listing,
  ListingCondition,
  ListingDraft,
  ListingStatus,
  MarketplaceCategory,
} from "@/lib/types";
import { createUserFromEmail } from "@/lib/auth";

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  avatar_initials: string | null;
  bio: string | null;
  major: string | null;
  year: string | null;
  campus_area: string | null;
  interests: string[] | null;
  trust_score: number;
  is_verified_student: boolean;
  has_completed_onboarding: boolean;
  created_at: string;
  updated_at: string;
};

export type ListingRow = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number | string;
  category: string;
  condition: string;
  location: string;
  campus_area: string;
  images: string[] | null;
  tags: string[] | null;
  pickup_options: string[] | null;
  is_negotiable: boolean;
  is_featured: boolean;
  status: string;
  views: number;
  saved_count: number;
  created_at: string;
  updated_at: string;
};

export type ListingInsert = {
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  campus_area: string;
  images: string[];
  tags: string[];
  pickup_options: string[];
  is_negotiable: boolean;
  status: ListingStatus;
};

export type ListingUpdate = Partial<
  Omit<ListingInsert, "seller_id"> & { is_featured?: boolean }
>;

function toDateLabel(value: string | null | undefined): string {
  if (!value) return new Date().toISOString().split("T")[0];
  return value.split("T")[0];
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function mapProfileRowToAuthUser(
  profile: ProfileRow,
  fallbackEmail?: string
): AuthUser {
  const email = profile.email || fallbackEmail || "";
  const base = email ? createUserFromEmail(email) : createUserFromEmail("student@ucf.edu");

  return {
    ...base,
    id: profile.id,
    email,
    name: profile.full_name || base.name,
    avatarInitials: profile.avatar_initials || base.avatarInitials,
    major: profile.major || base.major,
    year: profile.year || base.year,
    campusArea: profile.campus_area || base.campusArea,
    interests: profile.interests ?? base.interests,
    trustScore: profile.trust_score ?? base.trustScore,
    isVerifiedStudent: profile.is_verified_student ?? true,
    hasCompletedOnboarding: profile.has_completed_onboarding ?? false,
    joinedAt: toDateLabel(profile.created_at),
    bio: profile.bio ?? base.bio,
  };
}

function sellerNameFromProfile(profile?: ProfileRow | null): string {
  if (profile?.full_name?.trim()) return profile.full_name.trim();
  return "Verified student";
}

function sellerInitialsFromProfile(profile?: ProfileRow | null): string {
  if (profile?.avatar_initials?.trim()) return profile.avatar_initials.trim();
  const name = sellerNameFromProfile(profile);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return (name.slice(0, 2) || "VS").toUpperCase();
}

export function mapListingRowToListing(
  row: ListingRow,
  profile?: ProfileRow | null
): Listing {
  const images = row.images?.length ? row.images : ["📦"];

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    price: toNumber(row.price),
    category: row.category as MarketplaceCategory,
    condition: row.condition as ListingCondition,
    location: row.location ?? "",
    campusArea: row.campus_area ?? "",
    sellerId: row.seller_id,
    sellerName: sellerNameFromProfile(profile),
    sellerAvatarInitials: sellerInitialsFromProfile(profile),
    sellerRating: 5,
    sellerJoinedAt: toDateLabel(profile?.created_at),
    sellerMajor: profile?.major ?? "UCF Student",
    sellerYear: profile?.year ?? "Student",
    images,
    tags: row.tags ?? [],
    postedAt: toDateLabel(row.created_at),
    updatedAt: toDateLabel(row.updated_at),
    isFeatured: row.is_featured ?? false,
    isNegotiable: row.is_negotiable ?? false,
    pickupOptions: row.pickup_options ?? [],
    status: row.status as ListingStatus,
    views: row.views ?? 0,
    savedCount: row.saved_count ?? 0,
  };
}

export function mapListingDraftToListingInsert(
  draft: ListingDraft,
  userId: string,
  imageUrls: string[]
): ListingInsert | null {
  if (
    !draft.title.trim() ||
    !draft.category ||
    !draft.condition ||
    draft.price === "" ||
    !draft.campusArea ||
    !draft.location.trim() ||
    !draft.description.trim() ||
    draft.description.trim().length < 20 ||
    imageUrls.length === 0
  ) {
    return null;
  }

  const price = Number(draft.price);
  if (Number.isNaN(price) || price < 0) return null;

  return {
    seller_id: userId,
    title: draft.title.trim(),
    description: draft.description.trim(),
    price,
    category: draft.category,
    condition: draft.condition,
    location: draft.location.trim(),
    campus_area: draft.campusArea,
    images: imageUrls,
    tags: draft.tags,
    pickup_options: draft.pickupOptions,
    is_negotiable: draft.isNegotiable,
    status: "active",
  };
}
