import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Check, FileText, Lock, X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/pv-shell";
import { PageHeader } from "@/components/pv-header";
import { OutlineLink, PrimaryLink } from "@/components/pv-button";
import { fmtSize, fmtWhen, one } from "@/lib/pv-format";

type Props = { params: Promise<{ versionId: string }>; searchParams: Promise<{ s?: string }> };

export default function SyncStatus(props: Props) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-600">Loading...</p>}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params, searchParams }: Props) {
  const { versionId } = await params;
  const { s } = await searchParams;
  const supabase = await createClient();
  const { data: v } = await supabase.from("file_version")
    .select("file_id, version_number, file_size_kb, sync_status, synced_at, portfolio_file(file_name, is_encrypted)")
    .eq("version_id", Number(versionId)).maybeSingle();
  if (!v) redirect("/student");
  const pf = one(v.portfolio_file as { file_name: string; is_encrypted: boolean } | { file_name: string; is_encrypted: boolean }[] | null);
  const ok = v.sync_status === "SUCCESS";
  const secs = Number(s);

  return (
    <Shell>
      <PageHeader title="Sync status" href="/student" />
      <div className="flex flex-1 flex-col px-5 pb-6">
        <div className="mt-10 flex flex-col items-center text-center">
          <span className={`flex h-24 w-24 items-center justify-center rounded-full ${ok ? "bg-[#DFEDE7]" : "bg-red-100"}`}>
            <span className={`flex h-16 w-16 items-center justify-center rounded-full text-white ${ok ? "bg-[#1F4FD8]" : "bg-red-600"}`}>
              {ok ? <Check className="h-8 w-8" /> : <X className="h-8 w-8" />}
            </span>
          </span>
          <h2 className="mt-6 text-[26px] font-medium">{ok ? "Saved to repository" : v.sync_status === "FAILED" ? "Sync failed" : "Still syncing"}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {ok ? (secs > 0 ? `Synced in ${secs} ${secs === 1 ? "second" : "seconds"}` : `Synced ${fmtWhen(v.synced_at)}`) : "This version has not been saved yet."}
          </p>
        </div>
        <section className="mt-8 rounded-2xl bg-[#E3E8EF] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#0A6CFF]"><FileText className="h-5 w-5" /></span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{pf?.file_name}</p>
              <p className="text-xs text-slate-600">Version {v.version_number} · {fmtSize(v.file_size_kb)}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white pt-3 text-xs text-slate-600">
            <span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" />{pf?.is_encrypted ? "Encrypted" : "Not encrypted"}</span>
            <span className={`rounded px-2 py-0.5 text-xs font-semibold ${ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{v.sync_status}</span>
          </div>
        </section>
        <p className="mt-6 text-center text-xs text-slate-600">Your latest version is backed up. Previous versions are always within reach.</p>
        <div className="mt-auto space-y-3 pt-8">
          <PrimaryLink href={`/student/files/${v.file_id}`}>View versions</PrimaryLink>
          <OutlineLink href="/student">Back to dashboard</OutlineLink>
        </div>
      </div>
    </Shell>
  );
}
