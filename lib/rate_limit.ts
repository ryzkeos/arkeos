import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";

const remote =
  url && token
    ? new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.slidingWindow(MAX_PER_WINDOW, "10 m"),
        prefix: "arkeos:inquiry",
      })
    : null;

const hits = new Map<string, { count: number; reset: number }>();

function local_limited(key: string): boolean {
  const now = Date.now();
  if (hits.size > 5000) {
    for (const [k, entry] of hits) if (entry.reset <= now) hits.delete(k);
  }
  const entry = hits.get(key);
  if (!entry || entry.reset <= now) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function is_limited(key: string): Promise<boolean> {
  if (!remote) return local_limited(key);
  try {
    const result = await remote.limit(key);
    return !result.success;
  } catch {
    return local_limited(key);
  }
}
