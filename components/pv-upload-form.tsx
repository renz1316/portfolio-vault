"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { ChevronDown, CloudUpload, Lock, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { beginUpload, finishUpload } from "@/app/student/upload/actions";
import { OutlineLink, PrimaryButton } from "@/components/pv-button";
import { PageHeader } from "@/components/pv-header";
import { Modal } from "@/components/pv-modal";
import { fmtSize } from "@/lib/pv-format";

const FOLDERS = ["Capstone project", "Research papers", "Coursework", "Personal projects"];
type Alert = { title: string; text: string; limit: boolean } | null;

export function UploadForm() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState(FOLDERS[0]);
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState<Alert>(null);

  async function start() {
    if (!file) return;
    setBusy(true);
    const t0 = Date.now();
    const begin = await beginUpload(file.name, Math.max(1, Math.ceil(file.size / 1024)), folder);
    if (!begin.ok) {
      setBusy(false);
      setAlert(begin.kind === "limit"
        ? { title: "Storage limit reached", limit: true, text: `This file would take you over your ${fmtSize(begin.limitKb ?? 0)} limit (${fmtSize(begin.usedKb ?? 0)} used). Free up space or ask your administrator to raise it.` }
        : { title: "Sync failed", limit: false, text: begin.message });
      return;
    }
    const { error } = await createClient().storage.from("portfolio-files").upload(begin.path, file);
    await finishUpload(begin.versionId, !error);
    if (error) {
      setBusy(false);
      setAlert({ title: "Sync failed", limit: false, text: `We couldn't save ${file.name}. Check your connection and try again.` });
      return;
    }
    router.push(`/student/sync/${begin.versionId}?s=${Math.max(1, Math.round((Date.now() - t0) / 1000))}`);
  }

  const modalActions: ReactNode = alert && (
    <>
      {alert.limit ? <OutlineLink href="/student">Back to dashboard</OutlineLink>
        : <PrimaryButton type="button" onClick={() => { setAlert(null); start(); }}>Try again</PrimaryButton>}
      <button type="button" onClick={() => setAlert(null)} className="h-[52px] w-full rounded-xl text-base font-semibold text-slate-600">Close</button>
    </>
  );

  return (
    <div className="flex flex-1 flex-col pb-6">
      <PageHeader title="Upload file" href="/student" />
      <div className="flex flex-1 flex-col px-5">
        <p className="mt-6 text-sm text-slate-600">Keep your latest work in one safe place.</p>
        <button type="button" onClick={() => input.current?.click()}
          className="mt-4 flex h-52 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-400 bg-[#E3E8EF] px-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#0A6CFF]"><CloudUpload className="h-6 w-6" /></span>
          <span className="max-w-full truncate text-sm font-bold text-[#0A6CFF]">{file ? file.name : "Tap to choose a file"}</span>
          <span className="text-xs text-slate-600">{file ? fmtSize(Math.ceil(file.size / 1024)) : "Documents, code, images & ZIP files"}</span>
        </button>
        <input ref={input} type="file" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

        <label htmlFor="folder" className="mt-6 text-sm font-semibold">Project folder</label>
        <div className="relative mt-2">
          <select id="folder" value={folder} onChange={(e) => setFolder(e.target.value)}
            className="h-12 w-full appearance-none rounded-xl border border-slate-300 bg-[#E3E8EF] px-4 text-sm text-slate-700">
            {FOLDERS.map((f) => <option key={f}>{f}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-slate-600"><Lock className="h-3.5 w-3.5" />Files are encrypted before they are stored.</p>

        <div className="mt-auto space-y-3 pt-8">
          <PrimaryButton type="button" onClick={start} disabled={!file || busy} className="flex items-center justify-center gap-2">
            <Upload className="h-4 w-4" />{busy ? "Uploading..." : "Upload"}
          </PrimaryButton>
          <Link href="/student" className="flex h-[52px] w-full items-center justify-center rounded-xl border border-slate-300 text-base font-semibold text-slate-600">Cancel</Link>
        </div>
      </div>
      {alert && <Modal title={alert.title} actions={modalActions}>{alert.text}</Modal>}
    </div>
  );
}
