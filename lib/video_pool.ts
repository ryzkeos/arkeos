import { poster_url } from "./video_poster";

const MIN_PLAY_MS = 500;
const PASS_MS = 120;
const IDLE_MS = 30000;
const LIMIT_DESKTOP = 10;
const LIMIT_TOUCH = 6;
const LIMIT_LOW = 4;
const UNLOAD_SCREENS_DESKTOP = 3;
const UNLOAD_SCREENS_TOUCH = 1.5;

type User = {
  host: HTMLElement;
  shared: Shared;
  active: boolean;
  pinned: boolean;
  edge: number;
  distance: number;
  visible: boolean;
  on_hold: (holding: boolean) => void;
};

type Shared = {
  src: string;
  attr: string;
  el: HTMLVideoElement;
  users: Set<User>;
  holder: User | null;
  loaded: boolean;
  allowed: boolean;
  played_at: number;
  edge: number;
  distance: number;
  idle: number;
  on_playing: () => void;
};

type Profile = { limit: number; unload_screens: number; light: boolean };

let profile: Profile | null = null;
let timer = 0;
let pending = false;
let listening = false;
const pool = new Map<string, Shared>();

function get_profile(): Profile {
  if (profile) return profile;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const touch = window.matchMedia("(pointer: coarse)").matches;
  const low = (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) || (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2);
  profile = {
    limit: low ? LIMIT_LOW : touch ? LIMIT_TOUCH : LIMIT_DESKTOP,
    unload_screens: touch ? UNLOAD_SCREENS_TOUCH : UNLOAD_SCREENS_DESKTOP,
    light: touch || low,
  };
  return profile;
}

export const is_light_device = () => get_profile().light;

export const pool_has = (src: string) => pool.has(src);

const with_start = (src: string) => (src.includes("#") ? src : `${src}#t=0.001`);

function create(src: string): Shared {
  const el = document.createElement("video");
  el.muted = true;
  el.defaultMuted = true;
  el.loop = true;
  el.playsInline = true;
  el.preload = "metadata";
  el.setAttribute("aria-hidden", "true");
  const poster = poster_url(src);
  if (poster) el.poster = poster;
  const attr = with_start(src);
  el.src = attr;
  const shared: Shared = { src, attr, el, users: new Set(), holder: null, loaded: true, allowed: false, played_at: 0, edge: 0, distance: Infinity, idle: 0, on_playing: () => {} };
  shared.on_playing = () => { shared.played_at = performance.now(); };
  el.addEventListener("playing", shared.on_playing);
  pool.set(src, shared);
  return shared;
}

function unload(shared: Shared) {
  const { el } = shared;
  try {
    el.pause();
    el.removeAttribute("src");
    el.load();
  } catch {}
  shared.loaded = false;
  shared.allowed = false;
}

function reload(shared: Shared) {
  shared.el.src = shared.attr;
  shared.loaded = true;
}

function destroy(shared: Shared) {
  window.clearTimeout(shared.idle);
  shared.el.removeEventListener("playing", shared.on_playing);
  if (shared.el.parentNode) shared.el.parentNode.removeChild(shared.el);
  unload(shared);
  pool.delete(shared.src);
  stop_listening();
}

function measure(user: User, vw: number, vh: number) {
  const r = user.host.getBoundingClientRect();
  const dy = r.bottom < 0 ? -r.bottom : r.top > vh ? r.top - vh : 0;
  const dx = r.right < 0 ? -r.right : r.left > vw ? r.left - vw : 0;
  user.edge = Math.max(dy, dx);
  user.visible = user.edge === 0 && r.width > 0 && r.height > 0;
  user.distance = user.edge > 0 ? user.edge + vh : Math.abs((r.top + r.bottom) / 2 - vh / 2);
}

function choose(shared: Shared): User | null {
  const all = [...shared.users];
  if (!all.length) return null;
  const live = all.filter((u) => u.active);
  const pool_users = live.length ? live : all;
  const seen = pool_users.filter((u) => u.visible);
  if (shared.holder && seen.includes(shared.holder)) return shared.holder;
  const from = seen.length ? seen : pool_users;
  return from.reduce((a, b) => (b.distance < a.distance ? b : a));
}

