import { STATIC_IDENTITY, STATIC_PROJECTS, STATIC_SERVICES, STATIC_TEAM } from "@/data";
import { dbGet } from "@/lib/db";
import type {
  ProcessStep,
  Project,
  Service,
  SiteSettings,
  StatItem,
  TeamMember,
  ValueItem,
} from "./types";

const DEFAULT_NAME = "ARKEOS";

type Raw = Record<string, unknown>;

const isObj = (v: unknown): v is Raw => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const strOrNull = (v: unknown): string | null => str(v) || null;

function strList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map(str).filter(Boolean);
}

function parseList(raw: unknown): unknown[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function bySortOrder<T extends { sort_order?: number }>(items: T[]): T[] {
  return items
    .map((item, i) => ({ item, i }))
    .sort((a, b) => (a.item.sort_order ?? 0) - (b.item.sort_order ?? 0) || a.i - b.i)
    .map((e) => e.item);
}

function toProject(v: unknown): Project | null {
  if (!isObj(v)) return null;
  const title = str(v.title);
  if (!title) return null;
  return {
    id: typeof v.id === "string" || typeof v.id === "number" ? String(v.id) : undefined,
    title,
    description: str(v.description),
    tags: strList(v.tags),
    media: strOrNull(v.media),
    color: strOrNull(v.color),
    url: strOrNull(v.url),
    visible: v.visible !== false,
    sort_order: typeof v.sort_order === "number" ? v.sort_order : undefined,
  };
}

function toService(v: unknown): Service | null {
  if (!isObj(v)) return null;
  const title = str(v.title);
  if (!title) return null;
  return {
    id: typeof v.id === "string" || typeof v.id === "number" ? String(v.id) : title,
    title,
    description: str(v.description),
    tags: strList(v.tags),
    price: strOrNull(v.price),
    visible: v.visible !== false,
    sort_order: typeof v.sort_order === "number" ? v.sort_order : undefined,
  };
}

function collect<T>(rows: unknown, convert: (v: unknown) => T | null): T[] {
  if (!Array.isArray(rows)) return [];
  const out: T[] = [];
  for (const row of rows) {
    const item = convert(row);
    if (item) out.push(item);
  }
  return out;
}

export async function loadProjects(): Promise<Project[]> {
  try {
    const rows = await dbGet<unknown>("projects","select=*&visible=eq.true&order=sort_order.asc");
    const items = collect(rows, toProject).filter((p) => p.visible);
    if (items.length > 0) return items;
  } catch {}
  return bySortOrder(collect(STATIC_PROJECTS, toProject).filter((p) => p.visible));
}

export async function loadServices(): Promise<Service[]> {
  try {
    const rows = await dbGet<unknown>("services","select=*&visible=eq.true&order=sort_order.asc");
    const items = collect(rows, toService).filter((s) => s.visible);
    if (items.length > 0) return items;
  } catch {}
  return bySortOrder(collect(STATIC_SERVICES, toService).filter((s) => s.visible));
}

export function getIdentity(s: SiteSettings) {
  const year = Number(str(s.founded_year));
  const dbYear = Number.isInteger(year) && year >= 1000 && year <= 9999 ? year : null;
  const staticYear = STATIC_IDENTITY.foundedYear;
  const fallbackYear =
    typeof staticYear === "number" && Number.isInteger(staticYear) && staticYear >= 1000 && staticYear <= 9999
      ? staticYear
      : null;
  return {
    name: str(s.studio_name) || str(STATIC_IDENTITY.name) || DEFAULT_NAME,
    tagline: str(s.tagline) || str(STATIC_IDENTITY.tagline),
    email: str(s.contact_email) || str(STATIC_IDENTITY.email),
    responseTime: str(s.response_time) || str(STATIC_IDENTITY.responseTime),
    foundedYear: dbYear ?? fallbackYear,
  };
}

function toTeamMember(v: unknown): TeamMember | null {
  if (!isObj(v)) return null;
  const name = str(v.name);
  if (!name) return null;
  return { name, role: str(v.role), bio: str(v.bio), photo: strOrNull(v.photo) };
}

function toStat(v: unknown): StatItem | null {
  if (!isObj(v)) return null;
  const label = str(v.label);
  if (!label) return null;
  const raw = v.n;
  const n = typeof raw === "number" ? raw : typeof raw === "string" && raw.trim() ? Number(raw) : NaN;
  if (!Number.isFinite(n)) return null;
  return { n, label, desc: str(v.desc) };
}

function toTitled(v: unknown): { title: string; desc: string } | null {
  if (!isObj(v)) return null;
  const title = str(v.title);
  if (!title) return null;
  return { title, desc: str(v.desc) };
}

function fromSetting<T>(raw: unknown, convert: (v: unknown) => T | null, fallback: unknown[]): T[] {
  const items = collect(parseList(raw), convert);
  if (items.length > 0) return items;
  return collect(fallback, convert);
}

export function getTeam(s: SiteSettings): TeamMember[] {
  return fromSetting(s.team, toTeamMember, STATIC_TEAM);
}

export function getStats(s: SiteSettings): StatItem[] {
  return fromSetting(s.about_stats, toStat, STATIC_IDENTITY.stats);
}

export function getValues(s: SiteSettings): ValueItem[] {
  return fromSetting(s.about_values, toTitled, STATIC_IDENTITY.values);
}

export function getProcess(s: SiteSettings): ProcessStep[] {
  return fromSetting(s.process_steps, toTitled, STATIC_IDENTITY.process);
}

function paragraphs(text: unknown): string[] {
  if (typeof text !== "string") return [];
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function getStory(s: SiteSettings): string[] {
  const fromDb = paragraphs(s.about_story);
  if (fromDb.length > 0) return fromDb;
  return STATIC_IDENTITY.story.map((p) => str(p)).filter(Boolean);
}
