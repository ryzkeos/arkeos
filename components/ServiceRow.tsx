"use client";
import { safeUrl } from "@/lib/gsap";
import type { Service } from "@/lib/types";
import { use_cinema_active } from "@/hooks/use_cinema_active";
import { CinemaBg } from "./CinemaMedia";

type Props = { service: Service; index: number };

export default function ServiceRow({ service, index }: Props) {
  const { active, handlers } = use_cinema_active();
  const icon = service.icon_url ? safeUrl(service.icon_url) : null;
  const cls = ["svc-row", service.price ? "svc-row--priced" : "", service.cinema_url ? "svc-row--media" : "", "reveal"]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={cls}
      role="listitem"
      aria-label={service.title}
      tabIndex={service.cinema_url ? 0 : undefined}
      {...handlers}
    >
      {service.cinema_url && (
        <div className="svc-cinema-bg" aria-hidden="true">
          <CinemaBg url={service.cinema_url} active={active} />
        </div>
      )}
      <div className="svc-ico" aria-hidden="true">
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={icon} alt="" />
        ) : (
          <svg viewBox="0 0 24 24">
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        )}
      </div>
      <div className="svc-body">
        <p className="svc-num">{String(index + 1).padStart(2, "0")}</p>
        <h3 className="svc-title">{service.title}</h3>
        {service.description ? <p className="svc-desc">{service.description}</p> : null}
      </div>
      {service.price ? (
        <div className="svc-meta">
          <span className="svc-price">{service.price}</span>
        </div>
      ) : null}
    </article>
  );
}
