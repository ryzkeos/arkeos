"use client";
import { useEffect } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { useIntroDone } from "@/lib/preloader";

type Opts = {
  pageHero?: boolean;
  ready?: boolean;
};

export function useArkeosAnimations({ pageHero = false, ready: readyProp = true }: Opts = {}) {
  const introDone = useIntroDone();
  const ready = readyProp && introDone;
  useEffect(() => {
    if (!ready) return;
    const reduced = prefersReducedMotion();
    const q = <T extends Element = HTMLElement>(s: string) => Array.from(document.querySelectorAll<T>(s));

    const ctx = gsap.context(() => {
      if (pageHero) {
        const ems = q(".page-hero .section-h2 em");
        const eyebrow = document.querySelector(".page-hero .section-lbl");
        const sub = document.querySelector(".page-hero .page-hero__sub");
        if (reduced) {
          gsap.set(ems, { y: "0%" });
          if (eyebrow) gsap.set(eyebrow, { opacity: 1, y: 0 });
          if (sub) gsap.set(sub, { opacity: 1, y: 0 });
        } else {
          const tl = gsap.timeline({ delay: 0.1 });
          if (eyebrow) tl.from(eyebrow, { opacity: 0, y: 10, duration: 0.6, ease: "power2.out" });
          if (ems.length) tl.to(ems, { y: "0%", duration: 1, ease: "power2.out", stagger: 0.08 }, "-=0.4");
          if (sub) gsap.to(sub, { opacity: 1, y: 0, duration: 0.75, ease: "power2.out", delay: 0.55 });
        }
      }
      q(".section-h2 em").forEach((em) => {
        if (em.closest(".page-hero")) return;
        if (reduced) return void gsap.set(em, { y: "0%" });
        gsap.to(em, {
          y: "0%", duration: 1, ease: "power2.out",
          scrollTrigger: { trigger: em.closest(".section-h2"), start: "top 82%", once: true },
        });
      });
      const group_count = new Map<Element, number>();
      q(".reveal").forEach((el) => {
        if (reduced) return void gsap.set(el, { opacity: 1, y: 0 });
        if (el.closest(".proj-grid, .svc-grid") && el.matches(".p-card, .svc-row")) return;
        const group = el.closest(".svc-cards, .why-grid, .val-grid, .team-grid");
        const n = group ? group_count.get(group) ?? 0 : 0;
        if (group) group_count.set(group, n + 1);
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.9, ease: "power2.out", delay: Math.min(n * 0.07, 0.28),
          scrollTrigger: { trigger: el, start: "top 84%", once: true },
        });
      });
      if (!reduced) {
        q(".proj-grid").forEach((grid) => {
          const cards = grid.querySelectorAll(".p-card.reveal");
          if (!cards.length) return;
          gsap.to(cards, {
            opacity: 1, y: 0, duration: 0.95, ease: "power2.out", stagger: 0.11,
            scrollTrigger: { trigger: grid, start: "top 80%", once: true },
          });
        });
        if (document.querySelector(".svc-grid .svc-row.reveal"))
          gsap.to(".svc-row.reveal", {
            opacity: 1, y: 0, duration: 0.85, ease: "power2.out", stagger: 0.09,
            scrollTrigger: { trigger: ".svc-grid", start: "top 82%", once: true },
          });
      }
      q("#btn-all, #btn-svc, #btn-cta, .sec-hdr .btn").forEach((el) => {
        if (reduced) return void gsap.set(el, { opacity: 1, y: 0 });
        gsap.to(el, { opacity: 1, y: 0, duration: 0.65, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      });
      q("[data-counter]").forEach((el) => {
        const target = parseInt(el.dataset.counter ?? "0", 10);
        const suffix = el.dataset.counterSuffix ?? "";
        if (reduced) { el.textContent = target + suffix; return; }
        const obj = { val: 0 };
        ScrollTrigger.create({
          trigger: el, start: "top 85%", once: true,
          onEnter() {
            gsap.to(obj, { val: target, duration: 1.8, ease: "power2.out", onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; } });
          },
        });
      });
      q(".section-lbl, .cta-lbl").forEach((el) => {
        if (el.closest(".page-hero")) return;
        if (reduced) return void gsap.set(el, { opacity: 1, y: 0 });
        gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      });
      q(".about-img-wrap").forEach((el) => {
        const full = el.classList.contains("about-img-full");
        if (reduced) return void gsap.set(el, { clipPath: "inset(0 0% 0 0)" });
        gsap.fromTo(el, { clipPath: "inset(0 100% 0 0)" }, {
          clipPath: "inset(0 0% 0 0)", duration: full ? 1.6 : 1.4, ease: "power2.inOut",
          scrollTrigger: { trigger: el, start: full ? "top 75%" : "top 72%", once: true },
        });
      });
    });
    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, [pageHero, ready]);
}
