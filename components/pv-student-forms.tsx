"use client";

import { useRef, useState, useTransition } from "react";
import { PrimaryButton } from "@/components/pv-button";
import { addStudent, setLimit } from "@/app/admin/students/actions";

const FIELD =
  "h-12 w-full rounded-xl border border-slate-300 bg-[#E3E8EF] px-4 text-sm text-slate-900 placeholder:text-slate-600 focus:border-[#0A6CFF] focus:outline-none focus:ring-2 focus:ring-[#0A6CFF]/30";

export function AddStudentForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form ref={ref} className="grid gap-3" onSubmit={(e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      start(async () => {
        const r = await addStudent(fd);
        setMsg(r);
        if (r === "ok") ref.current?.reset();
      });
    }}>
      <input name="id" inputMode="numeric" placeholder="Student ID (numbers)" aria-label="Student ID" className={FIELD} required />
      <input name="name" placeholder="Full name" aria-label="Full name" className={FIELD} required />
      <input name="email" type="email" placeholder="Email" aria-label="Email" className={FIELD} required />
      <input name="program" placeholder="Program (e.g. BS Computer Engineering)" aria-label="Program" className={FIELD} required />
      <input name="password" type="password" placeholder="Starting password (8+ characters)" aria-label="Starting password" className={FIELD} required />
      <input name="limit" type="number" min={1} defaultValue={500} aria-label="Storage limit in MB" className={FIELD} />
      {msg && <p role="alert" className={`text-sm font-medium ${msg === "ok" ? "text-green-700" : "text-red-600"}`}>{msg === "ok" ? "Student added." : msg}</p>}
      <PrimaryButton type="submit" disabled={pending}>{pending ? "Adding..." : "Add student"}</PrimaryButton>
    </form>
  );
}

export function LimitForm({ studentId, current }: { studentId: number; current: number }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form className="flex flex-wrap items-center gap-2" onSubmit={(e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      start(async () => setMsg(await setLimit(studentId, fd)));
    }}>
      <label htmlFor={`limit-${studentId}`} className="sr-only">Storage limit in MB</label>
      <input id={`limit-${studentId}`} name="limit" type="number" min={1} defaultValue={current}
        className="h-12 w-24 rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-[#0A6CFF] focus:outline-none" />
      <span className="text-xs text-slate-600">MB</span>
      <button disabled={pending} className="h-12 rounded-xl bg-[#0A6CFF] px-4 text-sm font-semibold text-white hover:bg-[#0858D6] active:bg-[#0646AA] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600">
        {pending ? "Saving..." : "Save limit"}
      </button>
      {msg && <span role="status" className={`text-xs font-medium ${msg === "ok" ? "text-green-700" : "text-red-600"}`}>{msg === "ok" ? "Saved" : msg}</span>}
    </form>
  );
}
