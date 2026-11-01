"use client";
import { useEffect, useRef, useState, type RefObject } from "react";

const MIN_VISIBLE_MS = 700;
const MAX_WAIT_MS = 15000;

function watchMedia(el: Element, onDone: () => void): boolean {
  if (el instanceof HTMLImageElement) {
    if (el.loading === "lazy") el.loading = "eager";
    if (el.complete) return false;
    el.addEventListener("load", onDone, { once: true });
    el.addEventListener("error", onDone, { once: true });
    return true;
  }
  if (el instanceof HTMLVideoElement) {
    if (el.readyState >= 3) return false;
    const done = () => onDone();
    el.addEventListener("canplay", done, { once: true });
    el.addEventListener("loadeddata", done, { once: true });
    el.addEventListener("error", done, { once: true });
    el.load();
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
      const raw = s.forced ? 100 : Math.floor((s.done / s.total) * 100);
      const capped = s.minPassed || s.forced ? raw : Math.min(raw, 99);
      s.best = Math.max(s.best, capped);
      setValue(s.best);
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
