"use client";
import { useEffect, useRef } from "react";
import { safeUrl } from "@/lib/gsap";

const VIDEO_EXT = ["mp4", "webm", "mov", "ogg"];
const HTML_EXT = ["html", "htm"];
const ext_of = (m: string) => m.split("?")[0].split(".").pop()?.toLowerCase() ?? "";

export type MediaKind = "video" | "html" | "image";

export function media_kind(url: string): MediaKind {
  const e = ext_of(url);
  if (VIDEO_EXT.includes(e)) return "video";
  if (HTML_EXT.includes(e)) return "html";
  return "image";
}

type Props = { src?: string | null; active?: boolean };

export default function ProjectMedia({ src, active = true }: Props) {
  const url = safeUrl(src);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (active) el.play().catch(() => {});
    else el.pause();
  }, [active, url]);

  if (!url) return null;
  const kind = media_kind(url);
  if (kind === "video") return <video ref={video} src={url} autoPlay={active} muted loop playsInline preload="metadata" aria-hidden="true" />;
  if (kind === "html") return active ? <iframe src={url} title="" tabIndex={-1} sandbox="allow-scripts" loading="lazy" aria-hidden="true" /> : null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" aria-hidden="true" loading="lazy" draggable={false} />;
}
