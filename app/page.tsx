import Link from "next/link";
import { Headset, User } from "lucide-react";
import type { ReactNode } from "react";
import { Shell } from "@/components/pv-shell";

function RoleLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-3 text-base font-semibold">
      <span className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#3B7BE0]">
        {icon}
      </span>
      {label}
    </Link>
  );
}

export default function Welcome() {
  return (
    <Shell>
      <header
        className="flex items-center gap-3 bg-[#0A6CFF] px-5 pb-8 pt-12"
        style={{ borderBottomLeftRadius: "50% 28px", borderBottomRightRadius: "50% 28px" }}
      >
        {/* Replace this circle with your BulSU logo image later */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-orange-400 bg-white text-xs font-bold text-[#0A6CFF]">
          BulSU
        </div>
        <h1 className="text-xl font-bold text-white">Bulacan State University</h1>
      </header>
      <section className="flex flex-1 flex-col items-center px-6 pb-12 pt-20">
        <h2 className="text-xl font-semibold text-slate-600">Login to your account</h2>
        <div className="mt-10 flex gap-10">
          <RoleLink href="/login/student" label="Student Login" icon={<User className="h-12 w-12 text-white" fill="white" />} />
          <RoleLink href="/login/admin" label="Admin Login" icon={<Headset className="h-12 w-12 text-white" />} />
        </div>
        <p className="mt-12 text-sm font-semibold text-slate-600">
          Don&apos;t have an account? <span className="text-[#0A6CFF]">Ask your Administrator</span>
        </p>
      </section>
    </Shell>
  );
}
