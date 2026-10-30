"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const EXIT_SECONDS = 0.3;
const ENTER_SECONDS = 0.5;

export default function PageTransition() {
  const overlay = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const exitTween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const el = overlay.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { y: "-100%" });
      return;
    }
    const tween = gsap.fromTo(el, { y: "0%" }, { y: "-100%", duration: ENTER_SECONDS, ease: "power2.inOut" });
    return () => { tween.kill(); };
  }, [pathname]);

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

      exitTween.current?.kill();
      exitTween.current = null;

      if (prefersReducedMotion()) { router.push(href); return; }

      exitTween.current = gsap.fromTo(el, { y: "100%" }, {
        y: "0%", duration: EXIT_SECONDS, ease: "power2.in",
        onComplete: () => { exitTween.current = null; router.push(href); },
      });
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      exitTween.current?.kill();
    };
  }, [router]);

  return <div id="page-overlay" ref={overlay} style={{ transform: "translateY(0%)" }} aria-hidden="true" />;
}
