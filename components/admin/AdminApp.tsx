"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import * as db from "@/lib/db";
import { NAV } from "@/lib/data";
import type { CinemaType, Inquiry, Pillar, Project, Service, SiteSettings } from "@/lib/types";
import { applyAccent } from "@/components/SiteSettings";
import IdentityPanel from "./IdentityPanel";
import WebsiteInfoPanel from "./WebsiteInfoPanel";
import { CINEMA_TYPES, MEDIA_BUCKET, MediaField, PanelHead, isHttpUrl, msg, type PanelProps } from "./shared";

type Section = "inquiries" | "projects" | "services" | "pillars" | "availability" | "settings" | "website_info" | "identity" | "fonts" | "analytics";

const VIDEO_EXT = ["mp4", "webm", "mov", "ogg"];
function mediaBadge(media: string | null) {
  if (!media) return { label: "Black", cls: "black" };
  const ext = media.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXT.includes(ext) ? { label: "Video", cls: "video" } : { label: "Image", cls: "image" };
}
const splitTags = (s: string) => s.split(",").map((t) => t.trim()).filter(Boolean);

const NAV_GROUPS: { label: string; items: [Section, string][] }[] = [
  { label: "Content", items: [["inquiries", "Inquiries"], ["projects", "Projects"], ["services", "Services"], ["pillars", "Pillars"]] },
  { label: "Studio", items: [["availability", "Availability"], ["settings", "Site Settings"], ["website_info", "Website Info"], ["identity", "Identity"], ["fonts", "Font Settings"], ["analytics", "Analytics"]] },
];

