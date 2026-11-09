import { HardDrive } from "lucide-react";
import { fmtSize } from "@/lib/pv-format";

export function StorageCard({ title, usedKb, limitKb, note }: { title: string; usedKb: number; limitKb: number; note: string }) {
  const pct = limitKb > 0 ? Math.min(100, Math.round((usedKb / limitKb) * 100)) : 0;
  return (
    <section className="rounded-2xl bg-[#E3E8EF] p-4">
      <div className="flex items-center justify-between text-sm font-medium text-slate-600">
        <span className="flex items-center gap-2"><HardDrive className="h-4 w-4" />{title}</span>
        <span>{pct}%</span>
      </div>
      <p className="mt-3 text-lg font-bold">{fmtSize(usedKb)} of {fmtSize(limitKb)} used</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full border border-slate-900 bg-white" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-[#0A6CFF]" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-3 text-xs text-slate-600">{note}</p>
    </section>
  );
}
