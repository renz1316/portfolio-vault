import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/pv-shell";
import { AppBar } from "@/components/pv-appbar";
import { OutlineLink } from "@/components/pv-button";
import { ago, fmtSize, initials, one } from "@/lib/pv-format";

type Props = { searchParams: Promise<{ all?: string }> };
type PF = { file_name: string; student: { full_name: string } | { full_name: string }[] | null };

export default function Monitor(props: Props) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-600">Loading...</p>}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ searchParams }: Props) {
  const { all } = await searchParams;
  const supabase = await createClient();
  const { data: admin } = await supabase.from("system_administrator").select("full_name").maybeSingle();
  if (!admin) redirect("/");

  const [{ data: students }, { data: versions }] = await Promise.all([
    supabase.from("student").select("storage_limit_mb, created_at"),
    supabase.from("file_version").select("file_size_kb, synced_at, sync_status, portfolio_file(file_name, student(full_name))").order("synced_at", { ascending: false }),
  ]);
  const st = students ?? [];
  const vs = versions ?? [];
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const added = st.filter((x) => new Date(x.created_at) >= monthStart).length;
  const failed = vs.filter((v) => v.sync_status === "FAILED").length;
  const usedKb = vs.reduce((s, v) => s + v.file_size_kb, 0);
  const limitKb = st.reduce((s, x) => s + x.storage_limit_mb * 1024, 0);
  const pct = limitKb ? Math.min(100, Math.round((usedKb / limitKb) * 100)) : 0;
  const shown = all ? vs.slice(0, 50) : vs.slice(0, 4);
  const chip: Record<string, string> = { SUCCESS: "bg-green-200 text-green-800", FAILED: "bg-red-200 text-red-800", PENDING: "bg-amber-200 text-amber-800" };

  return (
    <Shell wide>
      <AppBar initials={initials(admin.full_name)} />
      <div className="flex flex-1 flex-col gap-6 px-5 pb-6 pt-6">
        <div>
          <h1 className="text-3xl font-bold leading-tight">Welcome back, Administrator</h1>
          <p className="mt-1 text-sm text-slate-600">Monitor storage and sync activity.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#E3E8EF] p-4">
                <p className="text-xs text-slate-600">Total students</p>
                <p className="mt-1 text-2xl font-bold">{st.length}</p>
                <p className="text-xs text-slate-600">{added} added this month</p>
              </div>
              <div className="rounded-2xl bg-[#F3CACA] p-4 text-red-900">
                <p className="text-xs">Failed syncs</p>
                <p className="mt-1 text-2xl font-bold">{failed}</p>
                <p className="text-xs">{failed ? "Needs attention" : "All clear"}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-[#E3E8EF] p-4">
              <p className="text-xs text-slate-600">Total storage used</p>
              <p className="mt-1 text-xl font-bold">{fmtSize(usedKb)} of {fmtSize(limitKb)}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full border border-slate-900 bg-white" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full bg-[#0A6CFF]" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-600">{fmtSize(Math.max(0, limitKb - usedKb))} still available</p>
            </div>
          </div>
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-base font-semibold">Recent sync activity</h2>
              <Link href={all ? "/admin/monitor" : "/admin/monitor?all=1"} className="flex h-12 items-center text-sm font-semibold text-[#0A6CFF]">{all ? "Show less" : "View all"}</Link>
            </div>
            {shown.length ? (
              <ul className="divide-y divide-slate-300 rounded-2xl border-2 border-slate-300">
                {shown.map((v, i) => {
                  const pf = one(v.portfolio_file as PF | PF[] | null);
                  return (
                    <li key={i} className="flex items-center justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{pf?.file_name ?? "Unknown file"}</p>
                        <p className="text-xs text-slate-600">{one(pf?.student ?? null)?.full_name ?? "Unknown"} · {ago(v.synced_at)}</p>
                      </div>
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${chip[v.sync_status] ?? chip.PENDING}`}>
                        {v.sync_status === "SUCCESS" ? "Success" : v.sync_status === "FAILED" ? "Failed" : "Pending"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-2xl bg-[#E3E8EF] p-4 text-sm text-slate-600">No sync activity yet.</p>
            )}
          </section>
        </div>
        <OutlineLink href="/admin" className="mt-auto">Back to dashboard</OutlineLink>
      </div>
    </Shell>
  );
}
