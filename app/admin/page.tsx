import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/pv-shell";
import { AppBar } from "@/components/pv-appbar";
import { StorageCard } from "@/components/pv-storage-card";
import { FileRow } from "@/components/pv-file-row";
import { OutlineLink, PrimaryLink } from "@/components/pv-button";
import { fmtSize, fmtWhen, initials } from "@/lib/pv-format";

export default function AdminDashboard() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-600">Loading...</p>}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const supabase = await createClient();
  const { data: admin } = await supabase.from("system_administrator").select("full_name").maybeSingle();
  if (!admin) redirect("/");

  const [{ data: students }, { data: versions }] = await Promise.all([
    supabase.from("student").select("program, storage_limit_mb"),
    supabase.from("file_version").select("file_size_kb, synced_at, sync_status, portfolio_file(file_name)").order("synced_at", { ascending: false }),
  ]);
  const list = students ?? [];
  const vs = versions ?? [];
  const limitKb = list.reduce((s, x) => s + x.storage_limit_mb * 1024, 0);
  const usedKb = vs.reduce((s, v) => s + v.file_size_kb, 0);
  const programs = [...new Set(list.map((x) => x.program))];
  const title = `${programs.length === 1 ? programs[0] : "All programs"} (${list.length})`;
  const recent = vs.slice(0, 5);

  return (
    <Shell wide>
      <AppBar initials={initials(admin.full_name)} />
      <div className="flex flex-1 flex-col gap-6 px-5 pb-6 pt-6">
        <div>
          <h1 className="text-3xl font-bold leading-tight">Welcome back, Administrator</h1>
          <p className="mt-1 text-sm text-slate-600">Repository overview for today.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <StorageCard title={title} usedKb={usedKb} limitKb={limitKb}
            note={`${fmtSize(Math.max(0, limitKb - usedKb))} available across all student accounts.`} />
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-base font-semibold">Recently Synced files</h2>
              <span className="text-xs text-slate-600">{recent.length} {recent.length === 1 ? "file" : "files"}</span>
            </div>
            {recent.length ? (
              <ul className="space-y-3">
                {recent.map((v, i) => {
                  const pf = Array.isArray(v.portfolio_file) ? v.portfolio_file[0] : v.portfolio_file;
                  return (
                    <FileRow key={i} name={pf?.file_name ?? "Unknown file"} status={v.sync_status}
                      meta={`${fmtSize(v.file_size_kb)} · ${fmtWhen(v.synced_at)}`} />
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-2xl bg-[#E3E8EF] p-4 text-sm text-slate-600">No files have been synced yet.</p>
            )}
          </section>
        </div>
        <div className="mt-auto space-y-3">
          <PrimaryLink href="/admin/monitor">Monitor Repository</PrimaryLink>
          <OutlineLink href="/admin/students">Manage Students</OutlineLink>
        </div>
      </div>
    </Shell>
  );
}
