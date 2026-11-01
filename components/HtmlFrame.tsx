"use client";
import { useEffect, useState } from "react";

export default function HtmlFrame({ src }: { src: string }) {
  const [doc, set_doc] = useState<string | null | false>(null);

  useEffect(() => {
    let live = true;
    const ctrl = new AbortController();
    set_doc(null);
    fetch(src, { signal: ctrl.signal })
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error("html unreadable"))))
      .then((text) => { if (live) set_doc(text); })
      .catch(() => { if (live) set_doc(false); });
    return () => {
      live = false;
      ctrl.abort();
    };
  }, [src]);

  if (doc === null) return null;
  if (doc === false) return <iframe src={src} title="" tabIndex={-1} sandbox="allow-scripts" aria-hidden="true" />;
  return <iframe srcDoc={doc} title="" tabIndex={-1} sandbox="allow-scripts" aria-hidden="true" />;
}
