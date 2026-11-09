import type { ReactNode } from "react";

// Phone column on phones; a rounded card on PCs. wide = dashboards get more room.
export function Shell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="flex min-h-screen justify-center bg-slate-100 text-slate-900 md:items-center md:py-10">
      <main
        className={`flex min-h-screen w-full max-w-[430px] flex-col bg-white shadow-sm md:min-h-0 md:overflow-hidden md:rounded-2xl md:shadow-lg ${
          wide ? "md:max-w-3xl lg:max-w-5xl" : ""
        }`}
      >
        {children}
      </main>
    </div>
  );
}
