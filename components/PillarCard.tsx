"use client";
import { useEffect, useState } from "react";
import { safeUrl } from "@/lib/gsap";
import type { Pillar } from "@/lib/types";
import { CinemaBg } from "./CinemaMedia";

type Props = { pillar: Pillar; icon: React.ReactNode };

export default function PillarCard({ pillar, icon }: Props) {
  const [hover, setHover] = useState(false);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  const iconSrc = pillar.icon_url ? safeUrl(pillar.icon_url) : null;
  const active = hover || touch;

  return (
    <article
      className="pillar reveal"
      role="listitem"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      tabIndex={pillar.cinema_url ? 0 : undefined}
    >
      {pillar.cinema_url && (
        <div className="pillar-cinema-bg" aria-hidden="true">
          <CinemaBg url={pillar.cinema_url} type={pillar.cinema_type} active={active} />
        </div>
      )}
      <div className="pillar-body">
        <div className="pillar-ico" aria-hidden="true">
          {iconSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={iconSrc} alt="" />
          ) : (
            <svg viewBox="0 0 24 24">{icon}</svg>
          )}
        </div>
        <h3 className="pillar-title">{pillar.title}</h3>
        {pillar.description && <p className="pillar-desc">{pillar.description}</p>}
      </div>
    </article>
  );
}
