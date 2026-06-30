import type { AuthUser, Listing, ListingSortOption, SellerProfile } from "./types";
import { listings as mockListings, sellerProfiles } from "./mock-data";

export function buildSellerProfileFromAuthUser(user: AuthUser): SellerProfile {
  return {
    id: user.id,
    name: user.name,
    avatarInitials: user.avatarInitials,
    email: user.email,
    major: user.major,
    year: user.year,
    campusArea: user.campusArea,
    rating: 5,
    reviewCount: 0,
    trustScore: user.trustScore,
    joinedAt: user.joinedAt,
    responseTime: "Usually within a few hours",
    completedSales: 0,
    bio: user.bio ?? "UCF student seller on Knight Market.",
    badges: user.isVerifiedStudent ? ["Verified Student"] : [],
    verified: user.isVerifiedStudent,
  };
}

export function buildSellerProfileFromListing(listing: Listing): SellerProfile {
  return {
    id: listing.sellerId,
    name: listing.sellerName,
    avatarInitials: listing.sellerAvatarInitials,
    email: "",
    major: listing.sellerMajor,
    year: listing.sellerYear,
    campusArea: listing.campusArea,
    rating: listing.sellerRating,
    reviewCount: 0,
    trustScore: 75,
    joinedAt: listing.sellerJoinedAt,
    responseTime: "Usually within a few hours",
    completedSales: 0,
    bio: "UCF student seller on Knight Market.",
    badges: ["Verified Student"],
    verified: true,
  };
}

export function resolveSellerProfile(
  sellerId: string,
  options: {
    authUser?: AuthUser | null;
    userListings?: Listing[];
  } = {}
): SellerProfile | undefined {
  const mock = sellerProfiles.find((s) => s.id === sellerId);
  if (mock) return mock;

  if (options.authUser?.id === sellerId) {
    const sales = (options.userListings ?? []).filter(
      (l) => l.sellerId === sellerId && l.status === "active"
    ).length;
    return {
      ...buildSellerProfileFromAuthUser(options.authUser),
      completedSales: sales,
    };
  }

  const listing = mergeListings(mockListings, options.userListings ?? []).find(
    (l) => l.sellerId === sellerId
  );
  if (listing) {
    const sales = (options.userListings ?? []).filter(
      (l) => l.sellerId === sellerId && l.status === "active"
    ).length;
    return {
      ...buildSellerProfileFromListing(listing),
      completedSales: sales,
    };
  }

  return undefined;
}

export function getAllMockListings(): Listing[] {
  return mockListings;
}

export function mergeListings(
  mock: Listing[],
  userListings: Listing[]
): Listing[] {
  const activeUser = userListings.filter((l) => l.status === "active");
  return [...activeUser, ...mock.filter((l) => l.status === "active")];
}

export function getListingById(
  id: string,
  userListings: Listing[] = []
): Listing | undefined {
  return mergeListings(mockListings, userListings).find((l) => l.id === id);
}

export function getSellerById(
  id: string,
  options?: {
    authUser?: AuthUser | null;
    userListings?: Listing[];
  }
): SellerProfile | undefined {
  return resolveSellerProfile(id, options);
}

export function getListingsBySeller(
  sellerId: string,
  userListings: Listing[] = []
): Listing[] {
  return mergeListings(mockListings, userListings).filter(
    (l) => l.sellerId === sellerId && l.status === "active"
  );
}

export function getRelatedListings(
  listing: Listing,
  userListings: Listing[] = [],
  limit = 4
): Listing[] {
  return mergeListings(mockListings, userListings)
    .filter(
      (l) =>
        l.id !== listing.id &&
        l.category === listing.category &&
        l.status === "active"
    )
    .slice(0, limit);
}

export type MarketplaceFilters = {
  search: string;
  category: string;
  condition: string;
  campusArea: string;
  sort: ListingSortOption;
};

export function filterAndSortListings(
  listings: Listing[],
  filters: MarketplaceFilters
): Listing[] {
  const search = filters.search.trim().toLowerCase();

  let result = listings.filter((listing) => {
    if (listing.status !== "active") return false;

    const matchesSearch =
      !search ||
      listing.title.toLowerCase().includes(search) ||
      listing.description.toLowerCase().includes(search) ||
      listing.location.toLowerCase().includes(search) ||
      listing.campusArea.toLowerCase().includes(search) ||
      listing.tags.some((tag) => tag.toLowerCase().includes(search)) ||
      listing.category.toLowerCase().includes(search);

    const matchesCategory =
      filters.category === "all" || listing.category === filters.category;
    const matchesCondition =
      filters.condition === "all" || listing.condition === filters.condition;
    const matchesCampus =
      filters.campusArea === "all" || listing.campusArea === filters.campusArea;

    return matchesSearch && matchesCategory && matchesCondition && matchesCampus;
  });

  switch (filters.sort) {
    case "price-asc":
      result = [...result].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result = [...result].sort((a, b) => b.price - a.price);
      break;
    case "most-saved":
      result = [...result].sort((a, b) => b.savedCount - a.savedCount);
      break;
    case "featured":
      result = [...result].sort(
        (a, b) => Number(b.isFeatured) - Number(a.isFeatured)
      );
      break;
    case "newest":
    default:
      result = [...result].sort(
        (a, b) =>
          new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      );
  }

  return result;
}

export const LISTING_SORT_OPTIONS: { id: ListingSortOption; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "most-saved", label: "Most Saved" },
  { id: "featured", label: "Featured" },
];

export const CONDITION_FILTER_OPTIONS = [
  { id: "all", label: "All Conditions" },
  { id: "new", label: "New" },
  { id: "like-new", label: "Like New" },
  { id: "good", label: "Good" },
  { id: "fair", label: "Fair" },
  { id: "poor", label: "Poor" },
] as const;

export const CAMPUS_AREA_FILTER_OPTIONS = [
  { id: "all", label: "All Areas" },
  { id: "Main Campus", label: "Main Campus" },
  { id: "Knights Circle", label: "Knights Circle" },
  { id: "NorthView", label: "NorthView" },
  { id: "The Pointe", label: "The Pointe" },
  { id: "Plaza on University", label: "Plaza on University" },
  { id: "Downtown Orlando", label: "Downtown Orlando" },
] as const;

export const PICKUP_OPTIONS = [
  "In-person pickup",
  "Campus meetup",
  "Dorm lobby",
  "Parking lot handoff",
] as const;

export const MOCK_IMAGE_PLACEHOLDERS = ["📦", "📚", "💻", "🛋️", "🎮", "🛴", "👕", "🎟️"];
