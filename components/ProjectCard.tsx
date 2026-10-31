import type { CSSProperties } from "react";
import type { Project } from "@/lib/types";
import { safeUrl } from "@/lib/gsap";

const VIDEO_EXT = ["mp4", "webm", "mov", "ogg"];
const HTML_EXT = ["html", "htm"];
const extOf = (m: string) => m.split("?")[0].split(".").pop()?.toLowerCase() ?? "";

export type CardLayout = { c: number; r: number; ct: number; rt: number; rm: number };

type Props = { project: Project; index: number; variant: "home" | "grid"; layout: CardLayout };

export default function ProjectCard({ project, index, variant, layout }: Props) {
  const num = String(index + 1).padStart(2, "0");
  const mod = `p-card--${(index % 6) + 1}`;
  const media = safeUrl(project.media);
  const link = safeUrl(project.url);
  const Title = variant === "grid" ? "h2" : "h3";

  return (
    <article
      className={`p-card ${mod} reveal`}
      role="listitem"
      data-tilt
      aria-label={`Project: ${project.title}`}
      style={{
        "--card-accent": project.color || "var(--color-accent)",
        "--c": layout.c, "--r": layout.r, "--ct": layout.ct, "--rt": layout.rt, "--rm": layout.rm,
      } as CSSProperties}
    >
      <div className="p-card__bg" aria-hidden="true">
        {media && (
          VIDEO_EXT.includes(extOf(media)) ? (
            <video src={media} autoPlay muted loop playsInline aria-hidden="true" />
          ) : HTML_EXT.includes(extOf(media)) ? (
            <iframe src={media} title="" tabIndex={-1} sandbox="allow-scripts" loading="lazy" aria-hidden="true" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media} alt="" aria-hidden="true" loading="lazy" draggable={false} />
          )
        )}
      </div>
      <div className="p-card__hover" aria-hidden="true" />
      <div className="p-card__body">
        <div className="p-card__head">
          <span className="p-card__num">{num}</span>
          <Title className="p-card__name">{project.title.toUpperCase()}</Title>
        </div>
        <p className="p-card__desc">{project.description}</p>
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
              aria-label={`View ${project.title} project (opens in a new tab)`}
            >
              <span className="btn-label">{variant === "grid" ? "View Project" : "View"}</span>
              <span className="btn-arrow" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
