"use client";
import { useEffect, useState, type RefObject } from "react";

export function use_near_screen(ref: RefObject<HTMLElement | null>, enabled: boolean, margin = "200% 0px") {
  const [near, set_near] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const io = new IntersectionObserver(([e]) => set_near(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => { io.disconnect(); set_near(false); };
  }, [ref, enabled, margin]);
  return near;
}
