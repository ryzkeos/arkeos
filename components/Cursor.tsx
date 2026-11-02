"use client";
import { useEffect, useRef } from "react";
import { prefersReducedMotion, isFinePointer } from "@/lib/gsap";

const HOVER =
  'a, button, .btn, .svc-card, .p-card, [role="button"], label, select, textarea, input, .svc-row, .val-item, .team-card, .why-item';

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFinePointer()) return;
    const d = dot.current, r = ring.current;
    if (!d || !r) return;
    const reduced = prefersReducedMotion();
    let mx = 0, my = 0, rx = 0, ry = 0, raf = 0;

    const tick = () => {
      d.style.left = mx + "px"; d.style.top = my + "px";
      rx += (mx - rx) * 0.11; ry += (my - ry) * 0.11;
      r.style.left = rx + "px"; r.style.top = ry + "px";
      raf = Math.abs(mx - rx) < 0.1 && Math.abs(my - ry) < 0.1 ? 0 : requestAnimationFrame(tick);
    };
    const move = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (reduced) { d.style.left = r.style.left = mx + "px"; d.style.top = r.style.top = my + "px"; return; }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const over = (e: MouseEvent) => {
      if ((e.target as Element).closest?.(HOVER)) { d.classList.add("big"); r.classList.add("big"); }
    };
    const out = (e: MouseEvent) => {
      if ((e.target as Element).closest?.(HOVER)) { d.classList.remove("big"); r.classList.remove("big"); }
    };
    const press = () => r.classList.add("down");
    const release = () => r.classList.remove("down");
    const hide = () => { d.style.opacity = r.style.opacity = "0"; };
    const show = () => { d.style.opacity = r.style.opacity = "1"; };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    document.addEventListener("mouseleave", hide);
    document.addEventListener("mouseenter", show);
    document.addEventListener("mousedown", press);
    document.addEventListener("mouseup", release);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("mouseenter", show);
      document.removeEventListener("mousedown", press);
      document.removeEventListener("mouseup", release);
    };
  }, []);

  return (
    <>
      <div id="c-dot" ref={dot} role="presentation" aria-hidden="true" />
      <div id="c-ring" ref={ring} role="presentation" aria-hidden="true" />
    </>
  );
}
