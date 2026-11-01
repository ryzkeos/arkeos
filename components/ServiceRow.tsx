"use client";
import { safeUrl } from "@/lib/gsap";
import type { Service } from "@/lib/types";
import { use_cinema_active } from "@/hooks/use_cinema_active";
import { CinemaBg } from "./CinemaMedia";

const MAX_TAGS = 5;

type Props = { service: Service; index: number };

export default function ServiceRow({ service, index }: Props) {
  const { active, handlers } = use_cinema_active();
  const icon = service.icon_url ? safeUrl(service.icon_url) : null;
  const tags = (service.tags ?? []).slice(0, MAX_TAGS);
  const cls = ["svc-row", service.cinema_url ? "svc-row--media" : "", "reveal"].filter(Boolean).join(" ");

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
          <CinemaBg url={service.cinema_url} type={service.cinema_type ?? "video"} active={active} />
        </div>
      )}
      <span className="svc-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <div className="svc-body">
        <h3 className="svc-title">{service.title}</h3>
        {service.description ? <p className="svc-desc">{service.description}</p> : null}
        {tags.length > 0 && (
          <div className="svc-tags">
            {tags.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
      </div>
      <div className="svc-meta">
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
        {service.price ? <span className="svc-price">{service.price}</span> : null}
      </div>
    </article>
  );
}
