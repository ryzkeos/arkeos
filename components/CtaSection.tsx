"use client";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import { useCopy } from "@/lib/use_copy";
import type { CinemaType } from "@/lib/types";
import Btn from "./Btn";
import { CinemaBg } from "./CinemaMedia";

const DECOS = [
  { id: "deco-a", key: "a", cls: "cta-deco-a", fx: 0.045, fy: 0.04 },
  { id: "deco-b", key: "b", cls: "cta-deco-b", fx: -0.035, fy: -0.028 },
  { id: "deco-c", key: "c", cls: "cta-deco-c", fx: 0.025, fy: 0.032 },
  { id: "deco-d", key: "d", cls: "cta-deco-d", fx: -0.03, fy: 0.026 },
] as const;

const MEDIA_TYPES: CinemaType[] = ["image", "video", "html"];

export default function CtaSection() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const { cta } = useCopy("shared");

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const pos = DECOS.map(() => ({ x: 0, y: 0 }));
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      DECOS.forEach((d, i) => {
        const el = refs.current[i];
        if (!el) return;
        const p = pos[i];
        p.x += ((e.clientX - cx) * d.fx - p.x) * 0.05;
        p.y += ((e.clientY - cy) * d.fy - p.y) * 0.05;
        el.style.setProperty("--dx", `${p.x}px`);
        el.style.setProperty("--dy", `${p.y}px`);
      });
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section id="cta" aria-label={cta.label}>
      <svg className="cta-corridor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="cta-focal-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" className="cta-corridor__glow-a" />
            <stop offset="1" className="cta-corridor__glow-b" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="50" rx="34" ry="42" fill="url(#cta-focal-glow)" />
        <path className="cta-corridor__line" d="M0 0L43 43M100 0L57 43M0 100L43 57M100 100L57 57" />
        <rect className="cta-corridor__line" x="19" y="19" width="62" height="62" />
        <rect className="cta-corridor__line" x="31" y="31" width="38" height="38" />
        <rect className="cta-corridor__line" x="38.5" y="38.5" width="23" height="23" />
        <rect className="cta-corridor__line cta-corridor__far" x="43" y="43" width="14" height="14" />
      </svg>
      <div className="cta-inner reveal">
        {DECOS.map((d, i) => {
          const url = cta[`deco_${d.key}_url`];
          const raw = cta[`deco_${d.key}_type`];
          const type = MEDIA_TYPES.find((t) => t === raw) ?? "image";
          return (
            <div
              key={d.id}
              id={d.id}
              ref={(el) => { refs.current[i] = el; }}
              className={url ? `cta-deco ${d.cls} cta-deco--media` : `cta-deco ${d.cls}`}
              aria-hidden="true"
            >
              {url && (
                <div className="cta-deco__media">
                  <CinemaBg url={url} type={type} active />
                </div>
              )}
            </div>
          );
        })}
        <span className="cta-lbl">{cta.label}</span>
        <div className="cta-title">
          <h2 className="cta-h2">{cta.headline}</h2>
        </div>
        <Btn href="/contact" id="btn-cta" label={cta.button} />
      </div>
    </section>
  );
}
