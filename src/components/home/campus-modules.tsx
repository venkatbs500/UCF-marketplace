"use client";

import Link from "next/link";
import {
  Store,
  Building2,
  GraduationCap,
  Briefcase,
  Calendar,
  Sparkles,
  Search,
  Tag,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { isDemoDataEnabled } from "@/lib/product-mode";
import { cn } from "@/lib/utils";

const modules = [
  {
    href: "/marketplace",
    icon: Store,
    title: "Marketplace",
    description: "Buy & sell textbooks, furniture, electronics, and more",
    demoStat: "240+ listings",
    realStat: "Open for student posts",
    cta: "Browse listings",
    isLive: true,
  },
  {
    href: "/housing",
    icon: Building2,
    title: "Housing",
    description: "Subleases, roommates, and apartment reviews",
    demoStat: "85 active posts",
    realStat: "Browse housing posts",
    cta: "Browse housing",
    isLive: true,
  },
  {
    href: "/tutoring",
    icon: GraduationCap,
    title: "Tutoring",
    description: "Book verified student tutors by subject",
    demoStat: "40+ tutors",
    realStat: "Find student tutors",
    cta: "Find tutors",
    isLive: true,
  },
  {
    href: "/jobs",
    icon: Briefcase,
    title: "Campus Jobs",
    description: "Gigs, part-time, research, and freelance",
    demoStat: "30 open roles",
    realStat: "Browse jobs and gigs",
    cta: "Browse jobs",
    isLive: true,
  },
  {
    href: "/events",
    icon: Calendar,
    title: "Events",
    description: "Hackathons, career fairs, club events, sports",
    demoStat: "15 this month",
    realStat: "Discover campus events",
    cta: "Discover events",
    isLive: true,
  },
  {
    href: "/lost-found",
    icon: Search,
    title: "Lost & Found",
    description: "Report and recover lost items on campus",
    demoStat: "12 active reports",
    realStat: "Report or recover items",
    cta: "Browse items",
    isLive: true,
  },
  {
    href: "/discounts",
    icon: Tag,
    title: "Student Deals",
    description: "Student-shared promos and local offers",
    demoStat: "20+ deals",
    realStat: "Browse student discounts",
    cta: "Browse deals",
    isLive: true,
  },
  {
    href: "/ai",
    icon: Sparkles,
    title: "AI Study Tools",
    description: "Flashcards, summaries, math help, and more",
    demoStat: "6 tools",
    realStat: "Coming soon",
    cta: "Preview tools",
    isLive: false,
  },
];

function moduleTestId(href: string): string {
  return `module-card-${href.replace(/^\//, "").replace(/\//g, "-")}`;
}

export function CampusModules() {
  const demoEnabled = isDemoDataEnabled();

  return (
    <section>
      <div className="mb-6 space-y-2">
        <h2 className="text-2xl font-bold">Everything Campus Life</h2>
        <p className="text-sm text-muted">
          One app for everything you need as a student
        </p>
        <DemoModeBadge />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((mod) => {
          const showLive = mod.isLive || demoEnabled;
          const statLabel = demoEnabled ? mod.demoStat : mod.realStat;

          return (
            <Link key={mod.href} href={mod.href} data-testid={moduleTestId(mod.href)}>
              <Card
                hover={showLive}
                className={cn(
                  "group flex h-full flex-col transition-all",
                  showLive
                    ? "border-white/10 hover:border-gold/30"
                    : "border-white/5 bg-white/[0.02] opacity-90"
                )}
              >
                <mod.icon
                  className={cn(
                    "mb-3 h-6 w-6",
                    showLive ? "text-gold" : "text-muted"
                  )}
                />
                <h3 className="mb-1 font-semibold">{mod.title}</h3>
                <p className="mb-3 flex-1 text-xs text-muted">{mod.description}</p>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      showLive ? "text-gold" : "text-muted"
                    )}
                  >
                    {statLabel}
                  </span>
                  {showLive && (
                    <span className="flex items-center gap-1 text-xs font-medium text-gold opacity-0 transition-opacity group-hover:opacity-100">
                      {mod.cta}
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
