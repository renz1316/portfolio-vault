"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(
  role: "student" | "admin",
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const id = Number(String(formData.get("id") ?? "").trim());
  const password = String(formData.get("password") ?? "");
  if (!Number.isInteger(id) || id <= 0 || !password) return "Enter your ID (numbers only) and password.";

  const supabase = await createClient();
  const { data: email } = await supabase.rpc("login_email", { p_role: role, p_id: id });
  if (!email) return "Incorrect ID or password.";

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return "Incorrect ID or password.";

  redirect(role === "student" ? "/student" : "/admin");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
