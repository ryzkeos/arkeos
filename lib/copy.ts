import { DEFAULTS, type Defaults, type PageKey } from "@/defaults";
import type { SiteSettings, StatItem, TeamMember } from "./types";

export const COPY_SETTING_KEY: Record<PageKey, keyof SiteSettings> = {
  shared: "copy_shared",
  home: "copy_home",
  projects: "copy_projects",
  services: "copy_services",
  about: "copy_about",
  contact: "copy_contact",
  privacy: "copy_privacy",
  not_found: "copy_not_found",
};

type Obj = Record<string, unknown>;

const BLOCKED_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const MAX_TEXT = 5000;
const MAX_ITEMS = 100;
const MAX_DEPTH = 6;
const MAX_JSON = 200_000;
const HERO_MAX_LINES = 3;
const HERO_DECO_MAX = 12;

const is_obj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

export function safe_href(value: string): boolean {
  const v = value.trim();
  if (!v || /[\u0000-\u001f\u007f]/.test(v)) return false;
  return /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(v);
}

function to_number(v: unknown): number | undefined {
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function clean_loose(v: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return undefined;
  if (typeof v === "string") return str(v).slice(0, MAX_TEXT) || undefined;
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  if (typeof v === "boolean") return v;
  if (Array.isArray(v)) {
    const items = v.slice(0, MAX_ITEMS).map((x) => clean_loose(x, depth + 1)).filter((x) => x !== undefined);
    return items.length ? items : undefined;
  }
  if (is_obj(v)) {
    const out: Obj = {};
    for (const k of Object.keys(v)) {
      if (BLOCKED_KEYS.has(k)) continue;
      const c = clean_loose(v[k], depth + 1);
      if (c !== undefined) out[k] = c;
    }
    return Object.keys(out).length ? out : undefined;
  }
  return undefined;
}

function empty_of(t: unknown): unknown {
  if (typeof t === "string") return "";
  if (typeof t === "number") return 0;
  if (typeof t === "boolean") return false;
  if (Array.isArray(t)) return [];
  if (is_obj(t)) {
    const out: Obj = {};
    for (const k of Object.keys(t)) if (!BLOCKED_KEYS.has(k)) out[k] = empty_of(t[k]);
    return out;
  }
  return t;
}

function is_blank(v: unknown): boolean {
  if (typeof v === "string") return !v;
  if (Array.isArray(v)) return v.every(is_blank);
  if (is_obj(v)) return Object.values(v).every(is_blank);
  return typeof v !== "number" && typeof v !== "boolean";
}

function clean_by_template(t: unknown, v: unknown, key = "", depth = 0): unknown {
  if (depth > MAX_DEPTH) return undefined;
  if (t === undefined) return clean_loose(v, depth);
  if (typeof t === "string") {
    const s = str(v).slice(0, MAX_TEXT);
    if (!s) return undefined;
    if (key === "href" && !safe_href(s)) return undefined;
    return s;
  }
  if (typeof t === "number") return to_number(v);
  if (typeof t === "boolean") return typeof v === "boolean" ? v : undefined;
  if (t === null) {
    if (!is_obj(v)) return undefined;
    const label = str(v.label).slice(0, MAX_TEXT);
    const href = str(v.href).slice(0, MAX_TEXT);
    return label && safe_href(href) ? { label, href } : undefined;
  }
  if (Array.isArray(t)) {
    if (!Array.isArray(v)) return undefined;
    const items = v
      .slice(0, MAX_ITEMS)
      .map((x) => clean_by_template(t[0], x, "", depth + 1))
      .filter((x) => x !== undefined);
    return items.length ? items : undefined;
  }
  if (is_obj(t)) {
    if (!is_obj(v)) return undefined;
    const out: Obj = {};
    for (const k of Object.keys(t)) {
      if (BLOCKED_KEYS.has(k)) continue;
      const c = clean_by_template(t[k], v[k], k, depth + 1);
      out[k] = c === undefined ? empty_of(t[k]) : c;
    }
    if ("href" in t && !out.href) return undefined;
    return is_blank(out) ? undefined : out;
  }
  return undefined;
}

function merge_value(d: unknown, o: unknown, key = "", depth = 0): unknown {
  if (is_obj(d)) {
    if (!is_obj(o)) return undefined;
    const out: Obj = {};
    for (const k of Object.keys(d)) {
      if (BLOCKED_KEYS.has(k)) continue;
      const m = merge_value(d[k], o[k], k, depth + 1);
      out[k] = m === undefined ? d[k] : m;
    }
    return out;
  }
  return clean_by_template(d, o, key, depth);
}

function parse_json(raw: unknown): unknown {
  if (typeof raw !== "string") return raw;
  if (!raw.trim() || raw.length > MAX_JSON) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function mergeCopy<T>(defaults: T, override: unknown): T {
  const merged = merge_value(defaults, parse_json(override));
  return (merged === undefined ? defaults : merged) as T;
}

function parse_list(raw: unknown): unknown[] {
  const parsed = parse_json(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function paragraphs(text: unknown): string[] {
  if (typeof text !== "string") return [];
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function headline_lines(v: unknown): string[] {
  if (typeof v !== "string") return [];
  return v
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, HERO_MAX_LINES);
}

function to_team_member(v: unknown): TeamMember | null {
  if (!is_obj(v)) return null;
  const name = str(v.name);
  if (!name) return null;
  return { name, role: str(v.role), bio: str(v.bio), photo: str(v.photo) || null };
}

function to_stat(v: unknown): StatItem | null {
  if (!is_obj(v)) return null;
  const label = str(v.label);
  const n = to_number(v.n);
  if (!label || n === undefined) return null;
  return { n, label, desc: str(v.desc) };
}

function to_titled(v: unknown): { title: string; desc: string } | null {
  if (!is_obj(v)) return null;
  const title = str(v.title);
  return title ? { title, desc: str(v.desc) } : null;
}

function collect<T>(rows: unknown[], convert: (v: unknown) => T | null): T[] {
  const out: T[] = [];
  for (const row of rows) {
    const item = convert(row);
    if (item) out.push(item);
  }
  return out;
}

export function legacy_stats(s: SiteSettings): StatItem[] {
  return collect(parse_list(s.about_stats), to_stat);
}

function legacy_year(v: unknown): number | undefined {
  const n = Number(str(v));
  return Number.isInteger(n) && n >= 1000 && n <= 9999 ? n : undefined;
}

function legacy_override(page: PageKey, s: SiteSettings): Obj {
  switch (page) {
    case "shared": {
      const deco = (str(s.hero_deco) || str(s.studio_name).toUpperCase()).slice(0, HERO_DECO_MAX);
      return {
        brand: {
          name: s.studio_name,
          tagline: s.tagline,
          email: s.contact_email,
          response_time: s.response_time,
          founded_year: legacy_year(s.founded_year),
        },
        hero: { deco },
      };
    }
    case "home":
      return {
        hero: { lines: headline_lines(s.hero_headline), cta: { label: s.cta_text } },
        what: { intro: s.what_intro },
        work: { intro: s.work_intro },
      };
    case "services":
      return { process_steps: collect(parse_list(s.process_steps), to_titled) };
    case "about":
      return {
        story_paragraphs: paragraphs(s.about_story),
        stats_items: legacy_stats(s),
        values_items: collect(parse_list(s.about_values), to_titled),
        team_members: collect(parse_list(s.team), to_team_member),
        about_image: s.about_image,
        about_image_wide: s.about_image_wide,
      };
    default:
      return {};
  }
}

export function getCopy<K extends PageKey>(page: K, settings: SiteSettings): Defaults[K] {
  const with_legacy = mergeCopy(DEFAULTS[page], legacy_override(page, settings));
  return mergeCopy(with_legacy, settings[COPY_SETTING_KEY[page]]);
}

export type CopyVars = { name: string | number; year: string | number; founded_year: string | number };

export function fill_vars(text: string, vars: Partial<CopyVars>): string {
  return text.replace(/\{(name|year|founded_year)\}/g, (match, k: keyof CopyVars) =>
    vars[k] === undefined ? match : String(vars[k])
  );
}

export function get_vars(settings: SiteSettings): CopyVars {
  const brand = getCopy("shared", settings).brand;
  return { name: brand.name, year: new Date().getFullYear(), founded_year: brand.founded_year };
}
