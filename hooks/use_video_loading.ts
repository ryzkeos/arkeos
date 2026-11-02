"use client";
import { useEffect, useState, type RefObject } from "react";

const EVENTS = ["loadstart", "emptied", "waiting", "stalled", "seeking", "seeked", "loadeddata", "canplay", "canplaythrough", "playing"];

export function use_video_loading(ref: RefObject<HTMLVideoElement | null>, enabled: boolean, src?: string | null) {
  const [loading, set_loading] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) {
      set_loading(false);
      return;
    }
    let timer = 0;
    const sync = () => set_loading(el.readyState < 3 && !el.error);
    const on_visible = () => {
      window.clearTimeout(timer);
      if (!document.hidden) timer = window.setTimeout(sync, 250);
    };
    const on_error = () => set_loading(false);

    sync();
    EVENTS.forEach((name) => el.addEventListener(name, sync));
    el.addEventListener("error", on_error);
    document.addEventListener("visibilitychange", on_visible);
    return () => {
      window.clearTimeout(timer);
      EVENTS.forEach((name) => el.removeEventListener(name, sync));
      el.removeEventListener("error", on_error);
      document.removeEventListener("visibilitychange", on_visible);
    };
  }, [ref, enabled, src]);

  return loading;
}
