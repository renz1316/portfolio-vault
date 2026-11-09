"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "@/app/login/actions";
import { PrimaryButton } from "@/components/pv-button";

type Role = "student" | "admin";

const COPY = {
  student: { sub: "Your projects are backed up automatically.", label: "Student ID", ph: "Enter your student ID", btn: "Sign in as Student", foot: "Need an account? Ask your administrator." },
  admin: { sub: "Monitor storage and sync activity.", label: "Admin ID", ph: "Enter your Admin ID", btn: "Sign in as Administrator", foot: "A secure home for your student projects." },
} as const;

const FIELD =
  "h-14 w-full rounded-xl border border-slate-300 bg-[#E3E8EF] px-4 text-base text-slate-900 placeholder:text-slate-600 focus:border-[#0A6CFF] focus:outline-none focus:ring-2 focus:ring-[#0A6CFF]/30";

export function LoginForm({ role }: { role: Role }) {
  const c = COPY[role];
  const [error, action, pending] = useActionState(signIn.bind(null, role), null);
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="flex flex-1 flex-col px-6 pb-8 pt-32 md:pt-14">
      <h1 className="text-3xl font-bold">Portfolio Vault</h1>
      <p className="mt-2 text-base text-slate-600">{c.sub}</p>

      <label htmlFor="id" className="mt-5 text-sm font-semibold">{c.label}</label>
      <input id="id" name="id" inputMode="numeric" autoComplete="username" placeholder={c.ph}
        value={id} onChange={(e) => setId(e.target.value)} className={`${FIELD} mt-2`} />

      <label htmlFor="password" className="mt-6 text-sm font-semibold">Password</label>
      <div className="relative mt-2">
        <input id="password" name="password" type={show ? "text" : "password"}
          autoComplete="current-password" placeholder="Enter your password"
          value={pw} onChange={(e) => setPw(e.target.value)} className={`${FIELD} pr-14`} />
        <button type="button" aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow(!show)}
          className="absolute right-1 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-slate-600">
          {show ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </button>
      </div>

      {error && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>}

      <PrimaryButton type="submit" disabled={pending || !id.trim() || !pw} className="mt-8">
        {pending ? "Signing in..." : c.btn}
      </PrimaryButton>
      <p className="mt-4 text-center text-xs text-slate-600">{c.foot}</p>
    </form>
  );
}
