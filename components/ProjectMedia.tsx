"use client";
import { useRef } from "react";
import { safeUrl } from "@/lib/gsap";
import { media_kind } from "@/lib/media_type";
import { use_video_keepalive } from "@/hooks/use_video_keepalive";
import { use_video_loading } from "@/hooks/use_video_loading";
import HtmlFrame from "./HtmlFrame";
import MediaImage from "./MediaImage";
import MediaLoader from "./MediaLoader";

type Props = { src?: string | null; active?: boolean };

export default function ProjectMedia({ src, active = true }: Props) {
  const url = safeUrl(src);
  const video = useRef<HTMLVideoElement>(null);

  const kind = url ? media_kind(url) : null;

  use_video_keepalive(video, active, url);
  const loading = use_video_loading(video, active && kind === "video", url);

  if (!url) return null;
  if (kind === "video") return (
    <>
      <video ref={video} src={url.includes("#") ? url : `${url}#t=0.001`} muted loop playsInline preload="metadata" aria-hidden="true" />
      {loading && <MediaLoader />}
    </>
  );
  if (kind === "html") return active ? <HtmlFrame src={url} /> : null;
  return <MediaImage src={url} />;
}
