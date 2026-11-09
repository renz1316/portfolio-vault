import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Download, FileText, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/pv-shell";
import { PageHeader } from "@/components/pv-header";
import { fmtDate, fmtSize, fmtTime } from "@/lib/pv-format";

type Ver = { version_id: number; version_number: number; file_size_kb: number; synced_at: string; sync_status: string };

export default function VersionHistory({ params }: { params: Promise<{ fileId: string }> }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-600">Loading...</p>}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  const supabase = await createClient();
  const { data: f } = await supabase.from("portfolio_file")
    .select("file_name, project_folder, file_version(version_id, version_number, file_size_kb, synced_at, sync_status)")
    .eq("file_id", Number(fileId)).maybeSingle();
  if (!f) redirect("/student");
  const versions = [...(f.file_version as Ver[])].sort((a, b) => b.version_number - a.version_number);

  return (
    <Shell>
      <div className="flex flex-1 flex-col bg-[#FBF8F5] pb-6">
        <PageHeader title="Version history" href="/student" />
        <div className="flex flex-1 flex-col px-5">
          <div className="mt-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EDE9E6] text-[#0A6CFF]"><FileText className="h-6 w-6" /></span>
            <div className="min-w-0">
              <p className="truncate font-bold">{f.file_name}</p>
              <p className="text-xs text-slate-600">{f.project_folder}</p>
            </div>
          </div>
          <div className="mb-3 mt-6 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Saved versions</h2>
            <span className="text-xs text-slate-600">Newest first</span>
          </div>
          <ul className="space-y-3">
            {versions.map((v, i) => (
              <li key={v.version_id} className="rounded-2xl bg-[#E3E8EF] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-base">Version {v.version_number}</span>
                  {i === 0 && <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Current</span>}
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-600">
                    <p className="text-sm font-medium text-slate-700">{fmtDate(v.synced_at)}</p>
                    {fmtTime(v.synced_at)} · {fmtSize(v.file_size_kb)}
                  </div>
                  {v.sync_status === "SUCCESS" ? (
                    <a href={`/api/download/${v.version_id}`} className="flex h-12 items-center gap-2 rounded-xl bg-[#0A6CFF] px-5 text-sm font-semibold text-white hover:bg-[#0858D6] active:bg-[#0646AA]">
                      <Download className="h-4 w-4" />Download
                    </a>
                  ) : (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">{v.sync_status}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-auto rounded-2xl bg-[#E3E8EF] p-4 pt-4 text-xs text-slate-600">
            <p>Download any version without changing your current file.</p>
            <p className="mt-2 flex items-center gap-2"><Lock className="h-3.5 w-3.5" />Every version is stored encrypted.</p>
          </div>
        </div>
      </div>
    </Shell>
  );
}
