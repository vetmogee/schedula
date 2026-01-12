import { createClient } from "@supabase/supabase-js"

// Server-side Supabase client.
// Uses the ANON key – keep the SERVICE_ROLE key out of application code.
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)
