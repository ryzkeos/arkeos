"use client";
import { useEffect, useState, type RefObject } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

const PERIOD_MS = 5000;
const HOLD_MS = 2600;
const STAGGER_MS = 700;
const FIRST_DELAY_MS = 800;

export function use_card_peek(ref: RefObject<HTMLElement | null>, index: number, enabled: boolean) {
  const [peek, set_peek] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || prefersReducedMotion()) return;
    let shown = false;
    let first: ReturnType<typeof setTimeout> | undefined;
    let hold: ReturnType<typeof setTimeout> | undefined;
    let loop: ReturnType<typeof setInterval> | undefined;

    const run = () => {
      set_peek(true);
      clearTimeout(hold);
      hold = setTimeout(() => set_peek(false), HOLD_MS);
    };
    const stop = () => {
      clearTimeout(first);
      clearTimeout(hold);
      clearInterval(loop);
      set_peek(false);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !shown) {
          shown = true;
          first = setTimeout(() => {
            run();
            loop = setInterval(run, PERIOD_MS);
          }, FIRST_DELAY_MS + (index % 5) * STAGGER_MS);
        } else if (!entry.isIntersecting && shown) {
          shown = false;
          stop();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, [ref, index, enabled]);

  return peek;
}
