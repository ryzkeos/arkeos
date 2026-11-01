"use client";
import { safeUrl } from "@/lib/gsap";
import type { Service } from "@/lib/types";
import { use_cinema_active } from "@/hooks/use_cinema_active";
import { CinemaBg } from "./CinemaMedia";

type Props = { service: Service; icon: React.ReactNode };

export default function ServiceCard({ service, icon }: Props) {
  const { active, handlers } = use_cinema_active();

  const iconSrc = service.icon_url ? safeUrl(service.icon_url) : null;
  return (
    <article
      className="pillar reveal"
      role="listitem"
      {...handlers}
      tabIndex={service.cinema_url ? 0 : undefined}
    >
      {service.cinema_url && (
        <div className="pillar-cinema-bg" aria-hidden="true">
          <CinemaBg url={service.cinema_url} active={active} />
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
        <h3 className="pillar-title">{service.title}</h3>
        {service.description && <p className="pillar-desc">{service.description}</p>}
      </div>
    </article>
  );
}
