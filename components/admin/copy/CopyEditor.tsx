"use client";
import "./copy_editor.css";
import { useEffect, useState } from "react";
import { DEFAULTS, type PageKey } from "@/defaults";
import * as db from "@/lib/db";
import { COPY_SETTING_KEY } from "@/lib/copy";
import { MediaField, PanelHead, msg, type PanelProps } from "../shared";
import { COPY_SCHEMA, LINK_FIELDS, PAGE_LABELS, type CopyField } from "./copy_schema";

type Row = Record<string, string>;
type Val = string | string[] | Row[];
type Obj = Record<string, unknown>;

const get_path = (o: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((a, k) => (a && typeof a === "object" ? (a as Obj)[k] : undefined), o);

function set_path(o: Obj, path: string, v: unknown) {
  const keys = path.split(".");
  let cur = o;
  for (const k of keys.slice(0, -1)) {
    if (typeof cur[k] !== "object" || cur[k] === null) cur[k] = {};
    cur = cur[k] as Obj;
  }
  cur[keys[keys.length - 1]] = v;
}

const as_text = (v: unknown): string =>
  Array.isArray(v) ? v.map(as_text).join("\n") : typeof v === "string" || typeof v === "number" ? String(v) : "";

const row_fields = (f: CopyField): CopyField[] | null => (f.type === "links" ? LINK_FIELDS : f.type === "list" ? f.item_fields ?? null : null);

function to_row(fields: CopyField[], item: unknown): Row {
  return Object.fromEntries(fields.map((sf) => [sf.path, as_text(get_path(item, sf.path))]));
}

function to_val(f: CopyField, raw: unknown): Val {
  const fields = row_fields(f);
  if (f.type === "list" || f.type === "links") {
    const arr = Array.isArray(raw) ? raw : [];
    return fields ? arr.map((it) => to_row(fields, it)) : arr.map(as_text);
  }
  return as_text(raw);
}

function split_lines(v: string): string[] {
  return v.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

function from_val(f: CopyField, v: Val | undefined, sample: unknown): unknown {
  if (v === undefined) return undefined;
  const fields = row_fields(f);
  if (f.type === "list" || f.type === "links") {
    if (!fields) {
      const items = (v as string[]).map((x) => x.trim()).filter(Boolean);
      return items.length ? items : undefined;
    }
    const rows: Obj[] = [];
    for (const row of v as Row[]) {
      const o: Obj = {};
      let filled = false;
      for (const sf of fields) {
        const t = (row[sf.path] ?? "").trim();
        if (sf.type === "lines") {
          const lines = split_lines(row[sf.path] ?? "");
          o[sf.path] = lines;
          if (lines.length) filled = true;
        } else {
          const num = typeof get_path(sample, sf.path) === "number" && t !== "" && Number.isFinite(Number(t));
          o[sf.path] = num ? Number(t) : t;
          if (t) filled = true;
        }
      }
      if (f.type === "links" && !(row.label?.trim() && row.href?.trim())) continue;
      if (filled) rows.push(o);
    }
    return rows.length ? rows : undefined;
  }
  const text = (v as string).trim();
  if (!text) return undefined;
  return f.type === "lines" ? split_lines(text) : text;
}

const swap = <T,>(arr: T[], i: number, j: number): T[] => {
  if (j < 0 || j >= arr.length) return arr;
  const next = arr.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

function TextControl({
  id, label, type, value, placeholder, max, onChange,
}: {
  id: string; label: string; type: CopyField["type"]; value: string; placeholder: string; max?: number; onChange: (v: string) => void;
}) {
  const multi = type === "textarea" || type === "lines";
  const limit = max ?? (multi ? 2000 : 400);
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      {multi ? (
        <textarea id={id} rows={type === "lines" ? 3 : 4} maxLength={limit} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type="text" id={id} maxLength={limit} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

export default function CopyEditor({ page, toast }: { page: PageKey; toast: PanelProps["toast"] }) {
  const fields = COPY_SCHEMA[page];
  const defaults = DEFAULTS[page];
  const [vals, setVals] = useState<Record<string, Val> | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    setVals(null);
    setError("");
    db.dbLoadSiteSettings()
      .then((s) => {
        if (!live) return;
        let stored: unknown = {};
        try {
          const raw = s[COPY_SETTING_KEY[page]];
          stored = raw ? JSON.parse(raw) : {};
        } catch {
          stored = {};
        }
        setVals(Object.fromEntries(fields.map((f) => [f.path, to_val(f, get_path(stored, f.path))])));
      })
      .catch((e) => {
        if (live) setError(msg(e, "Failed to load saved text."));
      });
    return () => {
      live = false;
    };
  }, [page, fields, attempt]);

  const set = (path: string, v: Val) => setVals((cur) => (cur ? { ...cur, [path]: v } : cur));
  const id_of = (path: string, extra = "") => `copy-${page}-${path.replace(/\./g, "-")}${extra}`;
  const placeholder_of = (path: string) => as_text(get_path(defaults, path));

  const save = async () => {
    if (!vals) return;
    setSaving(true);
    try {
      const out: Obj = {};
      for (const f of fields) {
        const sample = (get_path(defaults, f.path) as unknown[] | undefined)?.[0];
        const v = from_val(f, vals[f.path], sample);
        if (v !== undefined) set_path(out, f.path, v);
      }
      await db.dbSaveSetting(COPY_SETTING_KEY[page], Object.keys(out).length ? JSON.stringify(out) : "");
      toast(`${PAGE_LABELS[page]} text saved.`);
    } catch (e) {
      toast(msg(e, "Save failed."), true);
    } finally {
      setSaving(false);
    }
  };

  const render_list = (f: CopyField, rows: Val) => {
    const fields_of = row_fields(f);
    const default_arr = (get_path(defaults, f.path) as unknown[] | undefined) ?? [];
    const label = f.label;
    const reset_btn = (
      <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" aria-label={`Reset ${label} to default`} onClick={() => set(f.path, [])}>
        Reset
      </button>
    );
    const list_actions = (blank: Val[number], load: Val) => (
      <div className="admin-actions">
        <button type="button" className="admin-btn admin-btn--sm" onClick={() => set(f.path, [...(rows as Val[number][]), blank] as Val)}>Add row</button>
        {default_arr.length > 0 && <button type="button" className="admin-btn admin-btn--sm" onClick={() => set(f.path, load)}>Load defaults</button>}
        {reset_btn}
      </div>
    );
    if (!fields_of) {
      const list = rows as string[];
      return (
        <fieldset className="copy-list" key={f.path}>
          <legend>{label}</legend>
          {list.length === 0 && <p className="copy-empty">Using default list.</p>}
          {list.map((item, i) => (
            <div className="copy-row copy-row--plain" key={i}>
              <input
                type="text"
                aria-label={`${label} ${i + 1}`}
                maxLength={f.max ?? 400}
                value={item}
                placeholder={as_text(default_arr[i])}
                onChange={(e) => set(f.path, list.map((x, j) => (j === i ? e.target.value : x)))}
              />
              <div className="admin-actions">
                <button type="button" className="admin-btn admin-btn--sm" aria-label={`Move ${label} ${i + 1} up`} onClick={() => set(f.path, swap(list, i, i - 1))}>Up</button>
                <button type="button" className="admin-btn admin-btn--sm" aria-label={`Move ${label} ${i + 1} down`} onClick={() => set(f.path, swap(list, i, i + 1))}>Down</button>
                <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" aria-label={`Remove ${label} ${i + 1}`} onClick={() => set(f.path, list.filter((_, j) => j !== i))}>Remove</button>
              </div>
            </div>
          ))}
          {list_actions("", default_arr.map(as_text))}
        </fieldset>
      );
    }
    const list = rows as Row[];
    return (
      <fieldset className="copy-list" key={f.path}>
        <legend>{label}</legend>
        {list.length === 0 && <p className="copy-empty">Using default list.</p>}
        {list.map((row, i) => (
          <div className="copy-row" key={i}>
            {fields_of.map((sf) => (
              <TextControl
                key={sf.path}
                id={id_of(f.path, `-${i}-${sf.path}`)}
                label={`${sf.label} (${i + 1})`}
                type={sf.type}
                max={sf.max}
                value={row[sf.path] ?? ""}
                placeholder={as_text(get_path(default_arr[i], sf.path))}
                onChange={(v) => set(f.path, list.map((r, j) => (j === i ? { ...r, [sf.path]: v } : r)))}
              />
            ))}
            <div className="admin-actions">
              <button type="button" className="admin-btn admin-btn--sm" aria-label={`Move ${label} row ${i + 1} up`} onClick={() => set(f.path, swap(list, i, i - 1))}>Up</button>
              <button type="button" className="admin-btn admin-btn--sm" aria-label={`Move ${label} row ${i + 1} down`} onClick={() => set(f.path, swap(list, i, i + 1))}>Down</button>
              <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" aria-label={`Remove ${label} row ${i + 1}`} onClick={() => set(f.path, list.filter((_, j) => j !== i))}>Remove</button>
            </div>
          </div>
        ))}
        {list_actions(Object.fromEntries(fields_of.map((sf) => [sf.path, ""])), default_arr.map((it) => to_row(fields_of, it)))}
      </fieldset>
    );
  };

  const render_field = (f: CopyField) => {
    const v = vals?.[f.path];
    if (v === undefined) return null;
    if (f.type === "list" || f.type === "links") return render_list(f, v);
    const text = v as string;
    const reset = (
      <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" aria-label={`Reset ${f.label} to default`} disabled={!text} onClick={() => set(f.path, "")}>
        Reset
      </button>
    );
    if (f.type === "image") {
      return (
        <div className="copy-field" key={f.path}>
          <MediaField
            label={f.label}
            accept="image/*"
            folder={`copy/${page}`}
            value={text}
            placeholder={placeholder_of(f.path) || "https://"}
            toast={toast}
            onChange={(url) => set(f.path, url)}
          />
          <div className="admin-actions">{reset}</div>
        </div>
      );
    }
    return (
      <div className="copy-field" key={f.path}>
        <TextControl
          id={id_of(f.path)}
          label={f.label}
          type={f.type}
          max={f.max}
          value={text}
          placeholder={placeholder_of(f.path)}
          onChange={(x) => set(f.path, x)}
        />
        <div className="admin-actions">{reset}</div>
      </div>
    );
  };

  return (
    <div className="copy-editor" id={`copy-editor-${page}`}>
      <PanelHead title={PAGE_LABELS[page].toUpperCase()} sub="Leave a field empty to use its default text. Placeholders show the default." error={error} />
      {error && (
        <div className="admin-actions">
          <button type="button" className="admin-btn" onClick={() => setAttempt((n) => n + 1)}>Retry</button>
        </div>
      )}
      {!vals && !error && <p className="admin-empty" role="status">Loading…</p>}
      {vals && fields.length === 0 && <p className="copy-empty">No editable text on this page yet.</p>}
      {vals && fields.map(render_field)}
      {vals && fields.length > 0 && (
        <div className="copy-save">
          <button type="button" className="admin-btn admin-btn--accent" onClick={save} disabled={saving} aria-busy={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
