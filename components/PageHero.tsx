"use client";
import { safeUrl } from "@/lib/gsap";
import { useSiteSettings } from "./SiteSettings";
import SectionH2 from "./SectionH2";

type Props = {
  ariaLabel: string;
  ghost: string;
  label: string;
  lines: string[];
  sub: string;
  grouped?: boolean;
};

export default function PageHero({ ariaLabel, ghost, label, lines, sub, grouped }: Props) {
  const settings = useSiteSettings();
  const videoSrc = safeUrl(settings.hero_video);
  const title = <SectionH2 as="h1" lines={lines} />;
  return (
    <section className="page-hero" aria-label={ariaLabel}>
      {videoSrc && (
        <>
          <div className="page-hero__video" aria-hidden="true">
            <video src={videoSrc} autoPlay muted loop playsInline aria-hidden="true" />
          </div>
          <div className="page-hero__veil" aria-hidden="true" />
        </>
      )}
      <div className="page-hero__ghost" aria-hidden="true">{ghost}</div>
      <div className="page-hero__body">
        {grouped ? (
          <div>
            <span className="section-lbl">{label}</span>
            {title}
          </div>
        ) : (
          <>
            <span className="section-lbl">{label}</span>
            {title}
          </>
        )}
        <p className="page-hero__sub">{sub}</p>
      </div>
    </section>
  );
}
