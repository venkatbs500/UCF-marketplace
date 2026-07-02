import type { AuthService } from "./auth-service";
import { localAuthService } from "./local-auth-service";
import { supabaseAuthService } from "./supabase-auth-service";
import { AUTH_MODE } from "@/lib/supabase/config";

export const activeAuthService: AuthService =
  AUTH_MODE === "supabase" ? supabaseAuthService : localAuthService;
