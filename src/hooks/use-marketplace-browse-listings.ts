"use client";

import { useEffect, useState } from "react";
import type { Listing } from "@/lib/types";
import { getSupabaseListings } from "@/lib/services/supabase-marketplace-service";

export function useMarketplaceBrowseListings(options: {
  enabled: boolean;
  refreshKey?: number;
}) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(options.enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!options.enabled) return;

    let cancelled = false;

    void (async () => {
      setLoading(true);
      const result = await getSupabaseListings();
      if (cancelled) return;
      setListings(result.listings);
      setError(result.error ?? null);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [options.enabled, options.refreshKey]);

  if (!options.enabled) {
    return { listings: [], loading: false, error: null };
  }

  return { listings, loading, error };
}
