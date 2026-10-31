import { useRef, useState, type MutableRefObject, type ReactNode, type Ref } from "react";
import * as db from "@/lib/db";

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
};

export function Icon({ name }: { name: keyof typeof ICON_PATHS }) {
  return (
    <svg className="admin-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {ICON_PATHS[name]}
    </svg>
  );
}

export function IconBtn({
  icon, label, onClick, danger, disabled,
}: {
  icon: keyof typeof ICON_PATHS; label: string; onClick: () => void; danger?: boolean; disabled?: boolean;
}) {
  return (
    <button type="button" className={`admin-icon-btn${danger ? " admin-icon-btn--danger" : ""}`} aria-label={label} title={label} onClick={onClick} disabled={disabled}>
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

export function FilePicker({
  id, label, accept, inputRef, busy, status, status_text,
}: {
  id: string; label: string; accept: string; inputRef?: Ref<HTMLInputElement>; busy?: boolean; status?: "success" | "error"; status_text?: string;
}) {
  const own = useRef<HTMLInputElement | null>(null);
  const [, bump] = useState(0);
  const set_ref = (el: HTMLInputElement | null) => {
    own.current = el;
    if (typeof inputRef === "function") inputRef(el);
    else if (inputRef) (inputRef as MutableRefObject<HTMLInputElement | null>).current = el;
  };
  const name = own.current?.files?.[0]?.name ?? "";
  return (
    <div className="admin-file">
      <input id={id} ref={set_ref} type="file" className="admin-file__input" accept={accept} disabled={busy} onChange={() => bump((n) => n + 1)} />
      <label htmlFor={id} className={`admin-btn admin-btn--sm admin-file__btn${busy ? " admin-file__btn--busy" : ""}`} aria-label={label}>
        {busy ? "Uploading…" : "Choose file"}
      </label>
      <span className="admin-file__name" title={name || undefined}>{name || "No file selected"}</span>
      {status && <span className={`admin-file__state admin-file__state--${status}`} role="status">{status_text ?? (status === "success" ? "Uploaded" : "Upload failed")}</span>}
    </div>
  );
}

export function MediaField({
  label,
  accept,
  folder,
  value,
  onChange,
  toast,
  placeholder,
}: {
  label: string;
  accept: string;
  folder: string;
  value: string;
  onChange: (v: string) => void;
  toast: PanelProps["toast"];
  placeholder: string;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<"success" | "error" | undefined>(undefined);
  const upload = async () => {
    const fl = file.current?.files?.[0];
    if (!fl) return toast("Choose a file first.", true);
    const ext = fl.name.split(".").pop() ?? "bin";
    const path = `${folder}/${Date.now()}.${ext}`;
    setBusy(true);
    setState(undefined);
    try {
      await db.dbUpload(MEDIA_BUCKET, path, fl);
      onChange(db.dbPublicUrl(MEDIA_BUCKET, path));
      setState("success");
      toast("File uploaded.");
    } catch (e) {
      setState("error");
      toast(msg(e, "Upload failed."), true);
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  };
  return (
    <div className="form-group admin-form-full">
      <span className="admin-field-label">{label}</span>
      <div className="media-actions-row" style={{ marginBottom: "0.5rem" }}>
        <FilePicker id={`media-${folder.replace(/\W/g, "-")}-${label.replace(/\W/g, "-")}`} label={`${label} file`} accept={accept} inputRef={file} busy={busy} status={state} />
        <button type="button" className="admin-btn admin-btn--sm admin-btn--accent" onClick={upload} disabled={busy} aria-busy={busy} aria-label={`Upload ${label}`}>{busy ? "Uploading…" : "Upload"}</button>
        <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => onChange("")} aria-label={`Clear ${label}`}>Clear</button>
      </div>
      <input type="text" value={value} placeholder={placeholder} aria-label={`${label} URL`} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export const CINEMA_TYPES: [string, string][] = [["video", "Video"], ["image", "Image"], ["html", "HTML/iframe"]];
