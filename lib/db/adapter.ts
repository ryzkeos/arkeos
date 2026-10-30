import type { Inquiry, Project, Service, Session, SiteSettings } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_DATA_API_URL ?? "";
const API_KEY = process.env.NEXT_PUBLIC_DATA_API_KEY ?? "";
const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || API_URL;
const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "media";
const SESSION_KEY = "arkeos_session";

let session: Session | null = null;

function headers(extra?: Record<string, string>): Record<string, string> {
  const token = session?.access_token ?? API_KEY;
  return {
    apikey: API_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function check(res: Response): Promise<Response> {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.clone().json();
      if (body?.message) msg = body.message;
    } catch {}
    throw new Error(msg);
  }
  return res;
}

export async function dbGet<T = unknown>(table: string, query?: string): Promise<T> {
  const res = await fetch(`${API_URL}/rest/v1/${table}${query ? `?${query}` : ""}`, { headers: headers() });
  return (await check(res)).json();
}

export async function dbInsert(table: string, body: unknown, prefer = "return=minimal") {
  const res = await fetch(`${API_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: headers({ Prefer: prefer }),
    body: JSON.stringify(body),
  });
  return check(res);
}

export async function dbUpdate(table: string, query: string, body: unknown) {
  const res = await fetch(`${API_URL}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: headers({ Prefer: "return=minimal" }),
    body: JSON.stringify(body),
  });
  return check(res);
}

export async function dbDelete(table: string, query: string) {
  const res = await fetch(`${API_URL}/rest/v1/${table}?${query}`, {
    method: "DELETE",
    headers: headers({ Prefer: "return=minimal" }),
  });
  return check(res);
}

export async function dbCount(table: string, query?: string): Promise<number> {
  const res = await fetch(`${API_URL}/rest/v1/${table}${query ? `?${query}` : ""}`, {
    method: "HEAD",
    headers: headers({ Prefer: "count=exact" }),
  });
  await check(res);
  const total = Number(res.headers.get("content-range")?.split("/")[1]);
  return Number.isFinite(total) ? total : 0;
}

export async function dbSignIn(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: API_KEY },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function dbSignOut() {
  if (!session) return;
  try {
    await fetch(`${API_URL}/auth/v1/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}`, apikey: API_KEY },
    });
  } finally {
    session = null;
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
  }
}

export function dbSetSession(s: Session) {
  session = s;
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {}
}

export function dbRestoreSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) session = JSON.parse(raw);
  } catch {}
  return session;
}

export const dbIsAuthed = () => !!session?.access_token;

export async function dbUpload(_bucket: string, path: string, file: File) {
  const token = session?.access_token ?? API_KEY;
  const res = await fetch(`${STORAGE_URL}/storage/v1/object/${STORAGE_BUCKET}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, apikey: API_KEY, "Content-Type": file.type, "x-upsert": "true" },
    body: file,
  });
  await check(res);
}

export const dbPublicUrl = (_bucket: string, path: string) =>
  `${STORAGE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;

export async function dbLoadSiteSettings(): Promise<SiteSettings> {
  const rows = await dbGet<{ key: string; value: string }[]>("site_settings", "select=key,value");
  const s: Record<string, string> = {};
  if (Array.isArray(rows)) rows.forEach((r) => (s[r.key] = r.value));
  return s as SiteSettings;
}

export async function dbSaveSetting(key: string, value: string) {
  return dbInsert("site_settings?on_conflict=key", { key, value }, "resolution=merge-duplicates,return=minimal");
}

export function dbTrackPageView(pathname: string) {
  const page = pathname === "/" ? "index.html" : `${pathname.replace(/^\//, "")}.html`;
  dbInsert("analytics", { page, created_at: new Date().toISOString() }).catch(() => {});
}

export async function dbSubmitInquiry(payload: Record<string, string>) {
  const res = await fetch("/api/inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body?.error === "string" && body.error) msg = body.error;
      else if (typeof body?.message === "string" && body.message) msg = body.message;
    } catch {}
    throw new Error(msg);
  }
  return res;
}

export const dbGetInquiries = (status?: string) =>
  dbGet<Inquiry[]>("inquiries", `select=*&order=created_at.desc${status && status !== "all" ? `&status=eq.${status}` : ""}`);
export const dbMarkInquiry = (id: string, status: string) => dbUpdate("inquiries", `id=eq.${id}`, { status });
export const dbDeleteInquiry = (id: string) => dbDelete("inquiries", `id=eq.${id}`);

export const dbGetProjects = () => dbGet<Project[]>("projects", "select=*&order=sort_order.asc");
export const dbSaveProject = (id: string | null, payload: Partial<Project>) =>
  id ? dbUpdate("projects", `id=eq.${id}`, payload) : dbInsert("projects", payload);
export const dbDeleteProject = (id: string) => dbDelete("projects", `id=eq.${id}`);

export const dbGetServices = () => dbGet<Service[]>("services", "select=*&order=sort_order.asc");
export const dbSaveService = (id: string | null, payload: Partial<Service>) =>
  id ? dbUpdate("services", `id=eq.${id}`, payload) : dbInsert("services", payload);
export const dbDeleteService = (id: string) => dbDelete("services", `id=eq.${id}`);
