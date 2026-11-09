const TZ = "Asia/Manila";

export function fmtSize(kb: number) {
  if (kb >= 1024 * 1024) return `${(kb / 1024 / 1024).toFixed(1)} GB`;
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${Math.round(kb)} KB`;
}

export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit", timeZone: TZ });

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: TZ });

export function fmtWhen(iso: string) {
  const day = (x: Date) => x.toLocaleDateString("en-PH", { timeZone: TZ });
  if (day(new Date(iso)) === day(new Date())) return `Today, ${fmtTime(iso)}`;
  return `${new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", timeZone: TZ })}, ${fmtTime(iso)}`;
}

export function ago(iso: string) {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} hr ago` : `${Math.round(h / 24)} d ago`;
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

// Supabase returns an embedded row as an object or a one-item array; normalise it.
export function one<T>(x: T | T[] | null | undefined): T | null {
  return Array.isArray(x) ? (x[0] ?? null) : (x ?? null);
}
