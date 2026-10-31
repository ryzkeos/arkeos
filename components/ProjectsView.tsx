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
  const { work_count } = useCopy("home");
  const aria_hero = copy.hero.eyebrow || copy.hero.lines.join(" ");

  useArkeosAnimations({ pageHero: true, ready: projects !== null });

  const list = projects ?? [];
  const featured_n = Math.min(FEATURED_MAX, Math.max(0, Math.floor(work_count)));
  const featured = list.slice(0, featured_n);
  const others = list.slice(featured.length);

  return (
    <main className="pg-projects">
      <HeroLayout variant="page" ariaLabel={aria_hero} copy={copy.hero} />

      {featured.length > 0 && (
        <section id="featured" aria-label={copy.featured.label}>
          <SectionHeader copy={copy.featured} />
          <ProjectFeatured projects={featured} label={copy.featured.label} />
        </section>
      )}

      {others.length > 0 && (
        <section id="work" aria-label={copy.more.label}>
          <SectionHeader copy={copy.more} />
          <ProjectsMore projects={others} start_index={featured.length} />
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
