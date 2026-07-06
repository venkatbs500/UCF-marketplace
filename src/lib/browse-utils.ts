export function normalizeBrowseQuery(query: string | undefined): string {
  return query?.trim().toLowerCase() ?? "";
}

export function formatResultCount(
  count: number,
  singular: string,
  plural?: string
): string {
  const label = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${count} ${label} found`;
}

export function formatNoMatchMessage(moduleLabel: string): string {
  return `No ${moduleLabel} match your filters`;
}

export type BrowseEmptyStateCopy = {
  totalCount: number;
  filteredCount: number;
  filtersActive: boolean;
  moduleLabel: string;
  moduleLabelPlural: string;
  emptyAllTitle: string;
  emptyAllDescription: string;
  emptyFilterTitle?: string;
  emptyFilterDescription?: string;
};

export function getBrowseEmptyStateCopy({
  totalCount,
  filteredCount,
  filtersActive,
  moduleLabelPlural,
  emptyAllTitle,
  emptyAllDescription,
  emptyFilterTitle,
  emptyFilterDescription,
}: BrowseEmptyStateCopy): { title: string; description: string; isFilterMismatch: boolean } {
  const isFilterMismatch = filtersActive && totalCount > 0 && filteredCount === 0;
  if (isFilterMismatch) {
    return {
      title: emptyFilterTitle ?? formatNoMatchMessage(moduleLabelPlural),
      description:
        emptyFilterDescription ??
        `Try clearing search or changing your filters to see more ${moduleLabelPlural}.`,
      isFilterMismatch: true,
    };
  }
  return {
    title: emptyAllTitle,
    description: emptyAllDescription,
    isFilterMismatch: false,
  };
}
