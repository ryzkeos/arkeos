"use client";
import "@/styles/home.css";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, safeUrl } from "@/lib/gsap";
import { FALLBACK_PROJECTS } from "@/lib/data";
import { useArkeosAnimations } from "@/hooks/useArkeosAnimations";
import { useSiteSettings } from "./SiteSettings";
import Btn from "./Btn";
import CtaSection from "./CtaSection";
import ProjectCard from "./ProjectCard";
import SectionH2 from "./SectionH2";

/* the preloader plays once per full page load, not on client-side navigation back home */
let preloaderPlayed = false;

const PILLARS = [
  { title: "WEB DEV", desc: "Custom-built digital experiences that perform as beautifully as they look. Zero templates, zero compromises.", icon: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></> },
  { title: "MOTION", desc: "Cinematic animation and interactive storytelling that transforms how audiences feel about a brand.", icon: <polygon points="5 3 19 12 5 21 5 3" /> },
  { title: "INTERACTIVE", desc: "Experiences that respond, react, and reward. Built for humans. Optimized for wonder.", icon: <><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></> },
  { title: "BRANDING", desc: "Visual identity systems built to dominate — not just differentiate. Designed to lead categories.", icon: <><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></> },
];

const WHY = [
  { n: 47, label: "PROJECTS SHIPPED", desc: "Every single one delivered on time, on spec, and above expectation. No exceptions." },
  { n: 3, label: "YEARS ACTIVE", desc: "Three years of refusing to ship anything we wouldn't put our name on. That standard doesn't drop." },
  { n: 31, label: "CLIENTS SERVED", desc: "From solo founders to funded startups. Every client gets the same obsessive attention." },
];

const STATUSES = ["Loading Assets", "Building Experience", "Almost Ready", "Welcome"];

