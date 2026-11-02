"use client";
import { useEffect, useRef } from "react";
import { safeUrl } from "@/lib/gsap";
import { media_kind } from "@/lib/media_type";
import { poster_url } from "@/lib/video_poster";
import { use_pooled_video } from "@/hooks/use_pooled_video";
import { use_video_keepalive } from "@/hooks/use_video_keepalive";
import { use_video_loading } from "@/hooks/use_video_loading";
import HtmlFrame from "./HtmlFrame";
import MediaImage from "./MediaImage";
import MediaLoader from "./MediaLoader";

export function CinemaBg({ url, active = false }: { url: string; active?: boolean }) {
  const src = safeUrl(url);
  const host = useRef<HTMLDivElement>(null);
  const kind = src ? media_kind(src) : null;
  const video_src = kind === "video" ? src : null;

  const { el_ref, holding, slot } = use_pooled_video(host, video_src, active);
  use_video_keepalive(el_ref, active && holding, video_src, slot);
  const loading = use_video_loading(el_ref, active && holding && !!video_src, video_src);
  const poster = poster_url(video_src);

  useEffect(() => {
    const el = el_ref.current;
    if (el && holding && !active) {
      el.pause();
      try { el.currentTime = 0; } catch {}
    }
  }, [active, holding, el_ref]);

  if (!src) return null;
  if (kind === "video") return (
    <div ref={host} className="pooled-media">
      {!holding && poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" aria-hidden="true" decoding="async" draggable={false} />
      )}
      {holding && loading && <MediaLoader />}
    </div>
  );
  if (kind === "html") return active ? <HtmlFrame src={src} /> : null;
  return <MediaImage src={src} />;
}
