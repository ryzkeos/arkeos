"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { lenisRef } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/gsap";

type Props = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  close_label: string;
  options: string[];
  value: string;
  full?: boolean;
  on_change: (value: string) => void;
};

const CLOSE_MS = 200;

function ChevronDown() {
  return (
    <svg className="select-chevron" viewBox="0 0 12 8" aria-hidden="true" focusable="false">
      <path d="M1 1.5l5 5 5-5" />
    </svg>
  );
}

export default function SelectModal({ id, name, label, placeholder, close_label, options, value, full, on_change }: Props) {
  const uid = useId();
  const title_id = `${uid}-title`;
  const [open, set_open] = useState(false);
  const [closing, set_closing] = useState(false);
  const [cursor, set_cursor] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const close_btn = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open_modal = () => {
    set_cursor(Math.max(0, options.indexOf(value)));
    set_closing(false);
    set_open(true);
  };

  const close_modal = useCallback((restore = true) => {
    if (prefersReducedMotion()) {
      set_open(false);
      if (restore) trigger.current?.focus();
      return;
    }
    set_closing(true);
    timer.current = setTimeout(() => {
      set_open(false);
      set_closing(false);
      if (restore) trigger.current?.focus();
    }, CLOSE_MS);
  }, []);

  const pick = (opt: string) => {
    on_change(opt);
    close_modal();
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  useEffect(() => {
    if (!open) return;
    lenisRef.current?.stop();
    const prev_overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    list.current?.focus();
    return () => {
      lenisRef.current?.start();
      document.documentElement.style.overflow = prev_overflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, cursor]);

  const on_key = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close_modal();
      return;
    }
    if (e.key === "Tab") {
      const nodes = [close_btn.current, list.current].filter(Boolean) as HTMLElement[];
      const idx = nodes.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (idx <= 0 ? nodes.length - 1 : idx - 1) : idx === nodes.length - 1 ? 0 : idx + 1;
      e.preventDefault();
      nodes[next]?.focus();
      return;
    }
    if (document.activeElement !== list.current) return;
    if (e.key === "ArrowDown") { e.preventDefault(); set_cursor((c) => Math.min(options.length - 1, c + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); set_cursor((c) => Math.max(0, c - 1)); }
    else if (e.key === "Home") { e.preventDefault(); set_cursor(0); }
    else if (e.key === "End") { e.preventDefault(); set_cursor(options.length - 1); }
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = options[cursor];
      if (opt !== undefined) pick(opt);
    }
  };

  const modal = open && (
    <div className={closing ? "select-modal is-closing" : "select-modal"} onKeyDown={on_key}>
      <div className="select-modal__backdrop" onClick={() => close_modal()} aria-hidden="true" />
      <div ref={panel} className="select-modal__panel" role="dialog" aria-modal="true" aria-labelledby={title_id}>
        <div className="select-modal__head">
          <h3 className="select-modal__title" id={title_id}>{label}</h3>
          <button ref={close_btn} type="button" className="select-modal__close" aria-label={close_label} onClick={() => close_modal()}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <ul
          ref={list}
          className="select-modal__list"
          role="listbox"
          tabIndex={0}
          aria-labelledby={title_id}
          aria-activedescendant={`${uid}-opt-${cursor}`}
        >
          {options.map((o, i) => {
            const selected = o === value;
            const cls = `select-option${selected ? " is-selected" : ""}${i === cursor ? " is-cursor" : ""}`;
            return (
              <li
                key={o}
                id={`${uid}-opt-${i}`}
                data-index={i}
                role="option"
                aria-selected={selected}
                className={cls}
                onMouseMove={() => set_cursor(i)}
                onClick={() => pick(o)}
              >
                <span className="select-option__text">{o}</span>
                <svg className="select-option__check" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  return (
    <div className={`form-field${full ? " form-full" : ""}`}>
      <label id={`${id}-label`} htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <button
          ref={trigger}
          type="button"
          id={id}
          className="select-trigger"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-labelledby={`${id}-label ${id}-value`}
          onClick={open_modal}
        >
          <span id={`${id}-value`} className={value ? "select-value" : "select-value is-placeholder"}>{value || placeholder}</span>
          <ChevronDown />
        </button>
        <input type="hidden" name={name} value={value} />
      </div>
      {typeof document !== "undefined" && modal ? createPortal(modal, document.body) : null}
    </div>
  );
}
