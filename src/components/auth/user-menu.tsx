"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogOut, User, Shield, Heart } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/5",
          open && "bg-white/5"
        )}
        aria-label="User menu"
      >
        <Avatar
          initials={user.avatarInitials}
          size="sm"
          verified={user.isVerifiedStudent}
        />
        <span className="hidden text-sm font-medium lg:inline">
          {user.name || user.email.split("@")[0]}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl glass-card border border-white/10 p-2 shadow-xl">
          <div className="border-b border-white/10 px-3 py-2">
            <p className="truncate text-sm font-medium">
              {user.name || "Knight"}
            </p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            {user.isVerifiedStudent && (
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-gold">
                <Shield className="h-3 w-3" />
                Verified Student
              </span>
            )}
          </div>
          <Link
            href="/saved"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-foreground"
          >
            <Heart className="h-4 w-4" />
            Saved Listings
          </Link>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-foreground"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export function AuthNavActions() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="h-10 w-24 animate-pulse rounded-xl bg-white/5" />
    );
  }

  if (isAuthenticated) {
    return <UserMenu />;
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/sign-in">
        <Button variant="ghost" size="sm">
          Sign In
        </Button>
      </Link>
      <Link href="/sign-in" className="hidden sm:block">
        <Button size="sm">Join Knight Market</Button>
      </Link>
    </div>
  );
}
