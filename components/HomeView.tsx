"use client";
import "@/styles/home.css";
import { DEFAULTS, type HeroCopy, type SectionCopy } from "@/defaults";
import { fill_vars, legacy_stats } from "@/lib/copy";
import { useProjects, useServices } from "@/lib/useContent";
import { useCopy, useCopyVars } from "@/lib/use_copy";
import { useArkeosAnimations } from "@/hooks/useArkeosAnimations";
import { use_stat_values } from "@/hooks/use_stat_values";
import { useIntroDone } from "@/lib/preloader";
import type { StatItem } from "@/lib/types";
import { useSiteSettings, useSiteSettingsLoaded } from "./SiteSettings";
import HeroLayout from "./hero/HeroLayout";
import ServiceCard from "./ServiceCard";
import CtaSection from "./CtaSection";
import ProjectGrid from "./ProjectGrid";
import SectionHeader from "./SectionHeader";

const MAX_CARDS = 24;
const clamp_count = (n: number) => Math.min(MAX_CARDS, Math.max(0, Math.floor(n)));

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const ICONS = [
  <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
  <polygon points="5 3 19 12 5 21 5 3" />,
  <><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>,
  <><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></>,
];

export default function HomeView() {
  const settings = useSiteSettings();
  const settingsLoaded = useSiteSettingsLoaded();
  const allProjects = useProjects();
  const allServices = useServices();
  const introDone = useIntroDone();
  const copy = useCopy("home");
  const { brand } = useCopy("shared");
  const vars = useCopyVars();

  const projects = allProjects ? allProjects.slice(0, clamp_count(copy.work_count)) : [];
  const services = allServices ? allServices.slice(0, clamp_count(copy.what_count)) : [];
  const contentReady = settingsLoaded && allProjects !== null && allServices !== null;

  useArkeosAnimations({ ready: introDone && contentReady });

  const text = (v: string) => fill_vars(v, vars);
  const section = (c: SectionCopy): SectionCopy => ({ ...c, label: text(c.label) });

  const hero_copy: HeroCopy = {
    ...copy.hero,
    eyebrow: text(copy.hero.eyebrow),
    sub: copy.hero.sub || brand.tagline,
    ghost: copy.hero.ghost || brand.name,
  };

  const auto_n = use_stat_values();
  const own_stats = !same(copy.why_stats, DEFAULTS.home.why_stats);
  const legacy = legacy_stats(settings);
  const stats: StatItem[] =
    !own_stats && legacy.length > 0
      ? legacy
      : copy.why_stats.map((w, i) => ({ ...w, n: w.n > 0 ? w.n : auto_n[i] ?? 0 }));
  const why = section(copy.why);

  return (
    <main className="pg-home">
      <HeroLayout copy={hero_copy} ariaLabel={brand.name} variant="full" />

      {services.length > 0 && (
        <section id="what" className="section" aria-label={copy.what.label}>
          <SectionHeader cta_id="btn-svc" copy={section(copy.what)} />
          <div className="pillars" role="list">
            {services.map((s, i) => <ServiceCard key={s.id} service={s} icon={ICONS[i % ICONS.length]} />)}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section id="projects" className="section" aria-label={copy.work.label}>
          <SectionHeader cta_id="btn-all" copy={section(copy.work)} />
          <ProjectGrid projects={projects} variant="home" />
        </section>
      )}

      {contentReady && stats.length > 0 && (
        <section id="why" className="section" aria-label={why.label}>
          <SectionHeader copy={why} />
          <div className="why-grid" role="list">
            {stats.map((w) => (
              <div key={w.label} className="why-item reveal" role="listitem">
                <div className="why-num" data-counter={w.n} aria-label={String(w.n)}>0</div>
                <h3 className="why-label">{w.label}</h3>
                {w.desc && <p className="why-desc">{w.desc}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <CtaSection />
    </main>
  );
}
