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
  LayoutGrid,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { useUnreadMessages } from "@/components/providers/unread-messages-provider";
import { UnreadBadge } from "@/components/ui/unread-badge";
import { AUTH_ROUTES } from "@/lib/auth";
import { EXPLORE_NAV } from "@/lib/constants";

const iconMap = {
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
  LayoutGrid,
};

const mobileNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/marketplace", label: "Shop", icon: Store },
  { type: "more" as const, label: "More", icon: LayoutGrid },
  { href: "/sell", label: "Sell", icon: PlusCircle, authRequired: true },
  { href: "/messages", label: "Chat", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User, authRequired: true },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isExploreActive(pathname: string): boolean {
  return EXPLORE_NAV.some((item) => isNavActive(pathname, item.href));
}

export function MobileNav() {
  const pathname = usePathname();
  const { isLoading, isAuthenticated } = useAuth();
  const { unreadCount } = useUnreadMessages();
  const [exploreOpen, setExploreOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/90 backdrop-blur-xl md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around px-1 py-2">
          {mobileNavItems.map((item) => {
            if (item.type === "more") {
              const active = isExploreActive(pathname);
              return (
                <button
                  key="more"
                  type="button"
                  data-testid="mobile-nav-more"
                  aria-label="More campus modules"
                  onClick={() => setExploreOpen(true)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
                    active ? "text-gold" : "text-muted"
                  )}
                >
                  <LayoutGrid className={cn("h-5 w-5", active && "text-gold")} />
                  More
                </button>
              );
            }

            const active = isNavActive(pathname, item.href);
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
                aria-label={
                  item.href === "/messages" && unreadCount > 0
                    ? `${item.label} tab, ${unreadCount} unread`
                    : `${item.label} tab`
                }
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
                  active ? "text-gold" : "text-muted"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-gold")} />
                {item.href === "/messages" && (
                  <UnreadBadge
                    count={unreadCount}
                    className="absolute right-0 top-0"
                  />
                )}
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {exploreOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 md:hidden"
          role="presentation"
          onClick={() => setExploreOpen(false)}
        />
      )}

      {exploreOpen && (
        <div
          className="fixed inset-x-0 bottom-0 z-[70] rounded-t-3xl border-t border-white/10 bg-background p-4 pb-24 md:hidden"
          role="dialog"
          aria-label="Explore campus modules"
          data-testid="mobile-explore-menu"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Explore</h2>
            <button
              type="button"
              onClick={() => setExploreOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-white/5"
              aria-label="Close explore menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EXPLORE_NAV.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap];
              const active = isNavActive(pathname, item.href);
              const comingSoon = "comingSoon" in item && item.comingSoon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setExploreOpen(false)}
                  data-testid={`mobile-explore-${item.href.replace(/^\//, "")}`}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "border-gold/30 bg-gold/10 text-gold"
                      : comingSoon
                        ? "border-white/5 bg-white/[0.02] text-muted"
                        : "border-white/10 hover:border-gold/20 hover:bg-white/5"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex flex-col items-start">
                    <span>{item.label}</span>
                    {comingSoon && (
                      <span className="text-[10px] font-normal text-muted">Coming soon</span>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
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
        {EXPLORE_NAV.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const active = isNavActive(pathname, item.href);
          const comingSoon = "comingSoon" in item && item.comingSoon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-gold/20 text-gold"
                  : comingSoon
                    ? "text-muted hover:bg-white/5"
                    : "text-muted hover:bg-white/5 hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {comingSoon && (
                <span className="text-[10px] font-normal text-muted">Soon</span>
              )}
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
