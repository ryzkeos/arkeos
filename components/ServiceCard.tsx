"use client";
import "@/styles/service_card.css";
import { safeUrl } from "@/lib/gsap";
import type { Service } from "@/lib/types";
import { use_cinema_active } from "@/hooks/use_cinema_active";
import { CinemaBg } from "./CinemaMedia";

const MAX_TAGS = 3;

type Props = { service: Service; icon: React.ReactNode; index: number };

export default function ServiceCard({ service, icon, index }: Props) {
  const { active, handlers } = use_cinema_active();
  const icon_src = service.icon_url ? safeUrl(service.icon_url) : null;
  const tags = (service.tags ?? []).slice(0, MAX_TAGS);

  return (
    <article
      className="svc-card sweep-line sweep-line--bottom reveal"
      role="listitem"
      {...handlers}
      tabIndex={service.cinema_url ? 0 : undefined}
    >
      {service.cinema_url && (
        <div className="svc-card__media" aria-hidden="true">
          <CinemaBg url={service.cinema_url} active={active} />
        </div>
      )}
      <div className="svc-card__top">
        <div className="svc-card__id">
          <span className="svc-card__num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        </div>
        <div className="svc-card__ico" aria-hidden="true">
          {icon_src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={icon_src} alt="" />
          ) : (
            <svg viewBox="0 0 24 24">{icon}</svg>
          )}
        </div>
      </div>
      <div className="svc-card__body">
        <h3 className="svc-card__title">{service.title}</h3>
        {service.description && <p className="svc-card__desc" title={service.description}>{service.description}</p>}
      </div>
      <div className="svc-card__foot">
        {tags.length > 0 && (
          <div className="svc-card__tags">
            {tags.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
      </div>
    </article>
  );
}
