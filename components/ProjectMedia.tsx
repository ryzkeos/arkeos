"use client";
import { useRef } from "react";
import { safeUrl } from "@/lib/gsap";
import { media_kind } from "@/lib/media_type";
import { use_video_keepalive } from "@/hooks/use_video_keepalive";
import HtmlFrame from "./HtmlFrame";

type Props = { src?: string | null; active?: boolean };

export default function ProjectMedia({ src, active = true }: Props) {
  const url = safeUrl(src);
  const video = useRef<HTMLVideoElement>(null);

  use_video_keepalive(video, active, url);

  if (!url) return null;
  const kind = media_kind(url);
  if (kind === "video") return <video ref={video} src={url.includes("#") ? url : `${url}#t=0.001`} muted loop playsInline preload="metadata" aria-hidden="true" />;
  if (kind === "html") return active ? <HtmlFrame src={url} /> : null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img decoding="async" src={url} alt="" aria-hidden="true" loading="lazy" draggable={false} />;
}
