export type LostFoundItemType = "lost" | "found";
export type LostFoundItemStatus = "active" | "resolved" | "draft" | "removed";
export type LostFoundCategory =
  | "id-cards"
  | "electronics"
  | "keys"
  | "clothing"
  | "books"
  | "other";

export type LostFoundPoster = {
  id: string;
  name: string;
  avatarInitials: string;
  isVerifiedStudent: boolean;
};

export type LostFoundItemRecord = {
  id: string;
  userId: string;
  itemType: LostFoundItemType;
  title: string;
  description: string;
  category: LostFoundCategory;
  location: string;
  itemDate: string | null;
  images: string[];
  status: LostFoundItemStatus;
  createdAt: string;
  updatedAt: string;
  poster: LostFoundPoster;
};

export type LostFoundItemRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  location: string;
  item_date: string | null;
  images: string[] | null;
  contact_preference: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type LostFoundItemFilters = {
  query?: string;
  itemType?: LostFoundItemType | "all";
  category?: LostFoundCategory | "all";
  location?: string;
};

export type CreateLostFoundItemInput = {
  userId: string;
  itemType: LostFoundItemType;
  title: string;
  description: string;
  category: LostFoundCategory;
  location: string;
  itemDate?: string | null;
  images: string[];
  status?: "active" | "draft";
};

export type UpdateLostFoundItemInput = Partial<
  Omit<CreateLostFoundItemInput, "userId" | "images">
> & {
  images?: string[];
  status?: LostFoundItemStatus;
};

export const LOST_FOUND_CATEGORY_LABELS: Record<LostFoundCategory, string> = {
  "id-cards": "ID Cards",
  electronics: "Electronics",
  keys: "Keys",
  clothing: "Clothing",
  books: "Books",
  other: "Other",
};

function toDateLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.split("T")[0];
}

function isLostFoundItemType(value: string): value is LostFoundItemType {
  return value === "lost" || value === "found";
}

function isLostFoundCategory(value: string): value is LostFoundCategory {
  return (
    value === "id-cards" ||
    value === "electronics" ||
    value === "keys" ||
    value === "clothing" ||
    value === "books" ||
    value === "other"
  );
}

function normalizeStatus(value: string): LostFoundItemStatus {
  if (value === "open" || value === "active") return "active";
  if (value === "resolved" || value === "draft" || value === "removed") return value;
  return "draft";
}

export function mapLostFoundItemRow(
  row: LostFoundItemRow,
  poster: LostFoundPoster
): LostFoundItemRecord {
  const itemType = isLostFoundItemType(row.type) ? row.type : "lost";
  const category = isLostFoundCategory(row.category) ? row.category : "other";

  return {
    id: row.id,
    userId: row.user_id,
    itemType,
    title: row.title,
    description: row.description,
    category,
    location: row.location,
    itemDate: toDateLabel(row.item_date),
    images: row.images ?? [],
    status: normalizeStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    poster,
  };
}

export function filterLostFoundItems(
  items: LostFoundItemRecord[],
  filters: LostFoundItemFilters
): LostFoundItemRecord[] {
  const query = filters.query?.trim().toLowerCase();
  const location = filters.location?.trim().toLowerCase();

  return items.filter((item) => {
    if (filters.itemType && filters.itemType !== "all" && item.itemType !== filters.itemType) {
      return false;
    }
    if (filters.category && filters.category !== "all" && item.category !== filters.category) {
      return false;
    }
    if (location && !item.location.toLowerCase().includes(location)) {
      return false;
    }
    if (!query) return true;
    const haystack = [item.title, item.description, item.location, item.category]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}
