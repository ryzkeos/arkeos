import * as db from "@/lib/db";
import { capture_poster, poster_url } from "@/lib/video_poster";
import { MEDIA_BUCKET } from "./shared";

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
