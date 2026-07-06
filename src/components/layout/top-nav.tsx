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
  Menu,
  X,
  LayoutGrid,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { APP_NAME, NAV_ITEMS, PRIMARY_NAV, SECONDARY_NAV } from "@/lib/constants";
import { AuthNavActions } from "@/components/auth/user-menu";
import { TrustBanner } from "@/components/layout/trust-banner";
import { UnreadBadge } from "@/components/ui/unread-badge";
import { useUnreadMessages } from "@/components/providers/unread-messages-provider";

export { TrustBanner };

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

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unreadCount } = useUnreadMessages();

  return (
    <header className="sticky top-0 z-50 hidden border-b border-white/10 bg-background/80 backdrop-blur-xl md:block">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 lg:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gold-gradient">
            <span className="text-sm font-black text-black">KM</span>
          </div>
          <span className="text-lg font-bold">{APP_NAME}</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex xl:gap-1">
          {PRIMARY_NAV.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const active = isNavActive(pathname, item.href);
            const shortLabel = "shortLabel" in item ? item.shortLabel : item.label;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`top-nav-${item.href.replace(/^\//, "")}`}
                className={cn(
                  "flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-medium transition-colors lg:px-2.5 xl:gap-1.5 xl:px-3",
                  active
                    ? "bg-gold/20 text-gold"
                    : "text-muted hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden xl:inline">{item.label}</span>
                <span className="xl:hidden">{shortLabel}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {SECONDARY_NAV.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const active = isNavActive(pathname, item.href);
            const isMessages = item.href === "/messages";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                  active
                    ? "bg-gold/20 text-gold"
                    : "text-muted hover:bg-white/5 hover:text-foreground"
                )}
                title={item.label}
                aria-label={
                  isMessages && unreadCount > 0
                    ? `${item.label}, ${unreadCount} unread`
                    : item.label
                }
              >
                <Icon className="h-5 w-5" />
                {isMessages && (
                  <UnreadBadge
                    count={unreadCount}
                    className="absolute -right-0.5 -top-0.5"
                  />
                )}
              </Link>
            );
          })}
          <AuthNavActions />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-white/5 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-white/10 px-4 py-3 lg:hidden">
          <div className="flex flex-wrap gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap];
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                    active ? "bg-gold/20 text-gold" : "glass-card"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
