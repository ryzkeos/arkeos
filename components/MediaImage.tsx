"use client";
import { useEffect, useRef, useState } from "react";
import MediaLoader from "./MediaLoader";

export default function MediaImage({ src, eager = false }: { src: string; eager?: boolean }) {
  const img = useRef<HTMLImageElement>(null);
  const [ready, set_ready] = useState(false);

  useEffect(() => {
    const el = img.current;
    set_ready(!!el && el.complete && el.naturalWidth > 0);
  }, [src]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={img}
        decoding="async"
        src={src}
        alt=""
        aria-hidden="true"
        loading={eager ? "eager" : "lazy"}
        draggable={false}
        onLoad={() => set_ready(true)}
        onError={() => set_ready(true)}
      />
      {!ready && <MediaLoader />}
    </>
  );
}
