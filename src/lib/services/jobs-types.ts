export type CampusJobType =
  | "part_time"
  | "internship"
  | "gig"
  | "volunteer"
  | "research"
  | "campus";

export type CampusJobStatus = "active" | "closed" | "draft" | "removed";

export type CampusJobPoster = {
  id: string;
  name: string;
  avatarInitials: string;
  isVerifiedStudent: boolean;
};

export type CampusJobRecord = {
  id: string;
  postedBy: string;
  title: string;
  organization: string;
  description: string;
  pay: string;
  location: string;
  timeCommitment: string;
  jobType: CampusJobType;
  isRemote: boolean;
  requirements: string;
  applicationUrl: string | null;
  applicationInstructions: string;
  tags: string[];
  status: CampusJobStatus;
  createdAt: string;
  updatedAt: string;
  poster: CampusJobPoster;
};

export type CampusJobRow = {
  id: string;
  posted_by: string;
  title: string;
  organization: string;
  description: string;
  pay: string;
  location: string;
  time_commitment: string;
  category: string;
  job_type: string;
  is_remote: boolean;
  requirements: string;
  application_url: string | null;
  application_instructions: string;
  tags: string[] | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type CampusJobFilters = {
  query?: string;
  jobType?: CampusJobType | "all";
  location?: string;
  remoteOnly?: boolean;
};

export type CreateCampusJobInput = {
  postedBy: string;
  title: string;
  organization: string;
  description: string;
  pay?: string;
  location: string;
  timeCommitment?: string;
  jobType: CampusJobType;
  isRemote?: boolean;
  requirements?: string;
  applicationUrl?: string | null;
  applicationInstructions?: string;
  tags?: string[];
  status?: "active" | "draft";
};

export type UpdateCampusJobInput = Partial<Omit<CreateCampusJobInput, "postedBy">> & {
  status?: CampusJobStatus;
};

export const CAMPUS_JOB_TYPE_OPTIONS: Array<{ value: CampusJobType; label: string }> = [
  { value: "campus", label: "Campus" },
  { value: "part_time", label: "Part-time" },
  { value: "internship", label: "Internship" },
  { value: "gig", label: "Gig / freelance" },
  { value: "volunteer", label: "Volunteer" },
  { value: "research", label: "Research" },
];

export const CAMPUS_JOB_TYPE_LABELS: Record<CampusJobType, string> = {
  campus: "Campus",
  part_time: "Part-time",
  internship: "Internship",
  gig: "Gig",
  volunteer: "Volunteer",
  research: "Research",
};

function isCampusJobType(value: string): value is CampusJobType {
  return (
    value === "part_time" ||
    value === "internship" ||
    value === "gig" ||
    value === "volunteer" ||
    value === "research" ||
    value === "campus"
  );
}

function isCampusJobStatus(value: string): value is CampusJobStatus {
  return (
    value === "active" ||
    value === "closed" ||
    value === "draft" ||
    value === "removed"
  );
}

export function mapMockJobTypeToCampusJobType(
  type: "campus-gig" | "part-time" | "research" | "freelance"
): CampusJobType {
  if (type === "part-time") return "part_time";
  if (type === "research") return "research";
  if (type === "freelance") return "gig";
  return "campus";
}

export function mapCampusJobRow(
  row: CampusJobRow,
  poster: CampusJobPoster
): CampusJobRecord {
  const jobType = isCampusJobType(row.job_type) ? row.job_type : "campus";
  const status = isCampusJobStatus(row.status) ? row.status : "draft";

  return {
    id: row.id,
    postedBy: row.posted_by,
    title: row.title,
    organization: row.organization,
    description: row.description,
    pay: row.pay,
    location: row.location,
    timeCommitment: row.time_commitment,
    jobType,
    isRemote: row.is_remote,
    requirements: row.requirements,
    applicationUrl: row.application_url,
    applicationInstructions: row.application_instructions,
    tags: row.tags ?? [],
    status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    poster,
  };
}

export function filterCampusJobs(
  jobs: CampusJobRecord[],
  filters: CampusJobFilters
): CampusJobRecord[] {
  const query = filters.query?.trim().toLowerCase();
  const location = filters.location?.trim().toLowerCase();

  return jobs.filter((job) => {
    if (filters.jobType && filters.jobType !== "all" && job.jobType !== filters.jobType) {
      return false;
    }
    if (filters.remoteOnly && !job.isRemote) return false;
    if (location) {
      const locationHaystack = `${job.location} ${job.isRemote ? "remote" : ""}`.toLowerCase();
      if (!locationHaystack.includes(location)) return false;
    }
    if (!query) return true;
    const haystack = [
      job.title,
      job.organization,
      job.description,
      job.pay,
      job.location,
      job.requirements,
      ...job.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}
