import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Flag, UserCheck, Search, Lock } from "lucide-react";

const reportedListings = [
  {
    id: "r1",
    title: "Suspicious iPhone listing — price too low",
    reporter: "Anonymous",
    status: "pending",
    date: "2025-06-26",
  },
  {
    id: "r2",
    title: "Duplicate textbook listing spam",
    reporter: "@jordank",
    status: "reviewing",
    date: "2025-06-25",
  },
];

const reportedReviews = [
  {
    id: "rv1",
    content: "Fake 5-star review on new account",
    target: "listing-4",
    status: "pending",
    date: "2025-06-24",
  },
];

const lostFoundQueue = [
  {
    id: "lfq1",
    title: "UCF Student ID found at RWC",
    status: "pending approval",
    date: "2025-06-26",
  },
];

const verificationQueue = [
  {
    id: "vq1",
    name: "Chris Williams",
    email: "cwilliams@ucf.edu",
    status: "pending",
    date: "2025-06-27",
  },
  {
    id: "vq2",
    name: "New User",
    email: "student@ucf.edu",
    status: "pending",
    date: "2025-06-26",
  },
];

export function AdminDashboard() {
  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-gold" />
        <Badge variant="warning">Admin Preview — Not Connected</Badge>
      </div>

      <SectionHeading
        title="Moderation Dashboard"
        subtitle="Review reports, approvals, and verification queue"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Reported Listings", value: 2, icon: Flag },
          { label: "Reported Reviews", value: 1, icon: AlertTriangle },
          { label: "Lost/Found Queue", value: 1, icon: Search },
          { label: "Verification Queue", value: 2, icon: UserCheck },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
                <stat.icon className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Flag className="h-4 w-4 text-gold" />
            Reported Listings
          </h3>
          <div className="space-y-3">
            {reportedListings.map((item) => (
              <Card key={item.id}>
                <CardContent className="py-4">
                  <p className="mb-1 font-medium text-sm">{item.title}</p>
                  <p className="mb-3 text-xs text-muted">
                    Reported by {item.reporter} · {item.date}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                    <Button size="sm" variant="destructive">
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 text-gold" />
            Reported Reviews
          </h3>
          <div className="space-y-3">
            {reportedReviews.map((item) => (
              <Card key={item.id}>
                <CardContent className="py-4">
                  <p className="mb-1 font-medium text-sm">{item.content}</p>
                  <p className="mb-3 text-xs text-muted">
                    Target: {item.target} · {item.date}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                    <Button size="sm" variant="destructive">
                      Delete Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Search className="h-4 w-4 text-gold" />
            Lost & Found Approvals
          </h3>
          <div className="space-y-3">
            {lostFoundQueue.map((item) => (
              <Card key={item.id}>
                <CardContent className="py-4">
                  <p className="mb-1 font-medium text-sm">{item.title}</p>
                  <Badge variant="warning" className="mb-3">
                    {item.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm">Approve</Button>
                    <Button size="sm" variant="secondary">
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <UserCheck className="h-4 w-4 text-gold" />
            User Verification Queue
          </h3>
          <div className="space-y-3">
            {verificationQueue.map((item) => (
              <Card key={item.id}>
                <CardContent className="py-4">
                  <p className="mb-1 font-medium text-sm">{item.name}</p>
                  <p className="mb-1 text-xs text-muted">{item.email}</p>
                  <Badge variant="warning" className="mb-3">
                    {item.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm">Verify</Button>
                    <Button size="sm" variant="destructive">
                      Deny
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export function AdminLockedState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl glass-card p-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10">
        <Lock className="h-8 w-8 text-gold" />
      </div>
      <h2 className="mb-2 text-2xl font-bold">Admin Access Required</h2>
      <p className="mb-6 max-w-md text-sm text-muted">
        This area is restricted to Knight Market administrators. For demo access,
        sign in with a UCF email containing &quot;admin&quot; (e.g.{" "}
        <span className="text-gold">admin@ucf.edu</span>).
      </p>
      <Badge variant="warning">Mock admin gate — not connected to real roles</Badge>
    </div>
  );
}
