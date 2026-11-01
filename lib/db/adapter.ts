import type { Inquiry, Project, Service, Session, SiteSettings } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_DATA_API_URL ?? "";
const API_KEY = process.env.NEXT_PUBLIC_DATA_API_KEY ?? "";
const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || API_URL;
const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "media";
const SESSION_KEY = "arkeos_session";

export const UNAUTHORIZED_EVENT = "arkeos:unauthorized";

let session: Session | null = null;

function drop_session() {
  session = null;
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
}

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
    if (res.status === 401 && session) {
      drop_session();
      if (typeof window !== "undefined") window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
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
    drop_session();
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

export async function dbValidateSession(): Promise<boolean> {
  if (!session?.access_token) return false;
  try {
    const res = await fetch(`${API_URL}/auth/v1/user`, { headers: { Authorization: `Bearer ${session.access_token}`, apikey: API_KEY } });
    if (res.status === 401 || res.status === 403) {
      drop_session();
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

export const dbIsAuthed = () => !!session?.access_token;

export async function dbUpload(_bucket: string, path: string, file: File) {
  const token = session?.access_token ?? API_KEY;
  const res = await fetch(`${STORAGE_URL}/storage/v1/object/${STORAGE_BUCKET}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, apikey: API_KEY, "Content-Type": file.type || "application/octet-stream", "x-upsert": "true" },
    body: file,
  });
  await check(res);
}

export async function dbDeleteFile(url: string) {
  const prefix = `${STORAGE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/`;
  if (!url.startsWith(prefix)) return;
  let path = url.slice(prefix.length).split("?")[0];
  try { path = decodeURIComponent(path); } catch {}
  if (!path) return;
  const token = session?.access_token ?? API_KEY;
  try {
    await fetch(`${STORAGE_URL}/storage/v1/object/${STORAGE_BUCKET}/${path}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}`, apikey: API_KEY } });
  } catch {}
}

const STORAGE_PREFIX = `${STORAGE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/`;
const BACKUP_DIR = "backups";

function storage_path(url: string): string | null {
  if (!url.startsWith(STORAGE_PREFIX)) return null;
  let path = url.slice(STORAGE_PREFIX.length).split("?")[0];
  try { path = decodeURIComponent(path); } catch {}
  return path || null;
}

const storage_headers = () => ({ Authorization: `Bearer ${session?.access_token ?? API_KEY}`, apikey: API_KEY });

async function list_backups(folder: string, base: string): Promise<string[]> {
  try {
    const res = await fetch(`${STORAGE_URL}/storage/v1/object/list/${STORAGE_BUCKET}`, {
      method: "POST",
      headers: { ...storage_headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: `${BACKUP_DIR}/${folder}`, search: base, limit: 100 }),
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as { name?: string }[];
    return rows.map((r) => r.name ?? "").filter((n) => n.startsWith(`${base}.`));
  } catch {
    return [];
  }
}

const split_slot = (path: string) => {
  const cut = path.lastIndexOf("/");
  const folder = path.slice(0, cut);
  const name = path.slice(cut + 1);
  return { folder, name, base: name.replace(/\.[^.]+$/, "") };
};

export async function dbBackupFile(url: string) {
  const path = storage_path(url);
  if (!path || path.startsWith(`${BACKUP_DIR}/`)) return;
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const blob = await res.blob();
    const { folder, name, base } = split_slot(path);
    for (const old of await list_backups(folder, base)) {
      await fetch(`${STORAGE_URL}/storage/v1/object/${STORAGE_BUCKET}/${BACKUP_DIR}/${folder}/${old}`, { method: "DELETE", headers: storage_headers() });
    }
    await fetch(`${STORAGE_URL}/storage/v1/object/${STORAGE_BUCKET}/${BACKUP_DIR}/${folder}/${name}`, {
      method: "POST",
      headers: { ...storage_headers(), "Content-Type": blob.type || "application/octet-stream", "x-upsert": "true" },
      body: blob,
    });
  } catch {}
}

export async function dbFindBackup(folder: string, base: string): Promise<string | null> {
  const [name] = await list_backups(folder, base);
  return name ? `${STORAGE_PREFIX}${BACKUP_DIR}/${folder}/${name}` : null;
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

async function save_row(table: string, id: string | null, payload: unknown): Promise<string> {
  if (id) {
    await dbUpdate(table, `id=eq.${id}`, payload);
    return id;
  }
  const res = await dbInsert(table, payload, "return=representation");
  const rows = (await res.json()) as { id?: string | number }[];
  const created = rows?.[0]?.id;
  if (created === undefined || created === null) throw new Error("Saved, but the new row id could not be read.");
  return String(created);
}

export const dbGetProjects = () => dbGet<Project[]>("projects", "select=*&order=sort_order.asc");
export const dbSaveProject = (id: string | null, payload: Partial<Project>) => save_row("projects", id, payload);
export const dbDeleteProject = (id: string) => dbDelete("projects", `id=eq.${id}`);

export const dbGetServices = () => dbGet<Service[]>("services", "select=*&order=sort_order.asc");
export const dbSaveService = (id: string | null, payload: Partial<Service>) => save_row("services", id, payload);
export const dbDeleteService = (id: string) => dbDelete("services", `id=eq.${id}`);

