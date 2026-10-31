"use client";
import { useEffect, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

export function use_hero_intro(root: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    const el = root.current;
    if (!active || !el) return;
    const reduced = prefersReducedMotion();

    const run = () => {
      const $ = (s: string) => el.querySelector(s);
      const ghost = $(".hero-ghost");
      const lines = el.querySelectorAll(".hero-h1 em, .hero-studio em");
      const eyebrow = $(".hero-eyebrow");
      const sub = $(".hero-sub");
      const btn = $("#btn-hero");
      const scroll = $("#hero-scroll");
      const fade = [eyebrow, sub, btn].filter(Boolean);

      if (reduced) {
        gsap.set([ghost, scroll, ...fade].filter(Boolean), { opacity: 1, y: 0 });
        gsap.set(lines, { y: "0%" });
        return;
      }
      const tl = gsap.timeline({ delay: 0.05 });
      if (ghost) tl.to(ghost, { opacity: 1, duration: 2.2, ease: "power2.out" });
      if (eyebrow) tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=1.8");
      tl.to(lines, { y: "0%", duration: 1.05, ease: "power2.out", stagger: 0.08 }, "-=1.4");
      if (sub) tl.to(sub, { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" }, "-=0.7");
      if (btn) tl.to(btn, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.5");
      if (scroll) tl.to(scroll, { opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.3");
    };

    const ctx = gsap.context(run, root);
    return () => ctx.revert();
  }, [root, active]);
}
