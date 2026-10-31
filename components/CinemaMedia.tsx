"use client";
import { useEffect } from "react";
import { safeUrl } from "@/lib/gsap";
import type { CinemaType } from "@/lib/types";

export function CinemaBg({ url, type }: { url: string; type: CinemaType }) {
  const src = safeUrl(url);
  if (!src) return null;
  if (type === "video") return <video src={src} autoPlay muted loop playsInline />;
  if (type === "html") return <iframe src={src} tabIndex={-1} title="" sandbox="allow-scripts" />;
  return <img src={src} alt="" aria-hidden="true" />;
}

export type CinemaItem = { url: string; type: CinemaType; label: string };

export function CinemaOverlay({ item, onClose }: { item: CinemaItem | null; onClose: () => void }) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [item, onClose]);

  if (!item) return null;
  const src = safeUrl(item.url);
  if (!src) return null;

  return (
    <div className="cinema-overlay" role="dialog" aria-modal="true" aria-label={item.label} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <button className="cinema-close" onClick={onClose} aria-label="Close preview">Close</button>
      <div className="cinema-wrap">
        {item.type === "video" ? (
          <video src={src} autoPlay controls loop playsInline />
        ) : item.type === "html" ? (
          <iframe src={src} title={item.label} sandbox="allow-scripts" />
        ) : (
          <img src={src} alt={item.label} />
        )}
      </div>
    </div>
  );
}
