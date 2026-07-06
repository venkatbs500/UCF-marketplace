"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { completeAuthCallback, getPostLoginDestination } from "@/lib/auth-callback-client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { AUTH_MODE, hasSupabaseEnv } from "@/lib/supabase/config";

/**
 * Handles legacy magic links that land on /sign-in with hash tokens or errors.
 * Server routes cannot read URL hash fragments.
 */
export function SignInHashHandler() {
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current || AUTH_MODE !== "supabase" || !hasSupabaseEnv) return;
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (!hash || hash.length <= 1) return;

    const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const hasAuthPayload =
      hashParams.has("access_token") ||
      hashParams.has("refresh_token") ||
      hashParams.has("error");

    if (!hasAuthPayload) return;

    handled.current = true;

    async function run() {
      const client = getSupabaseBrowserClient();
      if (!client) {
        router.replace("/sign-in?error=magic_link_exchange_failed");
        return;
      }

      const result = await completeAuthCallback(client);
      router.replace(getPostLoginDestination(result));
    }

    void run();
  }, [router]);

  return null;
}
