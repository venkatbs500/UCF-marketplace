"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Store,
  Building2,
  GraduationCap,
  Briefcase,
  Calendar,
  Sparkles,
  Search,
  Tag,
  MessageCircle,
  PlusCircle,
  User,
  LogIn,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { AUTH_ROUTES } from "@/lib/auth";

const mobileNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/marketplace", label: "Shop", icon: Store },
  { href: "/sell", label: "Sell", icon: PlusCircle, authRequired: true },
  { href: "/messages", label: "Chat", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User, authRequired: true },
];

const moreItems = [
  { href: "/housing", label: "Housing", icon: Building2 },
  { href: "/tutoring", label: "Tutoring", icon: GraduationCap },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/ai", label: "AI", icon: Sparkles },
  { href: "/lost-found", label: "Lost & Found", icon: Search },
  { href: "/discounts", label: "Deals", icon: Tag },
];

export function MobileNav() {
  const pathname = usePathname();
  const { isLoading, isAuthenticated } = useAuth();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/90 backdrop-blur-xl md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          const active = pathname === item.href;
          const href =
            !isLoading && item.authRequired && !isAuthenticated
              ? AUTH_ROUTES.signIn
              : item.href;
          const Icon =
            !isLoading && item.authRequired && !isAuthenticated
              ? LogIn
              : item.icon;
          const label =
            !isLoading && item.authRequired && !isAuthenticated
              ? "Sign In"
              : item.label;

          return (
            <Link
              key={item.href}
              href={href}
              aria-label={`${item.label} tab`}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors",
                active ? "text-gold" : "text-muted"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-gold")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isLoading, isAuthenticated, hasCompletedOnboarding } = useAuth();

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="sticky top-24 space-y-1">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Explore
        </p>
        {moreItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-gold/20 text-gold"
                  : "text-muted hover:bg-white/5 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <div className="mt-6 border-t border-white/10 pt-4">
          {!isLoading && isAuthenticated ? (
            <div className="px-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Account
              </p>
              <Link
                href="/saved"
                className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-white/5 hover:text-foreground"
              >
                <Heart className="h-4 w-4" />
                Saved
              </Link>
              <Link
                href="/profile"
                className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-white/5 hover:text-foreground"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              {!hasCompletedOnboarding && (
                <Link
                  href={AUTH_ROUTES.onboarding}
                  className="mt-1 flex items-center gap-3 rounded-xl bg-gold/10 px-3 py-2.5 text-sm font-medium text-gold"
                >
                  Complete onboarding
                </Link>
              )}
            </div>
          ) : !isLoading ? (
            <Link
              href={AUTH_ROUTES.signIn}
              className="mx-3 flex items-center justify-center gap-2 rounded-xl gold-gradient px-4 py-2.5 text-sm font-medium text-black"
            >
              <LogIn className="h-4 w-4" />
              Join Knight Market
            </Link>
          ) : null}
        </div>
      </nav>
    </aside>
  );
}
