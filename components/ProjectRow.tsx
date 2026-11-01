"use client";
import { useState, type CSSProperties } from "react";
import type { Project } from "@/lib/types";
import { safeUrl } from "@/lib/gsap";
import { useCopy } from "@/lib/use_copy";
import ProjectMedia from "./ProjectMedia";

type Props = { project: Project; index: number };

export default function ProjectRow({ project, index }: Props) {
  const { buttons } = useCopy("shared");
  const [hot, set_hot] = useState(false);
  const link = safeUrl(project.url);
  const num = String(index + 1).padStart(2, "0");

  return (
    <article
      className="p-row"
      role="listitem"
      aria-label={project.title}
      style={{ "--card-accent": project.color || "var(--color-accent)" } as CSSProperties}
      onMouseEnter={() => set_hot(true)}
      onMouseLeave={() => set_hot(false)}
      onFocus={() => set_hot(true)}
      onBlur={() => set_hot(false)}
    >
      <div className="p-row__thumb" aria-hidden="true">
        <ProjectMedia src={project.media} active={hot} />
      </div>
      <div className="p-row__main">
        <h3 className="p-row__name">{project.title.toUpperCase()}</h3>
        {project.description && <p className="p-row__desc" title={project.description}>{project.description}</p>}
        {((project.tags ?? []).length > 0 || link) && (
          <div className="p-row__foot">
            <div className="p-row__tags">
              {(project.tags ?? []).map((t) => <span key={t} className="tag">{t}</span>)}
            </div>
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--visible p-row__cta"
                aria-label={`${buttons.view_project}: ${project.title}`}
              >
                <span className="btn-label">{buttons.view_project_short}</span>
                <span className="btn-arrow" aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </div>
      <span className="p-row__num" aria-hidden="true">{num}</span>
    </article>
  );
}
