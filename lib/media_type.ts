import type { CinemaType } from "./types";

const VIDEO_EXT = new Set(["mp4", "webm", "mov", "m4v", "ogv", "ogg"]);
const HTML_EXT = new Set(["html", "htm"]);

export function media_ext(url: string): string {
  let path = url;
  try {
    path = new URL(url, "https://placeholder.invalid").pathname;
  } catch {
    path = url.split(/[?#]/)[0];
  }
  return path.split(".").pop()?.toLowerCase() ?? "";
}

export function media_kind(url: string): CinemaType {
  const ext = media_ext(url);
  if (VIDEO_EXT.has(ext)) return "video";
  if (HTML_EXT.has(ext)) return "html";
  return "image";
}
