"use client";
import "@/styles/projects.css";
import { useArkeosAnimations } from "@/hooks/useArkeosAnimations";
import { useProjects } from "@/lib/useContent";
import { useCopy } from "@/lib/use_copy";
import CtaSection from "./CtaSection";
import HeroLayout from "./hero/HeroLayout";
import ProjectGrid from "./ProjectGrid";

export default function ProjectsView() {
  const projects = useProjects();
  const copy = useCopy("projects");
  const aria_hero = copy.hero.eyebrow || copy.hero.lines.join(" ");

  useArkeosAnimations({ pageHero: true, ready: projects !== null });

  return (
    <main className="pg-projects">
      <HeroLayout variant="page" ariaLabel={aria_hero} copy={copy.hero} />

      <section id="work" aria-label={aria_hero}>
        <ProjectGrid projects={projects} variant="grid" id="projects-grid" />
        {projects !== null && projects.length === 0 && copy.empty_text && (
          <p className="work-empty" role="status">{copy.empty_text}</p>
        )}
      </section>

      <CtaSection />
    </main>
  );
}
