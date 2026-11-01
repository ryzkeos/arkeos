"use client";
import { useEffect, useRef, useState, type AnimationEvent, type CSSProperties, type PointerEvent } from "react";
import type { Project } from "@/lib/types";
import { safeUrl } from "@/lib/gsap";
import { useCopy } from "@/lib/use_copy";
import ProjectMedia from "./ProjectMedia";

const SWIPE_PX = 50;

type Props = { projects: Project[]; label: string };

export default function ProjectFeatured({ projects, label }: Props) {
  const { buttons } = useCopy("shared");
  const { controls } = useCopy("projects");
  const root = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const [index, set_index] = useState(0);
  const [held, set_held] = useState(false);
  const [on_screen, set_on_screen] = useState(false);
  const count = projects.length;
  const multi = count > 1;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => set_on_screen(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (index >= count) set_index(0);
  }, [count, index]);

  const go = (i: number) => set_index(((i % count) + count) % count);
  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  const on_down = (e: PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
    dragged.current = false;
  };
  const on_up = (e: PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s || !multi) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 10) dragged.current = true;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
  };
  const on_fill_end = (e: AnimationEvent) => {
    if (e.animationName === "feat-fill") next();
  };

  const paused = held || !on_screen;

  return (
    <div
      ref={root}
      className={paused ? "feat is-paused" : "feat"}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => set_held(true)}
      onMouseLeave={() => set_held(false)}
      onFocus={() => set_held(true)}
      onBlur={() => set_held(false)}
    >
      <div
        className="feat__view"
        onPointerDown={on_down}
        onPointerUp={on_up}
        onPointerCancel={() => (start.current = null)}
        onClickCapture={(e) => {
          if (dragged.current) {
            e.preventDefault();
            dragged.current = false;
          }
        }}
      >
        <div className="feat__track" style={{ transform: `translateX(-${index * 100}%)` }} aria-live={paused ? "polite" : "off"}>
          {projects.map((p, i) => {
            const link = safeUrl(p.url);
            return (
              <article
                key={p.id ?? p.title}
                className="feat__slide"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${count}`}
                inert={i !== index}
                style={{ "--card-accent": p.color || "var(--color-accent)" } as CSSProperties}
              >
                <div className="feat__media" aria-hidden="true">
                  <ProjectMedia src={p.media} active={i === index} />
                </div>
                <div className="feat__veil" aria-hidden="true" />
                <div className="feat__body">
                  <div className="feat__main">
                    <h3 className="feat__name">{p.title.toUpperCase()}</h3>
                    {p.description && <p className="feat__desc" data-lenis-prevent>{p.description}</p>}
                    <div className="feat__foot">
                      {(p.tags ?? []).map((t) => <span key={t} className="tag">{t}</span>)}
                      {link && (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn--visible feat__cta"
                          aria-label={`${buttons.view_project}: ${p.title}`}
                        >
                          <span className="btn-label">{buttons.view_project}</span>
                          <span className="btn-arrow" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </div>
                  <span className="feat__num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {multi && (
        <div className="feat__bar">
          <div className="feat__dots">
            {projects.map((p, i) => (
              <button
                key={p.id ?? p.title}
                type="button"
                className={i === index ? "feat__dot is-active" : "feat__dot"}
                aria-label={`${controls.go_to} ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
              >
                <span className="feat__dot-fill" onAnimationEnd={i === index ? on_fill_end : undefined} />
              </button>
            ))}
          </div>
          <div className="feat__arrows">
            <button type="button" className="feat__arrow" aria-label={controls.previous} onClick={prev}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button type="button" className="feat__arrow" aria-label={controls.next} onClick={next}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
