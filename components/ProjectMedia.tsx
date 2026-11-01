"use client";
import { useEffect, useRef } from "react";
import { safeUrl } from "@/lib/gsap";
import { media_kind } from "@/lib/media_type";

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
