"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { ChevronDown, CloudUpload, Lock, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { beginUpload, finishUpload } from "@/app/student/upload/actions";
import { PrimaryButton } from "@/components/pv-button";
import { PageHeader } from "@/components/pv-header";
import { Modal } from "@/components/pv-modal";
import { fmtSize } from "@/lib/pv-format";
import { ACCEPT, validateUpload } from "@/lib/pv-upload-rules";

const FOLDERS = ["Capstone project", "Research papers", "Coursework", "Personal projects"];
type Alert = { title: string; text: string } | null;

const toKb = (f: File) => Math.max(1, Math.ceil(f.size / 1024));

export function UploadForm({ remainingKb }: { remainingKb: number }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [folder, setFolder] = useState(FOLDERS[0]);
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState<Alert>(null);

  // Picking a file re-checks it, so the error clears as soon as a valid file is chosen.
  function choose(f: File | null) {
    setFile(f);
    setFileError(f ? validateUpload(f.name, toKb(f), remainingKb) : null);
  }

  async function start() {
    if (!file || fileError) return;
    setBusy(true);
    const t0 = Date.now();
    const begin = await beginUpload(file.name, toKb(file), folder);
    if (!begin.ok) {
      setBusy(false);
      if (begin.kind === "invalid") setFileError(begin.message);
      else setAlert({ title: "Sync failed", text: begin.message });
      return;
    }
    const { error } = await createClient().storage.from("portfolio-files").upload(begin.path, file);
    await finishUpload(begin.versionId, !error);
    if (error) {
      setBusy(false);
      setAlert({ title: "Sync failed", text: `We couldn't save ${file.name}. Check your connection and try again.` });
      return;
    }
    router.push(`/student/sync/${begin.versionId}?s=${Math.max(1, Math.round((Date.now() - t0) / 1000))}`);
  }

  const modalActions: ReactNode = alert && (
    <>
      <PrimaryButton type="button" onClick={() => { setAlert(null); start(); }}>Try again</PrimaryButton>
      <button type="button" onClick={() => setAlert(null)} className="h-[52px] w-full rounded-xl text-base font-semibold text-slate-600">Close</button>
    </>
  );

  return (
    <div className="flex flex-1 flex-col pb-6">
      <PageHeader title="Upload file" href="/student" />
      <div className="flex flex-1 flex-col px-5">
        <p className="mt-6 text-sm text-slate-600">Keep your latest work in one safe place.</p>
        <button type="button" onClick={() => input.current?.click()}
          aria-invalid={!!fileError} aria-describedby={fileError ? "file-error" : undefined}
          className={`mt-4 flex h-52 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-[#E3E8EF] px-4 text-center ${fileError ? "border-red-600" : "border-slate-400"}`}>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#0A6CFF]"><CloudUpload className="h-6 w-6" /></span>
          <span className="max-w-full truncate text-sm font-bold text-[#0A6CFF]">{file ? file.name : "Tap to choose a file"}</span>
          <span className="text-xs text-slate-600">{file ? fmtSize(toKb(file)) : "Documents, code, images & ZIP files"}</span>
        </button>
        <input ref={input} type="file" hidden accept={ACCEPT}
          onChange={(e) => { choose(e.target.files?.[0] ?? null); e.target.value = ""; }} />
        {fileError && <p id="file-error" role="alert" className="mt-2 text-sm font-medium text-red-600">{fileError}</p>}

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
          <PrimaryButton type="button" onClick={start} disabled={!file || !!fileError || busy} className="flex items-center justify-center gap-2">
            <Upload className="h-4 w-4" />{busy ? "Uploading..." : "Upload"}
          </PrimaryButton>
          <Link href="/student" className="flex h-[52px] w-full items-center justify-center rounded-xl border border-slate-300 text-base font-semibold text-slate-600">Cancel</Link>
        </div>
      </div>
      {alert && <Modal title={alert.title} actions={modalActions}>{alert.text}</Modal>}
    </div>
  );
}
