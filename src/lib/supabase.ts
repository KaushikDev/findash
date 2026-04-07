import { createBrowserClient } from "@supabase/ssr";

const dbURL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const dbAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(dbURL, dbAnonKey);
