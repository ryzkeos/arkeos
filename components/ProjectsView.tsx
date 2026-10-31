"use client";
import "@/styles/projects.css";
import { useArkeosAnimations } from "@/hooks/useArkeosAnimations";
import { useProjects } from "@/lib/useContent";
import CtaSection from "./CtaSection";
import PageHero from "./PageHero";
import ProjectGrid from "./ProjectGrid";

export default function ProjectsView() {
  const projects = useProjects();

  useArkeosAnimations({ pageHero: true, ready: projects !== null });

  return (
    <main className="pg-projects">
      <PageHero
        ariaLabel="Work page hero"
        ghost="WORK"
        label="Selected Work"
        lines={["THE", "FULL", "PICTURE."]}
        sub="Projects from the studio, listed below."
      />

      <section id="work" aria-label="All projects">
        <ProjectGrid projects={projects} variant="grid" id="projects-grid" />
      </section>

      <CtaSection />
    </main>
  );
}
