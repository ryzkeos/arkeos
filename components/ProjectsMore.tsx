"use client";
import { useState } from "react";
import type { Project } from "@/lib/types";
import { useCopy } from "@/lib/use_copy";
import ProjectGrid from "./ProjectGrid";
import ProjectRow from "./ProjectRow";

type Mode = "cards" | "list";

type Props = { projects: Project[]; start_index: number };

const ICONS: Record<Mode, React.ReactNode> = {
  cards: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
  list: <><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></>,
};

export default function ProjectsMore({ projects, start_index }: Props) {
  const { controls } = useCopy("projects");
  const [mode, set_mode] = useState<Mode>("cards");
  const labels: Record<Mode, string> = { cards: controls.cards, list: controls.list };

  return (
    <>
      <div className="pj-toolbar">
        <div className="pj-toggle" role="group" aria-label={controls.view_label}>
          {(["cards", "list"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={mode === m ? "pj-toggle__btn is-active" : "pj-toggle__btn"}
              aria-pressed={mode === m}
              onClick={() => set_mode(m)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[m]}</svg>
              <span>{labels[m]}</span>
            </button>
          ))}
        </div>
      </div>

      <div key={mode} className="pj-switch" id="projects-grid">
        {mode === "cards" ? (
          <ProjectGrid projects={projects} variant="grid" start_index={start_index} reveal={false} />
        ) : (
          <div className="p-rows" role="list">
            {projects.map((p, i) => (
              <ProjectRow key={p.id ?? p.title} project={p} index={start_index + i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
