"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Users,
  GraduationCap,
  Search,
  Tag,
  Sparkles,
  ArrowRight,
  Briefcase,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { isDemoDataEnabled } from "@/lib/product-mode";

const demoPreviewCards = [
  {
    icon: ShoppingBag,
    title: "Used Desk — $45",
    subtitle: "Libra · Like New",
    color: "from-blue-500/20 to-blue-600/10",
  },
  {
    icon: Users,
    title: "Roommate Match — 94%",
    subtitle: "Mia · Near Campus",
    color: "from-purple-500/20 to-purple-600/10",
  },
  {
    icon: GraduationCap,
    title: "Calc Tutor — $25/hr",
    subtitle: "Sam · 4.9★ · 120 sessions",
    color: "from-green-500/20 to-green-600/10",
  },
  {
    icon: Search,
    title: "Lost ID Alert",
    subtitle: "Found at RWC Gym",
    color: "from-orange-500/20 to-orange-600/10",
  },
  {
    icon: Tag,
    title: "15% Off Coffee",
    subtitle: "Black Rock · Verified Deal",
    color: "from-pink-500/20 to-pink-600/10",
  },
  {
    icon: Sparkles,
    title: "AI Flashcards",
    subtitle: "2,890 students used this",
    color: "from-gold/20 to-gold/10",
  },
];

const realPreviewCards = [
  {
    icon: ShoppingBag,
    title: "Student Marketplace",
    subtitle: "Ready for real student posts",
    color: "from-blue-500/20 to-blue-600/10",
  },
  {
    icon: Users,
    title: "Housing",
    subtitle: "Coming soon",
    color: "from-purple-500/20 to-purple-600/10",
  },
  {
    icon: GraduationCap,
    title: "Tutoring",
    subtitle: "Coming soon",
    color: "from-green-500/20 to-green-600/10",
  },
  {
    icon: Briefcase,
    title: "Campus Jobs",
    subtitle: "Coming soon",
    color: "from-orange-500/20 to-orange-600/10",
  },
  {
    icon: Calendar,
    title: "Events",
    subtitle: "Coming soon",
    color: "from-pink-500/20 to-pink-600/10",
  },
  {
    icon: Sparkles,
    title: "AI Study Tools",
    subtitle: "Planned — not connected yet",
    color: "from-gold/20 to-gold/10",
  },
];

export function HeroSection() {
  const demoEnabled = isDemoDataEnabled();
  const previewCards = demoEnabled ? demoPreviewCards : realPreviewCards;

  return (
    <section className="relative overflow-hidden rounded-3xl glass-card p-8 md:p-12 lg:p-16">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-gold/5 blur-3xl" />

      <div className="relative mb-4">
        <DemoModeBadge />
      </div>

      <div className="relative grid gap-10 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="default" className="mb-4">
            Verified Student Hub
          </Badge>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            The campus app{" "}
            <span className="text-gold-gradient">UCF students</span> actually
            needed.
          </h1>
          <p className="mb-8 max-w-lg text-lg text-muted">
            Buy, sell, find roommates, book tutors, discover gigs, join events,
            use AI study tools, and unlock student deals — all inside one
            verified student hub.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/marketplace">
              <Button size="lg">
                Explore Marketplace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sell">
              <Button size="lg" variant="secondary">
                Post Something
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted">
            Sign in with your verified UCF student email to post and save listings.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          {previewCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`rounded-2xl bg-gradient-to-br ${card.color} border border-white/10 p-4 glass-card-hover`}
            >
              <card.icon className="mb-2 h-5 w-5 text-gold" />
              <p className="text-sm font-semibold">{card.title}</p>
              <p className="text-xs text-muted">{card.subtitle}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
