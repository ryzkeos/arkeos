"use client";
import { useEffect, useRef } from "react";
import { safeUrl } from "@/lib/gsap";
import { media_kind } from "@/lib/media_type";
import { use_video_keepalive } from "@/hooks/use_video_keepalive";
import HtmlFrame from "./HtmlFrame";

export function CinemaBg({ url, active = false }: { url: string; active?: boolean }) {
  const src = safeUrl(url);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current;
    if (el && !active) {
      el.pause();
      el.currentTime = 0;
    }
  }, [active]);

  use_video_keepalive(video, active, src);

  if (!src) return null;
  const kind = media_kind(src);
  if (kind === "video") return <video ref={video} src={src.includes("#") ? src : `${src}#t=0.001`} muted loop playsInline preload="metadata" aria-hidden="true" />;
  if (kind === "html") return active ? <HtmlFrame src={src} /> : null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img decoding="async" loading="lazy" src={src} alt="" aria-hidden="true" draggable={false} />;
}
