"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as db from "@/lib/db";
import type { SiteSettings } from "@/lib/types";
import { MEDIA_BUCKET, PanelHead, msg, type PanelProps } from "./shared";

type Keyed = { k: number };
type TeamRow = Keyed & { name: string; role: string; bio: string; photo: string };
type StatRow = Keyed & { n: string; label: string; desc: string };
type TitledRow = Keyed & { title: string; desc: string };

type Fields = {
  studio_name: string;
  founded_year: string;
  contact_email: string;
  response_time: string;
  tagline: string;
  cta_text: string;
  about_story: string;
};

const EMPTY_FIELDS: Fields = {
  studio_name: "",
  founded_year: "",
  contact_email: "",
  response_time: "",
  tagline: "",
  cta_text: "",
  about_story: "",
};

let seq = 0;
const nextKey = () => ++seq;

const text = (v: unknown) => (typeof v === "string" ? v : "");
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function parseRows(raw: string | undefined): Record<string, unknown>[] {
  if (!raw || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isRecord) : [];
  } catch {
    return [];
  }
}

const toTeam = (r: Record<string, unknown>): TeamRow => ({ k: nextKey(), name: text(r.name), role: text(r.role), bio: text(r.bio), photo: text(r.photo) });
const toStat = (r: Record<string, unknown>): StatRow => ({
  k: nextKey(),
  n: typeof r.n === "number" ? String(r.n) : text(r.n),
  label: text(r.label),
  desc: text(r.desc),
});
const toTitled = (r: Record<string, unknown>): TitledRow => ({ k: nextKey(), title: text(r.title), desc: text(r.desc) });

const blankTeam = (): TeamRow => ({ k: nextKey(), name: "", role: "", bio: "", photo: "" });
const blankStat = (): StatRow => ({ k: nextKey(), n: "", label: "", desc: "" });
const blankTitled = (): TitledRow => ({ k: nextKey(), title: "", desc: "" });

const normalizeStory = (s: string) =>
  s
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .join("\n\n");

type Cleaned = {
  fields: Fields;
  team: TeamRow[];
  stats: StatRow[];
  values: TitledRow[];
  steps: TitledRow[];
};

function validate(f: Fields, team: TeamRow[], stats: StatRow[], values: TitledRow[], steps: TitledRow[]): { error: string } | { data: Cleaned } {
  const fields: Fields = {
    studio_name: f.studio_name.trim(),
    founded_year: f.founded_year.trim(),
    contact_email: f.contact_email.trim(),
    response_time: f.response_time.trim(),
    tagline: f.tagline.trim(),
    cta_text: f.cta_text.trim(),
    about_story: normalizeStory(f.about_story),
  };

  if (fields.founded_year) {
    const year = Number(fields.founded_year);
    if (!/^\d{4}$/.test(fields.founded_year) || year > new Date().getFullYear()) return { error: "Founded year must be a four digit year that is not in the future." };
  }
  if (fields.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.contact_email)) return { error: "Contact email is not a valid address." };

  const cleanTeam: TeamRow[] = [];
  for (let i = 0; i < team.length; i++) {
    const r = team[i];
    const row = { ...r, name: r.name.trim(), role: r.role.trim(), bio: r.bio.trim(), photo: r.photo.trim() };
    if (!row.name && !row.role && !row.bio && !row.photo) continue;
    if (!row.name) return { error: `Team member ${i + 1}: name is required.` };
    cleanTeam.push(row);
  }

  const cleanStats: StatRow[] = [];
  for (let i = 0; i < stats.length; i++) {
    const r = stats[i];
    const row = { ...r, n: r.n.trim(), label: r.label.trim(), desc: r.desc.trim() };
    if (!row.n && !row.label && !row.desc) continue;
    if (!row.label) return { error: `Stat ${i + 1}: label is required.` };
    if (!row.n || !Number.isFinite(Number(row.n))) return { error: `Stat ${i + 1}: number must be a valid number.` };
    cleanStats.push(row);
  }

  const cleanTitled = (rows: TitledRow[], label: string): TitledRow[] | string => {
    const out: TitledRow[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = { ...rows[i], title: rows[i].title.trim(), desc: rows[i].desc.trim() };
      if (!row.title && !row.desc) continue;
      if (!row.title) return `${label} ${i + 1}: title is required.`;
      out.push(row);
    }
    return out;
  };

  const cleanValues = cleanTitled(values, "Value");
  if (typeof cleanValues === "string") return { error: cleanValues };
  const cleanProcess = cleanTitled(steps, "Process step");
  if (typeof cleanProcess === "string") return { error: cleanProcess };

  return { data: { fields, team: cleanTeam, stats: cleanStats, values: cleanValues, steps: cleanProcess } };
}

