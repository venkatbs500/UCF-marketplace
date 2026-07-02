"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabaseEnv } from "./config";

let client: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (!hasSupabaseEnv) return null;
  if (client) return client;

  client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