export default function AdminApp() {
  const [authed, setAuthed] = useState(false);
  const [booted, setBooted] = useState(false);
  const [section, setSection] = useState<Section>("inquiries");
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ text: string; err: boolean } | null>(null);
  const [confirmState, setConfirmState] = useState<{ text: string; onYes: () => void } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setAuthed(!!db.dbRestoreSession()?.access_token);
    setBooted(true);
  }, []);

  const showToast = useCallback((text: string, err = false) => {
    setToast({ text, err });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const ask = useCallback((text: string, onYes: () => void) => setConfirmState({ text, onYes }), []);

  const logout = async () => {
    await db.dbSignOut();
    setAuthed(false);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const go = (id: Section, closeMenu: boolean) => {
    setSection(id);
    if (closeMenu) setMenuOpen(false);
  };

  const renderNav = (closeMenu: boolean) => (
    <>
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="sidebar-label">{group.label}</div>
          <nav className="sidebar-nav">
            {group.items.map(([id, label]) => (
              <button key={id} className={section === id ? "active" : ""} onClick={() => go(id, closeMenu)}>
                {label}
                {id === "inquiries" && (
                  <span className="sidebar-badge" aria-label="Unread count" style={{ display: unread > 0 ? "inline-flex" : "none" }}>
                    {unread > 0 ? unread : ""}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      ))}
      <div className="sidebar-footer">
        <button aria-label="Log out of admin panel" onClick={logout}>Log Out</button>
      </div>
    </>
  );

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
          <header className="admin-topbar">
            <span className="sidebar-logo">ARKEOS</span>
            <button
              className="admin-topbar__toggle"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="admin-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span aria-hidden="true">{menuOpen ? "Close" : "Menu"}</span>
              {!menuOpen && unread > 0 && <span className="sidebar-badge" style={{ display: "inline-flex" }}>{unread}</span>}
            </button>
          </header>

          {menuOpen && (
            <div className="admin-menu" id="admin-menu" role="navigation" aria-label="Admin navigation">
              {renderNav(true)}
            </div>
          )}

          <aside className="admin-sidebar" role="navigation" aria-label="Admin navigation">
            <div className="sidebar-logo">ARKEOS</div>
            {renderNav(false)}
          </aside>

          <main className="admin-main" role="main">
            {section === "inquiries" && <Inquiries toast={showToast} ask={ask} onUnread={setUnread} />}
            {section === "projects" && <Projects toast={showToast} ask={ask} />}
            {section === "services" && <Services toast={showToast} ask={ask} />}
            {section === "pillars" && <Pillars toast={showToast} ask={ask} />}
            {section === "availability" && <Availability toast={showToast} />}
            {section === "settings" && <Settings toast={showToast} ask={ask} />}
            {section === "website_info" && <WebsiteInfoPanel toast={showToast} />}
            {section === "identity" && <IdentityPanel toast={showToast} />}
            {section === "fonts" && <Fonts toast={showToast} />}
            {section === "analytics" && <Analytics />}
          </main>
        </div>
      )}
    </>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setErr(""); setBusy(true);
    try {
      const data = await db.dbSignIn(email.trim(), pass);
      if (data.error || !data.access_token) {
        setErr(data.error_description || data.message || "Invalid credentials.");
      } else {
        db.dbSetSession(data);
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
          <input type="email" id="login-email" placeholder="name@domain" autoComplete="username" aria-required="true" value={email} onChange={(e) => setEmail(e.target.value)} />
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

function Inquiries({ toast, ask, onUnread }: PanelProps & { onUnread: (n: number) => void }) {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [items, setItems] = useState<Inquiry[] | null>(null);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(() => {
    db.dbGetInquiries(filter)
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setItems(list);
        setError("");
        db.dbCount("inquiries", "status=eq.unread").then(onUnread).catch(() => {});
      })
      .catch(() => setError("Failed to load inquiries."));
  }, [filter, onUnread]);

  useEffect(load, [load]);

  const mark = (id: string) => db.dbMarkInquiry(id, "read").then(load).catch(() => toast("Failed to update.", true));
  const del = (id: string) =>
    ask("Delete this inquiry? This cannot be undone.", () =>
      db.dbDeleteInquiry(id).then(() => { setOpenId(null); load(); }).catch(() => toast("Failed to delete.", true)));

  const selected = openId && items ? items.find((i) => i.id === openId) ?? null : null;
  const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—");

  if (selected) {
    const rows: [string, string][] = [
      ["Name", selected.name || "—"],
      ["Email", selected.email || "—"],
      ["Type", selected.project_type || "—"],
      ["Budget", selected.budget || "—"],
      ["Timeline", selected.timeline || "—"],
      ["Received", fmtDate(selected.created_at)],
    ];
    return (
      <div className="admin-panel" id="panel-inquiry-detail" style={{ display: "block" }}>
        <PanelHead title="INQUIRY" sub="Full details of the selected inquiry." error={error} />
        <div className="admin-actions" style={{ marginBottom: "1.2rem" }}>
          <button className="admin-btn" onClick={() => setOpenId(null)} aria-label="Back to inquiries">Back</button>
          {selected.status === "unread" && (
            <button className="admin-btn admin-btn--accent" onClick={() => mark(selected.id)} aria-label="Mark as read">Mark Read</button>
          )}
          <button className="admin-btn admin-btn--danger" onClick={() => del(selected.id)} aria-label="Delete inquiry">Delete</button>
          <span className={`status-badge status-${selected.status || "unread"}`}>{selected.status || "unread"}</span>
        </div>
        <div className="inquiry-detail">
          <dl className="inquiry-detail__meta">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="inquiry-detail__label">Message</p>
          <div className="inquiry-detail__message">{selected.message?.trim() || "No message provided."}</div>
        </div>
      </div>
    );
  }

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
                    <button className="admin-btn admin-btn--sm" onClick={() => setOpenId(i.id)} aria-label={`View inquiry from ${i.name || "unknown sender"}`}>View</button>
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

function Projects({ toast, ask }: PanelProps) {
  const [list, setList] = useState<Project[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<{ id: string | null; hadUrl: boolean } | null>(null);
  const [f, setF] = useState({ title: "", description: "", tags: "", url: "", color: "#C8FF00", visible: true });
  const [mediaStatus, setMediaStatus] = useState("No media — pure black active");
  const file = useRef<HTMLInputElement>(null);
  const dragSrc = useRef<number | null>(null);

  const load = useCallback(() => {
    db.dbGetProjects().then((d) => { setList(Array.isArray(d) ? d : []); setError(""); }).catch(() => setError("Failed to load projects."));
  }, []);
  useEffect(load, [load]);

  const open = (idx: number | null) => {
    const p = idx === null ? null : list![idx];
    setEditing({ id: p?.id ?? null, hadUrl: !!p?.url });
    setF({ title: p?.title ?? "", description: p?.description ?? "", tags: (p?.tags ?? []).join(", "), url: p?.url ?? "", color: p?.color || "#C8FF00", visible: p ? p.visible !== false : true });
    setMediaStatus(p ? mediaBadge(p.media).label : "No media — pure black active");
  };

  const save = async () => {
    if (!f.title.trim()) return toast("Title is required.", true);
    const url = f.url.trim();
    if (url && !isHttpUrl(url)) return toast("Project link must start with http:// or https://.", true);
    const payload: Partial<Project> = { title: f.title.trim(), description: f.description.trim(), tags: splitTags(f.tags), color: f.color, visible: f.visible };
    if (url) payload.url = url;
    else if (editing?.hadUrl) payload.url = null;
    if (!editing?.id) { payload.sort_order = list?.length ?? 0; payload.media = null; }
    try {
      await db.dbSaveProject(editing?.id ?? null, payload);
      setEditing(null); load(); toast("Project saved.");
    } catch (e) { toast(msg(e, "Failed to save project."), true); }
  };

  const del = (id: string) =>
    ask("Delete this project? This cannot be undone.", () =>
      db.dbDeleteProject(id).then(() => { load(); toast("Project deleted."); }).catch(() => toast("Failed to delete.", true)));

  const toggle = (p: Project) =>
    db.dbSaveProject(p.id!, { visible: !(p.visible !== false) }).then(load).catch(() => toast("Failed to update.", true));

  const upload = async () => {
    if (!editing?.id) return toast("Save the project first, then upload media.", true);
    const fl = file.current?.files?.[0];
    if (!fl) return;
    const path = `projects/${editing.id}.${fl.name.split(".").pop()}`;
    setMediaStatus("Uploading…");
    try {
      await db.dbUpload(MEDIA_BUCKET, path, fl);
      const url = db.dbPublicUrl(MEDIA_BUCKET, path);
      await db.dbSaveProject(editing.id, { media: url });
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
    Promise.all(next.map((p, i) => db.dbSaveProject(p.id!, { sort_order: i }))).then(load).catch(() => { toast("Failed to reorder.", true); load(); });
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
            <input type="text" id="pf-tags" placeholder="tag one, tag two" value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} />
          </div>
          <div className="form-group admin-form-full">
            <label htmlFor="pf-description">Description</label>
            <textarea id="pf-description" placeholder="One-line project description…" aria-required="true" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </div>
          <div className="form-group admin-form-full">
            <label htmlFor="pf-url">Project Link (optional)</label>
            <input type="url" id="pf-url" placeholder="https://" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} />
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
            <label htmlFor="pf-media-file">Media Upload (video, image or .html)</label>
            <div className="form-group-actions">
              <input type="file" id="pf-media-file" ref={file} accept="video/*,image/*,.html,.htm" aria-label="Upload project media" />
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

function Services({ toast, ask }: PanelProps) {
  const [list, setList] = useState<Service[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<{ id: string | null; hadPrice: boolean } | null>(null);
  const [f, setF] = useState({ title: "", description: "", tags: "", price: "", visible: true, icon_url: "", cinema_url: "", cinema_type: "video" as CinemaType });

  const load = useCallback(() => {
    db.dbGetServices().then((d) => { setList(Array.isArray(d) ? d : []); setError(""); }).catch(() => setError("Failed to load services."));
  }, []);
  useEffect(load, [load]);

  const open = (idx: number | null) => {
    const s = idx === null ? null : list![idx];
    setEditing({ id: s?.id ?? null, hadPrice: !!s?.price });
    setF({ title: s?.title ?? "", description: s?.description ?? "", tags: (s?.tags ?? []).join(", "), price: s?.price ?? "", visible: s ? s.visible !== false : true, icon_url: s?.icon_url ?? "", cinema_url: s?.cinema_url ?? "", cinema_type: s?.cinema_type ?? "video" });
  };

  const save = async () => {
    if (!f.title.trim()) return toast("Title is required.", true);
    const price = f.price.trim();
    const payload: Partial<Service> = { title: f.title.trim(), description: f.description.trim(), tags: splitTags(f.tags), visible: f.visible, icon_url: f.icon_url.trim() || null, cinema_url: f.cinema_url.trim() || null, cinema_type: f.cinema_type };
    if (price) payload.price = price;
    else if (editing?.hadPrice) payload.price = null;
    if (!editing?.id) payload.sort_order = list?.length ?? 0;
    try {
      await db.dbSaveService(editing?.id ?? null, payload);
      setEditing(null); load(); toast("Service saved.");
    } catch (e) { toast(msg(e, "Failed to save service."), true); }
  };

  const del = (id: string) =>
    ask("Delete this service? This cannot be undone.", () =>
      db.dbDeleteService(id).then(() => { load(); toast("Service deleted."); }).catch(() => toast("Failed to delete.", true)));

  const toggle = (s: Service) =>
    db.dbSaveService(s.id, { visible: !(s.visible !== false) }).then(load).catch(() => toast("Failed to update.", true));

  return (
    <div className="admin-panel" id="panel-services" style={{ display: "block" }}>
      <PanelHead title="SERVICES" sub="Manage studio services. Supports icon, cinema preview and pricing." error={error} />
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
            <input type="text" id="sf-tags" placeholder="tag one, tag two" value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} />
          </div>
          <div className="form-group admin-form-full">
            <label htmlFor="sf-description">Description</label>
            <textarea id="sf-description" placeholder="Short service description…" aria-required="true" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="sf-price">Price (optional)</label>
            <input type="text" id="sf-price" placeholder="Price text" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
          </div>
          <div className="form-group checkbox-row">
            <input type="checkbox" id="sf-visible" aria-label="Service visibility" checked={f.visible} onChange={(e) => setF({ ...f, visible: e.target.checked })} />
            <label htmlFor="sf-visible">Visible on site</label>
          </div>
          <MediaField label="Icon Image" accept="image/*" folder="services" value={f.icon_url} onChange={(v) => setF((x) => ({ ...x, icon_url: v }))} toast={toast} placeholder="or paste icon URL" />
          <MediaField label="Cinema Preview" accept="video/*,image/*" folder="services" value={f.cinema_url} onChange={(v) => setF((x) => ({ ...x, cinema_url: v }))} toast={toast} placeholder="or paste cinema URL" />
          <div className="form-group">
            <label htmlFor="sf-cinema-type">Cinema type</label>
            <select id="sf-cinema-type" value={f.cinema_type} onChange={(e) => setF({ ...f, cinema_type: e.target.value as CinemaType })}>
              {CINEMA_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
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

function Pillars({ toast, ask }: PanelProps) {
  const [list, setList] = useState<Pillar[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<{ id: string | null } | null>(null);
  const [f, setF] = useState({ title: "", description: "", sort: "0", icon_url: "", cinema_url: "", cinema_type: "video" as CinemaType });

  const load = useCallback(() => {
    db.dbGetPillars().then((d) => { setList(Array.isArray(d) ? d : []); setError(""); }).catch(() => setError("Failed to load pillars."));
  }, []);
  useEffect(load, [load]);

  const open = (idx: number | null) => {
    const p = idx === null ? null : list![idx];
    setEditing({ id: p?.id ?? null });
    setF({ title: p?.title ?? "", description: p?.description ?? "", sort: String(p?.sort_order ?? list?.length ?? 0), icon_url: p?.icon_url ?? "", cinema_url: p?.cinema_url ?? "", cinema_type: p?.cinema_type ?? "video" });
  };

  const save = async () => {
    if (!f.title.trim()) return toast("Title is required.", true);
    const payload: Partial<Pillar> = {
      title: f.title.trim(),
      description: f.description.trim(),
      sort_order: Number.parseInt(f.sort, 10) || 0,
      icon_url: f.icon_url.trim() || null,
      cinema_url: f.cinema_url.trim() || null,
      cinema_type: f.cinema_type,
    };
    try {
      await db.dbSavePillar(editing?.id ?? null, payload);
      setEditing(null); load(); toast(editing?.id ? "Pillar updated." : "Pillar added.");
    } catch (e) { toast(msg(e, "Failed to save pillar."), true); }
  };

  const del = (id: string) =>
    ask("Delete this pillar? This cannot be undone.", () =>
      db.dbDeletePillar(id).then(() => { load(); toast("Pillar deleted."); }).catch(() => toast("Failed to delete.", true)));

  return (
    <div className="admin-panel" id="panel-pillars" style={{ display: "block" }}>
      <PanelHead title="PILLARS" sub={'Homepage "What We Do" cards. Each can have an icon and a cinema preview. When empty, the first services are shown.'} error={error} />
      <div className="admin-actions" style={{ marginBottom: "1.2rem" }}>
        <button className="admin-btn admin-btn--accent" onClick={() => open(null)} aria-label="Add a new pillar">+ Add Pillar</button>
      </div>

      <div className="admin-form" id="pillar-form" aria-label="Pillar editor" style={{ display: editing ? "block" : "none" }}>
        <p className="form-title">{editing?.id ? "EDIT PILLAR" : "ADD PILLAR"}</p>
        <div className="admin-form-grid">
          <div className="form-group">
            <label htmlFor="pf-title">Title</label>
            <input type="text" id="pf-title" placeholder="Pillar title" aria-required="true" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="pf-sort">Sort Order</label>
            <input type="number" id="pf-sort" min={0} value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value })} />
          </div>
          <div className="form-group admin-form-full">
            <label htmlFor="pf-desc">Description</label>
            <textarea id="pf-desc" placeholder="Short pillar description…" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </div>
          <MediaField label="Icon Image" accept="image/*" folder="pillars" value={f.icon_url} onChange={(v) => setF((x) => ({ ...x, icon_url: v }))} toast={toast} placeholder="or paste icon URL" />
          <MediaField label="Cinema Preview" accept="video/*,image/*" folder="pillars" value={f.cinema_url} onChange={(v) => setF((x) => ({ ...x, cinema_url: v }))} toast={toast} placeholder="or paste cinema URL" />
          <div className="form-group">
            <label htmlFor="pf-cinema-type">Cinema type</label>
            <select id="pf-cinema-type" value={f.cinema_type} onChange={(e) => setF({ ...f, cinema_type: e.target.value as CinemaType })}>
              {CINEMA_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="admin-actions">
          <button className="admin-btn admin-btn--accent" onClick={save} aria-label="Save pillar">Save Pillar</button>
          <button className="admin-btn" onClick={() => setEditing(null)} aria-label="Cancel editing">Cancel</button>
        </div>
      </div>

      <div className="list-wrap" id="pillars-list" aria-label="Pillars list" role="list">
        {list === null ? <p className="admin-empty">Loading…</p> : list.length === 0 ? (
          <p className="admin-empty">No pillars yet.</p>
        ) : list.map((p, i) => (
          <div key={p.id} className="project-row" aria-label={`Pillar: ${p.title}`}>
            <div className="project-row__info"><strong>{p.title || "Untitled"}</strong><span className="project-row__tags">{p.description ? p.description.slice(0, 60) + "…" : ""}</span></div>
            <span className={`vis-badge ${p.cinema_url ? "vis--on" : "vis--off"}`}>{p.cinema_url ? p.cinema_type : "No cinema"}</span>
            <div className="admin-actions">
              <button className="admin-btn admin-btn--sm" onClick={() => open(i)} aria-label="Edit">Edit</button>
              <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => del(p.id)} aria-label="Delete">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Availability({ toast }: Pick<PanelProps, "toast">) {
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    db.dbGet<{ value: string }[]>("site_settings", "key=eq.availability&select=value")
      .then((d) => setAvailable((d?.[0]?.value ?? "available") !== "booked"))
      .catch(() => {});
  }, []);

  const change = async (next: boolean) => {
    setAvailable(next);
    try {
      await db.dbSaveSetting("availability", next ? "available" : "booked");
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

function Settings({ toast, ask }: PanelProps) {
  const [s, setS] = useState({ tagline: "", what_intro: "", work_intro: "", cta_text: "", accent_color: "#C8FF00", social_github: "", social_instagram: "", social_facebook: "" });
  const [video, setVideo] = useState("");
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [error, setError] = useState("");
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    db.dbLoadSiteSettings()
      .then((r: SiteSettings) => {
        setS({
          tagline: r.tagline ?? "", what_intro: (r as Record<string, string | undefined>).what_intro ?? "", work_intro: (r as Record<string, string | undefined>).work_intro ?? "", cta_text: r.cta_text ?? "", accent_color: r.accent_color || "#C8FF00",
          social_github: r.social_github ?? "", social_instagram: r.social_instagram ?? "", social_facebook: r.social_facebook ?? "",
        });
        setVideo(r.hero_video ?? "");
      })
      .catch(() => setError("Failed to load settings."));
  }, []);

  const save = async () => {
    const fields: Record<string, string> = {
      tagline: s.tagline.trim(), what_intro: s.what_intro.trim(), work_intro: s.work_intro.trim(), cta_text: s.cta_text.trim(), accent_color: s.accent_color,
      social_github: s.social_github.trim(), social_instagram: s.social_instagram.trim(), social_facebook: s.social_facebook.trim(),
    };
    try {
      await Promise.all(Object.entries(fields).map(([k, v]) => db.dbSaveSetting(k, v)));
      applyAccent(s.accent_color);
      toast("Settings saved.");
    } catch { toast("Failed to save some settings.", true); }
  };

  const upload = async () => {
    const fl = file.current?.files?.[0];
    if (!fl) return toast("Choose a video file first.", true);
    const path = `hero/hero-video.${fl.name.split(".").pop()}`;
    setVideoStatus("Uploading…");
    try {
      await db.dbUpload(MEDIA_BUCKET, path, fl);
      const url = db.dbPublicUrl(MEDIA_BUCKET, path);
      await db.dbSaveSetting("hero_video", url);
      setVideo(url); setVideoStatus(null);
      toast("Hero video updated.");
    } catch { setVideoStatus("Upload failed."); toast("Upload failed.", true); }
  };

  const clear = () =>
    ask("Remove hero video? Site will display pure black.", () =>
      db.dbSaveSetting("hero_video", "").then(() => { setVideo(""); setVideoStatus(null); toast("Hero video removed."); }).catch(() => toast("Failed to update.", true)));

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
          {text("tagline", "Hero Tagline", "set-tagline", "Tagline")}
          {text("cta_text", "Hero CTA Button Text", "set-cta-text", "Button text")}
          {text("what_intro", "What We Do Description", "set-what-intro", "Leave empty for the default text")}
          {text("work_intro", "Selected Work Description", "set-work-intro", "Leave empty for the default text")}
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
          {text("social_github", "GitHub URL", "set-social-gh", "https://", "url")}
          {text("social_instagram", "Instagram URL", "set-social-ig", "https://", "url")}
          {text("social_facebook", "Facebook URL", "set-social-fb", "https://", "url")}
        </div>
      </div>

      <div className="admin-actions">
        <button className="admin-btn admin-btn--accent" onClick={save} aria-label="Save all site settings">Save Settings</button>
      </div>
    </div>
  );
}

const FONT_SLOTS = [
  { key: "font_display", name: "Zentry", label: "Display / Hero Headings" },
  { key: "font_ui_regular", name: "Robert Regular", label: "UI Body / Regular" },
  { key: "font_ui_medium", name: "Robert Medium", label: "UI Subheadings / Medium" },
  { key: "font_label", name: "General Sans", label: "Labels / Eyebrows / Tags" },
] as const;

const FONT_MAX_BYTES = 2 * 1024 * 1024;
const WOFF2_SIGNATURE = [0x77, 0x4f, 0x46, 0x32];

async function checkFont(file: File): Promise<string | null> {
  if (file.size > FONT_MAX_BYTES) return "Font file must be under 2 MB.";
  const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  if (head.length < 4 || WOFF2_SIGNATURE.some((b, i) => head[i] !== b)) return "Not a valid woff2 font file.";
  return null;
}

function Fonts({ toast }: Pick<PanelProps, "toast">) {
  const [active, setActive] = useState<Record<string, string>>({});
  const files = useRef<Record<string, HTMLInputElement | null>>({});
  const [busy, setBusy] = useState("");

  const load = useCallback(() => {
    db.dbLoadSiteSettings().then((r) => setActive(r as Record<string, string>)).catch(() => {});
  }, []);
  useEffect(load, [load]);

  const upload = async (key: string) => {
    const fl = files.current[key]?.files?.[0];
    if (!fl) return toast("Choose a .woff2 file.", true);
    const problem = await checkFont(fl);
    if (problem) return toast(problem, true);
    const path = `fonts/${key}-${Date.now()}.woff2`;
    setBusy(key);
    try {
      await db.dbUpload(MEDIA_BUCKET, path, new File([fl], `${key}.woff2`, { type: "font/woff2" }));
    } catch (e) {
      setBusy("");
      return toast(msg(e, "Font upload failed."), true);
    }
    try {
      await db.dbSaveSetting(key, db.dbPublicUrl(MEDIA_BUCKET, path));
      load();
      const input = files.current[key];
      if (input) input.value = "";
      toast("Font uploaded. Reload the site to see it.");
    } catch (e) {
      toast(`Uploaded, but saving failed: ${msg(e, "unknown error")}`, true);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="admin-panel" id="panel-fonts" style={{ display: "block" }}>
      <PanelHead title="FONT SETTINGS" sub="Upload .woff2 font files. Green = active. Red = bundled font currently rendering." />
      {FONT_SLOTS.map((slot) => {
        const isOn = !!active[slot.key];
        return (
          <div key={slot.key} className="font-slot" aria-label={`${slot.label} slot`}>
            <div className="font-slot__info">
              <p className="font-slot__label">{slot.label}</p>
              <p className="font-slot__name">{slot.name}</p>
            </div>
            <span className={`font-status ${isOn ? "font-status--on" : "font-status--off"}`}>{isOn ? "Active" : "bundled font"}</span>
            <div className="font-upload-wrap">
              <input type="file" accept=".woff2" aria-label={`Upload ${slot.name} font`} ref={(el) => { files.current[slot.key] = el; }} />
              <button className="admin-btn admin-btn--sm admin-btn--accent" onClick={() => upload(slot.key)} disabled={busy === slot.key} aria-label={`Upload ${slot.label} font`}>{busy === slot.key ? "Uploading…" : "Upload"}</button>
            </div>
          </div>
        );
      })}
      <p style={{ fontSize: "0.72rem", color: "var(--color-muted)", marginTop: "1.5rem", lineHeight: 1.7 }}>
        Uploading a font file stores it in storage.
      </p>
    </div>
  );
}

function Analytics() {
  const [v, setV] = useState({ views: "—", top: "—", inqs: "—", unread: "—" });

  useEffect(() => {
    const put = (key: "views" | "inqs" | "unread") => (n: number) => setV((p) => ({ ...p, [key]: String(n) }));
    db.dbCount("analytics").then(put("views")).catch(() => {});
    Promise.all(
      NAV.map((n) => {
        const page = n.href === "/" ? "index.html" : `${n.href.replace(/^\//, "")}.html`;
        return db.dbCount("analytics", `page=eq.${encodeURIComponent(page)}`).then((count) => ({ page, count }));
      }),
    )
      .then((rows) => {
        const best = rows.reduce((a, b) => (b.count > a.count ? b : a), { page: "—", count: 0 });
        if (best.count > 0) setV((p) => ({ ...p, top: best.page }));
      })
      .catch(() => {});
    db.dbCount("inquiries").then(put("inqs")).catch(() => {});
    db.dbCount("inquiries", "status=eq.unread").then(put("unread")).catch(() => {});
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
