"use client";
import "@/styles/e404.css";
import { useEffect, useRef } from "react";
import { fill_vars } from "@/lib/copy";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useCopy, useCopyVars } from "@/lib/use_copy";
import Btn from "./Btn";

export default function NotFoundView() {
  const root = useRef<HTMLElement>(null);
  const copy = useCopy("not_found");
  const vars = useCopyVars();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const ghost = ".e404-ghost", lbl = ".e404-lbl", num = ".e404-num em", tag = ".e404-tag em", btn = "#btn-404";
      if (prefersReducedMotion()) {
        gsap.set([ghost, lbl, btn], { opacity: 1, y: 0 });
        gsap.set([num, tag], { y: "0%" });
        return;
      }
      gsap.timeline({ delay: 0.1 })
        .to(ghost, { opacity: 1, duration: 2.2, ease: "power2.out" })
        .from(lbl, { opacity: 0, y: 8, duration: 0.6, ease: "power2.out" }, "-=1.8")
        .to(num, { y: "0%", duration: 1.1, ease: "power2.out" }, "-=1.4")
        .to(tag, { y: "0%", duration: 0.9, ease: "power2.out" }, "-=0.8")
        .to(btn, { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" }, "-=0.55");
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <main className="pg-e404" ref={root}>
      <section id="hero-404" aria-label={fill_vars(copy.aria_section, vars)}>
        <div className="e404-ghost" aria-hidden="true">{copy.num}</div>
        <div className="e404-body">
          <span className="e404-lbl">{copy.label}</span>
          <div className="e404-num" aria-label={fill_vars(copy.aria_num, vars)}><em>{copy.num}</em></div>
          <div className="e404-tag" aria-label={fill_vars(copy.aria_tagline, vars)}><em>{copy.tagline}</em></div>
          <Btn href="/" id="btn-404" label={copy.button_label} ariaLabel={fill_vars(copy.aria_button, vars)} />
        </div>
      </section>
    </main>
  );
}
