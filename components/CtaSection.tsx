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
        el.style.transform = `translate(${p.x}px,${p.y}px)`;
      });
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section id="cta" aria-label={cta.label}>
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
