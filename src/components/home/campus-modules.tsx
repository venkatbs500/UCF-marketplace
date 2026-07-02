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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { isDemoDataEnabled } from "@/lib/product-mode";

const modules = [
  {
    href: "/marketplace",
    icon: Store,
    title: "Marketplace",
    description: "Buy & sell textbooks, furniture, electronics, and more",
    demoStat: "240+ listings",
    realStat: "Open for student posts",
  },
  {
    href: "/housing",
    icon: Building2,
    title: "Housing",
    description: "Subleases, roommates, and apartment reviews",
    demoStat: "85 active posts",
    realStat: "Coming soon",
  },
  {
    href: "/tutoring",
    icon: GraduationCap,
    title: "Tutoring",
    description: "Book verified student tutors by subject",
    demoStat: "40+ tutors",
    realStat: "Coming soon",
  },
  {
    href: "/jobs",
    icon: Briefcase,
    title: "Campus Jobs",
    description: "Gigs, part-time, research, and freelance",
    demoStat: "30 open roles",
    realStat: "Coming soon",
  },
  {
    href: "/events",
    icon: Calendar,
    title: "Events",
    description: "Hackathons, career fairs, club events, sports",
    demoStat: "15 this month",
    realStat: "Coming soon",
  },
  {
    href: "/ai",
    icon: Sparkles,
    title: "AI Study Tools",
    description: "Flashcards, summaries, math help, and more",
    demoStat: "6 tools",
    realStat: "Coming soon",
  },
  {
    href: "/lost-found",
    icon: Search,
    title: "Lost & Found",
    description: "Report and recover lost items on campus",
    demoStat: "12 active reports",
    realStat: "Coming soon",
  },
  {
    href: "/discounts",
    icon: Tag,
    title: "Student Deals",
    description: "Local discounts verified for students",
    demoStat: "20+ deals",
    realStat: "Coming soon",
  },
];

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
        {modules.map((mod) => (
          <Link key={mod.href} href={mod.href}>
            <Card hover className="h-full">
              <mod.icon className="mb-3 h-6 w-6 text-gold" />
              <h3 className="mb-1 font-semibold">{mod.title}</h3>
              <p className="mb-3 text-xs text-muted">{mod.description}</p>
              <span className="text-xs font-medium text-gold">
                {demoEnabled ? mod.demoStat : mod.realStat}
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
