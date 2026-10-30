"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/** black overlay: slides up to cover on exit, slides away on entry. */
export default function PageTransition() {
  const overlay = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const busy = useRef(false);

  /* entrance: runs on first load and after every route change */
  useEffect(() => {
    const el = overlay.current;
    if (!el) return;
    busy.current = false;
    if (prefersReducedMotion()) {
      gsap.set(el, { y: "-100%" });
      return;
    }
    const tween = gsap.fromTo(el, { y: "0%" }, {
      y: "-100%", duration: 0.85, ease: "power2.inOut",
      onStart: () => { el.style.pointerEvents = "none"; },
    });
    return () => { tween.kill(); };
  }, [pathname]);

  /* exit: intercept internal links before next/link sees them */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element).closest?.("a");
      const el = overlay.current;
      if (!link || !el) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (link.target === "_blank" || link.hostname !== window.location.hostname) return;
      if (link.pathname === window.location.pathname) return;

      e.preventDefault();
      e.stopPropagation();
      if (busy.current) return;
      busy.current = true;

      if (prefersReducedMotion()) { router.push(href); return; }
      el.style.pointerEvents = "all";
      gsap.fromTo(el, { y: "100%" }, {
        y: "0%", duration: 0.72, ease: "power2.inOut",
        onComplete: () => router.push(href),
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return <div id="page-overlay" ref={overlay} style={{ transform: "translateY(0%)" }} aria-hidden="true" />;
}
