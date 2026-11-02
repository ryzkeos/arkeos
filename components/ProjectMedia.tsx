"use client";
import { useEffect, useRef, useState } from "react";
import { safeUrl } from "@/lib/gsap";
import { media_kind } from "@/lib/media_type";
import { use_motion_allowed } from "@/hooks/use_motion_allowed";
import { poster_url } from "@/lib/video_poster";
import { register_video, type VideoSlot } from "@/lib/video_budget";
import { use_video_keepalive } from "@/hooks/use_video_keepalive";
import { use_video_loading } from "@/hooks/use_video_loading";
import HtmlFrame from "./HtmlFrame";
import MediaImage from "./MediaImage";
import MediaLoader from "./MediaLoader";

type Props = { src?: string | null; active?: boolean; budget?: boolean };

export default function ProjectMedia({ src, active = true, budget = false }: Props) {
  const url = safeUrl(src);
  const video = useRef<HTMLVideoElement>(null);

  const kind = url ? media_kind(url) : null;
  const poster = budget && kind === "video" ? poster_url(url) : null;
  const motion = use_motion_allowed();
  const live = active && (!budget || motion);
  const [slot, set_slot] = useState<VideoSlot | null>(null);

  useEffect(() => {
    const el = video.current;
    if (!budget || !el || !url || kind !== "video") return;
    const next = register_video(el, el.getAttribute("src") || url);
    set_slot(next);
    return () => { next.release(); set_slot(null); };
  }, [budget, kind, url]);

  useEffect(() => { slot?.set_active(live); }, [slot, live]);

  use_video_keepalive(video, live, url, slot);
  const loading = use_video_loading(video, live && kind === "video", url);

  if (!url) return null;
  if (kind === "video") return (
    <>
      <video ref={video} src={url.includes("#") ? url : `${url}#t=0.001`} poster={poster ?? undefined} muted loop playsInline preload={poster ? "none" : "metadata"} aria-hidden="true" />
      {loading && <MediaLoader />}
    </>
  );
  if (kind === "html") return active ? <HtmlFrame src={url} /> : null;
  return <MediaImage src={url} />;
}
