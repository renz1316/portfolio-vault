"use server";

import { createClient } from "@/lib/supabase/server";
import { validateUpload } from "@/lib/pv-upload-rules";

type Begin =
  | { ok: true; versionId: number; path: string }
  | { ok: false; kind: "invalid" | "error"; message: string };

type Ver = { file_size_kb: number; version_number: number };

export async function beginUpload(fileName: string, sizeKb: number, folder: string): Promise<Begin> {
  const supabase = await createClient();
  const { data: student } = await supabase.from("student").select("student_id, storage_limit_mb").maybeSingle();
  if (!student) return { ok: false, kind: "error", message: "Please sign in again." };

  // File type and size are checked here on the server, not only in the browser.
  if (!Number.isFinite(sizeKb) || sizeKb < 1) return { ok: false, kind: "invalid", message: "This file's size could not be read." };
  const badFile = validateUpload(fileName, sizeKb);
  if (badFile) return { ok: false, kind: "invalid", message: badFile };

  const name = fileName.slice(0, 150);
  const { data } = await supabase.from("portfolio_file").select("file_id, file_name, project_folder, file_version(file_size_kb, version_number)");
  const files = data ?? [];
  const usedKb = files.reduce((s, f) => s + (f.file_version as Ver[]).reduce((t, v) => t + v.file_size_kb, 0), 0);
  const limitKb = student.storage_limit_mb * 1024;
  // Storage limit is enforced here on the server, not only in the browser.
  const overLimit = validateUpload(fileName, sizeKb, limitKb - usedKb);
  if (overLimit) return { ok: false, kind: "invalid", message: overLimit };

  const existing = files.find((f) => f.file_name === name && f.project_folder === folder);
  let fileId = existing?.file_id as number | undefined;
  if (!fileId) {
    const { data: created, error } = await supabase
      .from("portfolio_file").insert({ student_id: student.student_id, file_name: name, project_folder: folder })
      .select("file_id").single();
    if (error || !created) return { ok: false, kind: "error", message: "We couldn't create the file record." };
    fileId = created.file_id;
  }
  const next = Math.max(0, ...((existing?.file_version as Ver[] | undefined) ?? []).map((v) => v.version_number)) + 1;
  const path = `${student.student_id}/${fileId}/v${next}/${name.replace(/[^\w.-]+/g, "_")}`;
  const { data: ver, error: e2 } = await supabase
    .from("file_version").insert({ file_id: fileId, version_number: next, file_size_kb: sizeKb, storage_path: path, sync_status: "PENDING" })
    .select("version_id").single();
  if (e2 || !ver) return { ok: false, kind: "error", message: "We couldn't create the version record." };
  return { ok: true, versionId: ver.version_id, path };
}

export async function finishUpload(versionId: number, ok: boolean): Promise<void> {
  const supabase = await createClient();
  await supabase.from("file_version")
    .update({ sync_status: ok ? "SUCCESS" : "FAILED", synced_at: new Date().toISOString() })
    .eq("version_id", versionId);
}
