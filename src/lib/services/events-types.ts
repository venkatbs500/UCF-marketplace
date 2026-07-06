export type CampusEventType =
  | "social"
  | "academic"
  | "career"
  | "sports"
  | "club"
  | "volunteer"
  | "other";

export type CampusEventStatus = "active" | "cancelled" | "draft" | "removed";

export type CampusEventOrganizer = {
  id: string;
  name: string;
  avatarInitials: string;
  isVerifiedStudent: boolean;
};

export type CampusEventRecord = {
  id: string;
  postedBy: string;
  title: string;
  description: string;
  eventType: CampusEventType;
  eventDate: string | null;
  eventTime: string;
  eventEndTime: string | null;
  location: string;
  host: string;
  images: string[];
  externalUrl: string | null;
  status: CampusEventStatus;
  createdAt: string;
  updatedAt: string;
  organizer: CampusEventOrganizer;
};

export type CampusEventRow = {
  id: string;
  posted_by: string;
  title: string;
  description: string;
  event_date: string | null;
  event_time: string | null;
  event_end_time: string | null;
  location: string;
  host: string;
  category: string;
  event_type: string;
  images: string[] | null;
  external_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type CampusEventFilters = {
  query?: string;
  eventType?: CampusEventType | "all";
  location?: string;
  upcomingOnly?: boolean;
};

export type CreateCampusEventInput = {
  postedBy: string;
  title: string;
  description: string;
  eventType: CampusEventType;
  eventDate?: string | null;
  eventTime?: string;
  eventEndTime?: string | null;
  location: string;
  host?: string;
  images: string[];
  externalUrl?: string | null;
  status?: "active" | "draft";
};

export type UpdateCampusEventInput = Partial<Omit<CreateCampusEventInput, "postedBy" | "images">> & {
  images?: string[];
  status?: CampusEventStatus;
};

export const CAMPUS_EVENT_TYPE_OPTIONS: Array<{ value: CampusEventType; label: string }> = [
  { value: "social", label: "Social" },
  { value: "academic", label: "Academic" },
  { value: "career", label: "Career" },
  { value: "sports", label: "Sports" },
  { value: "club", label: "Club" },
  { value: "volunteer", label: "Volunteer" },
  { value: "other", label: "Other" },
];

export const CAMPUS_EVENT_TYPE_LABELS: Record<CampusEventType, string> = {
  social: "Social",
  academic: "Academic",
  career: "Career",
  sports: "Sports",
  club: "Club",
  volunteer: "Volunteer",
  other: "Other",
};

function toDateLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.split("T")[0];
}

function isCampusEventType(value: string): value is CampusEventType {
  return (
    value === "social" ||
    value === "academic" ||
    value === "career" ||
    value === "sports" ||
    value === "club" ||
    value === "volunteer" ||
    value === "other"
  );
}

function isCampusEventStatus(value: string): value is CampusEventStatus {
  return (
    value === "active" ||
    value === "cancelled" ||
    value === "draft" ||
    value === "removed"
  );
}

export function mapMockEventTypeToCampusEventType(
  type: "club" | "hackathon" | "career-fair" | "sports" | "social"
): CampusEventType {
  if (type === "hackathon") return "academic";
  if (type === "career-fair") return "career";
  if (type === "sports") return "sports";
  if (type === "club") return "club";
  if (type === "social") return "social";
  return "other";
}

export function mapCampusEventRow(
  row: CampusEventRow,
  organizer: CampusEventOrganizer
): CampusEventRecord {
  const eventType = isCampusEventType(row.event_type) ? row.event_type : "other";
  const status = isCampusEventStatus(row.status) ? row.status : "draft";

  return {
    id: row.id,
    postedBy: row.posted_by,
    title: row.title,
    description: row.description,
    eventType,
    eventDate: toDateLabel(row.event_date),
    eventTime: row.event_time?.trim() || "",
    eventEndTime: row.event_end_time?.trim() || null,
    location: row.location,
    host: row.host,
    images: row.images ?? [],
    externalUrl: row.external_url,
    status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    organizer,
  };
}

function isUpcomingEvent(event: CampusEventRecord): boolean {
  if (!event.eventDate) return true;
  const today = new Date().toISOString().split("T")[0];
  return event.eventDate >= today;
}

export function filterCampusEvents(
  events: CampusEventRecord[],
  filters: CampusEventFilters
): CampusEventRecord[] {
  const query = filters.query?.trim().toLowerCase();
  const location = filters.location?.trim().toLowerCase();

  return events.filter((event) => {
    if (filters.upcomingOnly !== false && !isUpcomingEvent(event)) return false;
    if (filters.eventType && filters.eventType !== "all" && event.eventType !== filters.eventType) {
      return false;
    }
    if (location && !event.location.toLowerCase().includes(location)) return false;
    if (!query) return true;
    const haystack = [
      event.title,
      event.description,
      event.location,
      event.host,
      event.eventTime,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function formatEventTimeRange(event: CampusEventRecord): string {
  if (!event.eventTime && !event.eventEndTime) return "Time TBD";
  if (event.eventTime && event.eventEndTime) {
    return `${event.eventTime} – ${event.eventEndTime}`;
  }
  return event.eventTime || event.eventEndTime || "Time TBD";
}
