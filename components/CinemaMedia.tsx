"use client";
import { useEffect, useRef } from "react";
import { safeUrl } from "@/lib/gsap";
import { media_kind } from "@/lib/media_type";

export function CinemaBg({ url, active = false }: { url: string; active?: boolean }) {
  const src = safeUrl(url);
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
  const kind = media_kind(src);
  if (kind === "video") return <video ref={video} src={src.includes("#") ? src : `${src}#t=0.001`} muted loop playsInline preload="metadata" aria-hidden="true" />;
  if (kind === "html") return active ? <iframe src={src} tabIndex={-1} title="" sandbox="allow-scripts" aria-hidden="true" /> : null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" aria-hidden="true" draggable={false} />;
}
