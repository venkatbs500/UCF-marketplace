import type { Listing } from "@/lib/types";
import { getMyHousingPosts } from "./housing-service";
import { getMyTutorProfile } from "./tutoring-service";
import { getMyLostFoundItems } from "./lost-found-service";
import { getMyCampusJobs } from "./jobs-service";
import { getMyCampusEvents } from "./events-service";
import { getMyStudentDiscounts } from "./discounts-service";
import { fetchMyConversationPreviews } from "./messaging-service";
import { getActiveReportService } from "./report-service";
import type {
  GetMyProfileDashboardOptions,
  ProfileDashboardData,
  ProfileSectionResult,
} from "./profile-dashboard-types";

function sectionResult<T>(data: T, error?: string): ProfileSectionResult<T> {
  return error ? { data, error } : { data };
}

function unwrapSettled<T>(
  result: PromiseSettledResult<{ error?: string } & Record<string, unknown>>,
  key: string,
  fallback: T
): ProfileSectionResult<T> {
  if (result.status === "rejected") {
    return { data: fallback, error: "We could not load this section." };
  }
  const value = result.value;
  const data = (value[key] ?? fallback) as T;
  return sectionResult(data, value.error);
}

function countActiveListings(listings: Listing[]): number {
  return listings.filter((listing) => listing.status === "active").length;
}

function countActivePosts(data: Omit<ProfileDashboardData, "stats">): number {
  let count = countActiveListings(data.marketplaceListings.data);
  count += data.housingPosts.data.filter((post) => post.status === "active").length;
  if (data.tutorProfile.data?.status === "active") count += 1;
  count += data.lostFoundItems.data.filter((item) => item.status === "active").length;
  count += data.campusJobs.data.filter((job) => job.status === "active").length;
  count += data.campusEvents.data.filter((event) => event.status === "active").length;
  count += data.studentDiscounts.data.filter((discount) => discount.status === "active").length;
  return count;
}

export async function getMyProfileDashboard(
  userId: string,
  options: GetMyProfileDashboardOptions = {}
): Promise<ProfileDashboardData> {
  const marketplaceListings = options.marketplaceListings ?? [];

  const [
    housingResult,
    tutorResult,
    lostFoundResult,
    jobsResult,
    eventsResult,
    discountsResult,
    conversationsResult,
    reportsResult,
  ] = await Promise.allSettled([
    getMyHousingPosts(userId),
    getMyTutorProfile(userId),
    getMyLostFoundItems(userId),
    getMyCampusJobs(userId),
    getMyCampusEvents(userId),
    getMyStudentDiscounts(userId),
    fetchMyConversationPreviews(userId),
    getActiveReportService().getMyReports(userId),
  ]);

  const housingPosts = unwrapSettled(housingResult, "posts", []);
  const tutorProfile = unwrapSettled(tutorResult, "profile", null);
  const lostFoundItems = unwrapSettled(lostFoundResult, "items", []);
  const campusJobs = unwrapSettled(jobsResult, "jobs", []);
  const campusEvents = unwrapSettled(eventsResult, "events", []);
  const studentDiscounts = unwrapSettled(discountsResult, "discounts", []);

  let conversations = 0;
  let conversationsError: string | undefined;
  if (conversationsResult.status === "fulfilled") {
    conversations = conversationsResult.value.conversations.length;
    conversationsError = conversationsResult.value.error;
  } else {
    conversationsError = "We could not load conversations.";
  }

  let reportsSubmitted = 0;
  let reportsError: string | undefined;
  if (reportsResult.status === "fulfilled") {
    reportsSubmitted = reportsResult.value.reports.length;
    reportsError = reportsResult.value.error;
  } else {
    reportsError = "We could not load reports.";
  }

  const sections = {
    marketplaceListings: sectionResult(marketplaceListings),
    housingPosts,
    tutorProfile,
    lostFoundItems,
    campusJobs,
    campusEvents,
    studentDiscounts,
  };

  const stats = {
    activePosts: countActivePosts(sections),
    savedListings: options.savedListingCount ?? 0,
    conversations,
    reportsSubmitted,
  };

  void conversationsError;
  void reportsError;

  return { ...sections, stats };
}
