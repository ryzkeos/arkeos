"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { getIdentity } from "@/lib/content";
import { PRELOADER_KEY, markIntroDone } from "@/lib/preloader";
import { usePreloadProgress } from "@/hooks/usePreloadProgress";
import { useSiteSettings, useSiteSettingsLoaded } from "./SiteSettings";

const STATUSES = ["Loading", "Preparing", "Almost Ready", "Welcome"];
const statusFor = (p: number) => STATUSES[p >= 100 ? 3 : Math.min(Math.floor(p / 34), 2)];

const seen = () => {
  try { return sessionStorage.getItem(PRELOADER_KEY) === "1"; } catch { return false; }
};

export default function Preloader() {
  const pathname = usePathname();
  const settings = useSiteSettings();
  const settingsLoaded = useSiteSettingsLoaded();
  const root = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLElement | null>(null);
  const shown = useRef({ v: 0 });
  const finishing = useRef(false);
  const [active, setActive] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    page.current = document.body;
    if (seen() || pathname.startsWith("/admin")) {
      setActive(false);
      markIntroDone();
    }
    setMounted(true);
  }, [pathname]);

  const running = mounted && active;
  const progress = usePreloadProgress(running, settingsLoaded, page);
  const { name } = getIdentity(settings);

  useEffect(() => {
    if (!running || !root.current) return;
    const brand = root.current.querySelector(".pre__brand");
    gsap.to(brand, { opacity: 1, duration: prefersReducedMotion() ? 0 : 0.35, ease: "power2.out" });
  }, [running]);

  useEffect(() => {
    if (!running || !root.current) return;
    const el = root.current;
    const bar = el.querySelector<HTMLElement>("#pre-bar");
    const pctEl = el.querySelector("#pre-pct");
    const statusEl = el.querySelector("#pre-status");
    if (!bar) return;
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
      gsap.to(el, {
        opacity: 0,
        duration: reduced ? 0 : 0.35,
        delay: reduced ? 0 : 0.15,
        ease: "power2.inOut",
        onComplete: () => {
          try { sessionStorage.setItem(PRELOADER_KEY, "1"); } catch {}
          setActive(false);
          markIntroDone();
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
    return () => { tween.kill(); };
  }, [progress, running]);

  if (!active) return null;

  return (
    <div id="preloader" ref={root} aria-hidden="true">
      <span className="pre__corner pre__corner--tl" />
      <span className="pre__corner pre__corner--tr" />
      <span className="pre__corner pre__corner--bl" />
      <span className="pre__corner pre__corner--br" />
      <div className="pre__glow" />
      <div className="pre__center">
        <div className="pre__brand">{name}</div>
        <div className="pre__track"><div className="pre__bar" id="pre-bar" /></div>
      </div>
      <div className="pre__foot">
        <span className="pre__status" id="pre-status">{STATUSES[0]}</span>
        <span className="pre__pct" id="pre-pct">0%</span>
      </div>
    </div>
  );
}
