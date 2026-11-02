import { media_kind } from "./media_type";

const STORAGE_MARK = "/storage/v1/object/public/";
const POSTER_WIDTH = 640;
const POSTER_QUALITY = 0.78;
const CAPTURE_TIMEOUT_MS = 10000;

export function poster_url(url?: string | null): string | null {
  if (!url || !url.includes(STORAGE_MARK) || media_kind(url) !== "video") return null;
  const [base, query = ""] = url.split("#")[0].split("?");
  const next = base.replace(/\.[^./]+$/, ".poster.jpg");
  return next === base ? null : query ? `${next}?${query}` : next;
}

export async function capture_poster(file: File): Promise<File | null> {
  if (typeof document === "undefined") return null;
  const object_url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  try {
    const frame = await new Promise<Blob | null>((resolve) => {
      const timer = window.setTimeout(() => resolve(null), CAPTURE_TIMEOUT_MS);
      const done = (blob: Blob | null) => { window.clearTimeout(timer); resolve(blob); };
      video.onerror = () => done(null);
      video.onloadedmetadata = () => {
        video.currentTime = Math.min(0.1, (video.duration || 0.2) / 2);
      };
      video.onseeked = () => {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) return done(null);
        const scale = Math.min(1, POSTER_WIDTH / w);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return done(null);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => done(blob), "image/jpeg", POSTER_QUALITY);
      };
      video.src = object_url;
    });
    return frame && frame.size > 0 ? new File([frame], "poster.jpg", { type: "image/jpeg", lastModified: Date.now() }) : null;
  } catch {
    return null;
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(object_url);
  }
}
