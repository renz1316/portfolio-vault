import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PageHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center gap-4 px-5 pt-12 md:pt-8">
      <Link href={href} aria-label="Back" className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white">
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <h1 className="text-xl font-medium">{title}</h1>
    </div>
  );
}
