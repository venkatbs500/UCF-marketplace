"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { ProfileQuickActions } from "@/components/profile/profile-quick-actions";
import { MyPostsHub } from "@/components/profile/my-posts-hub";
import { ProfileAccountSection } from "@/components/profile/profile-account-section";
import { useAuth } from "@/components/providers/auth-provider";
import { useSavedListings } from "@/components/providers/saved-listings-provider";
import { useUserListings } from "@/components/providers/user-listings-provider";
import { getMyProfileDashboard } from "@/lib/services/profile-dashboard-service";
import type { ProfileDashboardData } from "@/lib/services/profile-dashboard-types";
import { formatDate } from "@/lib/utils";
import {
  Heart,
  MapPin,
  MessageCircle,
  Package,
  Calendar,
  Shield,
  Flag,
} from "lucide-react";

function ProfileContent() {
  const { user } = useAuth();
  const { savedListingIds } = useSavedListings();
  const { userListings, refreshUserListings } = useUserListings();
  const [dashboard, setDashboard] = useState<ProfileDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const myListings = useMemo(
    () => (user ? userListings.filter((listing) => listing.sellerId === user.id) : []),
    [user, userListings]
  );

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void getMyProfileDashboard(user.id, {
      marketplaceListings: myListings,
      savedListingCount: savedListingIds.length,
    }).then((data) => {
      if (cancelled) return;
      setDashboard(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user, myListings, savedListingIds.length]);

  const refreshDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    await refreshUserListings();
    const data = await getMyProfileDashboard(user.id, {
      marketplaceListings: userListings.filter((listing) => listing.sellerId === user.id),
      savedListingCount: savedListingIds.length,
    });
    setDashboard(data);
    setLoading(false);
  }, [user, userListings, savedListingIds.length, refreshUserListings]);

  if (!user) return null;

  const stats = [
    {
      icon: Package,
      label: "Active posts",
      value: dashboard?.stats.activePosts ?? myListings.filter((l) => l.status === "active").length,
      testId: "profile-stat-active-posts",
    },
    {
      icon: Heart,
      label: "Saved",
      value: savedListingIds.length,
      testId: "profile-stat-saved",
    },
    {
      icon: MessageCircle,
      label: "Conversations",
      value: dashboard?.stats.conversations ?? 0,
      testId: "profile-stat-conversations",
      href: "/messages",
    },
    {
      icon: Flag,
      label: "Reports submitted",
      value: dashboard?.stats.reportsSubmitted ?? 0,
      testId: "profile-stat-reports",
    },
  ];

  return (
    <AppShell>
      <div className="mb-4" data-testid="profile-dashboard">
        <DemoModeBadge />
      </div>

      <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Avatar
          initials={user.avatarInitials}
          size="lg"
          verified={user.isVerifiedStudent}
        />
        <div className="flex-1 text-center sm:text-left">
          <div className="mb-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            {user.isVerifiedStudent && (
              <Badge variant="success">
                <Shield className="mr-1 h-3 w-3" />
                Verified Student
              </Badge>
            )}
            {!user.hasCompletedOnboarding && (
              <Badge variant="warning">Complete your profile</Badge>
            )}
          </div>
          <p className="text-sm text-muted">
            {user.major} · {user.year}
          </p>
          <p className="mt-1 text-xs text-muted">{user.email}</p>
          {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-3 w-3" />
              {user.campusArea}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              Joined {formatDate(user.joinedAt)}
            </Badge>
          </div>
          {user.interests.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {user.interests.map((interest) => (
                <Badge key={interest} variant="secondary">
                  {interest}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="text-center" data-testid={stat.testId}>
            <CardContent className="py-4">
              <stat.icon className="mx-auto mb-2 h-5 w-5 text-gold" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted">{stat.label}</p>
              {stat.href && (
                <Link href={stat.href} className="mt-1 block text-[10px] text-gold">
                  Open messages
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ProfileQuickActions />
      <MyPostsHub dashboard={dashboard} loading={loading} onRefresh={refreshDashboard} />
      <ProfileAccountSection />
    </AppShell>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
