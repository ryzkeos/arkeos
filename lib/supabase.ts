import type { Inquiry, Project, Service, Session, SiteSettings } from "./types";

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SESSION_KEY = "arkeos_session";

let session: Session | null = null;

/* ── core http ─────────────────────────────────────────────── */
function headers(extra?: Record<string, string>): Record<string, string> {
  const token = session?.access_token ?? ANON_KEY;
  return {
    apikey: ANON_KEY,
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

export async function sbGet<T = unknown>(table: string, query?: string): Promise<T> {
  const res = await fetch(`${URL_BASE}/rest/v1/${table}${query ? `?${query}` : ""}`, { headers: headers() });
  return (await check(res)).json();
}

export async function sbPost(table: string, body: unknown, prefer = "return=minimal") {
  const res = await fetch(`${URL_BASE}/rest/v1/${table}`, {
    method: "POST",
    headers: headers({ Prefer: prefer }),
    body: JSON.stringify(body),
  });
  return check(res);
}

export async function sbPatch(table: string, query: string, body: unknown) {
  const res = await fetch(`${URL_BASE}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: headers({ Prefer: "return=minimal" }),
    body: JSON.stringify(body),
  });
  return check(res);
}

export async function sbDelete(table: string, query: string) {
  const res = await fetch(`${URL_BASE}/rest/v1/${table}?${query}`, {
    method: "DELETE",
    headers: headers({ Prefer: "return=minimal" }),
  });
  return check(res);
}

/* ── auth ──────────────────────────────────────────────────── */
export async function sbSignIn(email: string, password: string) {
  const res = await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function sbSignOut() {
  if (!session) return;
  try {
    await fetch(`${URL_BASE}/auth/v1/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}`, apikey: ANON_KEY },
    });
  } finally {
    session = null;
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
  }
}

export function sbSetSession(s: Session) {
  session = s;
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {}
}

export function sbRestoreSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) session = JSON.parse(raw);
  } catch {}
  return session;
}

export const sbIsAuthed = () => !!session?.access_token;

/* ── storage ───────────────────────────────────────────────── */
export async function sbUpload(bucket: string, path: string, file: File) {
  const token = session?.access_token ?? ANON_KEY;
  const res = await fetch(`${URL_BASE}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, apikey: ANON_KEY, "Content-Type": file.type, "x-upsert": "true" },
    body: file,
  });
  await check(res);
}

export const sbPublicUrl = (bucket: string, path: string) =>
  `${URL_BASE}/storage/v1/object/public/${bucket}/${path}`;

/* ── public reads ──────────────────────────────────────────── */
export async function sbLoadSiteSettings(): Promise<SiteSettings> {
  const rows = await sbGet<{ key: string; value: string }[]>("site_settings", "select=key,value");
  const s: Record<string, string> = {};
  if (Array.isArray(rows)) rows.forEach((r) => (s[r.key] = r.value));
  return s as SiteSettings;
}

export function sbTrackPageView(pathname: string) {
  const page = pathname === "/" ? "index.html" : `${pathname.replace(/^\//, "")}.html`;
  sbPost("analytics", { page, created_at: new Date().toISOString() }).catch(() => {});
}

export function sbSubmitInquiry(payload: Record<string, string>) {
  return sbPost("inquiries", { ...payload, status: "unread", created_at: new Date().toISOString() });
}

export async function sbLoadProjects(fallback: Project[]): Promise<Project[]> {
  try {
    const data = await sbGet<Project[]>("projects", "select=*&visible=eq.true&order=sort_order.asc");
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {}
  return fallback.filter((p) => p.visible !== false);
}

/* ── admin helpers ─────────────────────────────────────────── */
export async function sbSaveSetting(key: string, value: string) {
  const existing = await sbGet<unknown[]>("site_settings", `key=eq.${encodeURIComponent(key)}&select=key`);
  if (existing?.length) return sbPatch("site_settings", `key=eq.${encodeURIComponent(key)}`, { value });
  return sbPost("site_settings", { key, value });
}

export const sbGetInquiries = (status?: string) =>
  sbGet<Inquiry[]>("inquiries", `select=*&order=created_at.desc${status && status !== "all" ? `&status=eq.${status}` : ""}`);
export const sbMarkInquiry = (id: string, status: string) => sbPatch("inquiries", `id=eq.${id}`, { status });
export const sbDeleteInquiry = (id: string) => sbDelete("inquiries", `id=eq.${id}`);

export const sbGetProjects = () => sbGet<Project[]>("projects", "select=*&order=sort_order.asc");
export const sbSaveProject = (id: string | null, payload: Partial<Project>) =>
  id ? sbPatch("projects", `id=eq.${id}`, payload) : sbPost("projects", payload);
export const sbDeleteProject = (id: string) => sbDelete("projects", `id=eq.${id}`);

export const sbGetServices = () => sbGet<Service[]>("services", "select=*&order=sort_order.asc");
export const sbSaveService = (id: string | null, payload: Partial<Service>) =>
  id ? sbPatch("services", `id=eq.${id}`, payload) : sbPost("services", payload);
export const sbDeleteService = (id: string) => sbDelete("services", `id=eq.${id}`);
