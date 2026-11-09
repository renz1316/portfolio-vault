import { ShieldCheck } from "lucide-react";
import { signOut } from "@/app/login/actions";

export function AppBar({ initials }: { initials: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-12 md:pt-6">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A6CFF] text-white">
          <ShieldCheck className="h-5 w-5" />
        </span>
        Portfolio Vault
      </div>
      <details className="relative">
        <summary
          aria-label="Account menu"
          className="flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 [&::-webkit-details-marker]:hidden"
        >
          {initials}
        </summary>
        <form action={signOut} className="absolute right-0 z-10 mt-2 w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          <button className="h-12 w-full rounded-lg px-3 text-left text-sm font-medium hover:bg-slate-100">Log out</button>
        </form>
      </details>
    </div>
  );
}
