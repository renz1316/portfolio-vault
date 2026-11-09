import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";

export function FileRow({ name, meta, status, href }: { name: string; meta: string; status: string; href?: string }) {
  const label = status === "SUCCESS" ? "Synced" : status === "FAILED" ? "Failed" : "Pending";
  const tone = status === "SUCCESS" ? "bg-green-100 text-green-700" : status === "FAILED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";
  const cls = "flex items-center gap-3 rounded-2xl bg-[#E3E8EF] p-3";
  const body = (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#0A6CFF]"><FileText className="h-5 w-5" /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{name}</p>
        <p className="text-xs text-slate-600">{meta}</p>
        <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold ${tone}`}>{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-600" />
    </>
  );
  return <li>{href ? <Link href={href} className={cls}>{body}</Link> : <div className={cls}>{body}</div>}</li>;
}
