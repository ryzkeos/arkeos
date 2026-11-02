"use client";
import { useEffect, useRef, useState } from "react";
import MediaLoader from "./MediaLoader";

export default function HtmlFrame({ src }: { src: string }) {
  const [doc, set_doc] = useState<string | null | false>(null);
  const [visible, set_visible] = useState(false);
  const [ready, set_ready] = useState(false);
  const mark = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = mark.current?.parentElement;
    if (!el) return;
    let in_view = false;
    const sync = () => set_visible(in_view && !document.hidden);
    const io = new IntersectionObserver(([e]) => { in_view = e.isIntersecting; sync(); }, { threshold: 0.01 });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    if (!visible || doc !== null) return;
    let live = true;
    const ctrl = new AbortController();
    fetch(src, { signal: ctrl.signal })
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error("html unreadable"))))
      .then((text) => { if (live) set_doc(text); })
      .catch(() => { if (live) set_doc(false); });
    return () => {
      live = false;
      ctrl.abort();
    };
  }, [src, visible, doc]);

  useEffect(() => { set_doc(null); set_ready(false); }, [src]);
  useEffect(() => { if (!visible) set_ready(false); }, [visible]);
  useEffect(() => {
    if (!visible || ready) return;
    const timer = window.setTimeout(() => set_ready(true), 12000);
    return () => window.clearTimeout(timer);
  }, [visible, ready, src]);

  return (
    <>
      <span ref={mark} aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", visibility: "hidden" }} />
      {visible && doc === false && <iframe src={src} title="" tabIndex={-1} sandbox="allow-scripts" aria-hidden="true" onLoad={() => set_ready(true)} />}
      {visible && typeof doc === "string" && <iframe srcDoc={doc} title="" tabIndex={-1} sandbox="allow-scripts" aria-hidden="true" onLoad={() => set_ready(true)} />}
      {visible && !ready && <MediaLoader />}
    </>
  );
}
