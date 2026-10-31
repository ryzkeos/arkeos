"use client";
import "@/styles/home.css";
import type { HeroCopy } from "@/defaults";
import { getHomeStats, getIdentity, getSectionCopy } from "@/lib/content";
import { usePillars, useProjects } from "@/lib/useContent";
import { useArkeosAnimations } from "@/hooks/useArkeosAnimations";
import { useIntroDone } from "@/lib/preloader";
import { useSiteSettings, useSiteSettingsLoaded } from "./SiteSettings";
import HeroLayout from "./hero/HeroLayout";
import PillarCard from "./PillarCard";
import CtaSection from "./CtaSection";
import ProjectGrid from "./ProjectGrid";
import SectionH2 from "./SectionH2";
import SectionHeader from "./SectionHeader";

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
  const allPillars = usePillars();
  const introDone = useIntroDone();

  const identity = getIdentity(settings);
  const projects = allProjects ? allProjects.slice(0, 5) : [];
  const pillars = allPillars ?? [];
  const copy = getSectionCopy(settings);
  const stats = getHomeStats(settings, allProjects?.length ?? 0);
  const contentReady = settingsLoaded && allProjects !== null && allPillars !== null;

  useArkeosAnimations({ ready: introDone && contentReady });

  const hero_copy: HeroCopy = {
    eyebrow: identity.foundedYear ? `est. ${identity.foundedYear}` : "",
    lines: identity.heroHeadline.length ? identity.heroHeadline : [identity.name],
    sub: identity.tagline,
    ghost: identity.name,
    cta: { label: settings.cta_text || "View Work", href: "/projects" },
  };

  return (
    <main className="pg-home">
      <HeroLayout copy={hero_copy} ariaLabel="Hero" variant="full" />

      {pillars.length > 0 && (
        <section id="what" className="section" aria-label="What we do">
          <SectionHeader
            cta_id="btn-svc"
            copy={{ label: "What We Do", lines: ["CRAFT", "THAT CUTS."], intro: copy.what, cta: { label: "View All Services", href: "/services" } }}
          />
          <div className="pillars" role="list">
            {pillars.map((p, i) => <PillarCard key={p.id} pillar={p} icon={ICONS[i % ICONS.length]} />)}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section id="projects" className="section" aria-label="Featured projects">
          <SectionHeader
            cta_id="btn-all"
            copy={{ label: "Selected Work", lines: ["THE", "WORK."], intro: copy.work, cta: { label: "View All Projects", href: "/projects" } }}
          />
          <ProjectGrid projects={projects} variant="home" />
        </section>
      )}

      {contentReady && stats.length > 0 && (
        <section id="why" className="section" aria-label={`Why ${identity.name}`}>
          <span className="section-lbl">{`Why ${identity.name}`}</span>
          <SectionH2 lines={["BUILT", "DIFFERENT."]} />
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
