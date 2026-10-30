"use client";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import Btn from "./Btn";
import { useSiteSettings } from "./SiteSettings";

const DECOS = [
  { id: "deco-a", cls: "cta-deco-a", fx: 0.045, fy: 0.04 },
  { id: "deco-b", cls: "cta-deco-b", fx: -0.035, fy: -0.028 },
  { id: "deco-c", cls: "cta-deco-c", fx: 0.025, fy: 0.032 },
];

export default function CtaSection() {
  const settings = useSiteSettings();
  const refs = useRef<(HTMLDivElement | null)[]>([]);

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
    <section id="cta" aria-label="Start a project">
      {DECOS.map((d, i) => (
        <div key={d.id} id={d.id} ref={(el) => { refs.current[i] = el; }} className={`cta-deco ${d.cls}`} aria-hidden="true" />
      ))}
      <div className="cta-inner reveal">
        <h2 className="cta-h2">START A PROJECT.</h2>
        <Btn href="/contact" id="btn-cta" label={settings.cta_text?.trim() || "Get in Touch"} ariaLabel="Go to the contact page" />
      </div>
    </section>
  );
}
