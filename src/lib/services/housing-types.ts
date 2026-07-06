export type HousingPostType = "sublease" | "roommate" | "lease_transfer";
export type HousingPostStatus = "active" | "closed" | "draft" | "removed";

export type HousingPoster = {
  id: string;
  name: string;
  avatarInitials: string;
  isVerifiedStudent: boolean;
};

export type HousingPostItem = {
  id: string;
  userId: string;
  type: HousingPostType;
  title: string;
  description: string;
  rent: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  apartmentName: string | null;
  location: string;
  moveInDate: string | null;
  moveOutDate: string | null;
  images: string[];
  tags: string[];
  status: HousingPostStatus;
  createdAt: string;
  updatedAt: string;
  poster: HousingPoster;
};

export type HousingPostRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  rent: number | string | null;
  bedrooms: number | null;
  bathrooms: number | string | null;
  apartment_name: string | null;
  location: string;
  move_in_date: string | null;
  move_out_date: string | null;
  images: string[] | null;
  tags: string[] | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type HousingPostFilters = {
  query?: string;
  type?: HousingPostType | "all";
  minRent?: number;
  maxRent?: number;
  moveInBefore?: string;
  sort?: HousingSortOption;
};

export type HousingSortOption = "newest" | "rent-asc" | "rent-desc" | "available-soonest";

export const HOUSING_SORT_OPTIONS: Array<{ id: HousingSortOption; label: string }> = [
  { id: "newest", label: "Newest" },
  { id: "rent-asc", label: "Rent: Low to High" },
  { id: "rent-desc", label: "Rent: High to Low" },
  { id: "available-soonest", label: "Available soonest" },
];

export type CreateHousingPostInput = {
  userId: string;
  type: HousingPostType;
  title: string;
  description: string;
  rent: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  apartmentName?: string | null;
  location: string;
  moveInDate?: string | null;
  moveOutDate?: string | null;
  tags?: string[];
  images: string[];
  status?: "active" | "draft";
};

export type UpdateHousingPostInput = Partial<
  Omit<CreateHousingPostInput, "userId" | "images">
> & {
  images?: string[];
  status?: HousingPostStatus;
};

export const HOUSING_TYPE_OPTIONS: Array<{ value: HousingPostType; label: string }> = [
  { value: "sublease", label: "Sublease" },
  { value: "roommate", label: "Room / roommate wanted" },
  { value: "lease_transfer", label: "Lease transfer" },
];

export const HOUSING_TYPE_LABELS: Record<HousingPostType, string> = {
  sublease: "Sublease",
  roommate: "Room",
  lease_transfer: "Lease transfer",
};

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function toDateLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.split("T")[0];
}

function isHousingPostType(value: string): value is HousingPostType {
  return value === "sublease" || value === "roommate" || value === "lease_transfer";
}

function isHousingPostStatus(value: string): value is HousingPostStatus {
  return (
    value === "active" ||
    value === "closed" ||
    value === "draft" ||
    value === "removed"
  );
}

export function mapHousingPostRow(
  row: HousingPostRow,
  poster: HousingPoster
): HousingPostItem {
  const type = isHousingPostType(row.type) ? row.type : "sublease";
  const status = isHousingPostStatus(row.status) ? row.status : "draft";

  return {
    id: row.id,
    userId: row.user_id,
    type,
    title: row.title,
    description: row.description,
    rent: toNumber(row.rent),
    bedrooms: row.bedrooms,
    bathrooms: toNumber(row.bathrooms),
    apartmentName: row.apartment_name,
    location: row.location,
    moveInDate: toDateLabel(row.move_in_date),
    moveOutDate: toDateLabel(row.move_out_date),
    images: row.images ?? [],
    tags: row.tags ?? [],
    status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    poster,
  };
}

export function filterHousingPosts(
  posts: HousingPostItem[],
  filters: HousingPostFilters
): HousingPostItem[] {
  const query = filters.query?.trim().toLowerCase();
  return posts.filter((post) => {
    if (filters.type && filters.type !== "all" && post.type !== filters.type) {
      return false;
    }
    if (filters.minRent != null && (post.rent ?? 0) < filters.minRent) return false;
    if (filters.maxRent != null && (post.rent ?? Infinity) > filters.maxRent) return false;
    if (filters.moveInBefore && post.moveInDate && post.moveInDate > filters.moveInBefore) {
      return false;
    }
    if (!query) return true;
    const haystack = [
      post.title,
      post.description,
      post.location,
      post.apartmentName ?? "",
      ...post.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function sortHousingPosts(
  posts: HousingPostItem[],
  sort: HousingSortOption = "newest"
): HousingPostItem[] {
  const copy = [...posts];
  switch (sort) {
    case "rent-asc":
      return copy.sort((a, b) => (a.rent ?? Infinity) - (b.rent ?? Infinity));
    case "rent-desc":
      return copy.sort((a, b) => (b.rent ?? 0) - (a.rent ?? 0));
    case "available-soonest":
      return copy.sort((a, b) => {
        const aDate = a.moveInDate ?? "9999-12-31";
        const bDate = b.moveInDate ?? "9999-12-31";
        return aDate.localeCompare(bDate);
      });
    case "newest":
    default:
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

export function filterAndSortHousingPosts(
  posts: HousingPostItem[],
  filters: HousingPostFilters
): HousingPostItem[] {
  const { sort, ...rest } = filters;
  return sortHousingPosts(filterHousingPosts(posts, rest), sort ?? "newest");
}

export function isHousingFilterActive(filters: HousingPostFilters): boolean {
  return Boolean(
    filters.query?.trim() ||
      (filters.type && filters.type !== "all") ||
      filters.minRent != null ||
      filters.maxRent != null ||
      filters.moveInBefore
  );
}
