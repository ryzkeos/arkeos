import { compress_video, is_video_file } from "@/lib/video_compress";
import { resize_image } from "@/lib/image_compress";
import { size_label } from "@/lib/size_label";
import { capture_poster } from "@/lib/video_poster";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import * as db from "@/lib/db";
import { media_ext, media_kind } from "@/lib/media_type";
import { media_backup, media_released, media_uploaded } from "./media_tx";

export const MEDIA_BUCKET = "media";

export type PanelProps = {
  toast: (t: string, err?: boolean) => void;
  ask: (t: string, f: () => void) => void;
};

export const msg = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);

export function PanelHead({ title, sub, error }: { title: string; sub: string; error?: string }) {
  return (
    <>
      <h1 className="panel-title">{title}</h1>
      <p className="panel-sub">{sub}</p>
      <p className="panel-error" role="alert" style={{ display: error ? "block" : "none" }}>{error}</p>
    </>
  );
}

export const isHttpUrl = (value: string) => {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const ICON_PATHS: Record<string, ReactNode> = {
  edit: <path d="M4 20h4l10-10-4-4L4 16v4zM14 6l4 4" />,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  eye_off: <><path d="M3 3l18 18M10.6 5.1A9.7 9.7 0 0112 5c6 0 10 7 10 7a17 17 0 01-3.2 3.9M6.5 6.5C3.8 8.3 2 12 2 12s4 7 10 7c1.6 0 3-.4 4.3-1" /></>,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />,
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  down: <path d="M12 5v14M6 13l6 6 6-6" />,
  view: <><path d="M3 5h18v14H3zM3 7l9 7 9-7" /></>,
  mail_open: <path d="M3 9l9-6 9 6v11H3zM3 9l9 6 9-6" />,
  check: <path d="M5 12l5 5 9-10" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  chevron_down: <path d="M6 9l6 6 6-6" />,
  image: <><rect x="3" y="4" width="18" height="16" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></>,
  film: <><rect x="3" y="5" width="18" height="14" /><path d="M10 9l5 3-5 3z" /></>,
  code: <path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14" />,
  upload: <path d="M12 16V4M6 10l6-6 6 6M4 20h16" />,
  undo: <path d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3" />,
  star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
};

export function Icon({ name }: { name: keyof typeof ICON_PATHS }) {
  return (
    <svg className="admin-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {ICON_PATHS[name]}
    </svg>
  );
}

export function IconBtn({
  icon, label, onClick, danger, disabled, active,
}: {
  icon: keyof typeof ICON_PATHS; label: string; onClick: () => void; danger?: boolean; disabled?: boolean; active?: boolean;
}) {
  return (
    <button type="button" className={`admin-icon-btn${danger ? " admin-icon-btn--danger" : ""}${active ? " admin-icon-btn--active" : ""}`} aria-label={label} aria-pressed={active} title={label} onClick={onClick} disabled={disabled}>
      <Icon name={icon} />
    </button>
  );
}

export function Checkbox({
  id, label, checked, onChange, disabled,
}: {
  id: string; label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <label className={`admin-check${disabled ? " admin-check--disabled" : ""}`} htmlFor={id}>
      <input id={id} type="checkbox" className="admin-check__input" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="admin-check__box" aria-hidden="true"><Icon name="check" /></span>
      <span className="admin-check__text">{label}</span>
    </label>
  );
}

function file_kind(name: string): "video" | "html" | "image" | "font" {
  const ext = media_ext(name);
  return ext === "woff2" || ext === "woff" ? "font" : media_kind(name);
}

const KIND_ICON = { video: "film", html: "code", image: "image", font: "code" } as const;

function file_name(url: string) {
  const last = url.split("?")[0].split("/").pop() ?? "";
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

export const slug = (v: string) => v.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

function file_size(n: number) {
  return n < 1048576 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1048576).toFixed(1)} MB`;
}

export const media_slot = (base_name = "", label = "") => slug(base_name) || slug(label) || "file";

export async function upload_media(
  scope: string,
  folder: string,
  slot: string,
  file: File,
  previous: string,
  prepare?: (file: File) => File,
  on_status?: (text: string) => void,
  on_report?: (note: string) => void,
) {
  const packed = await compress_video(prepare ? prepare(file) : file, on_status);
  const sized = await resize_image(packed.file);
  const ready = sized.file;
  const note = packed.note || sized.note || "No compression for this file type.";
  const ext = (ready.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${folder}/${slot}.${ext}`;
  on_status?.("Uploading…");
  await media_backup(scope, previous);
  await db.dbUpload(MEDIA_BUCKET, path, ready);
  if (is_video_file(ready)) {
    const poster = await capture_poster(ready);
    if (poster) {
      try { await db.dbUpload(MEDIA_BUCKET, `${folder}/${slot}.poster.jpg`, poster); } catch {}
    }
  }
  const next = `${db.dbPublicUrl(MEDIA_BUCKET, path)}?v=${Date.now()}`;
  media_uploaded(scope, next, previous);
  on_report?.(`${note} Uploaded ${size_label(ready.size)}.`);
  return next;
}

