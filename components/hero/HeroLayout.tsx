"use client";
import "@/styles/hero.css";
import { useRef } from "react";
import { use_motion_allowed } from "@/hooks/use_motion_allowed";
import { use_video_keepalive } from "@/hooks/use_video_keepalive";
import { use_video_loading } from "@/hooks/use_video_loading";
import type { HeroCopy } from "@/defaults";
import { safeUrl } from "@/lib/gsap";
import { useIntroDone } from "@/lib/preloader";
import { useCopy } from "@/lib/use_copy";
import Btn from "../Btn";
import MediaLoader from "../MediaLoader";
import { useSiteSettings, useSiteSettingsLoaded } from "../SiteSettings";
import { use_hero_intro } from "./use_hero_intro";

const HERO_DECO_MAX = 12;

type Props = {
  copy: HeroCopy;
  ariaLabel: string;
  variant?: "full" | "page";
};

export default function HeroLayout({ copy, ariaLabel, variant = "full" }: Props) {
  const root = useRef<HTMLElement>(null);
  const settings = useSiteSettings();
  const loaded = useSiteSettingsLoaded();
  const introDone = useIntroDone();
  const { hero: deco_copy } = useCopy("shared");

  use_hero_intro(root, loaded && introDone);

  const video_src = safeUrl(settings.hero_video);
  const hero_video = useRef<HTMLVideoElement>(null);
  const motion_allowed = use_motion_allowed();
  const show_video = !!video_src && motion_allowed;
  use_video_keepalive(hero_video, show_video, video_src);
  const hero_loading = use_video_loading(hero_video, show_video, video_src);
  const lines = loaded ? copy.lines : [];
  const deco = deco_copy.deco.slice(0, HERO_DECO_MAX);

  return (
    <section id="hero" ref={root} className={`hero hero--${variant}`} aria-label={ariaLabel}>
      <div className="hero-video" aria-hidden="true">
        {show_video && <video ref={hero_video} src={video_src} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />}
        {show_video && hero_loading && <MediaLoader />}
      </div>
      <div className="hero-veil" aria-hidden="true" />
      {copy.ghost && <div className="hero-ghost" aria-hidden="true">{copy.ghost}</div>}

      <div className="hero-top-left">
        {copy.eyebrow && <p className="hero-eyebrow">{copy.eyebrow}</p>}
        <h1 className="hero-h1" aria-label={lines.join(" ")}>
          {lines.map((line, i) => (
            <span key={`${i}-${line}`}><em><span className="hero-word">{line}</span></em></span>
          ))}
        </h1>
        {copy.sub && <p className="hero-sub">{copy.sub}</p>}
        {copy.cta && <Btn href={copy.cta.href} id="btn-hero" label={copy.cta.label} />}
      </div>

      {deco && (
        <div className="hero-bottom-right" aria-hidden="true">
          <div className="hero-studio" tabIndex={0}>
            <span><em>
              <span className="hero-studio-word">
                <span className="hero-studio-a">{deco}</span>
                {deco_copy.hover_word && <span className="hero-studio-b" aria-hidden="true">{deco_copy.hover_word}</span>}
              </span>
            </em></span>
          </div>
        </div>
      )}

      <div
        className="hero-chevrons"
        id="hero-scroll"
        {...(deco_copy.scroll_label ? { role: "img", "aria-label": deco_copy.scroll_label } : { "aria-hidden": true })}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8l7 7 7-7" /></svg>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8l7 7 7-7" /></svg>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8l7 7 7-7" /></svg>
      </div>
    </section>
  );
}
