"use client";
import { useEffect, useRef } from "react";
import { safeUrl } from "@/lib/gsap";
import type { CinemaType } from "@/lib/types";
import { media_kind } from "./ProjectMedia";

export function CinemaBg({ url, type, active = false }: { url: string; type?: CinemaType; active?: boolean }) {
  const src = safeUrl(url);
  const kind = type ?? media_kind(url);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (active) {
      el.play().catch(() => {});
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [active]);

  if (!src) return null;
  if (kind === "video") return <video ref={video} src={src} muted loop playsInline preload="metadata" aria-hidden="true" />;
  if (kind === "html") return active ? <iframe src={src} tabIndex={-1} title="" sandbox="allow-scripts" aria-hidden="true" /> : null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" aria-hidden="true" draggable={false} />;
}