function move(shared: Shared, next: User | null) {
  const prev = shared.holder;
  if (prev === next) return;
  if (prev) {
    if (shared.el.parentNode === prev.host) prev.host.removeChild(shared.el);
    prev.on_hold(false);
  }
  shared.holder = next;
  if (next) {
    next.host.insertBefore(shared.el, next.host.firstChild);
    next.on_hold(true);
  }
}

function run_pass() {
  timer = 0;
  pending = false;
  if (!pool.size) return;
  const { limit, unload_screens } = get_profile();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const now = performance.now();
  let retry = false;

  pool.forEach((shared) => {
    shared.users.forEach((u) => measure(u, vw, vh));
    move(shared, choose(shared));
    const holder = shared.holder;
    shared.edge = holder ? holder.edge : Infinity;
    shared.distance = holder ? holder.distance : Infinity;
    const pinned = !!holder?.pinned;
    if (!holder) return;
    if (!pinned && shared.edge > unload_screens * vh) {
      if (shared.loaded) unload(shared);
    } else if (!shared.loaded) reload(shared);
  });

  const ranked = [...pool.values()]
    .filter((s) => s.loaded && s.holder?.active)
    .sort((a, b) => Number(!!b.holder?.pinned) - Number(!!a.holder?.pinned) || a.distance - b.distance);
  const keep = new Set(ranked.slice(0, Math.max(limit, ranked.filter((s) => s.holder?.pinned).length)));

  pool.forEach((shared) => {
    if (!shared.holder) return;
    const next = keep.has(shared);
    shared.allowed = next;
    const { el } = shared;
    el.preload = next ? "auto" : el.poster ? "none" : "metadata";
    if (next) {
      if (el.paused && !document.hidden && !el.ended && el.isConnected) el.play().catch(() => {});
      return;
    }
    if (el.paused) return;
    if (now - shared.played_at >= MIN_PLAY_MS) el.pause();
    else retry = true;
  });

  if (retry) schedule();
}

function schedule() {
  if (timer) return;
  timer = window.setTimeout(run_pass, PASS_MS);
}

function schedule_now() {
  if (pending) return;
  pending = true;
  queueMicrotask(() => {
    window.clearTimeout(timer);
    run_pass();
  });
}

function start_listening() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}

function stop_listening() {
  if (!listening || pool.size) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  window.clearTimeout(timer);
  timer = 0;
}

export type VideoSlot = {
  el: HTMLVideoElement;
  is_allowed: () => boolean;
  set_active: (active: boolean) => void;
  release: () => void;
};

type Options = { pinned?: boolean; on_hold: (holding: boolean) => void };

export function acquire_video(src: string, host: HTMLElement, { pinned = false, on_hold }: Options): VideoSlot {
  const shared = pool.get(src) ?? create(src);
  window.clearTimeout(shared.idle);
  shared.idle = 0;
  const user: User = { host, shared, active: false, pinned, edge: Infinity, distance: Infinity, visible: false, on_hold };
  shared.users.add(user);
  start_listening();
  schedule_now();

  return {
    el: shared.el,
    is_allowed: () => shared.holder === user && shared.allowed,
    set_active: (active) => {
      user.active = active;
      schedule_now();
    },
    release: () => {
      if (!shared.users.delete(user)) return;
      if (shared.holder === user) {
        if (shared.el.parentNode === host) host.removeChild(shared.el);
        shared.holder = null;
        shared.allowed = false;
        try { shared.el.pause(); } catch {}
      }
      if (shared.users.size === 0) shared.idle = window.setTimeout(() => destroy(shared), IDLE_MS);
      schedule_now();
    },
  };
}

export function warm_video_pooled(src: string, wait_ms: number): Promise<void> {
  return new Promise((resolve) => {
    const shared = pool.get(src) ?? create(src);
    if (!shared.users.size) {
      window.clearTimeout(shared.idle);
      shared.idle = window.setTimeout(() => destroy(shared), IDLE_MS * 2);
    }
    start_listening();
    const { el } = shared;
    if (el.readyState >= 2) return resolve();
    const done = () => {
      window.clearTimeout(t);
      el.removeEventListener("loadeddata", done);
      el.removeEventListener("error", done);
      resolve();
    };
    const t = window.setTimeout(done, wait_ms);
    el.addEventListener("loadeddata", done);
    el.addEventListener("error", done);
  });
}
