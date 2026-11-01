"use client";
import "./copy_editor.css";
import { useEffect, useState } from "react";
import { DEFAULTS, type PageKey } from "@/defaults";
import * as db from "@/lib/db";
import { COPY_SETTING_KEY } from "@/lib/copy";
import SelectModal from "@/components/SelectModal";
import { Checkbox, IconBtn, MediaField, PanelHead, msg, type PanelProps } from "../shared";
import { LINK_FIELDS, type CopyField, type CopyItem } from "./copy_schema";

type Row = Record<string, string>;
type Val = string | string[] | Row[];
type Obj = Record<string, unknown>;

const get_path = (o: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((a, k) => (a && typeof a === "object" ? (a as Obj)[k] : undefined), o);

const lines_text = (v: unknown): string => (Array.isArray(v) ? v.map(as_text).join(" | ") : as_text(v));

function unset_path(o: Obj, path: string) {
  const keys = path.split(".");
  const trail: Obj[] = [o];
  for (const k of keys.slice(0, -1)) {
    const next = trail[trail.length - 1][k];
    if (typeof next !== "object" || next === null || Array.isArray(next)) return;
    trail.push(next as Obj);
  }
  delete trail[trail.length - 1][keys[keys.length - 1]];
  for (let i = trail.length - 1; i > 0; i--) {
    if (Object.keys(trail[i]).length) break;
    delete trail[i - 1][keys[i - 1]];
  }
}

function parse_stored(raw: unknown): Obj {
  try {
    const v = typeof raw === "string" && raw ? JSON.parse(raw) : {};
    return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Obj) : {};
  } catch {
    return {};
  }
}

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

const ON_SUFFIX = "__on";

const key_of = (it: CopyItem) => `${it.page}::${it.field.path}`;

function to_row(fields: CopyField[], item: unknown): Row {
  const row: Row = {};
  for (const sf of fields) {
    const v = sf.type === "lines" ? lines_text(get_path(item, sf.path)) : as_text(get_path(item, sf.path));
    row[sf.path] = v;
    if (sf.type === "photo") row[sf.path + ON_SUFFIX] = v ? "1" : "";
  }
  return row;
}

function to_val(f: CopyField, raw: unknown): Val {
  const fields = row_fields(f);
  if (f.type === "list" || f.type === "links") {
    const arr = Array.isArray(raw) ? raw : [];
    return fields ? arr.map((it) => to_row(fields, it)) : arr.map(as_text);
  }
  return f.type === "lines" ? lines_text(raw) : as_text(raw);
}

