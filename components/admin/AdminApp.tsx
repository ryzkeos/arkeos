"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import * as db from "@/lib/db";
import { NAV } from "@/lib/data";
import { DEFAULTS } from "@/defaults";
import type { Inquiry, Project, Service, SiteSettings } from "@/lib/types";
import { applyAccent } from "@/components/SiteSettings";
import { SOCIAL_LINKS } from "@/components/SocialIcons";
import { media_commit, media_discard } from "./media_tx";
import IdentityPanel from "./IdentityPanel";
import WebsiteInfoPanel from "./WebsiteInfoPanel";
import CopyEditor from "./copy/CopyEditor";
import { SETTINGS_COPY_ITEMS } from "./copy/schema/settings";
import { ColorField, IconBtn, MediaField, PanelHead, ToggleField, isHttpUrl, media_slot, msg, slug, upload_media, type PanelProps } from "./shared";

type Section = "inquiries" | "projects" | "services" | "settings" | "website_info" | "identity" | "fonts" | "analytics";

const FEATURED_LIMIT = 5;
const splitTags = (s: string) => s.split(",").map((t) => t.trim()).filter(Boolean);

const NAV_GROUPS: { label: string; items: [Section, string][] }[] = [
  { label: "Content", items: [["inquiries", "Inquiries"], ["projects", "Projects"], ["services", "Services"]] },
  { label: "Studio", items: [["settings", "Site Settings"], ["website_info", "Website Info"], ["identity", "Identity"], ["fonts", "Font Settings"], ["analytics", "Analytics"]] },
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

  const showToast = useCallback((text: string, err = false) => {
    setToast({ text, err });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    let live = true;
    if (!db.dbRestoreSession()?.access_token) {
      setBooted(true);
      return;
    }
    db.dbValidateSession().then((ok) => {
      if (!live) return;
      setAuthed(ok);
      setBooted(true);
      if (!ok) showToast("Session expired. Please log in again.", true);
    });
    return () => {
      live = false;
    };
  }, [showToast]);

  useEffect(() => {
    const on_unauthorized = () => {
      setAuthed(false);
      setMenuOpen(false);
      setConfirmState(null);
      showToast("Session expired. Please log in again.", true);
    };
    window.addEventListener(db.UNAUTHORIZED_EVENT, on_unauthorized);
    return () => window.removeEventListener(db.UNAUTHORIZED_EVENT, on_unauthorized);
  }, [showToast]);

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
            {section === "settings" && <Settings toast={showToast} />}
            {section === "website_info" && <WebsiteInfoPanel toast={showToast} />}
            {section === "identity" && <IdentityPanel onOpenWebsiteInfo={() => setSection("website_info")} />}
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
      ["Type", selected.project_type || "—"],
      ["Budget", selected.budget || "—"],
      ["Timeline", selected.timeline || "—"],
    ];
    return (
      <div className="admin-panel" id="panel-inquiry-detail" style={{ display: "block" }}>
        <PanelHead title="INQUIRY" sub="Full details of the selected inquiry." error={error} />
        <div className="inquiry-bar">
          <button className="admin-btn" onClick={() => setOpenId(null)} aria-label="Back to inquiries">Back</button>
          <div className="admin-actions">
            {selected.status === "unread" && (
              <button className="admin-btn admin-btn--accent" onClick={() => mark(selected.id)} aria-label="Mark as read">Mark Read</button>
            )}
            <button className="admin-btn admin-btn--danger" onClick={() => del(selected.id)} aria-label="Delete inquiry">Delete</button>
          </div>
        </div>
        <article className="inquiry-detail" aria-label={`Inquiry from ${selected.name || "unknown sender"}`}>
          <header className="inquiry-detail__head">
            <div className="inquiry-detail__who">
              <h2 className="inquiry-detail__name">{selected.name || "Unknown sender"}</h2>
              {selected.email ? <a className="inquiry-detail__email" href={`mailto:${selected.email}`}>{selected.email}</a> : <span className="inquiry-detail__email">—</span>}
            </div>
            <time className="inquiry-detail__date" dateTime={selected.created_at ?? undefined}>{fmtDate(selected.created_at)}</time>
          </header>
          <dl className="inquiry-detail__meta">
            {rows.map(([label, value]) => (
              <div key={label} className="inquiry-detail__cell">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <section className="inquiry-detail__body">
            <p className="inquiry-detail__label">Message</p>
            <div className="inquiry-detail__message">{selected.message?.trim() || "No message provided."}</div>
          </section>
        </article>
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
            <tr>{["Name", "Email", "Type", "Budget", "Timeline", "Date", "Status", "Actions"].map((h) => <th key={h} scope="col" className={h === "Status" || h === "Actions" ? "cell-center" : undefined}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {items === null ? (
              <tr><td colSpan={8} className="admin-empty">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="admin-empty">No inquiries found.</td></tr>
            ) : (
              items.map((i) => (
                <tr key={i.id} className={i.status === "unread" ? "row-unread" : ""}>
                  <td className="cell-trunc" title={i.name || undefined}>{i.name || "—"}</td>
                  <td className="cell-trunc" title={i.email || undefined}>{i.email || "—"}</td>
                  <td className="cell-trunc" title={i.project_type || undefined}>{i.project_type || "—"}</td>
                  <td className="cell-trunc" title={i.budget || undefined}>{i.budget || "—"}</td>
                  <td className="cell-trunc" title={i.timeline || undefined}>{i.timeline || "—"}</td>
                  <td>{i.created_at ? new Date(i.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}</td>
                  <td className="cell-center"><span className={`status-badge status-${i.status || "unread"}`}>{i.status || "unread"}</span></td>
                  <td className="cell-center">
                    <div className="admin-actions admin-actions--center">
                      <IconBtn icon="view" label={`View inquiry from ${i.name || "unknown sender"}`} onClick={() => setOpenId(i.id)} />
                      <IconBtn icon="mail_open" label="Mark as read" onClick={() => mark(i.id)} />
                      <IconBtn icon="trash" label="Delete inquiry" danger onClick={() => del(i.id)} />
                    </div>
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
  const [f, setF] = useState({ title: "", description: "", tags: "", url: "", color: "#C8FF00", visible: true, featured: false, media: "" });
  const [staged, setStaged] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const dragSrc = useRef<number | null>(null);
  useEffect(() => () => media_discard("project"), []);

  const load = useCallback(() => {
    db.dbGetProjects().then((d) => { setList(Array.isArray(d) ? d : []); setError(""); }).catch(() => setError("Failed to load projects."));
  }, []);
  useEffect(load, [load]);

  const open = (idx: number | null) => {
    media_discard("project");
    setStaged(null);
    const p = idx === null ? null : list![idx];
    setEditing({ id: p?.id ?? null, hadUrl: !!p?.url });
    setF({ title: p?.title ?? "", description: p?.description ?? "", tags: (p?.tags ?? []).join(", "), url: p?.url ?? "", color: p?.color || "#C8FF00", visible: p ? p.visible !== false : true, featured: p?.featured === true, media: p?.media ?? "" });
  };

  const save = async () => {
    if (saving) return;
    if (!f.title.trim()) return toast("Title is required.", true);
    const url = f.url.trim();
    if (url && !isHttpUrl(url)) return toast("Project link must start with http:// or https://.", true);
    if (f.featured && featured_taken >= FEATURED_LIMIT) return toast(limit_msg, true);
    const payload: Partial<Project> = { title: f.title.trim(), description: f.description.trim(), tags: splitTags(f.tags), color: f.color, visible: f.visible, featured: f.featured, media: f.media.trim() || null };
    if (url) payload.url = url;
    else if (editing?.hadUrl) payload.url = null;
    if (!editing?.id) payload.sort_order = list?.length ?? 0;
    let id = editing?.id ?? null;
    let media = f.media.trim();
    let saved = false;
    setSaving(true);
    try {
      id = await db.dbSaveProject(id, payload);
      saved = true;
      if (staged) {
        media = await upload_media("project", "projects", media_slot(`project-${slug(f.title) || "untitled"}`), staged, f.media);
        await db.dbSaveProject(id, { media });
      }
      media_commit("project", [media]);
      setStaged(null); setEditing(null); load(); toast("Project saved.");
    } catch (e) {
      if (id && id !== editing?.id) { setEditing({ id, hadUrl: !!url }); load(); }
      if (media !== f.media.trim()) { setF((x) => ({ ...x, media })); setStaged(null); }
      toast(saved ? `Project saved, but the file step failed: ${msg(e, "Upload failed.")}` : msg(e, "Failed to save project."), true);
    } finally { setSaving(false); }
  };

  const del = (id: string) =>
    ask("Delete this project? This cannot be undone.", () =>
      db.dbDeleteProject(id).then(() => { const gone = list?.find((p) => p.id === id)?.media; if (gone) db.dbDeleteFile(gone); load(); toast("Project deleted."); }).catch(() => toast("Failed to delete.", true)));

  const toggle = (p: Project) =>
    db.dbSaveProject(p.id!, { visible: !(p.visible !== false) }).then(load).catch(() => toast("Failed to update.", true));

  const featured_taken = (list ?? []).filter((p) => p.featured && p.id !== editing?.id).length;
  const limit_msg = `Only ${FEATURED_LIMIT} projects can be featured. Unfeature one first.`;

  const feature = (p: Project) => {
    if (!p.featured && (list ?? []).filter((x) => x.featured).length >= FEATURED_LIMIT) return toast(limit_msg, true);
    db.dbSaveProject(p.id!, { featured: !p.featured }).then(load).catch(() => toast("Failed to update.", true));
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
            <textarea id="pf-description" placeholder="Project description, about 120 to 180 characters…" aria-required="true" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </div>
          <div className="form-group admin-form-full">
            <label htmlFor="pf-url">Project Link (optional)</label>
            <input type="url" id="pf-url" placeholder="https://" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} />
          </div>
          <ColorField id="pf-color" label="Accent Color" value={f.color} onChange={(v) => setF((x) => ({ ...x, color: v }))} />
          <ToggleField id="pf-featured" label="Featured" checked={f.featured} onChange={(v) => { if (v && featured_taken >= FEATURED_LIMIT) return toast(limit_msg, true); setF((x) => ({ ...x, featured: v })); }} />
          <MediaField label="Media (video, image or .html)" accept="video/*,image/*,.html,.htm" folder="projects" scope="project" file_name={`project-${slug(f.title) || "untitled"}`} value={f.media} onChange={(v) => setF((x) => ({ ...x, media: v }))} staged={staged} on_stage={setStaged} toast={toast} placeholder="or paste media URL" />
        </div>
        <div className="admin-actions admin-actions--end">
          <button className="admin-btn" onClick={() => { media_discard("project"); setStaged(null); setEditing(null); }} disabled={saving} aria-label="Cancel editing">Cancel</button>
          <button className="admin-btn admin-btn--accent" onClick={save} disabled={saving} aria-busy={saving} aria-label="Save project">{saving ? "Saving…" : "Save Project"}</button>
        </div>
      </div>

      <div className="list-wrap" id="projects-list" aria-label="Projects list" role="list">
        {list === null ? <p className="admin-empty">Loading…</p> : list.length === 0 ? (
          <p className="admin-empty">No projects yet. Add one below.</p>
        ) : list.map((p, i) => {
          const vis = p.visible !== false;
          return (
            <div key={p.id} className="project-row" draggable onDragStart={() => { dragSrc.current = i; }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); drop(i); }} aria-label={`Project: ${p.title}`}>
              <div className="project-row__drag" aria-hidden="true">⠿</div>
              <div className="project-row__info"><strong>{p.title || "Untitled"}</strong><span className="project-row__tags">{(p.tags ?? []).join(", ")}</span></div>
              <div className="admin-actions">
                <IconBtn icon="star" active={!!p.featured} label={p.featured ? `Unfeature ${p.title}` : `Feature ${p.title}`} onClick={() => feature(p)} />
                <IconBtn icon="edit" label={`Edit ${p.title}`} onClick={() => open(i)} />
                <IconBtn icon={vis ? "eye_off" : "eye"} label={vis ? `Hide ${p.title}` : `Show ${p.title}`} onClick={() => toggle(p)} />
                <IconBtn icon="trash" label={`Delete ${p.title}`} danger onClick={() => del(p.id!)} />
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
  const [f, setF] = useState({ title: "", description: "", tags: "", price: "", visible: true, icon_url: "", cinema_url: "" });
  const [staged, setStaged] = useState<Partial<Record<"icon_url" | "cinema_url", File | null>>>({});
  const [saving, setSaving] = useState(false);
  const dragSrc = useRef<number | null>(null);
  useEffect(() => () => media_discard("service"), []);

  const load = useCallback(() => {
    db.dbGetServices().then((d) => { setList(Array.isArray(d) ? d : []); setError(""); }).catch(() => setError("Failed to load services."));
  }, []);
  useEffect(load, [load]);

  const open = (idx: number | null) => {
    media_discard("service");
    setStaged({});
    const s = idx === null ? null : list![idx];
    setEditing({ id: s?.id ?? null, hadPrice: !!s?.price });
    setF({ title: s?.title ?? "", description: s?.description ?? "", tags: (s?.tags ?? []).join(", "), price: s?.price ?? "", visible: s ? s.visible !== false : true, icon_url: s?.icon_url ?? "", cinema_url: s?.cinema_url ?? "" });
  };

  const save = async () => {
    if (saving) return;
    if (!f.title.trim()) return toast("Title is required.", true);
    const price = f.price.trim();
    const payload: Partial<Service> = { title: f.title.trim(), description: f.description.trim(), tags: splitTags(f.tags), visible: f.visible, icon_url: f.icon_url.trim() || null, cinema_url: f.cinema_url.trim() || null };
    if (price) payload.price = price;
    else if (editing?.hadPrice) payload.price = null;
    if (!editing?.id) payload.sort_order = list?.length ?? 0;
    let id = editing?.id ?? null;
    let saved = false;
    const uploaded: Partial<Record<"icon_url" | "cinema_url", string>> = {};
    setSaving(true);
    try {
      id = await db.dbSaveService(id, payload);
      saved = true;
      for (const [key, part] of [["icon_url", "icon"], ["cinema_url", "cinema"]] as const) {
        const file = staged[key];
        if (file) uploaded[key] = await upload_media("service", "services", media_slot(`service-${slug(f.title) || "untitled"}-${part}`), file, f[key]);
      }
      if (Object.keys(uploaded).length) await db.dbSaveService(id, uploaded);
      media_commit("service", [uploaded.icon_url ?? f.icon_url, uploaded.cinema_url ?? f.cinema_url]);
      setStaged({}); setEditing(null); load(); toast("Service saved.");
    } catch (e) {
      if (id && id !== editing?.id) { setEditing({ id, hadPrice: !!price }); load(); }
      if (Object.keys(uploaded).length) {
        setF((x) => ({ ...x, ...uploaded }));
        setStaged((x) => ({ ...x, ...(uploaded.icon_url ? { icon_url: null } : {}), ...(uploaded.cinema_url ? { cinema_url: null } : {}) }));
      }
      toast(saved ? `Service saved, but the file step failed: ${msg(e, "Upload failed.")}` : msg(e, "Failed to save service."), true);
    } finally { setSaving(false); }
  };

  const del = (id: string) =>
    ask("Delete this service? This cannot be undone.", () =>
      db.dbDeleteService(id).then(() => { const gone = list?.find((x) => x.id === id); [gone?.icon_url, gone?.cinema_url].forEach((u) => u && db.dbDeleteFile(u)); load(); toast("Service deleted."); }).catch(() => toast("Failed to delete.", true)));

  const toggle = (s: Service) =>
    db.dbSaveService(s.id, { visible: !(s.visible !== false) }).then(load).catch(() => toast("Failed to update.", true));

  const drop = (target: number) => {
    const src = dragSrc.current;
    dragSrc.current = null;
    if (src === null || src === target || !list) return;
    const next = list.slice();
    next.splice(target, 0, next.splice(src, 1)[0]);
    setList(next);
    Promise.all(next.map((x, i) => db.dbSaveService(x.id, { sort_order: i }))).then(load).catch(() => { toast("Failed to reorder.", true); load(); });
  };

  return (
    <div className="admin-panel" id="panel-services" style={{ display: "block" }}>
      <PanelHead title="SERVICES" sub="Manage studio services. Drag to reorder. Supports icon, cinema preview and pricing." error={error} />
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
          <ToggleField id="sf-visible" label="Visible on site" checked={f.visible} onChange={(v) => setF((x) => ({ ...x, visible: v }))} />
          <MediaField label="Icon Image" accept="image/*" folder="services" scope="service" file_name={`service-${slug(f.title) || "untitled"}-icon`} value={f.icon_url} onChange={(v) => setF((x) => ({ ...x, icon_url: v }))} staged={staged.icon_url ?? null} on_stage={(file) => setStaged((x) => ({ ...x, icon_url: file }))} toast={toast} placeholder="or paste icon URL" />
          <MediaField label="Cinema Preview" accept="video/*,image/*" folder="services" scope="service" file_name={`service-${slug(f.title) || "untitled"}-cinema`} value={f.cinema_url} onChange={(v) => setF((x) => ({ ...x, cinema_url: v }))} staged={staged.cinema_url ?? null} on_stage={(file) => setStaged((x) => ({ ...x, cinema_url: file }))} toast={toast} placeholder="or paste cinema URL" />
        </div>
        <div className="admin-actions admin-actions--end">
          <button className="admin-btn" onClick={() => { media_discard("service"); setStaged({}); setEditing(null); }} disabled={saving} aria-label="Cancel editing">Cancel</button>
          <button className="admin-btn admin-btn--accent" onClick={save} disabled={saving} aria-busy={saving} aria-label="Save service">{saving ? "Saving…" : "Save Service"}</button>
        </div>
      </div>

      <div className="list-wrap" id="services-list" aria-label="Services list" role="list">
        {list === null ? <p className="admin-empty">Loading…</p> : list.length === 0 ? (
          <p className="admin-empty">No services yet. Add one below.</p>
        ) : list.map((s, i) => {
          const vis = s.visible !== false;
          return (
            <div key={s.id} className="project-row" draggable onDragStart={() => { dragSrc.current = i; }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); drop(i); }} aria-label={`Service: ${s.title}`}>
              <div className="project-row__drag" aria-hidden="true">⠿</div>
              <div className="project-row__info"><strong>{s.title || "Untitled"}</strong><span className="project-row__tags">{s.description ? s.description.slice(0, 60) + "…" : ""}</span></div>
              <div className="admin-actions">
                <IconBtn icon="edit" label={`Edit ${s.title}`} onClick={() => open(i)} />
                <IconBtn icon={vis ? "eye_off" : "eye"} label={vis ? `Hide ${s.title}` : `Show ${s.title}`} onClick={() => toggle(s)} />
                <IconBtn icon="trash" label={`Delete ${s.title}`} danger onClick={() => del(s.id)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Availability({ toast }: Pick<PanelProps, "toast">) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [texts, setTexts] = useState({ open: DEFAULTS.shared.availability.available_text, booked: DEFAULTS.shared.availability.booked_text });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    setError("");
    db.dbLoadSiteSettings()
      .then((r: SiteSettings) => {
        if (!live) return;
        let copy: { availability?: { available_text?: unknown; booked_text?: unknown } } = {};
        try { copy = r.copy_shared ? JSON.parse(r.copy_shared) : {}; } catch {}
        const pick = (v: unknown, fallback: string) => (typeof v === "string" && v.trim() ? v.trim() : fallback);
        setTexts({
          open: pick(copy?.availability?.available_text, DEFAULTS.shared.availability.available_text),
          booked: pick(copy?.availability?.booked_text, DEFAULTS.shared.availability.booked_text),
        });
        setAvailable((r.availability ?? "available") !== "booked");
      })
      .catch(() => { if (live) setError("Failed to load availability."); });
    return () => { live = false; };
  }, [attempt]);

  const change = async (next: boolean) => {
    if (saving || available === null || next === available) return;
    const prev = available;
    setAvailable(next);
    setSaving(true);
    try {
      await db.dbSaveSetting("availability", next ? "available" : "booked");
      toast("Availability updated.");
    } catch {
      setAvailable(prev);
      toast("Failed to update. Your change was reverted.", true);
    } finally {
      setSaving(false);
    }
  };

  const loading = available === null && !error;
  const text = available ? texts.open : texts.booked;

  return (
    <div className="settings-section" id="panel-availability">
      <p className="settings-section-title">Availability</p>
      {error && (
        <div className="admin-actions">
          <p className="panel-error" role="alert" style={{ display: "block" }}>{error}</p>
          <button type="button" className="admin-btn" onClick={() => setAttempt((n) => n + 1)}>Retry</button>
        </div>
      )}
      <div className="settings-grid settings-grid--single" aria-busy={loading || saving}>
        <ToggleField id="set-availability" label="Studio status" checked={available === true} disabled={available === null || saving} on_text="Taking projects" off_text="Currently booked" onChange={change} />
      </div>
      <p className="panel-sub" role="status">{loading ? "Loading…" : available === null ? "" : `Header badge shows: ${text}`}</p>
    </div>
  );
}

const SOCIAL_FIELD_IDS: Record<string, string> = {
  social_github: "set-social-gh",
  social_instagram: "set-social-ig",
  social_facebook: "set-social-fb",
  social_linkedin: "set-social-li",
  social_telegram: "set-social-tg",
  social_threads: "set-social-th",
  social_discord: "set-social-dc",
};

const blank_socials = () => Object.fromEntries(SOCIAL_LINKS.map(({ key }) => [key, ""])) as Record<(typeof SOCIAL_LINKS)[number]["key"], string>;

function Settings({ toast }: Pick<PanelProps, "toast">) {
  const [accent, setAccent] = useState("#C8FF00");
  const [socials, setSocials] = useState(blank_socials);
  const [video, setVideo] = useState("");
  const [error, setError] = useState("");
  useEffect(() => () => media_discard("settings"), []);

  useEffect(() => {
    db.dbLoadSiteSettings()
      .then((r: SiteSettings) => {
        setAccent(r.accent_color || "#C8FF00");
        setSocials(Object.fromEntries(SOCIAL_LINKS.map(({ key }) => [key, r[key] ?? ""])) as typeof socials);
        setVideo(r.hero_video ?? "");
      })
      .catch(() => setError("Failed to load settings."));
  }, []);

  const save = async () => {
    const fields: Record<string, string> = {
      accent_color: accent,
      hero_video: video.trim(),
      ...Object.fromEntries(SOCIAL_LINKS.map(({ key }) => [key, socials[key].trim()])),
    };
    try {
      await Promise.all(Object.entries(fields).map(([k, v]) => db.dbSaveSetting(k, v)));
      applyAccent(accent);
      media_commit("settings", [video]);
      toast("Settings saved.");
    } catch { toast("Failed to save some settings.", true); }
  };

  return (
    <div className="admin-panel" id="panel-settings" style={{ display: "block" }}>
      <PanelHead title="SITE SETTINGS" sub="Edit global site content. Changes reflect live. Counters shown on Home and About are edited once, here." error={error} />

      <div className="settings-section">
        <p className="settings-section-title">General</p>
        <div className="settings-grid settings-grid--single">
          <ColorField id="set-accent" label="Global Accent Color" value={accent} onChange={setAccent} wide />
        </div>
        <div className="admin-form-grid">
          <MediaField label="Hero Background Video" accept="video/mp4,video/webm" folder="hero" scope="settings" file_name="hero-background" value={video} onChange={setVideo} toast={toast} placeholder="or paste video URL" />
        </div>
        <p className="panel-sub">Empty video shows pure black.</p>
      </div>

      <div className="settings-section">
        <p className="settings-section-title">Social Links</p>
        <p className="panel-sub">Filled links show in the footer and the menu. Empty ones stay hidden.</p>
        <div className="settings-grid">
          {SOCIAL_LINKS.map(({ key, label }) => (
            <div className="form-group" key={key}>
              <label htmlFor={SOCIAL_FIELD_IDS[key]}>{label} URL</label>
              <input type="url" id={SOCIAL_FIELD_IDS[key]} placeholder="https://" value={socials[key]} onChange={(e) => setSocials((x) => ({ ...x, [key]: e.target.value }))} />
            </div>
          ))}
        </div>
      </div>

      <Availability toast={toast} />

      <div className="admin-actions admin-actions--full">
        <button type="button" className="admin-btn admin-btn--accent" onClick={save} aria-label="Save general settings and social links">Save General Settings</button>
      </div>

      <CopyEditor
        items={SETTINGS_COPY_ITEMS}
        toast={toast}
        saved_label="Media, navigation and preloader"
        save_label="Save Media, Navigation and Preloader"
      />
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

  const load = useCallback(() => {
    db.dbLoadSiteSettings().then((r) => setActive(r as Record<string, string>)).catch(() => {});
  }, []);
  useEffect(load, [load]);

  const save_font = async (key: string, url: string) => {
    try {
      await db.dbSaveSetting(key, url);
      media_commit("fonts", [url]);
      load();
      toast(url ? "Font saved. Reload the site to see it." : "Font removed.");
    } catch (e) {
      toast(`Saving failed: ${msg(e, "unknown error")}`, true);
    }
  };

  return (
    <div className="admin-panel" id="panel-fonts" style={{ display: "block" }}>
      <PanelHead title="FONT SETTINGS" sub="Upload .woff2 font files. A font marked Active replaces the default for that slot. Recommended fonts are only suggestions." />
      {FONT_SLOTS.map((slot) => {
        const isOn = !!active[slot.key];
        return (
          <div key={slot.key} className="font-slot" aria-label={`${slot.label} slot`}>
            <div className="font-slot__info">
              <p className="font-slot__label">{slot.label}</p>
              <p className="font-slot__hint">Recommended: {slot.name}</p>
            </div>
            {isOn && <span className="font-status font-status--on">Active</span>}
            <div className="font-upload-wrap">
              <MediaField
                label={`${slot.label} font`}
                accept=".woff2"
                folder="fonts"
                scope="fonts" file_name={slot.key.replace(/_/g, "-")}
                value={active[slot.key] ?? ""}
                onChange={(v) => save_font(slot.key, v)}
                toast={toast}
                hide_url
                wide={false}
                validate={checkFont}
                prepare={(fl) => new File([fl], `${slot.key}.woff2`, { type: "font/woff2" })}
              />
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
