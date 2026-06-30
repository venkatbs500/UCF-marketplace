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

const modules = [
  {
    href: "/marketplace",
    icon: Store,
    title: "Marketplace",
    description: "Buy & sell textbooks, furniture, electronics, and more",
    stat: "240+ listings",
  },
  {
    href: "/housing",
    icon: Building2,
    title: "Housing",
    description: "Subleases, roommates, and apartment reviews",
    stat: "85 active posts",
  },
  {
    href: "/tutoring",
    icon: GraduationCap,
    title: "Tutoring",
    description: "Book verified student tutors by subject",
    stat: "40+ tutors",
  },
  {
    href: "/jobs",
    icon: Briefcase,
    title: "Campus Jobs",
    description: "Gigs, part-time, research, and freelance",
    stat: "30 open roles",
  },
  {
    href: "/events",
    icon: Calendar,
    title: "Events",
    description: "Hackathons, career fairs, club events, sports",
    stat: "15 this month",
  },
  {
    href: "/ai",
    icon: Sparkles,
    title: "AI Study Tools",
    description: "Flashcards, summaries, math help, and more",
    stat: "6 tools",
  },
  {
    href: "/lost-found",
    icon: Search,
    title: "Lost & Found",
    description: "Report and recover lost items on campus",
    stat: "12 active reports",
  },
  {
    href: "/discounts",
    icon: Tag,
    title: "Student Deals",
    description: "Local discounts verified for students",
    stat: "20+ deals",
  },
];

export function CampusModules() {
  return (
    <section>
      <h2 className="mb-2 text-2xl font-bold">Everything Campus Life</h2>
      <p className="mb-6 text-sm text-muted">
        One app for everything you need as a student
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((mod) => (
          <Link key={mod.href} href={mod.href}>
            <Card hover className="h-full">
              <mod.icon className="mb-3 h-6 w-6 text-gold" />
              <h3 className="mb-1 font-semibold">{mod.title}</h3>
              <p className="mb-3 text-xs text-muted">{mod.description}</p>
              <span className="text-xs font-medium text-gold">{mod.stat}</span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
