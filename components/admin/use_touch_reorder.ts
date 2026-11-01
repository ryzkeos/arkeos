import { useRef, useState, type PointerEvent } from "react";

type Reorder = { from: number; over: number };

export function use_touch_reorder(on_move: (from: number, to: number) => void) {
  const [state, setState] = useState<Reorder | null>(null);
  const live = useRef<Reorder | null>(null);

  const set = (next: Reorder | null) => {
    live.current = next;
    setState(next);
  };

  const finish = (commit: boolean) => {
    const cur = live.current;
    set(null);
    if (commit && cur && cur.from !== cur.over) on_move(cur.from, cur.over);
  };

  const handle_props = (index: number) => ({
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType === "mouse") return;
      e.currentTarget.setPointerCapture(e.pointerId);
      set({ from: index, over: index });
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      const cur = live.current;
      if (!cur) return;
      if (e.clientY < 90) window.scrollBy(0, -14);
      else if (e.clientY > window.innerHeight - 90) window.scrollBy(0, 14);
      const row = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-reorder-index]");
      const over = row ? Number(row.getAttribute("data-reorder-index")) : cur.over;
      if (over !== cur.over) set({ from: cur.from, over });
    },
    onPointerUp: () => finish(true),
    onPointerCancel: () => finish(false),
  });

  const row_class = (index: number) =>
    state ? (state.from === index ? " is-dragging" : state.over === index ? " is-over" : "") : "";

  return { handle_props, row_class };
}
