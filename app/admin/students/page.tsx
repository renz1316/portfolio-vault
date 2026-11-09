import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/pv-shell";
import { PageHeader } from "@/components/pv-header";
import { AddStudentForm, LimitForm } from "@/components/pv-student-forms";
import { fmtSize } from "@/lib/pv-format";

export default function ManageStudents() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-600">Loading...</p>}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const supabase = await createClient();
  const { data: admin } = await supabase.from("system_administrator").select("admin_id").maybeSingle();
  if (!admin) redirect("/");

  const [{ data: students }, { data: files }] = await Promise.all([
    supabase.from("student").select("student_id, full_name, email, program, storage_limit_mb").order("created_at", { ascending: false }),
    supabase.from("portfolio_file").select("student_id, file_version(file_size_kb)"),
  ]);
  const used = new Map<number, number>();
  for (const f of files ?? []) {
    const kb = (f.file_version as { file_size_kb: number }[]).reduce((s, v) => s + v.file_size_kb, 0);
    used.set(f.student_id, (used.get(f.student_id) ?? 0) + kb);
  }
  const list = students ?? [];

  return (
    <Shell wide>
      <PageHeader title="Manage students" href="/admin" />
      <div className="grid gap-6 px-5 pb-6 pt-6 md:grid-cols-2">
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-semibold">Students</h2>
            <span className="text-xs text-slate-600">{list.length} {list.length === 1 ? "student" : "students"}</span>
          </div>
          <ul className="space-y-3">
            {list.map((s) => {
              const u = used.get(s.student_id) ?? 0;
              const lim = s.storage_limit_mb * 1024;
              const pct = Math.min(100, Math.round((u / lim) * 100));
              return (
                <li key={s.student_id} className="rounded-2xl bg-[#E3E8EF] p-4">
                  <p className="font-bold">{s.full_name}</p>
                  <p className="text-xs text-slate-600">{s.student_id} · {s.program}</p>
                  <p className="text-xs text-slate-600">{s.email}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full border border-slate-900 bg-white">
                    <div className="h-full bg-[#0A6CFF]" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{fmtSize(u)} of {fmtSize(lim)} used</p>
                  <div className="mt-3"><LimitForm studentId={s.student_id} current={s.storage_limit_mb} /></div>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="h-fit rounded-2xl border-2 border-slate-300 p-4">
          <h2 className="text-base font-semibold">Add a student</h2>
          <p className="mb-4 mt-1 text-xs text-slate-600">This creates the student&apos;s login. Give them the starting password.</p>
          <AddStudentForm />
        </section>
      </div>
    </Shell>
  );
}
