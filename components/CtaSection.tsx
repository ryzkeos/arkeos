"use client";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import { useCopy } from "@/lib/use_copy";
import type { CinemaType } from "@/lib/types";
import Btn from "./Btn";
import { CinemaBg } from "./CinemaMedia";

const DECOS = [
  { id: "deco-a", key: "a", cls: "cta-deco-a" },
  { id: "deco-b", key: "b", cls: "cta-deco-b" },
  { id: "deco-c", key: "c", cls: "cta-deco-c" },
  { id: "deco-d", key: "d", cls: "cta-deco-d" },
] as const;

const MEDIA_TYPES: CinemaType[] = ["image", "video", "html"];

export default function CtaSection() {
  const tunnel = useRef<HTMLDivElement>(null);
  const { cta } = useCopy("shared");

  useEffect(() => {
    const el = tunnel.current;
    if (!el || prefersReducedMotion()) return;
    const pos = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let raf = 0;
    const step = () => {
      pos.x += (target.x - pos.x) * 0.06;
      pos.y += (target.y - pos.y) * 0.06;
      el.style.setProperty("--ox", `${pos.x}px`);
      el.style.setProperty("--oy", `${pos.y}px`);
      raf = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.05 ? requestAnimationFrame(step) : 0;
    };
    const onMove = (e: MouseEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 60;
      target.y = (e.clientY / window.innerHeight - 0.5) * 40;
      if (!raf) raf = requestAnimationFrame(step);
    };
    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
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
      </svg>
      <div className="cta-inner reveal">
        <div className="cta-tunnel" ref={tunnel} aria-hidden="true">
          {DECOS.map((d) => {
            const url = cta[`deco_${d.key}_url`];
            const raw = cta[`deco_${d.key}_type`];
            const type = MEDIA_TYPES.find((t) => t === raw) ?? "image";
            return (
              <div
                key={d.id}
                id={d.id}
                className={url ? `cta-deco ${d.cls} cta-deco--media` : `cta-deco ${d.cls}`}
              >
                {url && (
                  <div className="cta-deco__media">
                    <CinemaBg url={url} type={type} active />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <span className="cta-lbl">{cta.label}</span>
        <div className="cta-title">
          <h2 className="cta-h2">{cta.headline}</h2>
        </div>
        <Btn href="/contact" id="btn-cta" label={cta.button} />
      </div>
    </section>
  );
}
