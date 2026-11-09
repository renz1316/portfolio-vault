import { createClient } from "@supabase/supabase-js";

// Server-only. The secret key bypasses all security rules: never import this in a "use client" file.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
