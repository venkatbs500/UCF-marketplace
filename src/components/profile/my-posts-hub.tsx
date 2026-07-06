"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import { MyPostRow } from "@/components/profile/my-post-row";
import { useAuth } from "@/components/providers/auth-provider";
import { useUserListings } from "@/components/providers/user-listings-provider";
import type { ProfileDashboardData } from "@/lib/services/profile-dashboard-types";
import {
  deleteHousingPost,
  markHousingPostInactive,
} from "@/lib/services/housing-service";
import {
  deleteTutorProfile,
  markTutorProfileInactive,
} from "@/lib/services/tutoring-service";
import {
  deleteLostFoundItem,
  markLostFoundItemResolved,
} from "@/lib/services/lost-found-service";
import { deleteCampusJob, markCampusJobClosed } from "@/lib/services/jobs-service";
import { deleteCampusEvent, markCampusEventCancelled } from "@/lib/services/events-service";
import {
  deleteStudentDiscount,
  markStudentDiscountExpired,
} from "@/lib/services/discounts-service";
import { HOUSING_TYPE_LABELS } from "@/lib/services/housing-types";
import { formatPrice } from "@/lib/utils";

const MY_POSTS_TABS = [
  { id: "marketplace", label: "Marketplace", testId: "my-posts-tab-marketplace" },
  { id: "housing", label: "Housing", testId: "my-posts-tab-housing" },
  { id: "tutoring", label: "Tutoring", testId: "my-posts-tab-tutoring" },
  { id: "lost-found", label: "Lost & Found", testId: "my-posts-tab-lost-found" },
  { id: "jobs", label: "Jobs", testId: "my-posts-tab-jobs" },
  { id: "events", label: "Events", testId: "my-posts-tab-events" },
  { id: "deals", label: "Deals", testId: "my-posts-tab-deals" },
] as const;

type MyPostsTabId = (typeof MY_POSTS_TABS)[number]["id"];

type MyPostsHubProps = {
  dashboard: ProfileDashboardData | null;
  loading: boolean;
  onRefresh: () => Promise<void>;
};

function SectionError({ message }: { message: string }) {
  return (
    <p role="alert" className="mb-4 text-sm text-red-400">
      {message}
    </p>
  );
}

