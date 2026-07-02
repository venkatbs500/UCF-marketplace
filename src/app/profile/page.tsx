"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { useAuth } from "@/components/providers/auth-provider";
import { useSavedListings } from "@/components/providers/saved-listings-provider";
import { useUserListings } from "@/components/providers/user-listings-provider";
import { reviews } from "@/lib/mock-data";
import { isDemoDataEnabled } from "@/lib/product-mode";
import { usesSupabaseMarketplace } from "@/lib/marketplace-mode";
import { formatDate } from "@/lib/utils";
import { Shield, Star, Package, Heart, Activity, MapPin, Calendar } from "lucide-react";
import { ProfileTabs } from "./profile-tabs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function ProfileContent() {
  const { user } = useAuth();
  const { savedListingIds } = useSavedListings();
  const { userListings, userListingsError, isLoading: listingsLoading } = useUserListings();
  const demoEnabled = isDemoDataEnabled();
  const supabaseMode = usesSupabaseMarketplace();

  if (!user) return null;

  const myPosted = userListings.filter((l) => l.sellerId === user.id);

  const stats = demoEnabled
    ? [
        { icon: Package, label: "Posted", value: myPosted.length },
        { icon: Heart, label: "Saved", value: savedListingIds.length },
        { icon: Star, label: "Reviews", value: reviews.length },
        { icon: Activity, label: "Active", value: 12 },
      ]
    : [
        { icon: Package, label: "Posted", value: myPosted.length },
        { icon: Heart, label: "Saved", value: savedListingIds.length },
      ];

  return (
    <AppShell>
      <div className="mb-4">
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
        <Card className="text-center">
          <CardContent className="px-6 py-4">
            <p className="text-3xl font-bold text-gold">{user.trustScore}</p>
            <p className="text-xs text-muted">Trust Score</p>
            <div className="mt-2 h-2 w-24 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full gold-gradient rounded-full"
                style={{ width: `${user.trustScore}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div
        className={`mb-8 grid gap-4 ${
          demoEnabled ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"
        }`}
      >
        {stats.map((stat) => (
          <Card key={stat.label} className="text-center">
            <CardContent className="py-4">
              <stat.icon className="mx-auto mb-2 h-5 w-5 text-gold" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">My Posted Listings</h2>
          <Link href="/sell">
            <Button size="sm" variant="outline">
              Post New
            </Button>
          </Link>
        </div>
        {userListingsError && (
          <p role="alert" className="mb-4 text-sm text-red-400">
            We could not load your listings. Please try again.
          </p>
        )}
        {listingsLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted">
              Loading your listings...
            </CardContent>
          </Card>
        ) : myPosted.length > 0 ? (
          <ListingGrid listings={myPosted} ownerActionVariant="profile" />
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="mb-4 text-sm text-muted">
                {supabaseMode
                  ? "You have not posted any listings yet."
                  : "No posted listings yet"}
              </p>
              <Link href="/sell">
                <Button>Post a listing</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>

      <ProfileTabs reviews={reviews} demoEnabled={demoEnabled} />
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
