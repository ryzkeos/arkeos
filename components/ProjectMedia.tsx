"use client";
import { useRef } from "react";
import { safeUrl } from "@/lib/gsap";
import { media_kind } from "@/lib/media_type";
import { poster_url } from "@/lib/video_poster";
import { use_motion_allowed } from "@/hooks/use_motion_allowed";
import { use_near_screen } from "@/hooks/use_near_screen";
import { use_pooled_video } from "@/hooks/use_pooled_video";
import { use_video_keepalive } from "@/hooks/use_video_keepalive";
import { use_video_loading } from "@/hooks/use_video_loading";
import HtmlFrame from "./HtmlFrame";
import MediaImage from "./MediaImage";
import MediaLoader from "./MediaLoader";

type Props = { src?: string | null; active?: boolean; budget?: boolean };

export default function ProjectMedia({ src, active = true, budget = false }: Props) {
  const url = safeUrl(src);
  const host = useRef<HTMLDivElement>(null);
  const kind = url ? media_kind(url) : null;
  const motion = use_motion_allowed();
  const live = active && (!budget || motion);
  const video_src = kind === "video" ? url : null;

  const { el_ref, holding, slot } = use_pooled_video(host, video_src, live, !budget);
  use_video_keepalive(el_ref, live && holding, video_src, slot);
  const loading = use_video_loading(el_ref, live && holding && !!video_src, video_src);
  const near = use_near_screen(host, kind === "html");
  const poster = poster_url(video_src);

  if (!url) return null;
  if (kind === "video") return (
    <div ref={host} className="pooled-media">
      {!holding && poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" aria-hidden="true" decoding="async" draggable={false} />
      )}
      {holding && loading && <MediaLoader />}
    </div>
  );
  if (kind === "html") return <div ref={host} className="pooled-media">{active && near ? <HtmlFrame src={url} /> : null}</div>;
  return <MediaImage src={url} />;
}
