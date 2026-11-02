"use client";
import { useEffect, useRef } from "react";
import { safeUrl } from "@/lib/gsap";
import { media_kind } from "@/lib/media_type";
import { use_video_keepalive } from "@/hooks/use_video_keepalive";
import { use_video_loading } from "@/hooks/use_video_loading";
import HtmlFrame from "./HtmlFrame";
import MediaImage from "./MediaImage";
import MediaLoader from "./MediaLoader";

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

  const kind = src ? media_kind(src) : null;

  use_video_keepalive(video, active, src);
  const loading = use_video_loading(video, active && kind === "video", src);

  if (!src) return null;
  if (kind === "video") return (
    <>
      <video ref={video} src={src.includes("#") ? src : `${src}#t=0.001`} muted loop playsInline preload="metadata" aria-hidden="true" />
      {loading && <MediaLoader />}
    </>
  );
  if (kind === "html") return active ? <HtmlFrame src={src} /> : null;
  return <MediaImage src={src} />;
}
