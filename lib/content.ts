import { DEFAULTS } from "@/defaults";
import { dbGet } from "@/lib/db";
import { getCopy, legacy_stats } from "./copy";
import type {
  CinemaType,
  ProcessStep,
  Project,
  Service,
  SiteSettings,
  StatItem,
  TeamMember,
  ValueItem,
} from "./types";

const DEFAULT_HEADLINE = ["WE BUILD", "DIGITAL", "LEGACIES."];

type Raw = Record<string, unknown>;

const isObj = (v: unknown): v is Raw => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const strOrNull = (v: unknown): string | null => str(v) || null;

function strList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map(str).filter(Boolean);
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
    featured: v.featured === true,
    sort_order: typeof v.sort_order === "number" ? v.sort_order : undefined,
  };
}

function toCinemaType(v: unknown): CinemaType {
  return v === "image" || v === "html" ? v : "video";
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
  return bySortOrder(collect(DEFAULTS.projects.projects, toProject).filter((p) => p.visible));
}

export async function loadServices(): Promise<Service[]> {
  try {
    const rows = await dbGet<unknown>("services", "select=*&visible=eq.true&order=sort_order.asc");
    const items = collect(rows, toService).filter((s) => s.visible);
    if (items.length > 0) return items;
  } catch {}
  return bySortOrder(collect(DEFAULTS.services.services, toService).filter((s) => s.visible));
}

export function getIdentity(s: SiteSettings) {
  const shared = getCopy("shared", s);
  const home = getCopy("home", s);
  const name = shared.brand.name;
  return {
    name,
    tagline: shared.brand.tagline,
    email: shared.brand.email,
    responseTime: shared.brand.response_time,
    foundedYear: shared.brand.founded_year,
    heroHeadline: home.hero.lines.length ? home.hero.lines.slice(0, 3) : DEFAULT_HEADLINE,
    heroDeco: shared.hero.deco || name.toUpperCase().slice(0, 12),
  };
}

export function getTeam(s: SiteSettings): TeamMember[] {
  return getCopy("about", s).team_members;
}

export function getStats(s: SiteSettings): StatItem[] {
  return getCopy("about", s).stats_items;
}

export function getValues(s: SiteSettings): ValueItem[] {
  return getCopy("about", s).values_items;
}

export function getProcess(s: SiteSettings): ProcessStep[] {
  return getCopy("services", s).process_steps;
}

export function getStory(s: SiteSettings): string[] {
  return getCopy("about", s).story_paragraphs;
}

const DEFAULT_WHAT_INTRO =
  "We are not a production house. We are your unfair advantage. Every project we touch becomes a benchmark in its category, not by accident, by obsession.";
const DEFAULT_WORK_INTRO = "A selection of recent projects from the studio.";

export function getSectionCopy(s: SiteSettings) {
  const home = getCopy("home", s);
  return {
    what: home.what.intro || DEFAULT_WHAT_INTRO,
    work: home.work.intro || DEFAULT_WORK_INTRO,
  };
}
