const MIN_PLAY_MS = 500;
const PASS_MS = 120;
const LIMIT_DESKTOP = 10;
const LIMIT_TOUCH = 6;
const LIMIT_LOW = 4;
const UNLOAD_SCREENS_DESKTOP = 3;
const UNLOAD_SCREENS_TOUCH = 1.5;

type Entry = {
  el: HTMLVideoElement;
  src: string;
  active: boolean;
  allowed: boolean;
  loaded: boolean;
  played_at: number;
  distance: number;
};

type Profile = { limit: number; unload_screens: number };

let profile: Profile | null = null;
let timer = 0;
let listening = false;
const entries = new Set<Entry>();

function get_profile(): Profile {
  if (profile) return profile;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const touch = window.matchMedia("(pointer: coarse)").matches;
  const low = (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) || (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2);
  const limit = low ? LIMIT_LOW : touch ? LIMIT_TOUCH : LIMIT_DESKTOP;
  profile = { limit, unload_screens: touch ? UNLOAD_SCREENS_TOUCH : UNLOAD_SCREENS_DESKTOP };
  return profile;
}

function unload(entry: Entry) {
  const { el } = entry;
  try {
    el.pause();
    el.removeAttribute("src");
    el.load();
  } catch {}
  entry.loaded = false;
  entry.allowed = false;
}

function reload(entry: Entry) {
  const { el } = entry;
  el.src = entry.src;
  entry.loaded = true;
  if (entry.active) el.load();
}

function run_pass() {
  timer = 0;
  if (!entries.size) return;
  const { limit, unload_screens } = get_profile();
  const vh = window.innerHeight;
  const mid = vh / 2;
  const now = performance.now();
  let retry = false;

  entries.forEach((entry) => {
    const rect = entry.el.getBoundingClientRect();
    const edge = rect.bottom < 0 ? -rect.bottom : rect.top > vh ? rect.top - vh : 0;
    entry.distance = edge > 0 ? edge + vh : Math.abs((rect.top + rect.bottom) / 2 - mid);
    if (edge > unload_screens * vh) {
      if (entry.loaded) unload(entry);
    } else if (!entry.loaded) reload(entry);
  });

  const ranked = [...entries].filter((e) => e.loaded && e.active).sort((a, b) => a.distance - b.distance);
  const keep = new Set(ranked.slice(0, limit));

  entries.forEach((entry) => {
    const next = keep.has(entry);
    entry.allowed = next;
    const { el } = entry;
    if (next) {
      if (el.paused && !document.hidden && !el.ended) el.play().catch(() => {});
      return;
    }
    if (el.paused) return;
    if (now - entry.played_at >= MIN_PLAY_MS) el.pause();
    else retry = true;
  });

  if (retry) schedule();
}

function schedule() {
  if (timer) return;
  timer = window.setTimeout(run_pass, PASS_MS);
}

function listen() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}

function unlisten() {
  if (!listening || entries.size) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  window.clearTimeout(timer);
  timer = 0;
}

export type VideoSlot = {
  is_allowed: () => boolean;
  set_active: (active: boolean) => void;
  release: () => void;
};

export function register_video(el: HTMLVideoElement, src: string): VideoSlot {
  const entry: Entry = { el, src, active: false, allowed: false, loaded: true, played_at: 0, distance: Infinity };
  const on_playing = () => { entry.played_at = performance.now(); };
  el.addEventListener("playing", on_playing);
  entries.add(entry);
  listen();
  schedule();

  return {
    is_allowed: () => entry.allowed,
    set_active: (active) => {
      entry.active = active;
      if (!active) entry.allowed = false;
      schedule();
    },
    release: () => {
      el.removeEventListener("playing", on_playing);
      entries.delete(entry);
      unlisten();
      schedule();
    },
  };
}
