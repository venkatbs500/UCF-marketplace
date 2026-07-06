"use client";

import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getBrowseEmptyStateCopy, type BrowseEmptyStateCopy } from "@/lib/browse-utils";

type BrowseEmptyStateProps = BrowseEmptyStateCopy & {
  icon: LucideIcon;
  createAction?: React.ReactNode;
  onReset?: () => void;
  testId?: string;
};

export function BrowseEmptyState({
  icon,
  createAction,
  onReset,
  testId = "browse-empty-state",
  ...copy
}: BrowseEmptyStateProps) {
  const { title, description, isFilterMismatch } = getBrowseEmptyStateCopy(copy);

  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      testId={testId}
      action={
        <div className="flex flex-wrap justify-center gap-2">
          {isFilterMismatch && onReset && (
            <Button variant="secondary" onClick={onReset} data-testid="browse-empty-reset">
              Reset filters
            </Button>
          )}
          {!isFilterMismatch && createAction}
          {isFilterMismatch && createAction}
        </div>
      }
    />
  );
}
