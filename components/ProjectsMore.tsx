"use client";
import { useState } from "react";
import type { Project } from "@/lib/types";
import { useCopy } from "@/lib/use_copy";
import ProjectGrid from "./ProjectGrid";
import ProjectRow from "./ProjectRow";

type Mode = "cards" | "list";

const PAGE_SIZE = 10;

type Props = { projects: Project[]; start_index: number };

const ICONS: Record<Mode, React.ReactNode> = {
  cards: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
  list: <><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></>,
};

export default function ProjectsMore({ projects, start_index }: Props) {
  const { controls } = useCopy("projects");
  const [mode, set_mode] = useState<Mode>("cards");
  const [count, set_count] = useState(PAGE_SIZE);
  const labels: Record<Mode, string> = { cards: controls.cards, list: controls.list };
  const shown = Math.min(count, projects.length);
  const visible = projects.slice(0, shown);
  const progress = (controls.showing || "Showing {shown} of {total}")
    .replace("{shown}", String(shown))
    .replace("{total}", String(projects.length));

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
          <ProjectGrid projects={visible} variant="grid" start_index={start_index} reveal={false} />
        ) : (
          <div className="p-rows" role="list">
            {visible.map((p, i) => (
              <ProjectRow key={p.id ?? p.title} project={p} index={start_index + i} />
            ))}
          </div>
        )}
      </div>

      {projects.length > PAGE_SIZE && (
        <div className="pj-more">
          <p className="pj-more__count" role="status" aria-live="polite">{progress}</p>
          {shown < projects.length && (
            <button type="button" className="btn btn--visible pj-more__btn" onClick={() => set_count((c) => c + PAGE_SIZE)}>
              <span className="btn-label">{controls.load_more || "Load more"}</span>
              <span className="btn-arrow" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
