"use client";
import "@/styles/projects.css";
import { useArkeosAnimations } from "@/hooks/useArkeosAnimations";
import { useProjects } from "@/lib/useContent";
import { useCopy } from "@/lib/use_copy";
import CtaSection from "./CtaSection";
import HeroLayout from "./hero/HeroLayout";
import ProjectFeatured from "./ProjectFeatured";
import ProjectsMore from "./ProjectsMore";
import SectionHeader from "./SectionHeader";

const FEATURED_MAX = 5;

export default function ProjectsView() {
  const projects = useProjects();
  const copy = useCopy("projects");
  const aria_hero = copy.hero.eyebrow || copy.hero.lines.join(" ");

  useArkeosAnimations({ pageHero: true, ready: projects !== null });

  const list = projects ?? [];
  const featured = list.filter((p) => p.featured).slice(0, FEATURED_MAX);

  return (
    <main className="pg-projects">
      <HeroLayout variant="page" ariaLabel={aria_hero} copy={copy.hero} />

      {list.length > 0 && (
        <section id="work" aria-label={copy.more.label}>
          <SectionHeader copy={copy.more} />
          {featured.length > 0 && (
            <div className="pj-featured">
              <ProjectFeatured projects={featured} label={copy.featured.label} />
            </div>
          )}
          <ProjectsMore projects={list} start_index={0} />
        </section>
      )}

      {projects !== null && projects.length === 0 && copy.empty_text && (
        <section id="work" aria-label={aria_hero}>
          <p className="work-empty" role="status">{copy.empty_text}</p>
        </section>
      )}

      <CtaSection />
    </main>
  );
}
