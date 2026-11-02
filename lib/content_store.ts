import { dbLoadSiteSettings } from "@/lib/db";
import { cache_read, cache_write } from "./cache";
import {
  fallback_projects,
  fallback_services,
  fetch_projects,
  fetch_services,
  parse_projects,
  parse_services,
  parse_settings,
} from "./content";
import type { Project, Service, SiteSettings } from "./types";

export type StoreState<T> = { data: T | null; ready: boolean };

export type Store<T> = {
  key: string;
  get: () => StoreState<T>;
  subscribe: (fn: () => void) => () => void;
  refresh: () => Promise<void>;
  seed: (data: T) => void;
};

const FRESH_MS = 15_000;
const EMPTY_STATE: StoreState<never> = { data: null, ready: false };

type Options<T> = {
  key: string;
  load: () => Promise<T>;
  parse: (raw: unknown) => T | null;
  fallback: () => T;
};

function create_store<T>(opts: Options<T>): Store<T> {
  let state: StoreState<T> = EMPTY_STATE;
  let hydrated = false;
  let in_flight: Promise<void> | null = null;
  let fetched_at = 0;
  const listeners = new Set<() => void>();

  const set = (next: StoreState<T>) => {
    state = next;
    listeners.forEach((fn) => fn());
  };

  const hydrate = () => {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    const cached = opts.parse(cache_read(opts.key));
    if (cached !== null) state = { data: cached, ready: true };
  };

  const get = () => {
    hydrate();
    return state;
  };

  const subscribe = (fn: () => void) => {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  };

  const seed = (data: T) => {
    if (typeof window === "undefined") return;
    hydrate();
    if (fetched_at > 0) return;
    fetched_at = Date.now();
    if (!state.ready || JSON.stringify(state.data) !== JSON.stringify(data)) set({ data, ready: true });
    cache_write(opts.key, data);
  };

  const refresh = () => {
    if (typeof window === "undefined") return Promise.resolve();
    hydrate();
    if (in_flight) return in_flight;
    if (state.ready && Date.now() - fetched_at < FRESH_MS) return Promise.resolve();
    in_flight = opts
      .load()
      .then(
        (data) => {
          fetched_at = Date.now();
          const changed = !state.ready || JSON.stringify(state.data) !== JSON.stringify(data);
          if (changed) set({ data, ready: true });
          cache_write(opts.key, data);
        },
        () => {
          if (!state.ready) set({ data: opts.fallback(), ready: true });
        }
      )
      .finally(() => {
        in_flight = null;
      });
    return in_flight;
  };

  return { key: opts.key, get, subscribe, refresh, seed };
}

export const settings_store = create_store<SiteSettings>({
  key: "settings",
  load: dbLoadSiteSettings,
  parse: parse_settings,
  fallback: () => ({}),
});

export const projects_store = create_store<Project[]>({
  key: "projects",
  load: fetch_projects,
  parse: parse_projects,
  fallback: fallback_projects,
});

export const services_store = create_store<Service[]>({
  key: "services",
  load: fetch_services,
  parse: parse_services,
  fallback: fallback_services,
});

export function warm_content(): void {
  void settings_store.refresh();
  void projects_store.refresh();
  void services_store.refresh();
}

if (typeof window !== "undefined") warm_content();
