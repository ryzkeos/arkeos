"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import * as sb from "@/lib/supabase";
import type { Inquiry, Project, Service, SiteSettings } from "@/lib/types";

type Section = "inquiries" | "projects" | "services" | "availability" | "settings" | "fonts" | "analytics";

const VIDEO_EXT = ["mp4", "webm", "mov", "ogg"];
function mediaBadge(media: string | null) {
  if (!media) return { label: "Black", cls: "black" };
  const ext = media.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXT.includes(ext) ? { label: "Video", cls: "video" } : { label: "Image", cls: "image" };
}
const splitTags = (s: string) => s.split(",").map((t) => t.trim()).filter(Boolean);
const msg = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);

export default function AdminApp() {
  const [authed, setAuthed] = useState(false);
  const [booted, setBooted] = useState(false);
  const [section, setSection] = useState<Section>("inquiries");
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<{ text: string; err: boolean } | null>(null);
  const [confirmState, setConfirmState] = useState<{ text: string; onYes: () => void } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setAuthed(!!sb.sbRestoreSession()?.access_token);
    setBooted(true);
  }, []);

  const showToast = useCallback((text: string, err = false) => {
    setToast({ text, err });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const ask = useCallback((text: string, onYes: () => void) => setConfirmState({ text, onYes }), []);

  const logout = async () => {
    await sb.sbSignOut();
    setAuthed(false);
  };

  if (!booted) return null;

  return (
    <>
      <div
        className={`admin-toast${toast?.err ? " admin-toast--err" : ""}`}
        id="admin-toast"
        role="status"
        aria-live="polite"
        style={{ opacity: toast ? 1 : 0 }}
      >
        {toast?.text}
      </div>

      {confirmState && (
        <div className="admin-confirm" role="alertdialog" aria-modal="true" aria-label="Confirm action">
          <div className="admin-confirm__box">
            <p>{confirmState.text}</p>
            <div className="admin-actions">
              <button className="admin-btn admin-btn--danger" autoFocus onClick={() => { const f = confirmState.onYes; setConfirmState(null); f(); }}>Confirm</button>
              <button className="admin-btn" onClick={() => setConfirmState(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {!authed ? (
        <Login onDone={() => { setAuthed(true); setSection("inquiries"); }} />
      ) : (
        <div id="app-shell" style={{ display: "flex" }}>
          <aside className="admin-sidebar" role="navigation" aria-label="Admin navigation">
            <div className="sidebar-logo">ARKEOS</div>

            <div className="sidebar-label">Content</div>
            <nav className="sidebar-nav">
              <button className={section === "inquiries" ? "active" : ""} onClick={() => setSection("inquiries")}>
                Inquiries
                <span className="sidebar-badge" id="inquiries-badge" aria-label="Unread count" style={{ display: unread > 0 ? "inline-flex" : "none" }}>
                  {unread > 0 ? unread : ""}
                </span>
              </button>
              <button className={section === "projects" ? "active" : ""} onClick={() => setSection("projects")}>Projects</button>
              <button className={section === "services" ? "active" : ""} onClick={() => setSection("services")}>Services</button>
            </nav>

            <div className="sidebar-label">Studio</div>
            <nav className="sidebar-nav">
              <button className={section === "availability" ? "active" : ""} onClick={() => setSection("availability")}>Availability</button>
              <button className={section === "settings" ? "active" : ""} onClick={() => setSection("settings")}>Site Settings</button>
              <button className={section === "fonts" ? "active" : ""} onClick={() => setSection("fonts")}>Font Settings</button>
              <button className={section === "analytics" ? "active" : ""} onClick={() => setSection("analytics")}>Analytics</button>
            </nav>

            <div className="sidebar-footer">
              <button id="logout-btn" aria-label="Log out of admin panel" onClick={logout}>Log Out</button>
            </div>
          </aside>

          <main className="admin-main" role="main">
            {section === "inquiries" && <Inquiries toast={showToast} ask={ask} onUnread={setUnread} />}
            {section === "projects" && <Projects toast={showToast} ask={ask} />}
            {section === "services" && <Services toast={showToast} ask={ask} />}
            {section === "availability" && <Availability toast={showToast} />}
            {section === "settings" && <Settings toast={showToast} ask={ask} />}
            {section === "fonts" && <Fonts toast={showToast} />}
            {section === "analytics" && <Analytics />}
          </main>
        </div>
      )}
    </>
  );
}

type PanelProps = { toast: (t: string, err?: boolean) => void; ask: (t: string, f: () => void) => void };

/* ── login ───────────────────────────────────────────────────── */
function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setErr(""); setBusy(true);
    try {
      const data = await sb.sbSignIn(email.trim(), pass);
      if (data.error || !data.access_token) {
        setErr(data.error_description || data.message || "Invalid credentials.");
      } else {
        sb.sbSetSession(data);
        onDone();
      }
    } catch {
      setErr("Network error. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div id="login-screen" aria-label="Admin login">
      <div className="login-logo" aria-label="Arkeos">ARKEOS</div>
      <p className="login-sub">Control Center</p>
      <form className="login-card" aria-label="Admin login form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <div className="login-field">
          <label htmlFor="login-email">Email Address</label>
          <input type="email" id="login-email" placeholder="admin@arkeos.studio" autoComplete="username" aria-required="true" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="login-field">
          <label htmlFor="login-pass">Password</label>
          <input type="password" id="login-pass" placeholder="••••••••••••" autoComplete="current-password" aria-required="true" value={pass} onChange={(e) => setPass(e.target.value)} />
        </div>
        <p className="login-error" id="login-error" role="alert" aria-live="polite" style={{ display: err ? "block" : "none" }}>{err}</p>
        <button type="submit" className="login-btn" id="login-form-btn" aria-label="Login to Arkeos admin" aria-disabled={busy || undefined}>
          {busy ? "Authenticating…" : "Enter"}
        </button>
      </form>
    </div>
  );
}

function PanelHead({ title, sub, error }: { title: string; sub: string; error?: string }) {
  return (
    <>
      <h1 className="panel-title">{title}</h1>
      <p className="panel-sub">{sub}</p>
      <p className="panel-error" role="alert" style={{ display: error ? "block" : "none" }}>{error}</p>
    </>
  );
}

/* ── inquiries ───────────────────────────────────────────────── */
function Inquiries({ toast, ask, onUnread }: PanelProps & { onUnread: (n: number) => void }) {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [items, setItems] = useState<Inquiry[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    sb.sbGetInquiries(filter)
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setItems(list);
        setError("");
        sb.sbGet<{ id: string }[]>("inquiries", "select=id&status=eq.unread").then((u) => onUnread(Array.isArray(u) ? u.length : 0)).catch(() => {});
      })
      .catch(() => setError("Failed to load inquiries."));
  }, [filter, onUnread]);

  useEffect(load, [load]);

  const mark = (id: string) => sb.sbMarkInquiry(id, "read").then(load).catch(() => toast("Failed to update.", true));
  const del = (id: string) =>
    ask("Delete this inquiry? This cannot be undone.", () => sb.sbDeleteInquiry(id).then(load).catch(() => toast("Failed to delete.", true)));

  return (
    <div className="admin-panel" id="panel-inquiries" style={{ display: "block" }}>
      <PanelHead title="INQUIRIES" sub="All client inquiries submitted via the contact form." error={error} />
      <div className="admin-filters" role="group" aria-label="Filter inquiries">
        {(["all", "unread", "read"] as const).map((f) => (
          <button key={f} className={`filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)} aria-label={`Show ${f} inquiries`}>
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table" aria-label="Inquiries table">
          <thead>
            <tr>{["Name", "Email", "Type", "Budget", "Timeline", "Date", "Status", "Actions"].map((h) => <th key={h} scope="col">{h}</th>)}</tr>
          </thead>
          <tbody>
            {items === null ? (
              <tr><td colSpan={8} className="admin-empty">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="admin-empty">No inquiries found.</td></tr>
            ) : (
              items.map((i) => (
                <tr key={i.id} className={i.status === "unread" ? "row-unread" : ""}>
                  <td>{i.name || "—"}</td>
                  <td>{i.email || "—"}</td>
                  <td>{i.project_type || "—"}</td>
                  <td>{i.budget || "—"}</td>
                  <td>{i.timeline || "—"}</td>
                  <td>{i.created_at ? new Date(i.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}</td>
                  <td><span className={`status-badge status-${i.status || "unread"}`}>{i.status || "unread"}</span></td>
                  <td className="admin-actions">
                    <button className="admin-btn admin-btn--sm" onClick={() => mark(i.id)} aria-label="Mark as read">Read</button>
                    <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => del(i.id)} aria-label="Delete inquiry">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── projects ────────────────────────────────────────────────── */
function Projects({ toast, ask }: PanelProps) {
  const [list, setList] = useState<Project[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<{ id: string | null } | null>(null);
  const [f, setF] = useState({ title: "", description: "", tags: "", color: "#C8FF00", visible: true });
  const [mediaStatus, setMediaStatus] = useState("No media — pure black active");
  const file = useRef<HTMLInputElement>(null);
  const dragSrc = useRef<number | null>(null);

  const load = useCallback(() => {
    sb.sbGetProjects().then((d) => { setList(Array.isArray(d) ? d : []); setError(""); }).catch(() => setError("Failed to load projects."));
  }, []);
  useEffect(load, [load]);

  const open = (idx: number | null) => {
    const p = idx === null ? null : list![idx];
    setEditing({ id: p?.id ?? null });
    setF({ title: p?.title ?? "", description: p?.description ?? "", tags: (p?.tags ?? []).join(", "), color: p?.color || "#C8FF00", visible: p ? p.visible !== false : true });
    setMediaStatus(p ? mediaBadge(p.media).label : "No media — pure black active");
  };

  const save = async () => {
    if (!f.title.trim()) return toast("Title is required.", true);
    const payload: Partial<Project> = { title: f.title.trim(), description: f.description.trim(), tags: splitTags(f.tags), color: f.color, visible: f.visible };
    if (!editing?.id) { payload.sort_order = list?.length ?? 0; payload.media = null; }
    try {
      await sb.sbSaveProject(editing?.id ?? null, payload);
      setEditing(null); load(); toast("Project saved.");
    } catch (e) { toast(msg(e, "Failed to save project."), true); }
  };

  const del = (id: string) =>
    ask("Delete this project? This cannot be undone.", () =>
      sb.sbDeleteProject(id).then(() => { load(); toast("Project deleted."); }).catch(() => toast("Failed to delete.", true)));

  const toggle = (p: Project) =>
    sb.sbSaveProject(p.id!, { visible: !(p.visible !== false) }).then(load).catch(() => toast("Failed to update.", true));

  const upload = async () => {
    if (!editing?.id) return toast("Save the project first, then upload media.", true);
    const fl = file.current?.files?.[0];
    if (!fl) return;
    const path = `projects/${editing.id}.${fl.name.split(".").pop()}`;
    setMediaStatus("Uploading…");
    try {
      await sb.sbUpload("media", path, fl);
      const url = sb.sbPublicUrl("media", path);
      await sb.sbSaveProject(editing.id, { media: url });
      setMediaStatus(`${mediaBadge(url).label} — uploaded`);
      toast("Media uploaded."); load();
    } catch (e) { setMediaStatus("Upload failed."); toast(msg(e, "Upload failed."), true); }
  };

  const drop = (target: number) => {
    const src = dragSrc.current;
    dragSrc.current = null;
    if (src === null || src === target || !list) return;
    const next = list.slice();
    next.splice(target, 0, next.splice(src, 1)[0]);
    setList(next);
    Promise.all(next.map((p, i) => sb.sbSaveProject(p.id!, { sort_order: i }))).then(load).catch(() => { toast("Failed to reorder.", true); load(); });
  };

  return (
    <div className="admin-panel" id="panel-projects" style={{ display: "block" }}>
      <PanelHead title="PROJECTS" sub="Manage portfolio projects. Drag to reorder. Changes reflect live." error={error} />
      <div className="admin-actions" style={{ marginBottom: "1.2rem" }}>
        <button className="admin-btn admin-btn--accent" onClick={() => open(null)} aria-label="Add a new project">+ Add Project</button>
      </div>

      <div className="admin-form" id="project-form" aria-label="Project editor" style={{ display: editing ? "block" : "none" }}>
        <p className="form-title">{editing?.id ? "EDIT PROJECT" : "ADD PROJECT"}</p>
        <div className="admin-form-grid">
          <div className="form-group">
            <label htmlFor="pf-title">Title</label>
            <input type="text" id="pf-title" placeholder="Project name" aria-required="true" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="pf-tags">Tags (comma-separated)</label>
            <input type="text" id="pf-tags" placeholder="Web, Motion, GSAP" value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} />
          </div>
          <div className="form-group admin-form-full">
            <label htmlFor="pf-description">Description</label>
            <textarea id="pf-description" placeholder="One-line project description…" aria-required="true" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="pf-color">Accent Color</label>
            <input type="color" id="pf-color" aria-label="Project card accent color" value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })} />
          </div>
          <div className="form-group checkbox-row">
            <input type="checkbox" id="pf-visible" aria-label="Project visibility" checked={f.visible} onChange={(e) => setF({ ...f, visible: e.target.checked })} />
            <label htmlFor="pf-visible">Visible on site</label>
          </div>
          <div className="form-group admin-form-full">
            <label htmlFor="pf-media-file">Media Upload (.mp4 or image)</label>
            <div className="form-group-actions">
              <input type="file" id="pf-media-file" ref={file} accept="video/*,image/*" aria-label="Upload project media" />
              <button className="admin-btn admin-btn--accent" onClick={upload} aria-label="Upload media file">Upload</button>
              <span className="field-status status--off" aria-live="polite">{mediaStatus}</span>
            </div>
          </div>
        </div>
        <div className="admin-actions">
          <button className="admin-btn admin-btn--accent" onClick={save} aria-label="Save project">Save Project</button>
          <button className="admin-btn" onClick={() => setEditing(null)} aria-label="Cancel editing">Cancel</button>
        </div>
      </div>

      <div className="list-wrap" id="projects-list" aria-label="Projects list" role="list">
        {list === null ? <p className="admin-empty">Loading…</p> : list.length === 0 ? (
          <p className="admin-empty">No projects yet. Add one below.</p>
        ) : list.map((p, i) => {
          const b = mediaBadge(p.media);
          const vis = p.visible !== false;
          return (
            <div key={p.id} className="project-row" draggable onDragStart={() => { dragSrc.current = i; }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); drop(i); }} aria-label={`Project: ${p.title}`}>
              <div className="project-row__drag" aria-hidden="true">⠿</div>
              <div className="project-row__info"><strong>{p.title || "Untitled"}</strong><span className="project-row__tags">{(p.tags ?? []).join(", ")}</span></div>
              <span className={`media-badge media-badge--${b.cls}`}>{b.label}</span>
              <span className={`vis-badge ${vis ? "vis--on" : "vis--off"}`}>{vis ? "Visible" : "Hidden"}</span>
              <div className="admin-actions">
                <button className="admin-btn admin-btn--sm" onClick={() => open(i)} aria-label="Edit">Edit</button>
                <button className="admin-btn admin-btn--sm" onClick={() => toggle(p)} aria-label="Toggle visibility">{vis ? "Hide" : "Show"}</button>
                <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => del(p.id!)} aria-label="Delete">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── services ────────────────────────────────────────────────── */
function Services({ toast, ask }: PanelProps) {
  const [list, setList] = useState<Service[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<{ id: string | null } | null>(null);
  const [f, setF] = useState({ title: "", description: "", tags: "", visible: true });

  const load = useCallback(() => {
    sb.sbGetServices().then((d) => { setList(Array.isArray(d) ? d : []); setError(""); }).catch(() => setError("Failed to load services."));
  }, []);
  useEffect(load, [load]);

  const open = (idx: number | null) => {
    const s = idx === null ? null : list![idx];
    setEditing({ id: s?.id ?? null });
    setF({ title: s?.title ?? "", description: s?.description ?? "", tags: (s?.tags ?? []).join(", "), visible: s ? s.visible !== false : true });
  };

  const save = async () => {
    if (!f.title.trim()) return toast("Title is required.", true);
    const payload: Partial<Service> = { title: f.title.trim(), description: f.description.trim(), tags: splitTags(f.tags), visible: f.visible };
    if (!editing?.id) payload.sort_order = list?.length ?? 0;
    try {
      await sb.sbSaveService(editing?.id ?? null, payload);
      setEditing(null); load(); toast("Service saved.");
    } catch (e) { toast(msg(e, "Failed to save service."), true); }
  };

  const del = (id: string) =>
    ask("Delete this service? This cannot be undone.", () =>
      sb.sbDeleteService(id).then(() => { load(); toast("Service deleted."); }).catch(() => toast("Failed to delete.", true)));

  const toggle = (s: Service) =>
    sb.sbSaveService(s.id, { visible: !(s.visible !== false) }).then(load).catch(() => toast("Failed to update.", true));

  return (
    <div className="admin-panel" id="panel-services" style={{ display: "block" }}>
      <PanelHead title="SERVICES" sub="Manage studio services. Toggle visibility per service." error={error} />
      <div className="admin-actions" style={{ marginBottom: "1.2rem" }}>
        <button className="admin-btn admin-btn--accent" onClick={() => open(null)} aria-label="Add a new service">+ Add Service</button>
      </div>

      <div className="admin-form" id="service-form" aria-label="Service editor" style={{ display: editing ? "block" : "none" }}>
        <p className="form-title">{editing?.id ? "EDIT SERVICE" : "ADD SERVICE"}</p>
        <div className="admin-form-grid">
          <div className="form-group">
            <label htmlFor="sf-title">Title</label>
            <input type="text" id="sf-title" placeholder="Service name" aria-required="true" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="sf-tags">Tags (comma-separated)</label>
            <input type="text" id="sf-tags" placeholder="Web, GSAP, CMS" value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} />
          </div>
          <div className="form-group admin-form-full">
            <label htmlFor="sf-description">Description</label>
            <textarea id="sf-description" placeholder="Short service description…" aria-required="true" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </div>
          <div className="form-group checkbox-row">
            <input type="checkbox" id="sf-visible" aria-label="Service visibility" checked={f.visible} onChange={(e) => setF({ ...f, visible: e.target.checked })} />
            <label htmlFor="sf-visible">Visible on site</label>
          </div>
        </div>
        <div className="admin-actions">
          <button className="admin-btn admin-btn--accent" onClick={save} aria-label="Save service">Save Service</button>
          <button className="admin-btn" onClick={() => setEditing(null)} aria-label="Cancel editing">Cancel</button>
        </div>
      </div>

      <div className="list-wrap" id="services-list" aria-label="Services list" role="list">
        {list === null ? <p className="admin-empty">Loading…</p> : list.length === 0 ? (
          <p className="admin-empty">No services yet. Add one below.</p>
        ) : list.map((s, i) => {
          const vis = s.visible !== false;
          return (
            <div key={s.id} className="project-row" aria-label={`Service: ${s.title}`}>
              <div className="project-row__info"><strong>{s.title || "Untitled"}</strong><span className="project-row__tags">{s.description ? s.description.slice(0, 60) + "…" : ""}</span></div>
              <span className={`vis-badge ${vis ? "vis--on" : "vis--off"}`}>{vis ? "Visible" : "Hidden"}</span>
              <div className="admin-actions">
                <button className="admin-btn admin-btn--sm" onClick={() => open(i)} aria-label="Edit">Edit</button>
                <button className="admin-btn admin-btn--sm" onClick={() => toggle(s)} aria-label="Toggle visibility">{vis ? "Hide" : "Show"}</button>
                <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => del(s.id)} aria-label="Delete">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── availability ────────────────────────────────────────────── */
function Availability({ toast }: Pick<PanelProps, "toast">) {
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    sb.sbGet<{ value: string }[]>("site_settings", "key=eq.availability&select=value")
      .then((d) => setAvailable((d?.[0]?.value ?? "available") !== "booked"))
      .catch(() => {});
  }, []);

  const change = async (next: boolean) => {
    setAvailable(next);
    try {
      await sb.sbSaveSetting("availability", next ? "available" : "booked");
      toast("Availability updated.");
    } catch {
      setAvailable(!next);
      toast("Failed to update.", true);
    }
  };

  return (
    <div className="admin-panel" id="panel-availability" style={{ display: "block" }}>
      <PanelHead title="AVAILABILITY" sub="Toggle studio status. Reflects live in the site header badge instantly." />
      <div className="avail-card">
        <div className="avail-status">
          <div className={`avail-dot ${available ? "avail-dot--green" : "avail-dot--red"}`} aria-hidden="true" />
          <span className="avail-label-text">{available ? "Now Taking Projects" : "Currently Booked"}</span>
        </div>
        <div className="avail-toggle-wrap">
          <span className="avail-toggle-label">Available</span>
          <label className="toggle-switch" aria-label="Toggle studio availability">
            <input type="checkbox" checked={available} onChange={(e) => change(e.target.checked)} />
            <span className="toggle-slider" />
          </label>
          <span className="avail-toggle-label">Taking clients</span>
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", lineHeight: 1.7, maxWidth: 320 }}>
          Switching to &quot;Currently Booked&quot; updates the header badge sitewide within seconds. No code change required.
        </p>
      </div>
    </div>
  );
}

/* ── site settings ───────────────────────────────────────────── */
function Settings({ toast, ask }: PanelProps) {
  const [s, setS] = useState({ tagline: "", cta_text: "", accent_color: "#C8FF00", social_github: "", social_instagram: "", social_facebook: "" });
  const [video, setVideo] = useState("");
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [error, setError] = useState("");
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    sb.sbLoadSiteSettings()
      .then((r: SiteSettings) => {
        setS({
          tagline: r.tagline ?? "", cta_text: r.cta_text ?? "", accent_color: r.accent_color || "#C8FF00",
          social_github: r.social_github ?? "", social_instagram: r.social_instagram ?? "", social_facebook: r.social_facebook ?? "",
        });
        setVideo(r.hero_video ?? "");
      })
      .catch(() => setError("Failed to load settings."));
  }, []);

  const save = async () => {
    const fields: Record<string, string> = {
      tagline: s.tagline.trim(), cta_text: s.cta_text.trim(), accent_color: s.accent_color,
      social_github: s.social_github.trim(), social_instagram: s.social_instagram.trim(), social_facebook: s.social_facebook.trim(),
    };
    try {
      await Promise.all(Object.entries(fields).map(([k, v]) => sb.sbSaveSetting(k, v)));
      toast("Settings saved.");
    } catch { toast("Failed to save some settings.", true); }
  };

  const upload = async () => {
    const fl = file.current?.files?.[0];
    if (!fl) return toast("Choose a video file first.", true);
    const path = `hero/hero-video.${fl.name.split(".").pop()}`;
    setVideoStatus("Uploading…");
    try {
      await sb.sbUpload("media", path, fl);
      const url = sb.sbPublicUrl("media", path);
      await sb.sbSaveSetting("hero_video", url);
      setVideo(url); setVideoStatus(null);
      toast("Hero video updated.");
    } catch { setVideoStatus("Upload failed."); toast("Upload failed.", true); }
  };

  const clear = () =>
    ask("Remove hero video? Site will display pure black.", () =>
      sb.sbSaveSetting("hero_video", "").then(() => { setVideo(""); setVideoStatus(null); toast("Hero video removed."); }).catch(() => toast("Failed to update.", true)));

  const on = !!video && videoStatus === null;
  const text = (k: keyof typeof s, label: string, id: string, ph: string, type = "text") => (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input type={type} id={id} placeholder={ph} value={s[k]} onChange={(e) => setS({ ...s, [k]: e.target.value })} />
    </div>
  );

  return (
    <div className="admin-panel" id="panel-settings" style={{ display: "block" }}>
      <PanelHead title="SITE SETTINGS" sub="Edit global site content. Changes reflect live." error={error} />

      <div className="settings-section">
        <p className="settings-section-title">Hero &amp; Copy</p>
        <div className="settings-grid">
          {text("tagline", "Hero Tagline", "set-tagline", "Crafting web experiences…")}
          {text("cta_text", "Hero CTA Button Text", "set-cta-text", "View Our Work")}
        </div>
      </div>

      <div className="settings-section">
        <p className="settings-section-title">Brand</p>
        <div className="settings-grid">
          <div className="form-group">
            <label htmlFor="set-accent">Global Accent Color</label>
            <input type="color" id="set-accent" aria-label="Global accent color picker" value={s.accent_color} onChange={(e) => setS({ ...s, accent_color: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <p className="settings-section-title">Hero Background Video</p>
        <div className="admin-actions" style={{ gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
          <input type="file" id="set-video-file" ref={file} accept="video/mp4,video/webm" aria-label="Choose hero video file" />
          <button className="admin-btn admin-btn--accent" onClick={upload} aria-label="Upload hero video">Upload</button>
          <button className="admin-btn admin-btn--danger" onClick={clear} aria-label="Remove hero video">Clear Video</button>
          <span className={`field-status ${on ? "status--on" : "status--off"}`} aria-live="polite">
            {videoStatus ?? (video ? `Video Active — ${video}` : "Displaying Pure Black")}
          </span>
        </div>
      </div>

      <div className="settings-section">
        <p className="settings-section-title">Social Links</p>
        <div className="settings-grid">
          {text("social_github", "GitHub URL", "set-social-gh", "https://github.com/arkeos", "url")}
          {text("social_instagram", "Instagram URL", "set-social-ig", "https://instagram.com/arkeos", "url")}
          {text("social_facebook", "Facebook URL", "set-social-fb", "https://facebook.com/arkeos", "url")}
        </div>
      </div>

      <div className="admin-actions">
        <button className="admin-btn admin-btn--accent" onClick={save} aria-label="Save all site settings">Save Settings</button>
      </div>
    </div>
  );
}

/* ── fonts ───────────────────────────────────────────────────── */
const FONT_SLOTS = [
  { key: "font_display", name: "Zentry", label: "Display / Hero Headings", fallback: "Bebas Neue" },
  { key: "font_ui_regular", name: "Robert Regular", label: "UI Body / Regular", fallback: "Satoshi / DM Sans" },
  { key: "font_ui_medium", name: "Robert Medium", label: "UI Subheadings / Medium", fallback: "Satoshi / DM Sans" },
  { key: "font_label", name: "General Sans", label: "Labels / Eyebrows / Tags", fallback: "DM Sans" },
] as const;

function Fonts({ toast }: Pick<PanelProps, "toast">) {
  const [active, setActive] = useState<Record<string, string>>({});
  const files = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(() => {
    sb.sbLoadSiteSettings().then((r) => setActive(r as Record<string, string>)).catch(() => {});
  }, []);
  useEffect(load, [load]);

  const upload = async (key: string) => {
    const fl = files.current[key]?.files?.[0];
    if (!fl) return toast("Choose a .woff2 file.", true);
    if (!fl.name.endsWith(".woff2")) return toast("Only .woff2 files accepted.", true);
    const path = `fonts/${key}.woff2`;
    try {
      await sb.sbUpload("media", path, fl);
      await sb.sbSaveSetting(key, sb.sbPublicUrl("media", path));
      load();
      toast("Font uploaded. Reload site to activate.");
    } catch { toast("Font upload failed.", true); }
  };

  return (
    <div className="admin-panel" id="panel-fonts" style={{ display: "block" }}>
      <PanelHead title="FONT SETTINGS" sub="Upload .woff2 font files. Green = active. Red = fallback currently rendering." />
      {FONT_SLOTS.map((slot) => {
        const isOn = !!active[slot.key];
        return (
          <div key={slot.key} className="font-slot" aria-label={`${slot.label} slot`}>
            <div className="font-slot__info">
              <p className="font-slot__label">{slot.label}</p>
              <p className="font-slot__name">{slot.name}</p>
            </div>
            <span className={`font-status ${isOn ? "font-status--on" : "font-status--off"}`}>{isOn ? "Active" : `Fallback: ${slot.fallback}`}</span>
            <div className="font-upload-wrap">
              <input type="file" accept=".woff2" aria-label={`Upload ${slot.name} font`} ref={(el) => { files.current[slot.key] = el; }} />
              <button className="admin-btn admin-btn--sm admin-btn--accent" onClick={() => upload(slot.key)} aria-label={`Upload ${slot.label} font`}>Upload</button>
            </div>
          </div>
        );
      })}
      <p style={{ fontSize: "0.72rem", color: "var(--color-muted)", marginTop: "1.5rem", lineHeight: 1.7 }}>
        Uploading a font file stores it in Supabase storage. The public site does not inject these fonts yet, so they stay on the fallback until that is wired up.
      </p>
    </div>
  );
}

/* ── analytics ───────────────────────────────────────────────── */
function Analytics() {
  const [v, setV] = useState({ views: "—", top: "—", inqs: "—", unread: "—" });

  useEffect(() => {
    const len = (d: unknown) => (Array.isArray(d) ? String(d.length) : "—");
    sb.sbGet("analytics", "select=id").then((d) => setV((p) => ({ ...p, views: len(d) }))).catch(() => {});
    sb.sbGet<{ page: string }[]>("analytics", "select=page").then((d) => {
      if (!Array.isArray(d) || !d.length) return;
      const counts: Record<string, number> = {};
      d.forEach((r) => (counts[r.page] = (counts[r.page] || 0) + 1));
      const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
      setV((p) => ({ ...p, top: top || "—" }));
    }).catch(() => {});
    sb.sbGet("inquiries", "select=id").then((d) => setV((p) => ({ ...p, inqs: len(d) }))).catch(() => {});
    sb.sbGet("inquiries", "select=id&status=eq.unread").then((d) => setV((p) => ({ ...p, unread: len(d) }))).catch(() => {});
  }, []);

  return (
    <div className="admin-panel" id="panel-analytics" style={{ display: "block" }}>
      <PanelHead title="ANALYTICS" sub="Snapshot of key site metrics from the analytics table." />
      <div className="analytics-grid" role="list">
        {[
          ["Total Page Views", v.views], ["Most Visited Page", v.top], ["Total Inquiries", v.inqs], ["Unread Inquiries", v.unread],
        ].map(([label, val], i) => (
          <div key={label} className="analytics-card" role="listitem">
            <p className="analytics-card__label">{label}</p>
            <p className="analytics-card__val" style={i === 1 ? { fontSize: "1.2rem", letterSpacing: "0.04em" } : undefined}>{val}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: "0.72rem", color: "var(--color-muted)", lineHeight: 1.7 }}>
        Page views are logged automatically from every public page into the <code>analytics</code> table.
      </p>
    </div>
  );
}
