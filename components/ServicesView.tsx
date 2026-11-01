"use client";
import "@/styles/services.css";
import { useCopy } from "@/lib/use_copy";
import { useServices } from "@/lib/useContent";
import { useArkeosAnimations } from "@/hooks/useArkeosAnimations";
import CtaSection from "./CtaSection";
import HeroLayout from "./hero/HeroLayout";
import ProcessFlow from "./ProcessFlow";
import SectionHeader from "./SectionHeader";
import ServiceRow from "./ServiceRow";
import { useSiteSettingsLoaded } from "./SiteSettings";

export default function ServicesView() {
  const services = useServices();
  const settingsLoaded = useSiteSettingsLoaded();
  const copy = useCopy("services");
  const process = copy.process_steps;

  useArkeosAnimations({ pageHero: true, ready: services !== null && settingsLoaded });

  return (
    <main className="pg-services">
      <HeroLayout variant="page" ariaLabel={copy.hero.lines.join(" ")} copy={copy.hero} />

      <section id="services" aria-label={copy.capabilities.label}>
        <SectionHeader copy={copy.capabilities} />
        <div className="svc-grid" role="list" aria-busy={services === null}>
          {services === null ? null : (
            services.map((s, i) => <ServiceRow key={s.id} service={s} index={i} />)
          )}
        </div>
        {services !== null && services.length === 0 && copy.empty_text ? (
          <p className="svc-empty">{copy.empty_text}</p>
        ) : null}
      </section>

      {process.length > 0 ? (
        <section id="process" aria-label={copy.process.label}>
          <SectionHeader copy={copy.process} />
          <ProcessFlow steps={process} />
        </section>
      ) : null}

      <CtaSection />
    </main>
  );
}
