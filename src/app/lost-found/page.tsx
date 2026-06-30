"use client";

import { useState } from "react";
import { Plus, Shield } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { FilterChips } from "@/components/ui/filter-chips";
import { LostFoundCard } from "@/components/lost-found/lost-found-card";
import { lostFoundItems } from "@/lib/mock-data";
import { LOST_FOUND_CATEGORIES } from "@/lib/constants";
import type { LostFoundCategory } from "@/lib/types";

export default function LostFoundPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [category, setCategory] = useState<LostFoundCategory | "all">("all");

  const filtered = lostFoundItems.filter((item) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "lost" && item.status === "lost") ||
      (activeTab === "found" && item.status === "found");
    const matchesCategory = category === "all" || item.category === category;
    return matchesTab && matchesCategory;
  });

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          title="Lost & Found"
          subtitle="Help fellow students recover lost items on campus"
        />
        <Button>
          <Plus className="h-4 w-4" />
          Report Lost Item
        </Button>
      </div>

      <div className="mb-6 rounded-2xl border border-gold/20 bg-gold/5 p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <div>
            <p className="text-sm font-medium">Safety & Trust</p>
            <p className="text-xs text-muted">
              Always meet in public campus locations. Verify identity before
              returning items like IDs. Report suspicious activity to campus
              security. Knight Market moderates all lost & found posts.
            </p>
          </div>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: "all", label: "All" },
          { id: "lost", label: "Lost Items" },
          { id: "found", label: "Found Items" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-4"
      />

      <FilterChips
        options={LOST_FOUND_CATEGORIES}
        value={category}
        onChange={setCategory}
        allLabel="All Categories"
        size="sm"
        className="mb-6"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <LostFoundCard key={item.id} item={item} />
        ))}
      </div>
    </AppShell>
  );
}
