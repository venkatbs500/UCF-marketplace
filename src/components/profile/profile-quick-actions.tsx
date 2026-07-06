import Link from "next/link";
import {
  Briefcase,
  Calendar,
  GraduationCap,
  Home,
  Package,
  Percent,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const QUICK_ACTIONS = [
  {
    id: "sell",
    label: "Sell item",
    href: "/sell",
    icon: Package,
    testId: "profile-quick-action-sell",
  },
  {
    id: "housing",
    label: "Post housing",
    href: "/housing/new",
    icon: Home,
    testId: "profile-quick-action-housing",
  },
  {
    id: "tutoring",
    label: "Become tutor",
    href: "/tutoring/new",
    icon: GraduationCap,
    testId: "profile-quick-action-tutoring",
  },
  {
    id: "lost-found",
    label: "Post lost/found",
    href: "/lost-found/new",
    icon: Search,
    testId: "profile-quick-action-lost-found",
  },
  {
    id: "jobs",
    label: "Post job",
    href: "/jobs/new",
    icon: Briefcase,
    testId: "profile-quick-action-jobs",
  },
  {
    id: "events",
    label: "Post event",
    href: "/events/new",
    icon: Calendar,
    testId: "profile-quick-action-events",
  },
  {
    id: "discounts",
    label: "Post discount",
    href: "/discounts/new",
    icon: Percent,
    testId: "profile-quick-action-discounts",
  },
] as const;

export function ProfileQuickActions() {
  return (
    <section className="mb-8" data-testid="profile-quick-actions">
      <h2 className="mb-3 text-lg font-semibold">Quick actions</h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.id} href={action.href} data-testid={action.testId}>
            <Button variant="secondary" className="h-auto w-full justify-start gap-2 py-3">
              <action.icon className="h-4 w-4 shrink-0 text-gold" />
              <span className="text-left text-sm">{action.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </section>
  );
}
