import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zzwtajhzdjtwqeszswrp.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6d3Rhamh6ZGp0d3Flc3pzd3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzkwMDksImV4cCI6MjA4ODM1NTAwOX0.4tLWGSRhugqb4pIvfBgzsr67dT__q-QAJbFTYxHRDcE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
