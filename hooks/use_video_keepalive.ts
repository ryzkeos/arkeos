"use client";
import { useEffect, type RefObject } from "react";

const STALL_MS = 3000;
const RETRY_MS = 1000;

function release(el: HTMLVideoElement) {
  try {
    el.pause();
    el.removeAttribute("src");
    el.load();
  } catch {}
}

export function use_video_keepalive(ref: RefObject<HTMLVideoElement | null>, active: boolean, src?: string | null) {
  useEffect(() => {
    const el = ref.current;
    return () => {
      if (!el) return;
      el.pause();
      queueMicrotask(() => { if (!el.isConnected) release(el); });
    };
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;

    let reloaded = false;
    let stall_timer = 0;
    let retry_timer = 0;

    const play = () => {
      if (document.hidden || !el.paused || el.ended) return;
      el.play().catch(() => {});
    };
    const clear_stall = () => window.clearTimeout(stall_timer);
    const on_ready = () => { clear_stall(); play(); };
    const on_stall = () => {
      clear_stall();
      stall_timer = window.setTimeout(() => {
        if (el.readyState < 3 && !reloaded && el.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
          reloaded = true;
          el.load();
        }
        play();
      }, STALL_MS);
    };
    const on_pause = () => {
      window.clearTimeout(retry_timer);
      retry_timer = window.setTimeout(play, 150);
    };
    const on_error = () => {
      if (reloaded) return;
      reloaded = true;
      window.clearTimeout(retry_timer);
      retry_timer = window.setTimeout(() => { el.load(); play(); }, RETRY_MS);
    };
    const on_visible = () => { if (document.hidden) el.pause(); else play(); };

    el.preload = "auto";

    el.addEventListener("canplay", on_ready);
    el.addEventListener("loadeddata", on_ready);
    el.addEventListener("stalled", on_stall);
    el.addEventListener("waiting", on_stall);
    el.addEventListener("pause", on_pause);
    el.addEventListener("error", on_error);
    document.addEventListener("visibilitychange", on_visible);
    window.addEventListener("pagehide", on_visible);
    play();

    return () => {
      clear_stall();
      window.clearTimeout(retry_timer);
      el.pause();
      el.removeEventListener("canplay", on_ready);
      el.removeEventListener("loadeddata", on_ready);
      el.removeEventListener("stalled", on_stall);
      el.removeEventListener("waiting", on_stall);
      el.removeEventListener("pause", on_pause);
      el.removeEventListener("error", on_error);
      document.removeEventListener("visibilitychange", on_visible);
      window.removeEventListener("pagehide", on_visible);
    };
  }, [ref, active, src]);
}
