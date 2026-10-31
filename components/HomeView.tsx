"use client";
import "@/styles/home.css";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, safeUrl } from "@/lib/gsap";
import { getHomeStats, getIdentity, getSectionCopy } from "@/lib/content";
import { usePillars, useProjects } from "@/lib/useContent";
import { useArkeosAnimations } from "@/hooks/useArkeosAnimations";
import { usePreloadProgress } from "@/hooks/usePreloadProgress";
import { useSiteSettings, useSiteSettingsLoaded } from "./SiteSettings";
import Btn from "./Btn";
import PillarCard from "./PillarCard";
import CtaSection from "./CtaSection";
import ProjectCard from "./ProjectCard";
import SectionH2 from "./SectionH2";

let preloaderPlayed = false;

const ICONS = [
  <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
  <polygon points="5 3 19 12 5 21 5 3" />,
  <><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>,
  <><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></>,
];

const HOVER_WORD = "LEGACY";
const STATUSES = ["Loading", "Preparing", "Almost Ready", "Welcome"];
const statusFor = (p: number) => STATUSES[p >= 100 ? 3 : Math.min(Math.floor(p / 34), 2)];

export default function HomeView() {
  const root = useRef<HTMLElement>(null);
  const settings = useSiteSettings();
  const settingsLoaded = useSiteSettingsLoaded();
  const allProjects = useProjects();
  const allPillars = usePillars();
  const [showPreloader] = useState(() => !preloaderPlayed);
  const [introDone, setIntroDone] = useState(!showPreloader);

  const identity = getIdentity(settings);
  const projects = allProjects ? allProjects.slice(0, 3) : [];
  const pillars = allPillars ?? [];
  const copy = getSectionCopy(settings);
  const stats = getHomeStats(settings, allProjects?.length ?? 0);
  const contentReady = settingsLoaded && allProjects !== null && allPillars !== null;

  useArkeosAnimations({ ready: introDone && contentReady });

  const progress = usePreloadProgress(showPreloader, contentReady, root);
  const shown = useRef({ v: 0 });
  const finishing = useRef(false);

  useEffect(() => {
    if (!showPreloader || !root.current) return;
    const brand = root.current.querySelector(".pre__brand");
    gsap.to(brand, { opacity: 1, duration: prefersReducedMotion() ? 0 : 0.35, ease: "power2.out" });
  }, [showPreloader]);

  useEffect(() => {
    if (!showPreloader || !root.current) return;
    const el = root.current;
    const preloader = el.querySelector<HTMLElement>("#preloader");
    const bar = el.querySelector<HTMLElement>("#pre-bar");
    const pctEl = el.querySelector("#pre-pct");
    const statusEl = el.querySelector("#pre-status");
    if (!preloader || !bar) return;
    const reduced = prefersReducedMotion();

    const render = () => {
      const v = Math.round(shown.current.v);
      bar.style.width = `${shown.current.v}%`;
      if (pctEl) pctEl.textContent = `${v}%`;
      if (statusEl) statusEl.textContent = statusFor(v);
    };

    const finish = () => {
      if (finishing.current) return;
      finishing.current = true;
      gsap.to(preloader, {
        opacity: 0,
        duration: reduced ? 0 : 0.35,
        delay: reduced ? 0 : 0.15,
        ease: "power2.inOut",
        onComplete: () => {
          preloader.style.display = "none";
          preloaderPlayed = true;
          setIntroDone(true);
        },
      });
    };

    const tween = gsap.to(shown.current, {
      v: progress,
      duration: reduced ? 0 : 0.45,
      ease: "power1.out",
      overwrite: true,
      onUpdate: render,
      onComplete: () => {
        render();
        if (progress >= 100) finish();
      },
    });
    return () => {
      tween.kill();
    };
  }, [progress, showPreloader]);

  useEffect(() => {
    if (!settingsLoaded || !introDone) return;
    const reduced = prefersReducedMotion();

    const runHero = () => {
      const $ = (s: string) => root.current!.querySelector(s);
      const ghost = $(".hero-ghost");
      const heroEm = root.current!.querySelectorAll(".hero-h1 em, .hero-studio em");
      const eyebrow = $(".hero-eyebrow");
      const sub = $(".hero-sub");
      const btn = $("#btn-hero");
      const scroll = $("#hero-scroll");
      const fade = [eyebrow, sub, btn].filter(Boolean);

      if (reduced) {
        gsap.set([ghost, scroll, ...fade], { opacity: 1, y: 0 });
        gsap.set(heroEm, { y: "0%" });
        return;
      }
      const tl = gsap.timeline({ delay: 0.05 });
      tl.to(ghost, { opacity: 1, duration: 2.2, ease: "power2.out" });
      if (eyebrow) tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=1.8");
      tl.to(heroEm, { y: "0%", duration: 1.05, ease: "power2.out", stagger: 0.08 }, "-=1.4");
      if (sub) tl.to(sub, { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" }, "-=0.7");
      if (btn) tl.to(btn, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.5");
      tl.to(scroll, { opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.3");
    };

    const ctx = gsap.context(runHero, root);

    return () => ctx.revert();
  }, [settingsLoaded, introDone]);

  const videoSrc = safeUrl(settings.hero_video);
  const heroLines = settingsLoaded ? (identity.heroHeadline.length ? identity.heroHeadline : [identity.name]) : [];
  const eyebrow = identity.foundedYear ? `est. ${identity.foundedYear}` : "";

  return (
    <main className="pg-home" ref={root}>
      {showPreloader && (
        <div id="preloader" aria-hidden="true">
          <span className="pre__corner pre__corner--tl" />
          <span className="pre__corner pre__corner--tr" />
          <span className="pre__corner pre__corner--bl" />
          <span className="pre__corner pre__corner--br" />
          <div className="pre__glow" />
          <div className="pre__center">
            <div className="pre__brand">{identity.name}</div>
            <div className="pre__track"><div className="pre__bar" id="pre-bar" /></div>
          </div>
          <div className="pre__foot">
            <span className="pre__status" id="pre-status">{STATUSES[0]}</span>
            <span className="pre__pct" id="pre-pct">0%</span>
          </div>
        </div>
      )}

      <section id="hero" aria-label="Hero">
        <div className="hero-video" aria-hidden="true">
          {videoSrc && <video src={videoSrc} autoPlay muted loop playsInline aria-hidden="true" />}
        </div>
        <div className="hero-veil" aria-hidden="true" />
        <div className="hero-ghost" aria-hidden="true">{identity.name}</div>

        <div className="hero-top-left">
          {eyebrow && <p className="hero-eyebrow">{eyebrow}</p>}
          <h1 className="hero-h1" aria-label={heroLines.join(" ")}>
            {heroLines.map((line, i) => (
              <span key={`${i}-${line}`}><em><span className="hero-word">{line}</span></em></span>
            ))}
          </h1>
          {identity.tagline && <p className="hero-sub">{identity.tagline}</p>}
          <Btn href="/projects" id="btn-hero" label={settings.cta_text || "View Work"} ariaLabel="View work" />
        </div>

        {identity.heroDeco && (
          <div className="hero-bottom-right" aria-hidden="true">
            <div className="hero-studio" tabIndex={0}>
              <span><em>
                <span className="hero-studio-word">
                  <span className="hs-a">{identity.heroDeco}</span>
                  <span className="hs-b" aria-hidden="true">{HOVER_WORD}</span>
                </span>
              </em></span>
            </div>
          </div>
        )}

        <div className="hero-chevrons" id="hero-scroll" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M5 8l7 7 7-7" /></svg>
          <svg viewBox="0 0 24 24"><path d="M5 8l7 7 7-7" /></svg>
          <svg viewBox="0 0 24 24"><path d="M5 8l7 7 7-7" /></svg>
        </div>
      </section>

      {pillars.length > 0 && (
        <section id="what" className="section" aria-label="What we do">
          <div className="sec-hdr">
            <div>
              <span className="section-lbl">What We Do</span>
              <SectionH2 lines={["CRAFT", "THAT CUTS."]} />
            </div>
            <div className="sec-side">
              {copy.what && <p className="sec-intro reveal">{copy.what}</p>}
              <Btn href="/services" id="btn-svc" label="View All Services" ariaLabel="View all services" />
            </div>
          </div>
          <div className="pillars" role="list">
            {pillars.map((p, i) => <PillarCard key={p.id} pillar={p} icon={ICONS[i % ICONS.length]} />)}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section id="projects" className="section" aria-label="Featured projects">
          <div className="sec-hdr">
            <div>
              <span className="section-lbl">Selected Work</span>
              <SectionH2 lines={["THE", "WORK."]} />
            </div>
            <div className="sec-side">
              {copy.work && <p className="sec-intro reveal">{copy.work}</p>}
              <Btn href="/projects" id="btn-all" label="View All Projects" ariaLabel="View all projects" />
            </div>
          </div>
          <div className="proj-grid" role="list">
            {projects.map((p, i) => <ProjectCard key={p.id ?? p.title} project={p} index={i} variant="home" />)}
          </div>
        </section>
      )}

      {contentReady && stats.length > 0 && (
        <section id="why" className="section" aria-label={`Why ${identity.name}`}>
          <span className="section-lbl">{`Why ${identity.name}`}</span>
          <SectionH2 lines={["BUILT", "DIFFERENT."]} />
          <div className="why-grid" role="list">
            {stats.map((w) => (
              <div key={w.label} className="why-item reveal" role="listitem">
                <div className="why-num" data-counter={w.n} aria-label={String(w.n)}>0</div>
                <h3 className="why-label">{w.label}</h3>
                {w.desc && <p className="why-desc">{w.desc}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <CtaSection />
    </main>
  );
}
