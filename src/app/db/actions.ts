"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";

async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch (error) {
            console.error("Failed to set cookies in server action", error);
          }
        },
      },
    },
  );
}

export async function createBudget(formData: FormData) {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Session expired, please login again");

  const name = formData.get("name") as string;
  const totalLimit = formData.get("totalLimit") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;

  if (!name || !totalLimit || !startDate || !endDate) {
    throw new Error("All fields are required to create a budget!");
  }

  const totalLimitInCents = Math.round(parseFloat(totalLimit) * 100);

  const { error } = await supabase.from("budgets").insert([
    {
      user_id: user.id,
      name,
      total_limit: totalLimitInCents,
      start_date: startDate,
      end_date: endDate,
    },
  ]);

  if (error) {
    console.log("Error occurred while creating budget!!", error);
    throw new Error("Failed to create budget in the database!!");
  }

  revalidatePath("/");
}
