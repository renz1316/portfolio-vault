import { fmtSize } from "@/lib/pv-format";

// Shared by the upload form (browser) and the upload server action, so both enforce the same rules.
// Kept out of actions.ts because a "use server" file may only export async functions.

export const MAX_FILE_MB = 25;
export const MAX_FILE_KB = MAX_FILE_MB * 1024;

const ALLOWED = {
  documents: ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "odt", "rtf", "txt", "md", "csv"],
  code: ["js", "jsx", "ts", "tsx", "py", "java", "c", "cpp", "h", "cs", "php", "rb", "go", "rs", "sh", "sql", "ino", "html", "css", "json", "xml", "yml", "yaml", "ipynb"],
  images: ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"],
  archives: ["zip"],
};

const EXTENSIONS = new Set(Object.values(ALLOWED).flat());

// For the file picker's "accept" attribute.
export const ACCEPT = [...EXTENSIONS].map((e) => `.${e}`).join(",");

function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(i + 1).toLowerCase() : "";
}

/** Returns an error message, or null when the file is acceptable. remainingKb is optional. */
export function validateUpload(name: string, sizeKb: number, remainingKb?: number): string | null {
  const ext = extOf(name);
  if (!EXTENSIONS.has(ext)) {
    return `${ext ? `.${ext} files` : "Files without an extension"} can't be uploaded. Choose a document, code file, image or ZIP.`;
  }
  if (sizeKb > MAX_FILE_KB) {
    return `This file is ${fmtSize(sizeKb)}. The maximum size is ${MAX_FILE_MB} MB.`;
  }
  if (remainingKb !== undefined && sizeKb > remainingKb) {
    return `Not enough storage: this file is ${fmtSize(sizeKb)} but you have ${fmtSize(Math.max(0, remainingKb))} free. Free up space or ask your administrator to raise your limit.`;
  }
  return null;
}
