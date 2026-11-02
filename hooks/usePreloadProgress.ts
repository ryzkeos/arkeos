"use client";
import { useEffect, useRef, useState, type RefObject } from "react";

const MIN_VISIBLE_MS = 700;
const MAX_WAIT_MS = 15000;

function near_viewport(el: Element) {
  const r = el.getBoundingClientRect();
  const h = window.innerHeight;
  return r.bottom > -h * 0.25 && r.top < h * 1.25;
}

function watchMedia(el: Element, onDone: () => void): boolean {
  let fired = false;
  const done = () => {
    if (fired) return;
    fired = true;
    onDone();
  };
  if (el instanceof HTMLImageElement) {
    if (el.complete || !near_viewport(el)) return false;
    if (el.loading === "lazy") el.loading = "eager";
    el.addEventListener("load", done, { once: true });
    el.addEventListener("error", done, { once: true });
    return true;
  }
  if (el instanceof HTMLVideoElement) {
    if (el.readyState >= 2 || !near_viewport(el)) return false;
    el.preload = "auto";
    el.addEventListener("canplay", done, { once: true });
    el.addEventListener("loadeddata", done, { once: true });
    el.addEventListener("error", done, { once: true });
    return true;
  }
  return false;
}

export function usePreloadProgress(
  enabled: boolean,
  contentReady: boolean,
  root: RefObject<HTMLElement | null>
): number {
  const [value, setValue] = useState(enabled ? 0 : 100);
  const state = useRef({ done: 0, total: 3, minPassed: false, forced: false, best: 0 });
  const recompute = useRef<() => void>(() => {});
  const discovered = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const s = state.current;
    recompute.current = () => {
      const raw = s.forced ? 100 : Math.min(100, Math.floor((s.done / Math.max(1, s.total)) * 100));
      const capped = s.minPassed || s.forced ? raw : Math.min(raw, 99);
      s.best = Math.max(s.best, capped);
      setValue(Math.min(100, s.best));
    };
    const finishOne = () => {
      s.done += 1;
      recompute.current();
    };

    const minTimer = window.setTimeout(() => {
      s.minPassed = true;
      recompute.current();
    }, MIN_VISIBLE_MS);
    const maxTimer = window.setTimeout(() => {
      s.forced = true;
      s.minPassed = true;
      recompute.current();
    }, MAX_WAIT_MS);

    if (document.fonts?.ready) document.fonts.ready.then(finishOne, finishOne);
    else finishOne();

    if (document.readyState === "complete") finishOne();
    else window.addEventListener("load", finishOne, { once: true });

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      window.removeEventListener("load", finishOne);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !contentReady || discovered.current) return;
    const s = state.current;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (discovered.current) return;
        discovered.current = true;
        const items = root.current ? Array.from(root.current.querySelectorAll("img, video")) : [];
        const pending = items.filter((el) =>
          watchMedia(el, () => {
            s.done += 1;
            recompute.current();
          })
        );
        s.total += pending.length;
        s.done += 1;
        recompute.current();
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [enabled, contentReady, root]);

  return value;
}