export function MediaField({
  label,
  accept,
  folder,
  file_name: base_name,
  scope,
  value,
  onChange,
  toast,
  placeholder,
  hide_url,
  validate,
  prepare,
  trailing,
  wide = true,
  staged,
  on_stage,
}: {
  label: string;
  accept: string;
  folder: string;
  file_name?: string;
  scope: string;
  value: string;
  onChange: (v: string) => void;
  toast: PanelProps["toast"];
  placeholder?: string;
  hide_url?: boolean;
  validate?: (file: File) => Promise<string | null> | string | null;
  prepare?: (file: File) => File;
  trailing?: React.ReactNode;
  wide?: boolean;
  staged?: File | null;
  on_stage?: (file: File | null) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [local_picked, setLocalPicked] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const id = `media-${folder.replace(/\W/g, "-")}-${label.replace(/\W/g, "-")}`;
  const deferred = !!on_stage;
  const picked = deferred ? staged ?? null : local_picked;
  const setPicked = (file: File | null) => (on_stage ? on_stage(file) : setLocalPicked(file));

  const reset_input = () => {
    if (input.current) input.current.value = "";
  };

  useEffect(() => {
    if (!picked) reset_input();
  }, [picked]);

  const slot_base = media_slot(base_name, label);
  const [backup, setBackup] = useState<string | null>(null);
  const [backup_tick, setBackupTick] = useState(0);

  useEffect(() => {
    let live = true;
    db.dbFindBackup(folder, slot_base).then((u) => { if (live) setBackup(u); }).catch(() => {});
    return () => { live = false; };
  }, [folder, slot_base, backup_tick]);

  const [status, setStatus] = useState("");

  const send = async (file: File) => {
    const problem = validate ? await validate(file) : null;
    if (problem) {
      setFailed(true);
      reset_input();
      return toast(problem, true);
    }
    setBusy(true);
    setFailed(false);
    setStatus("");
    let report = "";
    try {
      const next = await upload_media(scope, folder, slot_base, file, value, prepare, setStatus, (note) => { report = note; });
      onChange(next);
      setPicked(null);
      reset_input();
      setBackupTick((n) => n + 1);
      toast(report ? `File uploaded. ${report}` : "File uploaded.");
    } catch (e) {
      setFailed(true);
      toast(msg(e, "Upload failed."), true);
    } finally {
      setBusy(false);
      reset_input();
    }
  };

  const pick = async (file: File | null) => {
    setFailed(false);
    if (deferred && file && validate) {
      const problem = await validate(file);
      if (problem) {
        setFailed(true);
        reset_input();
        return toast(problem, true);
      }
    }
    setPicked(file);
  };

  const restore = async () => {
    if (!backup) return;
    setBusy(true);
    try {
      const res = await fetch(backup);
      if (!res.ok) throw new Error("Backup could not be read.");
      const blob = await res.blob();
      const name = decodeURIComponent(backup.split("?")[0].split("/").pop() ?? "backup");
      setBusy(false);
      const file = new File([blob], name, { type: blob.type });
      if (deferred) await pick(file);
      else await send(file);
    } catch (e) {
      setBusy(false);
      toast(msg(e, "Restore failed."), true);
    }
  };

  const remove = () => {
    if (picked) {
      setPicked(null);
      setFailed(false);
      reset_input();
    } else {
      media_released(scope, value);
      onChange("");
    }
  };

  const name = picked ? picked.name : value ? file_name(value) : "";
  const kind = name ? file_kind(name) : null;
  const meta = busy ? status || "Uploading…" : failed ? "Upload failed" : picked ? `${file_size(picked.size)} · uploads when you save` : value ? "Uploaded" : hide_url ? "Choose a file to upload" : "Choose a file or paste a link below";
  const state = failed ? "error" : busy ? "busy" : picked ? "ready" : value ? "done" : "empty";

  return (
    <div className={`form-group${wide ? " admin-form-full" : ""}`}>
      <span className="admin-field-label">{label}</span>
      <div className={`admin-media admin-media--${state}`}>
        <input id={id} ref={input} type="file" className="admin-media__input" accept={accept} disabled={busy} onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          if (!file) return;
          if (deferred) pick(file);
          else send(file);
        }} />
        <div className="admin-media__thumb" aria-hidden="true">
          {!picked && value && kind === "image" ? <img src={value} alt="" /> : <Icon name={kind ? KIND_ICON[kind] : "image"} />}
        </div>
        <div className="admin-media__info">
          <span className="admin-media__name" title={name || undefined}>{name || "No file selected"}</span>
          <span className="admin-media__meta" role="status">
            {kind && <span className={`admin-media__kind admin-media__kind--${kind}`}>{kind}</span>}
            <span className="admin-media__text">{meta}</span>
          </span>
        </div>
        <div className="admin-media__actions">
          <label htmlFor={id} className={`admin-icon-btn${busy ? " admin-media__btn--off" : ""}`} title={`${value || picked ? "Replace" : "Upload"} ${label} file`} aria-label={`${value || picked ? "Replace" : "Upload"} ${label} file`}><Icon name="upload" /></label>
          {backup && !picked && <IconBtn icon="undo" label={`Restore previous ${label} file`} onClick={restore} disabled={busy} />}
          {(value || picked) && <IconBtn icon="x" label={picked ? `Discard chosen ${label} file` : `Remove ${label}`} onClick={remove} danger disabled={busy} />}
        </div>
      </div>
      {!hide_url && (
        <div className="admin-field-row">
          <input type="text" value={value} placeholder={placeholder} aria-label={`${label} URL`} onChange={(e) => { if (deferred && picked) setPicked(null); onChange(e.target.value); }} />
          {trailing}
        </div>
      )}
    </div>
  );
}

