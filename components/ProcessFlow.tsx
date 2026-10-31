"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import type { ProcessStep } from "@/lib/types";

const DWELL_MS = 1100;
const TRAVEL_MS = 700;
const REST_MS = 1800;
const MAX_COLS = 4;

type Props = { steps: ProcessStep[] };

export default function ProcessFlow({ steps }: Props) {
  const grid = useRef<HTMLDivElement>(null);
  const count = steps.length;
  const [cols, set_cols] = useState(Math.min(count, MAX_COLS));
  const [live, set_live] = useState(false);
  const [active, set_active] = useState(-1);
  const [flow, set_flow] = useState(-1);

  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    const read = () => set_cols(Math.max(1, getComputedStyle(el).gridTemplateColumns.split(" ").length));
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => set_live(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [count]);

  useEffect(() => {
    if (!live || count < 2 || prefersReducedMotion()) {
      set_active(-1);
      set_flow(-1);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));
    const step = (i: number) => {
      set_active(i);
      set_flow(-1);
      if (i < count - 1) {
        at(() => set_flow(i), DWELL_MS);
        at(() => step(i + 1), DWELL_MS + TRAVEL_MS);
      } else {
        at(() => set_active(-1), DWELL_MS + REST_MS / 2);
        at(() => step(0), DWELL_MS + REST_MS);
      }
    };
    step(0);
    return () => timers.forEach(clearTimeout);
  }, [live, count]);

  const running = active >= 0;

  return (
    <div
      ref={grid}
      className={running ? "process-grid is-live" : "process-grid"}
      role="list"
      style={{ "--n": Math.min(count, MAX_COLS) } as CSSProperties}
    >
      {steps.map((p, i) => {
        const dir = (i + 1) % cols === 0 ? "down" : "right";
        return (
          <div
            key={`${i}-${p.title}`}
            className={i === active ? "process-step is-active reveal" : "process-step reveal"}
            role="listitem"
            style={{ zIndex: count - i }}
          >
            <div className="process-step__num">{String(i + 1).padStart(2, "0")}</div>
            <h3 className="process-step__title">{p.title}</h3>
            {p.desc ? <p className="process-step__desc">{p.desc}</p> : null}
            {i < count - 1 && (
              <span
                className={`process-arrow process-arrow--${dir}${flow === i ? " is-flow" : ""}`}
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24"><path d="M4 12h16M14 6l6 6-6 6" /></svg>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
