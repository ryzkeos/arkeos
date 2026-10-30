"use client";
import "@/styles/projects.css";
import { useEffect, useState } from "react";
import { FALLBACK_PROJECTS } from "@/lib/data";
import { sbLoadProjects } from "@/lib/supabase";
import { useArkeosAnimations } from "@/hooks/useArkeosAnimations";
import type { Project } from "@/lib/types";
import CtaSection from "./CtaSection";
import PageHero from "./PageHero";
import ProjectCard from "./ProjectCard";

export default function ProjectsView() {
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    let alive = true;
    sbLoadProjects(FALLBACK_PROJECTS).then((p) => alive && setProjects(p));
    return () => { alive = false; };
  }, []);

  /* animations wait for cards to exist */
  useArkeosAnimations({ pageHero: true, ready: projects !== null });

  return (
    <main className="pg-projects">
      <PageHero
        ariaLabel="Work page hero"
        ghost="WORK"
        label="Selected Work"
        lines={["THE", "FULL", "PICTURE."]}
        sub="Six years of refusing to ship anything less than a category benchmark. Every project below is the evidence."
      />

      <section id="work" aria-label="All projects">
        <div className="work-grid proj-grid" id="projects-grid" role="list" aria-busy={projects === null}>
          {projects === null ? null : projects.length === 0 ? (
            <p className="work-empty">No projects to display.</p>
          ) : (
            projects.map((p, i) => <ProjectCard key={p.id ?? p.title} project={p} index={i} variant="grid" />)
          )}
        </div>
      </section>

      <CtaSection />
    </main>
  );
}
