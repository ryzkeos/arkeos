"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import type { ProcessStep } from "@/lib/types";

const DWELL_MS = 1500;
const TRAVEL_MS = 700;
const REST_MS = 2200;
const RESET_MS = 700;
const MAX_COLS = 4;

type Props = { steps: ProcessStep[] };

export default function ProcessFlow({ steps }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const count = steps.length;
  const [live, set_live] = useState(false);
  const [active, set_active] = useState(-1);
  const [flow, set_flow] = useState(-1);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => set_live(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
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
        at(() => set_active(-1), DWELL_MS + REST_MS);
        at(() => step(0), DWELL_MS + REST_MS + RESET_MS);
      }
    };
    step(0);
    return () => timers.forEach(clearTimeout);
  }, [live, count]);

  return (
    <div
      ref={root}
      className={active >= 0 ? "process-flow is-live" : "process-flow"}
      role="list"
      style={{ "--n": Math.min(count, MAX_COLS) } as CSSProperties}
    >
      {steps.map((p, i) => {
        const state = i === active ? " is-active" : i < active ? " is-done" : "";
        const filled = i < active || i === flow;
        return (
          <div key={`${i}-${p.title}`} className={`process-step${state} reveal`} role="listitem">
            <span className="process-node" aria-hidden="true" />
            {i < count - 1 && (
              <span
                className={`process-seg${filled ? " is-filled" : ""}${flow === i ? " is-flow" : ""}`}
                aria-hidden="true"
              >
                <span className="process-seg__fill" />
                <span className="process-seg__dot" />
              </span>
            )}
            <div className="process-step__num">{String(i + 1).padStart(2, "0")}</div>
            <h3 className="process-step__title">{p.title}</h3>
            {p.desc ? <p className="process-step__desc">{p.desc}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
