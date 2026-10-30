"use client";
import "@/styles/e404.css";
import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import Btn from "./Btn";

export default function NotFoundView() {
  const root = useRef<HTMLElement>(null);

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
      <section id="hero-404" aria-label="404 — Page not found">
        <div className="e404-ghost" aria-hidden="true">404</div>
        <div className="e404-body">
          <span className="e404-lbl">Error 404</span>
          <div className="e404-num" aria-label="404"><em>404</em></div>
          <div className="e404-tag" aria-label="Lost in the dark"><em>Lost in the dark.</em></div>
          <Btn href="/" id="btn-404" label="Back to Home" ariaLabel="Return to Arkeos homepage" />
        </div>
      </section>
    </main>
  );
}
