import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { one } from "@/lib/pv-format";

export async function GET(_req: Request, { params }: { params: Promise<{ versionId: string }> }) {
  const { versionId } = await params;
  const supabase = await createClient();
  const { data: v } = await supabase.from("file_version")
    .select("storage_path, portfolio_file(file_name)").eq("version_id", Number(versionId)).maybeSingle();
  if (!v) return NextResponse.json({ error: "Version not found" }, { status: 404 });
  const pf = one(v.portfolio_file as { file_name: string } | { file_name: string }[] | null);
  const { data, error } = await supabase.storage.from("portfolio-files")
    .createSignedUrl(v.storage_path, 60, { download: pf?.file_name ?? true });
  if (error || !data) return NextResponse.json({ error: "This file is not in storage" }, { status: 404 });
  return NextResponse.redirect(data.signedUrl);
}
