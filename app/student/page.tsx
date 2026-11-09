import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/pv-shell";
import { AppBar } from "@/components/pv-appbar";
import { StorageCard } from "@/components/pv-storage-card";
import { FileRow } from "@/components/pv-file-row";
import { PrimaryLink } from "@/components/pv-button";
import { fmtSize, fmtWhen, initials } from "@/lib/pv-format";

type Version = { version_number: number; file_size_kb: number; synced_at: string; sync_status: string };

export default function StudentDashboard() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-600">Loading...</p>}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const supabase = await createClient();
  const { data: student } = await supabase.from("student").select("full_name, storage_limit_mb").maybeSingle();
  if (!student) redirect("/");

  const { data: files } = await supabase
    .from("portfolio_file")
    .select("file_id, file_name, file_version(version_number, file_size_kb, synced_at, sync_status)");

  const rows = (files ?? [])
    .map((f) => {
      const vs = [...(f.file_version as Version[])].sort((a, b) => b.version_number - a.version_number);
      return { id: f.file_id as number, name: f.file_name as string, latest: vs[0], total: vs.reduce((s, v) => s + v.file_size_kb, 0) };
    })
    .filter((r) => r.latest)
    .sort((a, b) => +new Date(b.latest.synced_at) - +new Date(a.latest.synced_at));

  const usedKb = rows.reduce((s, r) => s + r.total, 0);
  const limitKb = student.storage_limit_mb * 1024;

  return (
    <Shell wide>
      <AppBar initials={initials(student.full_name)} />
      <div className="flex flex-1 flex-col gap-6 px-5 pb-6 pt-6">
        <div>
          <h1 className="text-3xl font-bold leading-tight">Welcome back, {student.full_name}</h1>
          <p className="mt-1 text-sm text-slate-600">Your work, safe and up to date.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <StorageCard title="Your storage" usedKb={usedKb} limitKb={limitKb}
            note={`${fmtSize(Math.max(0, limitKb - usedKb))} available for your next big idea.`} />
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-base font-semibold">Recent files</h2>
              <span className="text-xs text-slate-600">{rows.length} {rows.length === 1 ? "file" : "files"}</span>
            </div>
            {rows.length ? (
              <ul className="space-y-3">
                {rows.slice(0, 5).map((r) => (
                  <FileRow key={r.id} href={`/student/files/${r.id}`} name={r.name} status={r.latest.sync_status}
                    meta={`${fmtSize(r.latest.file_size_kb)} · ${fmtWhen(r.latest.synced_at)}`} />
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl bg-[#E3E8EF] p-4 text-sm text-slate-600">No files yet. Upload your first file to back it up.</p>
            )}
          </section>
        </div>
        <PrimaryLink href="/student/upload" className="mt-auto">Upload File</PrimaryLink>
      </div>
    </Shell>
  );
}
