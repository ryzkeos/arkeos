"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { acquire_video, type VideoSlot } from "@/lib/video_pool";

export function use_pooled_video(host: RefObject<HTMLElement | null>, src: string | null, active: boolean, pinned = false) {
  const el_ref = useRef<HTMLVideoElement | null>(null);
  const [holding, set_holding] = useState(false);
  const [slot, set_slot] = useState<VideoSlot | null>(null);

  useEffect(() => {
    const node = host.current;
    if (!node || !src) return;
    const next = acquire_video(src, node, { pinned, on_hold: set_holding });
    el_ref.current = next.el;
    set_slot(next);
    return () => {
      next.release();
      el_ref.current = null;
      set_slot(null);
      set_holding(false);
    };
  }, [host, src, pinned]);

  useEffect(() => { slot?.set_active(active); }, [slot, active]);

  return { el_ref, holding, slot };
}
