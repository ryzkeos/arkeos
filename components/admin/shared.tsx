import { useRef, useState } from "react";
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
  const upload = async () => {
    const fl = file.current?.files?.[0];
    if (!fl) return toast("Choose a file first.", true);
    const ext = fl.name.split(".").pop() ?? "bin";
    const path = `${folder}/${Date.now()}.${ext}`;
    setBusy(true);
    try {
      await db.dbUpload(MEDIA_BUCKET, path, fl);
      onChange(db.dbPublicUrl(MEDIA_BUCKET, path));
      toast("File uploaded.");
    } catch (e) {
      toast(msg(e, "Upload failed."), true);
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  };
  return (
    <div className="form-group admin-form-full">
      <label>{label}</label>
      <div className="media-actions-row" style={{ marginBottom: "0.5rem" }}>
        <input type="file" ref={file} accept={accept} aria-label={`${label} file`} />
        <button type="button" className="admin-btn admin-btn--sm admin-btn--accent" onClick={upload} disabled={busy} aria-label={`Upload ${label}`}>{busy ? "Uploading…" : "Upload"}</button>
        <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => onChange("")} aria-label={`Clear ${label}`}>Clear</button>
      </div>
      <input type="text" value={value} placeholder={placeholder} aria-label={`${label} URL`} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export const CINEMA_TYPES: [string, string][] = [["video", "Video"], ["image", "Image"], ["html", "HTML/iframe"]];
