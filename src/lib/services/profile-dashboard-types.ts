import type { Listing } from "@/lib/types";
import type { HousingPostItem } from "./housing-types";
import type { TutorProfileItem } from "./tutoring-types";
import type { LostFoundItemRecord } from "./lost-found-types";
import type { CampusJobRecord } from "./jobs-types";
import type { CampusEventRecord } from "./events-types";
import type { StudentDiscountRecord } from "./discounts-types";

export type ProfileSectionResult<T> = {
  data: T;
  error?: string;
};

export type ProfileDashboardStats = {
  activePosts: number;
  savedListings: number;
  conversations: number;
  reportsSubmitted: number;
};

export type ProfileDashboardData = {
  marketplaceListings: ProfileSectionResult<Listing[]>;
  housingPosts: ProfileSectionResult<HousingPostItem[]>;
  tutorProfile: ProfileSectionResult<TutorProfileItem | null>;
  lostFoundItems: ProfileSectionResult<LostFoundItemRecord[]>;
  campusJobs: ProfileSectionResult<CampusJobRecord[]>;
  campusEvents: ProfileSectionResult<CampusEventRecord[]>;
  studentDiscounts: ProfileSectionResult<StudentDiscountRecord[]>;
  stats: ProfileDashboardStats;
};

export type GetMyProfileDashboardOptions = {
  marketplaceListings?: Listing[];
  savedListingCount?: number;
};
