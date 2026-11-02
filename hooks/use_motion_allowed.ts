"use client";
import { useEffect, useState } from "react";

export function use_motion_allowed() {
  const [allowed, set_allowed] = useState(true);
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || connection?.saveData) set_allowed(false);
  }, []);
  return allowed;
}