const HEX_FULL = /^#[0-9a-f]{6}$/i;
const COLOR_PRESETS = ["#C8FF00", "#FF6B6B", "#FFB800", "#00D1FF", "#7C5CFF", "#F5F5F5"];

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function normalize_hex(raw: string): string | null {
  const t = raw.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(t)) return `#${t.split("").map((c) => c + c).join("")}`.toLowerCase();
  if (/^[0-9a-f]{6}$/i.test(t)) return `#${t}`.toLowerCase();
  return null;
}

type Hsv = [number, number, number];

function hex_to_hsv(hex: string): Hsv {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, max ? d / max : 0, max];
}

function hsv_to_hex([h, s, v]: Hsv): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const to = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${to(f(5))}${to(f(3))}${to(f(1))}`;
}

export function ColorField({
  id, label, value, onChange, wide,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; wide?: boolean;
}) {
  const safe = HEX_FULL.test(value) ? value.toLowerCase() : "#c8ff00";
  const [open, setOpen] = useState(false);
  const [hsv, setHsv] = useState<Hsv>(() => hex_to_hsv(safe));
  const [draft, setDraft] = useState(safe);
  const root = useRef<HTMLDivElement>(null);
  const sv = useRef<HTMLDivElement>(null);
  const hue = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHsv((cur) => (hsv_to_hex(cur) === safe ? cur : hex_to_hsv(safe)));
    setDraft(safe);
  }, [safe]);

  useEffect(() => {
    if (!open) return;
    const on_down = (e: globalThis.PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const on_key = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", on_down);
    document.addEventListener("keydown", on_key);
    return () => {
      document.removeEventListener("pointerdown", on_down);
      document.removeEventListener("keydown", on_key);
    };
  }, [open]);

  const apply = (next: Hsv) => {
    setHsv(next);
    onChange(hsv_to_hex(next));
  };

  const pick_sv = (e: PointerEvent<HTMLDivElement>) => {
    const r = sv.current?.getBoundingClientRect();
    if (!r) return;
    apply([hsv[0], clamp01((e.clientX - r.left) / r.width), 1 - clamp01((e.clientY - r.top) / r.height)]);
  };

  const pick_hue = (e: PointerEvent<HTMLDivElement>) => {
    const r = hue.current?.getBoundingClientRect();
    if (!r) return;
    apply([clamp01((e.clientX - r.left) / r.width) * 360, hsv[1], hsv[2]]);
  };

  const key_sv = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    apply([hsv[0], clamp01(hsv[1] + m[0]), clamp01(hsv[2] + m[1])]);
  };

  const key_hue = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 15 : 3;
    const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? step : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -step : 0;
    if (!d) return;
    e.preventDefault();
    apply([(hsv[0] + d + 360) % 360, hsv[1], hsv[2]]);
  };

  return (
    <div className={`form-group${wide ? " admin-form-full" : ""}`}>
      <span className="admin-field-label" id={`${id}-label`}>{label}</span>
      <div className="admin-color" ref={root}>
        <button type="button" id={id} className="admin-color__trigger" aria-haspopup="dialog" aria-expanded={open} aria-labelledby={`${id}-label ${id}`} onClick={() => setOpen((o) => !o)}>
          <span className="admin-color__swatch" style={{ background: safe }} aria-hidden="true" />
          <span className="admin-color__hex">{safe.toUpperCase()}</span>
          <span className="admin-color__chevron" aria-hidden="true"><Icon name="chevron_down" /></span>
        </button>
        {open && (
          <div className="admin-color__pop" role="dialog" aria-label={`${label} picker`}>
            <div
              ref={sv}
              className="admin-color__sv"
              style={{ backgroundColor: `hsl(${hsv[0]} 100% 50%)` }}
              tabIndex={0}
              role="slider"
              aria-label="Saturation and brightness"
              aria-valuetext={`Saturation ${Math.round(hsv[1] * 100)} percent, brightness ${Math.round(hsv[2] * 100)} percent`}
              aria-valuenow={Math.round(hsv[1] * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); pick_sv(e); }}
              onPointerMove={(e) => { if (e.buttons) pick_sv(e); }}
              onKeyDown={key_sv}
            >
              <span className="admin-color__knob" style={{ left: `${hsv[1] * 100}%`, top: `${(1 - hsv[2]) * 100}%`, background: safe }} />
            </div>
            <div
              ref={hue}
              className="admin-color__hue"
              tabIndex={0}
              role="slider"
              aria-label="Hue"
              aria-valuenow={Math.round(hsv[0])}
              aria-valuemin={0}
              aria-valuemax={360}
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); pick_hue(e); }}
              onPointerMove={(e) => { if (e.buttons) pick_hue(e); }}
              onKeyDown={key_hue}
            >
              <span className="admin-color__knob" style={{ left: `${(hsv[0] / 360) * 100}%`, top: "50%", background: `hsl(${hsv[0]} 100% 50%)` }} />
            </div>
            <input
              type="text"
              className="admin-color__input"
              aria-label={`${label} hex value`}
              value={draft}
              maxLength={7}
              spellCheck={false}
              onChange={(e) => {
                setDraft(e.target.value);
                const next = normalize_hex(e.target.value);
                if (next) onChange(next);
              }}
              onBlur={() => setDraft(safe)}
            />
            <div className="admin-color__presets" role="group" aria-label="Preset colors">
              {COLOR_PRESETS.map((c) => (
                <button key={c} type="button" className={`admin-color__preset${c.toLowerCase() === safe ? " is-active" : ""}`} style={{ background: c }} aria-label={`Use ${c}`} aria-pressed={c.toLowerCase() === safe} onClick={() => onChange(c.toLowerCase())} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ToggleField({
  id, label, checked, onChange, wide, disabled, on_text = "On", off_text = "Off",
}: {
  id: string; label: string; checked: boolean; onChange: (v: boolean) => void; wide?: boolean; disabled?: boolean; on_text?: string; off_text?: string;
}) {
  return (
    <div className={`form-group${wide ? " admin-form-full" : ""}`}>
      <span className="admin-field-label">{label}</span>
      <label className="admin-toggle" htmlFor={id}>
        <input id={id} type="checkbox" role="switch" className="admin-toggle__input" disabled={disabled} checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="admin-toggle__text">{checked ? on_text : off_text}</span>
        <span className="admin-toggle__track" aria-hidden="true"><span className="admin-toggle__thumb" /></span>
      </label>
    </div>
  );
}


export function SlideText({ children }: { children: string }) {
  const box = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const [dist, setDist] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!box.current || !inner.current) return;
      setDist(Math.max(0, Math.ceil(inner.current.offsetWidth - box.current.clientWidth)));
    };
    measure();
    const watcher = new ResizeObserver(measure);
    if (box.current) watcher.observe(box.current);
    return () => watcher.disconnect();
  }, [children]);

  const vars = { "--slide-distance": `${dist}px`, "--slide-time": `${Math.max(4, dist / 25 + 3)}s` } as CSSProperties;

  return (
    <span ref={box} className={`slide-text${dist > 0 ? " is-sliding" : ""}`} style={vars}>
      <span ref={inner} className="slide-text__inner">{children}</span>
    </span>
  );
}