export default function HomeView() {
  const root = useRef<HTMLElement>(null);
  const settings = useSiteSettings();
  const [showPreloader] = useState(() => !preloaderPlayed);
  const [introDone, setIntroDone] = useState(!showPreloader);

  useArkeosAnimations({ ready: introDone });

  useEffect(() => {
    const reduced = prefersReducedMotion();
    let ctx: gsap.Context;

    const runHero = () => {
      const $ = (s: string) => root.current!.querySelector(s);
      const ghost = $(".hero-ghost");
      const heroEm = root.current!.querySelectorAll(".hero-h1 em, .hero-studio em");
      const eyebrow = $(".hero-eyebrow");
      const sub = $(".hero-sub");
      const btn = $("#btn-hero");
      const scroll = $("#hero-scroll");

      if (reduced) {
        gsap.set([ghost, eyebrow, sub, btn, scroll], { opacity: 1, y: 0 });
        gsap.set(heroEm, { y: "0%" });
        return;
      }
      const tl = gsap.timeline({ delay: 0.05 });
      tl.to(ghost, { opacity: 1, duration: 2.2, ease: "power2.out" })
        .to(eyebrow, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=1.8")
        .to(heroEm, { y: "0%", duration: 1.05, ease: "power2.out", stagger: 0.08 }, "-=1.4")
        .to(sub, { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" }, "-=0.7")
        .to(btn, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.5")
        .to(scroll, { opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.3");
      const line = $(".hero-scroll__line");
      if (line) gsap.to(line, { scaleX: 1.5, opacity: 0.4, duration: 1.1, ease: "power2.inOut", repeat: -1, yoyo: true, delay: 2.5 });
    };

    ctx = gsap.context(() => {
      if (!showPreloader) return void runHero();

      const preloader = root.current!.querySelector<HTMLElement>("#preloader")!;
      const bar = root.current!.querySelector("#pre-bar");
      const brand = root.current!.querySelector(".pre__brand");
      const pctEl = root.current!.querySelector("#pre-pct");
      const statusEl = root.current!.querySelector("#pre-status");

      gsap.timeline()
        .to(brand, { opacity: 1, duration: 0.75, ease: "power2.out" })
        .to(bar, {
          width: "100%", duration: 2.4, ease: "power2.inOut",
          onUpdate() {
            const p = (this as unknown as gsap.core.Tween).progress();
            const si = Math.min(Math.floor(p * STATUSES.length), STATUSES.length - 1);
            if (pctEl) pctEl.textContent = Math.round(p * 100) + "%";
            if (statusEl) statusEl.textContent = STATUSES[si];
          },
        }, "+=0.15")
        .to(preloader, {
          opacity: 0, duration: 0.65, ease: "power2.inOut",
          onComplete() {
            preloader.style.display = "none";
            preloaderPlayed = true;
            setIntroDone(true);
            ctx.add(runHero);
          },
        }, "+=0.25");
    }, root);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const videoSrc = safeUrl(settings.hero_video);
  const projects = FALLBACK_PROJECTS.slice(0, 3);

  return (
    <main className="pg-home" ref={root}>
      {showPreloader && (
        <div id="preloader" aria-hidden="true">
          <div className="pre__brand">ARKEOS</div>
          <div className="pre__track"><div className="pre__bar" id="pre-bar" /></div>
          <div className="pre__meta">
            <span className="pre__status" id="pre-status">{STATUSES[0]}</span>
            <span className="pre__pct" id="pre-pct">0%</span>
          </div>
        </div>
      )}

      {/* HERO */}
      <section id="hero" aria-label="Hero">
        <div className="hero-video" aria-hidden="true">
          {videoSrc && <video src={videoSrc} autoPlay muted loop playsInline aria-hidden="true" />}
        </div>
        <div className="hero-veil" aria-hidden="true" />
        <div className="hero-ghost" aria-hidden="true">ARKEOS</div>

        <div className="hero-top-left">
          <p className="hero-eyebrow">Creative Web &amp; Motion Studio — Est.&thinsp;2022</p>
          <h1 className="hero-h1" aria-label="We Build Digital Legends">
            <span><em>WE BUILD</em></span>
            <span><em>DIGITAL</em></span>
            <span><em>LEGENDS.</em></span>
          </h1>
          <p className="hero-sub">
            {settings.tagline || "Crafting web experiences and motion work that demand attention — and refuse to be forgotten."}
          </p>
          <Btn href="/projects" id="btn-hero" label={settings.cta_text || "View Our Work"} ariaLabel="View our work" />
        </div>

        <div className="hero-bottom-right" aria-hidden="true">
          <div className="hero-studio">
            <span><em>STU</em></span>
            <span><em>DIO.</em></span>
          </div>
        </div>

        <div className="hero-bottom-left" aria-hidden="true">
          <div className="hero-scroll" id="hero-scroll">
            <span className="hero-scroll__line" />
            Scroll
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section id="what" className="section" aria-label="What we do">
        <div className="what-hdr">
          <div>
            <span className="section-lbl">What We Do</span>
            <SectionH2 lines={["CRAFT", "THAT CUTS."]} />
          </div>
          <p className="what-intro reveal">
            We are not a production house. We are your unfair advantage. Every project we touch becomes a benchmark in its category — not by accident, by obsession.
          </p>
        </div>
        <div className="pillars" role="list">
          {PILLARS.map((p) => (
            <article key={p.title} className="pillar reveal" role="listitem">
              <div className="pillar-ico" aria-hidden="true"><svg viewBox="0 0 24 24">{p.icon}</svg></div>
              <h3 className="pillar-title">{p.title}</h3>
              <p className="pillar-desc">{p.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section id="projects" className="section" aria-label="Featured projects">
        <div className="proj-hdr">
          <div>
            <span className="section-lbl">Selected Work</span>
            <SectionH2 lines={["THE", "WORK."]} />
          </div>
          <Btn href="/projects" id="btn-all" label="All Projects" ariaLabel="View all projects" />
        </div>
        <div className="proj-grid" role="list">
          {projects.map((p, i) => <ProjectCard key={p.title} project={p} index={i} variant="home" />)}
        </div>
      </section>

      {/* WHY ARKEOS */}
      <section id="why" className="section" aria-label="Why Arkeos">
        <span className="section-lbl">Why Arkeos</span>
        <SectionH2 lines={["BUILT", "DIFFERENT."]} />
        <div className="why-grid" role="list">
          {WHY.map((w) => (
            <div key={w.label} className="why-item reveal" role="listitem">
              <div className="why-num" data-counter={w.n} aria-label={String(w.n)}>0</div>
              <h3 className="why-label">{w.label}</h3>
              <p className="why-desc">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaSection />
    </main>
  );
}
