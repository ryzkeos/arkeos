"use client";
import { useRef, type CSSProperties } from "react";
import type { Project } from "@/lib/types";
import { safeUrl } from "@/lib/gsap";
import { useCopy } from "@/lib/use_copy";
import { use_card_peek } from "@/hooks/use_card_peek";
import ProjectMedia from "./ProjectMedia";

export type CardLayout = { c: number; r: number; ct: number; rt: number; rm: number };

type Props = {
  project: Project;
  index: number;
  variant: "home" | "grid";
  layout: CardLayout;
  reveal?: boolean;
};

export default function ProjectCard({ project, index, variant, layout, reveal = true }: Props) {
  const { buttons } = useCopy("shared");
  const root = useRef<HTMLElement>(null);
  const peek = use_card_peek(root, index, variant === "home");
  const num = String(index + 1).padStart(2, "0");
  const mod = `p-card--${(index % 6) + 1}`;
  const link = safeUrl(project.url);
  const Title = variant === "grid" ? "h2" : "h3";
  const cls = ["p-card", mod, reveal ? "reveal" : "", peek ? "is-peek" : ""].filter(Boolean).join(" ");

  return (
    <article
      ref={root}
      className={cls}
      role="listitem"
      aria-label={project.title}
      style={{
        "--card-accent": project.color || "var(--color-accent)",
        "--c": layout.c, "--r": layout.r, "--ct": layout.ct, "--rt": layout.rt, "--rm": layout.rm,
      } as CSSProperties}
    >
      <div className="p-card__bg" aria-hidden="true">
        <ProjectMedia src={project.media} />
      </div>
      <div className="p-card__hover" aria-hidden="true" />
      <div className="p-card__body">
        <div className="p-card__head">
          <Title className="p-card__name">{project.title.toUpperCase()}</Title>
          <span className="p-card__num" aria-hidden="true">{num}</span>
        </div>
        <p className="p-card__desc" title={project.description}>{project.description}</p>
        <div className="p-card__foot">
          <div className="p-card__tags">
            {(project.tags ?? []).map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn p-card__cta"
              aria-label={`${buttons.view_project}: ${project.title}`}
            >
              <span className="btn-label">{variant === "grid" ? buttons.view_project : buttons.view_project_short}</span>
              <span className="btn-arrow" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
