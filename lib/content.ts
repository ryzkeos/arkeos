import { STATIC_IDENTITY, STATIC_PROJECTS, STATIC_SERVICES, STATIC_TEAM } from "@/data";
import { dbGet } from "@/lib/db";
import type {
  CinemaType,
  Pillar,
  ProcessStep,
  Project,
  Service,
  SiteSettings,
  StatItem,
  TeamMember,
  ValueItem,
} from "./types";

const DEFAULT_NAME = "ARKEOS";
const DEFAULT_YEAR = 2026;
const DEFAULT_HEADLINE = ["WE BUILD", "DIGITAL", "LEGACIES."];

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

function toCinemaType(v: unknown): CinemaType {
  return v === "image" || v === "html" ? v : "video";
}

function toPillar(v: unknown): Pillar | null {
  if (!isObj(v)) return null;
  const title = str(v.title);
  if (!title) return null;
  return {
    id: typeof v.id === "string" || typeof v.id === "number" ? String(v.id) : title,
    title,
    description: str(v.description),
    icon_url: strOrNull(v.icon_url),
    cinema_url: strOrNull(v.cinema_url),
    cinema_type: toCinemaType(v.cinema_type),
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
    icon_url: strOrNull(v.icon_url),
    cinema_url: strOrNull(v.cinema_url),
    cinema_type: toCinemaType(v.cinema_type),
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
    const rows = await dbGet<unknown>("projects", "select=*&visible=eq.true&order=sort_order.asc");
    const items = collect(rows, toProject).filter((p) => p.visible);
    if (items.length > 0) return items;
  } catch {}
  return bySortOrder(collect(STATIC_PROJECTS, toProject).filter((p) => p.visible));
}

export async function loadServices(): Promise<Service[]> {
  try {
    const rows = await dbGet<unknown>("services", "select=*&visible=eq.true&order=sort_order.asc");
    const items = collect(rows, toService).filter((s) => s.visible);
    if (items.length > 0) return items;
  } catch {}
  return bySortOrder(collect(STATIC_SERVICES, toService).filter((s) => s.visible));
}

const HERO_MAX_LINES = 3;
const HERO_DECO_MAX = 12;

function headlineLines(v: unknown): string[] {
  if (typeof v !== "string") return [];
  return v
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, HERO_MAX_LINES);
}

export async function loadPillars(): Promise<Pillar[]> {
  try {
    const rows = await dbGet<unknown>("pillars", "select=*&order=sort_order.asc,created_at.asc");
    const items = collect(rows, toPillar);
    if (items.length > 0) return items;
  } catch {}
  const services = await loadServices();
  return services.slice(0, 4).map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    icon_url: s.icon_url ?? null,
    cinema_url: s.cinema_url ?? null,
    cinema_type: s.cinema_type ?? "video",
  }));
}

export function getIdentity(s: SiteSettings) {
  const year = Number(str(s.founded_year));
  const dbYear = Number.isInteger(year) && year >= 1000 && year <= 9999 ? year : null;
  const staticYear = STATIC_IDENTITY.foundedYear;
  const fallbackYear =
    typeof staticYear === "number" && Number.isInteger(staticYear) && staticYear >= 1000 && staticYear <= 9999
      ? staticYear
      : null;
  const name = str(s.studio_name) || str(STATIC_IDENTITY.name) || DEFAULT_NAME;
  return {
    name,
    tagline: str(s.tagline) || str(STATIC_IDENTITY.tagline),
    email: str(s.contact_email) || str(STATIC_IDENTITY.email),
    responseTime: str(s.response_time) || str(STATIC_IDENTITY.responseTime),
    foundedYear: dbYear ?? fallbackYear ?? DEFAULT_YEAR,
    heroHeadline: headlineLines(s.hero_headline).length
      ? headlineLines(s.hero_headline)
      : headlineLines(STATIC_IDENTITY.heroHeadline).length
        ? headlineLines(STATIC_IDENTITY.heroHeadline)
        : DEFAULT_HEADLINE,
    heroDeco: (str(s.hero_deco) || str(STATIC_IDENTITY.heroDeco) || name.toUpperCase()).slice(0, HERO_DECO_MAX),
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

const DEFAULT_WHAT_INTRO =
  "We are not a production house. We are your unfair advantage. Every project we touch becomes a benchmark in its category, not by accident, by obsession.";
const DEFAULT_WORK_INTRO = "A selection of recent projects from the studio.";
const DEFAULT_STAT_COPY = [
  { label: "PROJECTS SHIPPED", desc: "Every single one delivered on time, on spec, and above expectation." },
  { label: "YEARS ACTIVE", desc: "Refusing to ship anything that would not carry the name. That standard does not drop." },
  { label: "CLIENTS SERVED", desc: "From solo founders to funded startups. Every client gets the same obsessive attention." },
];

export function getSectionCopy(s: SiteSettings) {
  const r = s as Record<string, unknown>;
  return {
    what: str(r.what_intro) || DEFAULT_WHAT_INTRO,
    work: str(r.work_intro) || DEFAULT_WORK_INTRO,
  };
}

function wholeNumber(v: unknown): number | null {
  const n = Number.parseInt(str(v), 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function getHomeStats(s: SiteSettings, projectCount: number): StatItem[] {
  const own = getStats(s);
  if (own.length > 0) return own;
  const r = s as Record<string, unknown>;
  const founded = getIdentity(s).foundedYear;
  const years = founded ? Math.max(1, new Date().getFullYear() - founded + 1) : 1;
  const values = [wholeNumber(r.projects_count) ?? projectCount, wholeNumber(r.years_active) ?? years, wholeNumber(r.clients_count) ?? 0];
  return DEFAULT_STAT_COPY.map((c, i) => ({ n: values[i], label: c.label, desc: c.desc }));
}
