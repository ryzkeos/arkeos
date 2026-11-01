const PREFIX = "arkeos_cache_v1:";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

type Entry = { at: number; data: unknown };

export function cache_read(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry | null;
    if (!entry || typeof entry.at !== "number" || Date.now() - entry.at > MAX_AGE_MS) return null;
    return entry.data ?? null;
  } catch {
    return null;
  }
}

export function cache_write(key: string, data: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify({ at: Date.now(), data } satisfies Entry));
  } catch {}
}

export function cache_clear(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {}
}
