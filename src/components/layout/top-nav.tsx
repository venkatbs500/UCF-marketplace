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
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { APP_NAME, NAV_ITEMS, SECONDARY_NAV } from "@/lib/constants";
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
};

export function TopNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unreadCount } = useUnreadMessages();

  return (
    <header className="sticky top-0 z-50 hidden border-b border-white/10 bg-background/80 backdrop-blur-xl md:block">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gold-gradient">
            <span className="text-sm font-black text-black">KM</span>
          </div>
          <span className="text-lg font-bold">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.slice(1, 6).map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-gold/20 text-gold"
                    : "text-muted hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {SECONDARY_NAV.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const active = pathname === item.href;
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
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-white/5 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
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
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-xl glass-card px-3 py-2 text-sm"
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
