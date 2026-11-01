"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { useCopy } from "@/lib/use_copy";
import Btn from "./Btn";
import { CinemaBg } from "./CinemaMedia";

const DECOS = [
  { id: "deco-a", key: "a", cls: "cta-deco-a" },
  { id: "deco-b", key: "b", cls: "cta-deco-b" },
  { id: "deco-c", key: "c", cls: "cta-deco-c" },
  { id: "deco-d", key: "d", cls: "cta-deco-d" },
] as const;

const MOTION = [
  { from_x: -170, from_y: 0, depth: 70, float: 12, float_time: 3.4 },
  { from_x: 170, from_y: 0, depth: 110, float: 14, float_time: 4.1 },
  { from_x: -60, from_y: 130, depth: 40, float: 10, float_time: 3.8 },
  { from_x: 60, from_y: -130, depth: 30, float: 9, float_time: 4.6 },
];

export default function CtaSection() {
  const section = useRef<HTMLElement>(null);
  const tunnel = useRef<HTMLDivElement>(null);
  const { cta } = useCopy("shared");

  useEffect(() => {
    const root = section.current;
    const wrap = tunnel.current;
    if (!root || !wrap || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const els = Array.from(wrap.querySelectorAll<HTMLElement>(".cta-deco"));
      els.forEach((el, i) => {
        const m = MOTION[i];
        if (!m) return;
        const state = { ex: m.from_x, ey: m.from_y, eo: 0, py: 0, fy: 0 };
        const apply = () => {
          el.style.setProperty("--ex", `${state.ex}px`);
          el.style.setProperty("--ey", `${state.ey + state.py + state.fy}px`);
          el.style.setProperty("--eo", `${state.eo}`);
        };
        apply();
        gsap.to(state, {
          ex: 0, ey: 0, eo: 1, duration: 1.3, ease: "power3.out", delay: i * 0.14, onUpdate: apply,
          scrollTrigger: { trigger: root, start: "top 75%", once: true },
        });
        gsap.fromTo(state, { py: m.depth }, {
          py: -m.depth, ease: "none", onUpdate: apply,
          scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: 0.8 },
        });
        gsap.to(state, {
          fy: m.float, duration: m.float_time, ease: "sine.inOut", yoyo: true, repeat: -1, onUpdate: apply,
        });
      });
    }, root);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

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
    <section id="cta" ref={section} aria-label={cta.label}>
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
            return (
              <div
                key={d.id}
                id={d.id}
                className={url ? `cta-deco ${d.cls} cta-deco--media` : `cta-deco ${d.cls}`}
              >
                {url && (
                  <div className="cta-deco__media">
                    <CinemaBg url={url} active />
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
