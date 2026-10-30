import type { CSSProperties } from "react";
import type { Project } from "@/lib/types";
import { safeUrl } from "@/lib/gsap";
import Btn from "./Btn";

const VIDEO_EXT = ["mp4", "webm", "mov", "ogg"];
const extOf = (m: string) => m.split("?")[0].split(".").pop()?.toLowerCase() ?? "";

function badge(media: string | null) {
  if (!media) return { label: "Black", cls: "badge--black" };
  return VIDEO_EXT.includes(extOf(media)) ? { label: "Video", cls: "badge--video" } : { label: "Image", cls: "badge--image" };
}

type Props = { project: Project; index: number; variant: "home" | "grid" };

export default function ProjectCard({ project, index, variant }: Props) {
  const num = String(index + 1).padStart(2, "0");
  const mod = `p-card--${(index % 6) + 1}`;
  const media = safeUrl(project.media);
  const b = badge(project.media);
  const Title = variant === "grid" ? "h2" : "h3";

  return (
    <article
      className={`p-card ${mod} reveal`}
      role="listitem"
      data-tilt
      aria-label={`Project: ${project.title}`}
      style={{ "--card-accent": project.color || "var(--color-accent)" } as CSSProperties}
    >
      <div className="p-card__bg" aria-hidden="true">
        {variant === "grid" && media &&
          (VIDEO_EXT.includes(extOf(media))
            ? <video src={media} autoPlay muted loop playsInline aria-hidden="true" />
            // eslint-disable-next-line @next/next/no-img-element
            : <img src={media} alt="" aria-hidden="true" loading="lazy" />)}
      </div>
      <div className="p-card__veil" aria-hidden="true" />
      <div className="p-card__hover" aria-hidden="true" />
      {variant === "grid" && (
        <span className={`p-card__media-badge ${b.cls}`} aria-label={`Media type: ${b.label}`}>{b.label}</span>
      )}
      <div className="p-card__body">
        <div className="p-card__num">{num}</div>
        <Title className="p-card__name">{project.title.toUpperCase()}</Title>
        <p className="p-card__desc">{project.description}</p>
        <div className="p-card__tags">
          {(project.tags ?? []).map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
      </div>
      <Btn
        href="#"
        className="p-card__cta"
        label={variant === "grid" ? "View Project" : "View"}
        ariaLabel={`View ${project.title} project`}
      />
    </article>
  );
}