function ListEditor<T extends Keyed>({
  title,
  rowLabel,
  addLabel,
  items,
  setItems,
  blank,
  render,
}: {
  title: string;
  rowLabel: string;
  addLabel: string;
  items: T[];
  setItems: (next: T[]) => void;
  blank: () => T;
  render: (item: T, patch: (p: Partial<T>) => void) => ReactNode;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };

  return (
    <div className="settings-section">
      <p className="settings-section-title">{title}</p>
      {items.length === 0 && <p className="list-editor__empty">Nothing added yet.</p>}
      {items.map((item, i) => (
        <div key={item.k} className="list-row" role="group" aria-label={`${rowLabel} ${i + 1}`}>
          <div className="list-row__head">
            <span className="list-row__index">{rowLabel} {i + 1}</span>
            <div className="admin-actions">
              <button type="button" className="admin-btn admin-btn--sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${rowLabel} ${i + 1} up`}>Up</button>
              <button type="button" className="admin-btn admin-btn--sm" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${rowLabel} ${i + 1} down`}>Down</button>
              <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => setItems(items.filter((x) => x.k !== item.k))} aria-label={`Remove ${rowLabel} ${i + 1}`}>Remove</button>
            </div>
          </div>
          <div className="admin-form-grid">
            {render(item, (p) => setItems(items.map((x) => (x.k === item.k ? { ...x, ...p } : x))))}
          </div>
        </div>
      ))}
      <button type="button" className="admin-btn admin-btn--accent" onClick={() => setItems([...items, blank()])}>{addLabel}</button>
    </div>
  );
}

function Field({ id, label, full, children }: { id: string; label: string; full?: boolean; children: ReactNode }) {
  return (
    <div className={`form-group${full ? " admin-form-full" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

export default function IdentityPanel({ toast }: Pick<PanelProps, "toast">) {
  const [f, setF] = useState<Fields>(EMPTY_FIELDS);
  const [team, setTeam] = useState<TeamRow[]>([]);
  const [stats, setStats] = useState<StatRow[]>([]);
  const [values, setValues] = useState<TitledRow[]>([]);
  const [steps, setProcess] = useState<TitledRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState<number | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    db.dbLoadSiteSettings()
      .then((r: SiteSettings) => {
        if (!alive.current) return;
        setF({
          studio_name: r.studio_name ?? "",
          founded_year: r.founded_year ?? "",
          contact_email: r.contact_email ?? "",
          response_time: r.response_time ?? "",
          tagline: r.tagline ?? "",
          cta_text: r.cta_text ?? "",
          about_story: r.about_story ?? "",
        });
        setTeam(parseRows(r.team).map(toTeam));
        setStats(parseRows(r.about_stats).map(toStat));
        setValues(parseRows(r.about_values).map(toTitled));
        setProcess(parseRows(r.process_steps).map(toTitled));
        setLoaded(true);
      })
      .catch(() => alive.current && setError("Failed to load identity settings."));
    return () => {
      alive.current = false;
    };
  }, []);

  const save = async () => {
    if (saving || !loaded) return;
    const result = validate(f, team, stats, values, steps);
    if ("error" in result) return toast(result.error, true);
    const { fields, team: t, stats: s, values: v, steps: p } = result.data;
    setSaving(true);
    const entries: [string, string][] = [
      ...(Object.entries(fields) as [string, string][]),
      ["team", JSON.stringify(t.map(({ name, role, bio, photo }) => ({ name, role, bio, photo: photo || null })))],
      ["about_stats", JSON.stringify(s.map(({ n, label, desc }) => ({ n: Number(n), label, desc })))],
      ["about_values", JSON.stringify(v.map(({ title, desc }) => ({ title, desc })))],
      ["process_steps", JSON.stringify(p.map(({ title, desc }) => ({ title, desc })))],
    ];
    try {
      await Promise.all(entries.map(([k, val]) => db.dbSaveSetting(k, val)));
      setF(fields);
      setTeam(t);
      setStats(s);
      setValues(v);
      setProcess(p);
      toast("Identity saved.");
    } catch (e) {
      toast(msg(e, "Failed to save some settings."), true);
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (k: number, file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast("Choose an image file.", true);
    const ext = (file.name.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `team/${Date.now()}-${k}.${ext}`;
    setPhotoBusy(k);
    try {
      await db.dbUpload(MEDIA_BUCKET, path, file);
      const url = db.dbPublicUrl(MEDIA_BUCKET, path);
      setTeam((rows) => rows.map((r) => (r.k === k ? { ...r, photo: url } : r)));
      toast("Photo uploaded. Save to keep it.");
    } catch (e) {
      toast(msg(e, "Photo upload failed."), true);
    } finally {
      setPhotoBusy(null);
    }
  };

  const input = (key: keyof Fields, label: string, id: string, ph: string, type = "text") => (
    <Field id={id} label={label}>
      <input type={type} id={id} placeholder={ph} value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })} />
    </Field>
  );

  return (
    <div className="admin-panel" id="panel-identity" style={{ display: "block" }}>
      <PanelHead title="IDENTITY" sub="Studio details, story, team and process. Changes reflect live." error={error} />

      <div className="settings-section">
        <p className="settings-section-title">Studio</p>
        <div className="settings-grid">
          {input("studio_name", "Studio Name", "id-studio-name", "Studio name")}
          {input("founded_year", "Founded Year", "id-founded-year", "yyyy")}
          {input("contact_email", "Contact Email", "id-contact-email", "name@domain", "email")}
          {input("response_time", "Response Time", "id-response-time", "Response time")}
          {input("tagline", "Tagline", "id-tagline", "Tagline")}
          {input("cta_text", "Call To Action Text", "id-cta-text", "Button text")}
        </div>
      </div>

      <div className="settings-section">
        <p className="settings-section-title">Story</p>
        <div className="form-group">
          <label htmlFor="id-story">About Story (blank line between paragraphs)</label>
          <textarea id="id-story" rows={8} value={f.about_story} onChange={(e) => setF({ ...f, about_story: e.target.value })} />
        </div>
      </div>

      <ListEditor
        title="Team"
        rowLabel="Member"
        addLabel="+ Add Member"
        items={team}
        setItems={setTeam}
        blank={blankTeam}
        render={(item, patch) => (
          <>
            <Field id={`tm-name-${item.k}`} label="Name">
              <input type="text" id={`tm-name-${item.k}`} value={item.name} onChange={(e) => patch({ name: e.target.value })} />
            </Field>
            <Field id={`tm-role-${item.k}`} label="Role">
              <input type="text" id={`tm-role-${item.k}`} value={item.role} onChange={(e) => patch({ role: e.target.value })} />
            </Field>
            <Field id={`tm-bio-${item.k}`} label="Bio" full>
              <textarea id={`tm-bio-${item.k}`} value={item.bio} onChange={(e) => patch({ bio: e.target.value })} />
            </Field>
            <Field id={`tm-photo-${item.k}`} label="Photo" full>
              <div className="form-group-actions">
                {item.photo && <img className="list-row__photo" src={item.photo} alt="" />}
                <input type="file" id={`tm-photo-${item.k}`} accept="image/*" disabled={photoBusy === item.k} onChange={(e) => { const fl = e.target.files?.[0]; e.target.value = ""; uploadPhoto(item.k, fl); }} />
                {photoBusy === item.k && <span className="field-status status--off" aria-live="polite">Uploading…</span>}
                {item.photo && photoBusy !== item.k && (
                  <button type="button" className="admin-btn admin-btn--sm" onClick={() => patch({ photo: "" })}>Remove Photo</button>
                )}
              </div>
            </Field>
          </>
        )}
      />

      <ListEditor
        title="Stats"
        rowLabel="Stat"
        addLabel="+ Add Stat"
        items={stats}
        setItems={setStats}
        blank={blankStat}
        render={(item, patch) => (
          <>
            <Field id={`st-n-${item.k}`} label="Number">
              <input type="number" id={`st-n-${item.k}`} value={item.n} onChange={(e) => patch({ n: e.target.value })} />
            </Field>
            <Field id={`st-label-${item.k}`} label="Label">
              <input type="text" id={`st-label-${item.k}`} value={item.label} onChange={(e) => patch({ label: e.target.value })} />
            </Field>
            <Field id={`st-desc-${item.k}`} label="Description" full>
              <input type="text" id={`st-desc-${item.k}`} value={item.desc} onChange={(e) => patch({ desc: e.target.value })} />
            </Field>
          </>
        )}
      />

      <ListEditor
        title="Values"
        rowLabel="Value"
        addLabel="+ Add Value"
        items={values}
        setItems={setValues}
        blank={blankTitled}
        render={(item, patch) => (
          <>
            <Field id={`va-title-${item.k}`} label="Title" full>
              <input type="text" id={`va-title-${item.k}`} value={item.title} onChange={(e) => patch({ title: e.target.value })} />
            </Field>
            <Field id={`va-desc-${item.k}`} label="Description" full>
              <textarea id={`va-desc-${item.k}`} value={item.desc} onChange={(e) => patch({ desc: e.target.value })} />
            </Field>
          </>
        )}
      />

      <ListEditor
        title="Process"
        rowLabel="Step"
        addLabel="+ Add Step"
        items={steps}
        setItems={setProcess}
        blank={blankTitled}
        render={(item, patch) => (
          <>
            <Field id={`pr-title-${item.k}`} label="Title" full>
              <input type="text" id={`pr-title-${item.k}`} value={item.title} onChange={(e) => patch({ title: e.target.value })} />
            </Field>
            <Field id={`pr-desc-${item.k}`} label="Description" full>
              <textarea id={`pr-desc-${item.k}`} value={item.desc} onChange={(e) => patch({ desc: e.target.value })} />
            </Field>
          </>
        )}
      />

      <div className="admin-actions">
        <button type="button" className="admin-btn admin-btn--accent" onClick={save} disabled={saving || !loaded} aria-label="Save identity">
          {saving ? "Saving…" : "Save Identity"}
        </button>
      </div>
    </div>
  );
}
