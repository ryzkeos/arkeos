import type { CinemaType } from "./types";

const VIDEO_EXT = new Set(["mp4", "webm", "mov", "m4v", "ogv"]);
const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif", "svg"]);
const HTML_EXT = new Set(["html", "htm"]);

export function resolve_media_type(url: string, declared: CinemaType): CinemaType {
  let path = url;
  try {
    path = new URL(url, "https://placeholder.invalid").pathname;
  } catch {}
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  if (VIDEO_EXT.has(ext)) return "video";
  if (IMAGE_EXT.has(ext)) return "image";
  if (HTML_EXT.has(ext)) return "html";
  return declared;
}
