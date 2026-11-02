import * as db from "@/lib/db";
import { capture_poster, poster_url } from "@/lib/video_poster";
import { MEDIA_BUCKET } from "./shared";

const VIDEO_URL = /https?:\/\/[^\s"'<>\\]+?\.(?:mp4|webm|mov|m4v|ogv|ogg)(?:\?[^\s"'<>\\]*)?/gi;

export async function collect_video_urls(): Promise<string[]> {
  const found = new Set<string>();
  const add = (text: unknown) => {
    if (typeof text !== "string") return;
    for (const m of text.matchAll(VIDEO_URL)) found.add(m[0]);
  };
  const [projects, services, settings] = await Promise.all([
    db.dbGetProjects().catch(() => []),
    db.dbGetServices().catch(() => []),
    db.dbLoadSiteSettings().catch(() => ({})),
  ]);
  (Array.isArray(projects) ? projects : []).forEach((p) => add(p.media));
  (Array.isArray(services) ? services : []).forEach((s) => add(s.cinema_url));
  Object.values(settings as Record<string, unknown>).forEach(add);
  return [...found];
}

async function has_file(url: string) {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function backfill_posters(urls: string[], on_status: (text: string) => void) {
  const prefix = db.dbPublicUrl(MEDIA_BUCKET, "");
  const todo = [...new Set(urls)].filter((u) => poster_url(u));
  let made = 0;
  let missed = 0;
  for (let i = 0; i < todo.length; i++) {
    const url = todo[i];
    const target = poster_url(url)!;
    on_status(`Posters ${i + 1} of ${todo.length}`);
    if (await has_file(target)) continue;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("video unreadable");
      const blob = await res.blob();
      const poster = await capture_poster(new File([blob], "video.mp4", { type: blob.type || "video/mp4" }));
      if (!poster) throw new Error("no frame");
      let path = target.split("?")[0].slice(prefix.length);
      try { path = decodeURIComponent(path); } catch {}
      await db.dbUpload(MEDIA_BUCKET, path, poster);
      made++;
    } catch {
      missed++;
    }
  }
  return { made, missed, total: todo.length };
}
