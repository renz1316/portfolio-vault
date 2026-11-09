"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("system_administrator").select("admin_id").maybeSingle();
  return { supabase, adminId: data?.admin_id as number | undefined };
}

// Returns "ok" or an error message.
export async function addStudent(fd: FormData): Promise<string> {
  const { supabase, adminId } = await requireAdmin();
  if (!adminId) return "Only administrators can add students.";

  const id = Number(fd.get("id"));
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const program = String(fd.get("program") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  const limit = Number(fd.get("limit") || 500);

  if (!Number.isInteger(id) || id <= 0 || !name || !email || !program) return "Fill in every field (Student ID is numbers only).";
  if (name.length > 40 || email.length > 40 || program.length > 40) return "Name, email and program must be 40 characters or fewer.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!Number.isInteger(limit) || limit < 1) return "Storage limit must be a whole number of MB.";

  const admin = createAdminClient();
  const { data: created, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !created.user) return error?.message ?? "Could not create the login.";

  const { error: e2 } = await supabase.from("student").insert({
    student_id: id, auth_user_id: created.user.id, full_name: name, email, program,
    storage_limit_mb: limit, managed_by: adminId,
  });
  if (e2) {
    await admin.auth.admin.deleteUser(created.user.id); // undo the login so nothing is left half-created
    return e2.code === "23505" ? "That Student ID or email already exists." : "Could not save the student.";
  }
  revalidatePath("/admin/students");
  return "ok";
}

export async function setLimit(studentId: number, fd: FormData): Promise<string> {
  const { supabase, adminId } = await requireAdmin();
  if (!adminId) return "Only administrators can change limits.";
  const mb = Number(fd.get("limit"));
  if (!Number.isInteger(mb) || mb < 1) return "Enter a whole number of MB.";
  const { error } = await supabase.from("student").update({ storage_limit_mb: mb }).eq("student_id", studentId);
  if (error) return "Could not save.";
  revalidatePath("/admin/students");
  return "ok";
}
