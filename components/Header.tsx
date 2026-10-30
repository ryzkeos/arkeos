"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/data";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useSiteSettings } from "./SiteSettings";

export default function Header() {
  const pathname = usePathname();
  const settings = useSiteSettings();
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const drawer = useRef<HTMLDivElement>(null);
  const booked = settings.availability === "booked";
  const availText = booked ? "Currently Booked" : "Now Taking Projects";

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 90);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* close on route change + Esc */
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* drawer link animation + scroll lock */
  useEffect(() => {
    const links = drawer.current?.querySelectorAll("a");
    if (!links) return;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      if (prefersReducedMotion()) gsap.set(links, { y: 0, opacity: 1 });
      else gsap.to(links, { y: 0, opacity: 1, duration: 0.55, ease: "power2.out", stagger: 0.07, delay: 0.05 });
    } else {
      gsap.set(links, { y: 20, opacity: 0 });
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <div
        id="mobile-nav"
        ref={drawer}
        className={open ? "open" : ""}
        style={{ display: "flex" }}
        role="dialog"
        aria-label="Mobile navigation"
        aria-modal="true"
        aria-hidden={!open}
      >
        <nav>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={isActive(n.href) ? "is-active" : undefined} aria-current={isActive(n.href) ? "page" : undefined} tabIndex={open ? 0 : -1}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mobile-nav__footer">
          <span className={`dot${booked ? " booked" : ""}`} />
          <span>{availText}</span>
        </div>
      </div>

      <header id="header" className={stuck ? "stuck" : ""} role="banner">
        <Link href="/" className="hdr-logo" aria-label="Arkeos — Home">ARKEOS</Link>

        <nav className="hdr-nav" role="navigation" aria-label="Main navigation">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={isActive(n.href) ? "is-active" : undefined} aria-current={isActive(n.href) ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hdr-badge" id="availability-badge" aria-label={`Studio availability: ${availText}`}>
          <span className={`dot${booked ? " booked" : ""}`} />
          <span id="availability-text">{availText}</span>
        </div>

        <button
          className={`hdr-menu-btn${open ? " open" : ""}`}
          id="menu-btn"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </header>
    </>
  );
}
