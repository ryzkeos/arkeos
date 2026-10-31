"use client";
import { useEffect, useState } from "react";

export function use_cinema_active() {
  const [hover, set_hover] = useState(false);
  const [touch, set_touch] = useState(false);

  useEffect(() => {
    set_touch(window.matchMedia("(hover: none)").matches);
  }, []);

  return {
    active: hover || touch,
    handlers: {
      onMouseEnter: () => set_hover(true),
      onMouseLeave: () => set_hover(false),
      onFocus: () => set_hover(true),
      onBlur: () => set_hover(false),
    },
  };
}
