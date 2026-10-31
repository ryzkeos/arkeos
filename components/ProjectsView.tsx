"use client";
import "@/styles/projects.css";
import { useArkeosAnimations } from "@/hooks/useArkeosAnimations";
import { useProjects } from "@/lib/useContent";
import CtaSection from "./CtaSection";
import PageHero from "./PageHero";
import ProjectCard from "./ProjectCard";

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
        <div className="work-grid proj-grid" id="projects-grid" role="list" aria-busy={projects === null}>
          {projects === null ? null : (
            projects.map((p, i) => <ProjectCard key={p.id ?? p.title} project={p} index={i} variant="grid" />)
          )}
        </div>
      </section>

      <CtaSection />
    </main>
  );
}