function EmptySection({
  message,
  ctaLabel,
  ctaHref,
  testId,
}: {
  message: string;
  ctaLabel: string;
  ctaHref: string;
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardContent className="py-8 text-center">
        <p className="mb-4 text-sm text-muted">{message}</p>
        <Link href={ctaHref}>
          <Button>{ctaLabel}</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function MyPostsHub({ dashboard, loading, onRefresh }: MyPostsHubProps) {
  const { user } = useAuth();
  const { userListings, userListingsError, isLoading: listingsLoading } = useUserListings();
  const [activeTab, setActiveTab] = useState<MyPostsTabId>("marketplace");

  const myListings = useMemo(
    () => (user ? userListings.filter((listing) => listing.sellerId === user.id) : []),
    [user, userListings]
  );

  const refresh = useCallback(async () => {
    await onRefresh();
  }, [onRefresh]);

  if (!user) return null;

  const sectionLoading = loading && !dashboard;

  return (
    <section className="mb-10" data-testid="my-posts-hub">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">My Posts</h2>
        <Link href="/saved">
          <Button size="sm" variant="outline">
            Saved listings
          </Button>
        </Link>
      </div>

      <Tabs
        tabs={[...MY_POSTS_TABS]}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as MyPostsTabId)}
        className="mb-6"
      />

      {activeTab === "marketplace" && (
        <div data-testid="my-posts-marketplace">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">My Posted Listings</h3>
            <Link href="/sell">
              <Button size="sm" variant="outline">
                Sell item
              </Button>
            </Link>
          </div>
          {userListingsError && (
            <SectionError message="We could not load your listings. Please try again." />
          )}
          {listingsLoading || sectionLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted">
                Loading your listings...
              </CardContent>
            </Card>
          ) : myListings.length > 0 ? (
            <ListingGrid listings={myListings} ownerActionVariant="profile" />
          ) : (
            <EmptySection
              message="You have not listed anything yet."
              ctaLabel="Sell an item"
              ctaHref="/sell"
              testId="profile-empty-marketplace"
            />
          )}
        </div>
      )}

      {activeTab === "housing" && (
        <div data-testid="my-posts-housing">
          {dashboard?.housingPosts.error && (
            <SectionError message={dashboard.housingPosts.error} />
          )}
          {sectionLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted">
                Loading housing posts...
              </CardContent>
            </Card>
          ) : (dashboard?.housingPosts.data.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {dashboard!.housingPosts.data.map((post) => (
                <MyPostRow
                  key={post.id}
                  title={post.title}
                  href={`/housing/${post.id}`}
                  status={post.status}
                  createdAt={post.createdAt}
                  updatedAt={post.updatedAt}
                  metadata={`${HOUSING_TYPE_LABELS[post.type]} · ${post.location}${post.rent != null ? ` · ${formatPrice(post.rent)}/mo` : ""}`}
                  editHref={`/housing/${post.id}/edit`}
                  statusActionLabel="Mark inactive"
                  onStatusAction={async () => {
                    const result = await markHousingPostInactive(post.id, user.id);
                    if (!result.success) throw new Error(result.error);
                    await refresh();
                  }}
                  onDelete={async () => {
                    const result = await deleteHousingPost(post.id, user.id);
                    if (!result.success) throw new Error(result.error);
                    await refresh();
                  }}
                  testId={`my-post-housing-${post.id}`}
                />
              ))}
            </div>
          ) : (
            <EmptySection
              message="You have not posted housing yet."
              ctaLabel="Post housing"
              ctaHref="/housing/new"
              testId="profile-empty-housing"
            />
          )}
        </div>
      )}

      {activeTab === "tutoring" && (
        <div data-testid="my-posts-tutoring">
          {dashboard?.tutorProfile.error && (
            <SectionError message={dashboard.tutorProfile.error} />
          )}
          {sectionLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted">
                Loading tutor profile...
              </CardContent>
            </Card>
          ) : dashboard?.tutorProfile.data ? (
            <MyPostRow
              title={dashboard.tutorProfile.data.displayName}
              href={`/tutoring/${dashboard.tutorProfile.data.id}`}
              status={dashboard.tutorProfile.data.status}
              createdAt={dashboard.tutorProfile.data.createdAt}
              updatedAt={dashboard.tutorProfile.data.updatedAt}
              metadata={`${dashboard.tutorProfile.data.subjects.slice(0, 3).join(", ")}${dashboard.tutorProfile.data.hourlyRate != null ? ` · ${formatPrice(dashboard.tutorProfile.data.hourlyRate)}/hr` : ""}`}
              editHref={`/tutoring/${dashboard.tutorProfile.data.id}/edit`}
              statusActionLabel="Mark inactive"
              onStatusAction={async () => {
                const result = await markTutorProfileInactive(
                  dashboard.tutorProfile.data!.id,
                  user.id
                );
                if (!result.success) throw new Error(result.error);
                await refresh();
              }}
              onDelete={async () => {
                const result = await deleteTutorProfile(
                  dashboard.tutorProfile.data!.id,
                  user.id
                );
                if (!result.success) throw new Error(result.error);
                await refresh();
              }}
              testId="my-post-tutor-profile"
            />
          ) : (
            <EmptySection
              message="You have not created a tutor profile yet."
              ctaLabel="Become a tutor"
              ctaHref="/tutoring/new"
              testId="profile-empty-tutoring"
            />
          )}
        </div>
      )}

      {activeTab === "lost-found" && (
        <div data-testid="my-posts-lost-found">
          {dashboard?.lostFoundItems.error && (
            <SectionError message={dashboard.lostFoundItems.error} />
          )}
          {sectionLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted">
                Loading lost & found items...
              </CardContent>
            </Card>
          ) : (dashboard?.lostFoundItems.data.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {dashboard!.lostFoundItems.data.map((item) => (
                <MyPostRow
                  key={item.id}
                  title={item.title}
                  href={`/lost-found/${item.id}`}
                  status={item.status}
                  createdAt={item.createdAt}
                  updatedAt={item.updatedAt}
                  metadata={`${item.itemType === "lost" ? "Lost" : "Found"} · ${item.location}`}
                  editHref={`/lost-found/${item.id}/edit`}
                  statusActionLabel="Mark resolved"
                  onStatusAction={async () => {
                    const result = await markLostFoundItemResolved(item.id, user.id);
                    if (!result.success) throw new Error(result.error);
                    await refresh();
                  }}
                  onDelete={async () => {
                    const result = await deleteLostFoundItem(item.id, user.id);
                    if (!result.success) throw new Error(result.error);
                    await refresh();
                  }}
                  testId={`my-post-lost-found-${item.id}`}
                />
              ))}
            </div>
          ) : (
            <EmptySection
              message="You have not posted lost or found items yet."
              ctaLabel="Post lost or found item"
              ctaHref="/lost-found/new"
              testId="profile-empty-lost-found"
            />
          )}
        </div>
      )}

      {activeTab === "jobs" && (
        <div data-testid="my-posts-jobs">
          {dashboard?.campusJobs.error && <SectionError message={dashboard.campusJobs.error} />}
          {sectionLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted">
                Loading jobs...
              </CardContent>
            </Card>
          ) : (dashboard?.campusJobs.data.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {dashboard!.campusJobs.data.map((job) => (
                <MyPostRow
                  key={job.id}
                  title={job.title}
                  href={`/jobs/${job.id}`}
                  status={job.status}
                  createdAt={job.createdAt}
                  updatedAt={job.updatedAt}
                  metadata={`${job.organization} · ${job.location}`}
                  editHref={`/jobs/${job.id}/edit`}
                  statusActionLabel="Mark closed"
                  onStatusAction={async () => {
                    const result = await markCampusJobClosed(job.id, user.id);
                    if (!result.success) throw new Error(result.error);
                    await refresh();
                  }}
                  onDelete={async () => {
                    const result = await deleteCampusJob(job.id, user.id);
                    if (!result.success) throw new Error(result.error);
                    await refresh();
                  }}
                  testId={`my-post-job-${job.id}`}
                />
              ))}
            </div>
          ) : (
            <EmptySection
              message="You have not posted jobs yet."
              ctaLabel="Post a job"
              ctaHref="/jobs/new"
              testId="profile-empty-jobs"
            />
          )}
        </div>
      )}

      {activeTab === "events" && (
        <div data-testid="my-posts-events">
          {dashboard?.campusEvents.error && (
            <SectionError message={dashboard.campusEvents.error} />
          )}
          {sectionLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted">
                Loading events...
              </CardContent>
            </Card>
          ) : (dashboard?.campusEvents.data.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {dashboard!.campusEvents.data.map((event) => (
                <MyPostRow
                  key={event.id}
                  title={event.title}
                  href={`/events/${event.id}`}
                  status={event.status}
                  createdAt={event.createdAt}
                  updatedAt={event.updatedAt}
                  metadata={`${event.host} · ${event.location}`}
                  editHref={`/events/${event.id}/edit`}
                  statusActionLabel="Mark cancelled"
                  onStatusAction={async () => {
                    const result = await markCampusEventCancelled(event.id, user.id);
                    if (!result.success) throw new Error(result.error);
                    await refresh();
                  }}
                  onDelete={async () => {
                    const result = await deleteCampusEvent(event.id, user.id);
                    if (!result.success) throw new Error(result.error);
                    await refresh();
                  }}
                  testId={`my-post-event-${event.id}`}
                />
              ))}
            </div>
          ) : (
            <EmptySection
              message="You have not posted events yet."
              ctaLabel="Post an event"
              ctaHref="/events/new"
              testId="profile-empty-events"
            />
          )}
        </div>
      )}

      {activeTab === "deals" && (
        <div data-testid="my-posts-deals">
          {dashboard?.studentDiscounts.error && (
            <SectionError message={dashboard.studentDiscounts.error} />
          )}
          {sectionLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted">
                Loading discounts...
              </CardContent>
            </Card>
          ) : (dashboard?.studentDiscounts.data.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {dashboard!.studentDiscounts.data.map((discount) => (
                <MyPostRow
                  key={discount.id}
                  title={discount.title}
                  href={`/discounts/${discount.id}`}
                  status={discount.status}
                  createdAt={discount.createdAt}
                  updatedAt={discount.updatedAt}
                  metadata={`${discount.businessName} · ${discount.discountValue}`}
                  editHref={`/discounts/${discount.id}/edit`}
                  statusActionLabel="Mark expired"
                  onStatusAction={async () => {
                    const result = await markStudentDiscountExpired(discount.id, user.id);
                    if (!result.success) throw new Error(result.error);
                    await refresh();
                  }}
                  onDelete={async () => {
                    const result = await deleteStudentDiscount(discount.id, user.id);
                    if (!result.success) throw new Error(result.error);
                    await refresh();
                  }}
                  testId={`my-post-discount-${discount.id}`}
                />
              ))}
            </div>
          ) : (
            <EmptySection
              message="You have not posted discounts yet."
              ctaLabel="Post a discount"
              ctaHref="/discounts/new"
              testId="profile-empty-deals"
            />
          )}
        </div>
      )}
    </section>
  );
}
