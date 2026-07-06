export type TutoringFormat = "online" | "in_person" | "both";
export type TutorProfileStatus = "active" | "inactive" | "removed";

export type TutorOwner = {
  id: string;
  name: string;
  avatarInitials: string;
  isVerifiedStudent: boolean;
  major?: string | null;
  year?: string | null;
};

export type TutorProfileItem = {
  id: string;
  userId: string;
  displayName: string;
  subjects: string[];
  bio: string;
  hourlyRate: number | null;
  availability: string[];
  tutoringFormat: TutoringFormat;
  experience: string;
  meetingPreference: string;
  rating: number;
  reviewCount: number;
  status: TutorProfileStatus;
  createdAt: string;
  updatedAt: string;
  tutor: TutorOwner;
};

export type TutorProfileRow = {
  id: string;
  user_id: string;
  display_name: string | null;
  subjects: string[] | null;
  bio: string;
  hourly_rate: number | string | null;
  availability: string[] | null;
  tutoring_format: string;
  experience: string | null;
  meeting_preference: string | null;
  rating: number | string;
  review_count: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type TutorProfileFilters = {
  query?: string;
  format?: TutoringFormat | "all";
  minRate?: number;
  maxRate?: number;
  sort?: TutorSortOption;
};

export type TutorSortOption = "newest" | "rate-asc" | "rate-desc";

export const TUTOR_SORT_OPTIONS: Array<{ id: TutorSortOption; label: string }> = [
  { id: "newest", label: "Newest" },
  { id: "rate-asc", label: "Rate: Low to High" },
  { id: "rate-desc", label: "Rate: High to Low" },
];

export type CreateTutorProfileInput = {
  userId: string;
  displayName?: string | null;
  subjects: string[];
  bio: string;
  hourlyRate: number | null;
  availability: string[];
  tutoringFormat: TutoringFormat;
  experience?: string;
  meetingPreference?: string;
  status?: "active";
};

export type UpdateTutorProfileInput = Partial<
  Omit<CreateTutorProfileInput, "userId">
> & {
  status?: TutorProfileStatus;
};

export const TUTORING_FORMAT_OPTIONS: Array<{ value: TutoringFormat; label: string }> = [
  { value: "online", label: "Online" },
  { value: "in_person", label: "In person" },
  { value: "both", label: "Online & in person" },
];

export const TUTORING_FORMAT_LABELS: Record<TutoringFormat, string> = {
  online: "Online",
  in_person: "In person",
  both: "Online & in person",
};

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function isTutoringFormat(value: string): value is TutoringFormat {
  return value === "online" || value === "in_person" || value === "both";
}

function isTutorProfileStatus(value: string): value is TutorProfileStatus {
  return value === "active" || value === "inactive" || value === "removed";
}

export function mapTutorProfileRow(
  row: TutorProfileRow,
  tutor: TutorOwner
): TutorProfileItem {
  const format = isTutoringFormat(row.tutoring_format) ? row.tutoring_format : "both";
  const status = isTutorProfileStatus(row.status) ? row.status : "inactive";
  const displayName =
    row.display_name?.trim() || tutor.name || "Verified student tutor";

  return {
    id: row.id,
    userId: row.user_id,
    displayName,
    subjects: row.subjects ?? [],
    bio: row.bio,
    hourlyRate: toNumber(row.hourly_rate),
    availability: row.availability ?? [],
    tutoringFormat: format,
    experience: row.experience?.trim() ?? "",
    meetingPreference: row.meeting_preference?.trim() ?? "",
    rating: toNumber(row.rating) ?? 0,
    reviewCount: row.review_count ?? 0,
    status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tutor,
  };
}

export function filterTutorProfiles(
  profiles: TutorProfileItem[],
  filters: TutorProfileFilters
): TutorProfileItem[] {
  const query = filters.query?.trim().toLowerCase() ?? "";

  return profiles.filter((profile) => {
    if (filters.format && filters.format !== "all" && profile.tutoringFormat !== filters.format) {
      return false;
    }
    if (filters.minRate != null && (profile.hourlyRate ?? 0) < filters.minRate) {
      return false;
    }
    if (filters.maxRate != null && (profile.hourlyRate ?? Infinity) > filters.maxRate) {
      return false;
    }
    if (!query) return true;

    const haystack = [
      profile.displayName,
      profile.bio,
      profile.experience,
      profile.meetingPreference,
      ...profile.subjects,
      ...profile.availability,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function sortTutorProfiles(
  profiles: TutorProfileItem[],
  sort: TutorSortOption = "newest"
): TutorProfileItem[] {
  const copy = [...profiles];
  switch (sort) {
    case "rate-asc":
      return copy.sort((a, b) => (a.hourlyRate ?? Infinity) - (b.hourlyRate ?? Infinity));
    case "rate-desc":
      return copy.sort((a, b) => (b.hourlyRate ?? 0) - (a.hourlyRate ?? 0));
    case "newest":
    default:
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

export function filterAndSortTutorProfiles(
  profiles: TutorProfileItem[],
  filters: TutorProfileFilters
): TutorProfileItem[] {
  const { sort, ...rest } = filters;
  return sortTutorProfiles(filterTutorProfiles(profiles, rest), sort ?? "newest");
}

export function isTutorFilterActive(filters: TutorProfileFilters): boolean {
  return Boolean(
    filters.query?.trim() ||
      (filters.format && filters.format !== "all") ||
      filters.minRate != null ||
      filters.maxRate != null
  );
}