function split_lines(v: string): string[] {
  return v.split(/\r?\n|\|/).map((l) => l.trim()).filter(Boolean);
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
        if (sf.type === "photo") {
          o[sf.path] = row[sf.path + ON_SUFFIX] ? t : "";
        } else if (sf.type === "lines") {
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

function photo_missing(items: CopyItem[], vals: Record<string, Val>): string {
  for (const it of items) {
    const sub = row_fields(it.field)?.filter((sf) => sf.type === "photo") ?? [];
    if (!sub.length) continue;
    const rows = (vals[key_of(it)] as Row[] | undefined) ?? [];
    for (let i = 0; i < rows.length; i++) {
      for (const sf of sub) {
        if (rows[i][sf.path + ON_SUFFIX] && !(rows[i][sf.path] ?? "").trim()) {
          const who = (rows[i].name ?? "").trim() || `row ${i + 1}`;
          return `${it.field.label}: upload a photo for ${who} or turn the photo off.`;
        }
      }
    }
  }
  return "";
}

function RowActions({ label, index, count, onUp, onDown, onRemove }: { label: string; index: number; count: number; onUp: () => void; onDown: () => void; onRemove: () => void }) {
  return (
    <div className="copy-row__actions" role="group" aria-label={`${label} ${index + 1} actions`}>
      <IconBtn icon="up" label={`Move ${label} ${index + 1} up`} disabled={index === 0} onClick={onUp} />
      <IconBtn icon="down" label={`Move ${label} ${index + 1} down`} disabled={index === count - 1} onClick={onDown} />
      <IconBtn icon="trash" danger label={`Remove ${label} ${index + 1}`} onClick={onRemove} />
    </div>
  );
}

const swap = <T,>(arr: T[], i: number, j: number): T[] => {
  if (j < 0 || j >= arr.length) return arr;
  const next = arr.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

function TextControl({
  id, label, value, placeholder, max, trailing, onChange,
}: {
  id: string; label: string; value: string; placeholder: string; max?: number; trailing?: React.ReactNode; onChange: (v: string) => void;
}) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="admin-field-row">
        <input type="text" id={id} maxLength={max ?? 400} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        {trailing}
      </div>
    </div>
  );
}

type Props = {
  items: CopyItem[];
  toast: PanelProps["toast"];
  title?: string;
  sub?: string;
  saved_label: string;
  save_label?: string;
};

export default function CopyEditor({ items, toast, title, sub, saved_label, save_label = "Save" }: Props) {
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
        const stored: Partial<Record<PageKey, Obj>> = {};
        for (const it of items) {
          if (!stored[it.page]) stored[it.page] = parse_stored(s[COPY_SETTING_KEY[it.page]]);
        }
        setVals(Object.fromEntries(items.map((it) => [key_of(it), to_val(it.field, get_path(stored[it.page], it.field.path))])));
      })
      .catch((e) => {
        if (live) setError(msg(e, "Failed to load saved text."));
      });
    return () => {
      live = false;
    };
  }, [items, attempt]);

  const set = (it: CopyItem, v: Val) => setVals((cur) => (cur ? { ...cur, [key_of(it)]: v } : cur));
  const id_of = (it: CopyItem, extra = "") => `copy-${it.page}-${it.field.path.replace(/\./g, "-")}${extra}`;
  const placeholder_of = (it: CopyItem) => (it.field.type === "lines" ? lines_text(get_path(DEFAULTS[it.page], it.field.path)) : as_text(get_path(DEFAULTS[it.page], it.field.path)));

  const save = async () => {
    if (!vals) return;
    const missing = photo_missing(items, vals);
    if (missing) {
      toast(missing, true);
      return;
    }
    setSaving(true);
    try {
      const latest = await db.dbLoadSiteSettings();
      const pages = Array.from(new Set(items.map((it) => it.page)));
      for (const page of pages) {
        const out = parse_stored(latest[COPY_SETTING_KEY[page]]);
        for (const it of items.filter((x) => x.page === page)) {
          const sample = (get_path(DEFAULTS[page], it.field.path) as unknown[] | undefined)?.[0];
          const v = from_val(it.field, vals[key_of(it)], sample);
          if (v !== undefined) set_path(out, it.field.path, v);
          else unset_path(out, it.field.path);
        }
        await db.dbSaveSetting(COPY_SETTING_KEY[page], Object.keys(out).length ? JSON.stringify(out) : "");
      }
      toast(`${saved_label} saved.`);
    } catch (e) {
      toast(msg(e, "Save failed."), true);
    } finally {
      setSaving(false);
    }
  };

  const render_list = (it: CopyItem, rows: Val) => {
    const f = it.field;
    const fields_of = row_fields(f);
    const default_arr = (get_path(DEFAULTS[it.page], f.path) as unknown[] | undefined) ?? [];
    const label = f.label;
    const title_id = `${id_of(it)}-title`;
    const reset_btn = (
      <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" aria-label={`Reset ${label} to default`} onClick={() => set(it, [])}>
        Reset
      </button>
    );
    const list_actions = (blank: Val[number], load: Val) => (
      <div className="admin-actions copy-list__actions">
        <button type="button" className="admin-btn admin-btn--sm" onClick={() => set(it, [...(rows as Val[number][]), blank] as Val)}>Add row</button>
        {default_arr.length > 0 && <button type="button" className="admin-btn admin-btn--sm" onClick={() => set(it, load)}>Load defaults</button>}
        {reset_btn}
      </div>
    );
    const list_title = (n: number, actions: React.ReactNode) => (
      <div className="copy-list__head">
        <span className="copy-list__title" id={title_id}>{label}</span>
        <span className="copy-list__side">
          <span className={`copy-list__badge${n === 0 ? "" : " copy-list__badge--custom"}`}>{n === 0 ? "Using default" : `Custom, ${n} ${n === 1 ? "row" : "rows"}`}</span>
          {actions}
        </span>
      </div>
    );
    if (!fields_of) {
      const list = rows as string[];
      return (
        <fieldset className="copy-list" key={key_of(it)} aria-labelledby={title_id}>
          {list_title(list.length, list_actions("", default_arr.map(as_text)))}
          {list.length === 0 && <p className="copy-empty">Nothing saved yet. The site shows the default list. Add a row or load the defaults to edit it.</p>}
          {list.map((item, i) => (
            <div className="copy-row copy-row--plain" key={i}>
              <span className="copy-row__index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <input
                type="text"
                aria-label={`${label} ${i + 1}`}
                maxLength={f.max ?? 400}
                value={item}
                placeholder={as_text(default_arr[i])}
                onChange={(e) => set(it, list.map((x, j) => (j === i ? e.target.value : x)))}
              />
              <RowActions label={label} index={i} count={list.length} onUp={() => set(it, swap(list, i, i - 1))} onDown={() => set(it, swap(list, i, i + 1))} onRemove={() => set(it, list.filter((_, j) => j !== i))} />
            </div>
          ))}
        </fieldset>
      );
    }
    const list = rows as Row[];
    return (
      <fieldset className="copy-list" key={key_of(it)} aria-labelledby={title_id}>
        {list_title(list.length, list_actions(to_row(fields_of, {}), default_arr.map((x) => to_row(fields_of, x))))}
        {list.length === 0 && <p className="copy-empty">Nothing saved yet. The site shows the default list. Add a row or load the defaults to edit it.</p>}
        {list.map((row, i) => (
          <div className="copy-row" key={i}>
            <span className="copy-row__index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <div className="copy-row__fields">
            {fields_of.map((sf) => sf.type === "photo" ? (
              <div className="copy-photo" key={sf.path}>
                <div className="form-group">
                  <Checkbox
                    id={id_of(it, `-${i}-${sf.path}-on`)}
                    label={`${sf.label} (${i + 1})`}
                    checked={!!row[sf.path + ON_SUFFIX]}
                    onChange={(on) => set(it, list.map((r, j) => (j === i ? { ...r, [sf.path + ON_SUFFIX]: on ? "1" : "" } : r)))}
                  />
                </div>
                {row[sf.path + ON_SUFFIX] && (
                  <MediaField
                    label={`Photo (${i + 1}). Required while the photo is on`}
                    accept="image/*"
                    folder={`copy/${it.page}/team`}
                    value={row[sf.path] ?? ""}
                    placeholder="https://"
                    toast={toast}
                    onChange={(url) => set(it, list.map((r, j) => (j === i ? { ...r, [sf.path]: url } : r)))}
                  />
                )}
              </div>
            ) : (
              <TextControl
                key={sf.path}
                id={id_of(it, `-${i}-${sf.path}`)}
                label={`${sf.label} (${i + 1})`}
                max={sf.max}
                value={row[sf.path] ?? ""}
                placeholder={sf.type === "lines" ? lines_text(get_path(default_arr[i], sf.path)) : as_text(get_path(default_arr[i], sf.path))}
                onChange={(v) => set(it, list.map((r, j) => (j === i ? { ...r, [sf.path]: v } : r)))}
              />
            ))}
            </div>
            <RowActions label={`${label} row`} index={i} count={list.length} onUp={() => set(it, swap(list, i, i - 1))} onDown={() => set(it, swap(list, i, i + 1))} onRemove={() => set(it, list.filter((_, j) => j !== i))} />
          </div>
        ))}
      </fieldset>
    );
  };

  const render_item = (it: CopyItem) => {
    const f = it.field;
    const v = vals?.[key_of(it)];
    if (v === undefined) return null;
    if (f.type === "list" || f.type === "links") return render_list(it, v);
    const text = v as string;
    const reset = (
      <button type="button" className="admin-btn admin-btn--danger" aria-label={`Reset ${f.label} to default`} disabled={!text} onClick={() => set(it, "")}>
        Reset
      </button>
    );
    if (f.type === "select") {
      const default_label = `Default (${placeholder_of(it)})`;
      return (
        <div className="copy-field" key={key_of(it)}>
          <SelectModal
            variant="admin"
            id={id_of(it)}
            name={f.path}
            label={f.label}
            placeholder={default_label}
            close_label={`Close ${f.label}`}
            options={[default_label, ...(f.options ?? [])]}
            value={text || default_label}
            trailing={reset}
            on_change={(o) => set(it, o === default_label ? "" : o)}
          />
        </div>
      );
    }
    if (f.type === "image" || f.type === "media") {
      return (
        <div className="copy-field" key={key_of(it)}>
          <MediaField
            label={f.label}
            accept={f.type === "media" ? "video/*,image/*,.html,.htm" : "image/*"}
            folder={`copy/${it.page}`}
            value={text}
            placeholder={placeholder_of(it) || "https://"}
            toast={toast}
            trailing={reset}
            onChange={(url) => set(it, url)}
          />
        </div>
      );
    }
    return (
      <div className="copy-field" key={key_of(it)}>
        <TextControl
          id={id_of(it)}
          label={f.label}
          max={f.max}
          value={text}
          placeholder={placeholder_of(it)}
          trailing={reset}
          onChange={(x) => set(it, x)}
        />
      </div>
    );
  };

  const groups: { title?: string; items: CopyItem[] }[] = [];
  for (const it of items) {
    const last = groups[groups.length - 1];
    if (last && last.title === it.section) last.items.push(it);
    else groups.push({ title: it.section, items: [it] });
  }

  return (
    <div className="copy-editor" id={`copy-editor-${items[0]?.page ?? "empty"}`}>
      {title && <PanelHead title={title} sub={sub ?? ""} error={error} />}
      {error && (
        <div className="admin-actions">
          {!title && <p className="panel-error" role="alert" style={{ display: "block" }}>{error}</p>}
          <button type="button" className="admin-btn" onClick={() => setAttempt((n) => n + 1)}>Retry</button>
        </div>
      )}
      {!vals && !error && <p className="admin-empty" role="status">Loading…</p>}
      {vals && items.length === 0 && <p className="copy-empty">No editable text on this page yet.</p>}
      {vals && groups.map((g, i) => (
        <section className="copy-section" key={g.title ?? i} aria-label={g.title}>
          {g.title && !(g.items.length === 1 && (g.items[0].field.type === "list" || g.items[0].field.type === "links")) && <h3 className="copy-section__title">{g.title}</h3>}
          {g.items.map(render_item)}
        </section>
      ))}
      {vals && items.length > 0 && (
        <div className="copy-save">
          <button type="button" className="admin-btn admin-btn--accent" onClick={save} disabled={saving} aria-busy={saving}>
            {saving ? "Saving…" : save_label}
          </button>
        </div>
      )}
    </div>
  );
}
