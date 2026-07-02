import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (!hasSupabaseEnv) {
    return NextResponse.redirect(`${origin}/sign-in?error=callback`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[auth/callback] Session exchange failed:", error.message);
      }
      return NextResponse.redirect(`${origin}/sign-in?error=callback`);
    }

    return NextResponse.redirect(`${origin}/auth/post-login`);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      const message = error instanceof Error ? error.message : "Unknown callback error";
      console.error("[auth/callback] Unexpected error:", message);
    }
    return NextResponse.redirect(`${origin}/sign-in?error=callback`);
  }
}
