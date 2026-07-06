"use client";

import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string; testId?: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto scrollbar-hide pb-1", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          data-testid={tab.testId}
          className={cn(
            "shrink-0 rounded-2xl px-4 py-2 text-sm font-medium transition-all",
            activeTab === tab.id
              ? "gold-gradient text-black shadow-lg shadow-gold/20"
              : "glass-card text-muted hover:text-foreground hover:bg-white/10"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
