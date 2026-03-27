import { createClient } from "@supabase/supabase-js";

const dbURL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const dbAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(dbURL, dbAnonKey);
