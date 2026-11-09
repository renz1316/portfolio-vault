import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/pv-shell";
import { UploadForm } from "@/components/pv-upload-form";

export default function UploadPage() {
  return (
    <Shell>
      <Suspense fallback={<p className="p-6 text-sm text-slate-600">Loading...</p>}>
        <Content />
      </Suspense>
    </Shell>
  );
}

async function Content() {
  const supabase = await createClient();
  const { data: student } = await supabase.from("student").select("storage_limit_mb").maybeSingle();
  if (!student) redirect("/");
  const { data: files } = await supabase.from("portfolio_file").select("file_version(file_size_kb)");
  const usedKb = (files ?? []).reduce((s, f) => s + (f.file_version as { file_size_kb: number }[]).reduce((t, v) => t + v.file_size_kb, 0), 0);
  return <UploadForm remainingKb={Math.max(0, student.storage_limit_mb * 1024 - usedKb)} />;
}
