"use client";
import "@/styles/services.css";
import { safeUrl } from "@/lib/gsap";
import { useCopy } from "@/lib/use_copy";
import { useServices } from "@/lib/useContent";
import { useArkeosAnimations } from "@/hooks/useArkeosAnimations";
import CtaSection from "./CtaSection";
import PageEffects from "./PageEffects";
import HeroLayout from "./hero/HeroLayout";
import SectionHeader from "./SectionHeader";
import { useSiteSettingsLoaded } from "./SiteSettings";

export default function ServicesView() {
  const services = useServices();
  const settingsLoaded = useSiteSettingsLoaded();
  const copy = useCopy("services");
  const process = copy.process_steps;

  useArkeosAnimations({ pageHero: true, ready: services !== null && settingsLoaded });

  return (
    <main className="pg-services">
      <PageEffects />
      <HeroLayout variant="page" ariaLabel={copy.hero.lines.join(" ")} copy={copy.hero} />

      <section id="services" aria-label={copy.capabilities.label}>
        <SectionHeader copy={copy.capabilities} />
        <div className="svc-grid" role="list" aria-busy={services === null}>
          {services === null ? null : (
            services.map((s, i) => (
              <article
                key={s.id}
                className={s.price ? "svc-row svc-row--priced reveal" : "svc-row reveal"}
                role="listitem"
                aria-label={s.title}
              >
                <div className="svc-ico" aria-hidden="true">
                  {s.icon_url && safeUrl(s.icon_url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={safeUrl(s.icon_url)!} alt="" />
                  ) : (
                    <svg viewBox="0 0 24 24">
                      <rect x="3" y="7" width="18" height="13" rx="2" />
                      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  )}
                </div>
                <div className="svc-body">
                  <p className="svc-num">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="svc-title">{s.title}</h3>
                  {s.description ? <p className="svc-desc">{s.description}</p> : null}
                </div>
                {s.price ? (
                  <div className="svc-meta">
                    <span className="svc-price">{s.price}</span>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>
        {services !== null && services.length === 0 && copy.empty_text ? (
          <p className="svc-empty">{copy.empty_text}</p>
        ) : null}
      </section>

      {process.length > 0 ? (
        <section id="process" aria-label={copy.process.label}>
          <SectionHeader copy={copy.process} />
          <div className="process-grid" role="list">
            {process.map((p, i) => (
              <div key={`${i}-${p.title}`} className="process-step reveal" role="listitem">
                <div className="process-step__num">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="process-step__title">{p.title}</h3>
                {p.desc ? <p className="process-step__desc">{p.desc}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <CtaSection />
    </main>
  );
}
