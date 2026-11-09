import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

export function Modal({ title, children, actions }: { title: string; children: ReactNode; actions: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h2 id="modal-title" className="mt-4 text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{children}</p>
        <div className="mt-5 space-y-3">{actions}</div>
      </div>
    </div>
  );
}
