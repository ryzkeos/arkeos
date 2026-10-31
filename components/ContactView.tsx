"use client";
import "@/styles/contact.css";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { dbSubmitInquiry } from "@/lib/db";
import { useCopy } from "@/lib/use_copy";
import { useSiteSettingsLoaded } from "./SiteSettings";
import { useArkeosAnimations } from "@/hooks/useArkeosAnimations";
import HeroLayout from "./hero/HeroLayout";
import Btn from "./Btn";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Form = { name: string; email: string; project_type: string; budget: string; timeline: string; message: string };
const EMPTY: Form = { name: "", email: "", project_type: "", budget: "", timeline: "", message: "" };
const CLEAN = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).map(([k, x]) => [k, x.trim()]));

type SelectProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  full?: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

function SelectField({ id, name, label, placeholder, options, value, full, onChange }: SelectProps) {
  return (
    <div className={`form-field${full ? " form-full" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <select id={id} name={name} required aria-required="true" value={value} onChange={onChange}>
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function ContactView() {
  const copy = useCopy("contact");
  const { brand } = useCopy("shared");
  const loaded = useSiteSettingsLoaded();
  useArkeosAnimations({ ready: loaded });

  const [form, setForm] = useState<Form>(EMPTY);
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [phase, setPhase] = useState<"form" | "leaving" | "done">("form");
  const formWrap = useRef<HTMLDivElement>(null);
  const success = useRef<HTMLDivElement>(null);
  const errBox = useRef<HTMLDivElement>(null);

  const { hero, info, form: f, success: ok, errors } = copy;

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  useEffect(() => {
    if (error && errBox.current && !prefersReducedMotion())
      gsap.from(errBox.current, { opacity: 0, y: 8, duration: 0.4, ease: "power2.out" });
  }, [error]);

  useEffect(() => {
    if (phase === "leaving") {
      if (prefersReducedMotion() || !formWrap.current) return setPhase("done");
      gsap.to(formWrap.current, { opacity: 0, y: -14, duration: 0.45, ease: "power2.inOut", onComplete: () => setPhase("done") });
    }
    if (phase === "done" && success.current) {
      if (prefersReducedMotion()) gsap.set(success.current, { opacity: 1, y: 0 });
      else gsap.to(success.current, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" });
    }
  }, [phase]);

  const validate = (): string | null => {
    const v = CLEAN(form) as Form;
    if (!v.name || !v.email || !v.project_type || !v.budget || !v.timeline || !v.message) return errors.required;
    if (!EMAIL_RE.test(v.email)) return errors.invalid_email;
    return null;
  };

  const submit = async () => {
    if (sending) return;
    setError(null);
    const problem = validate();
    if (problem) return setError(problem);

    setSending(true);
    try {
      await dbSubmitInquiry({ ...CLEAN(form), website });
      setPhase("leaving");
    } catch (err) {
      setError(err instanceof TypeError ? errors.network : errors.server);
    } finally {
      setSending(false);
    }
  };

  const note = f.note || brand.response_time;

  return (
    <main className="pg-contact">
      <HeroLayout variant="page" ariaLabel={hero.lines.join(" ")} copy={hero} />

      <section id="contact" aria-label={info.title} aria-busy={!loaded}>
        {!loaded ? (
          <div className="contact-layout contact-skeleton" aria-hidden="true">
            <div className="contact-skeleton__info">
              <span className="sk sk--title" />
              <span className="sk sk--line" />
              <span className="sk sk--line" />
            </div>
            <div className="contact-skeleton__form">
              {[0, 1, 2, 3, 4].map((i) => <span key={i} className="sk sk--field" />)}
              <span className="sk sk--area" />
            </div>
          </div>
        ) : (
          <div className="contact-layout">
            <div className="contact-info reveal">
              <h2 className="contact-info__title">{info.title}</h2>
              <p className="contact-info__body">{info.body}</p>
              {(brand.email || brand.response_time) && (
                <div className="contact-details">
                  {brand.email && (
                    <div>
                      <p className="contact-detail__label">{info.email_label}</p>
                      <p className="contact-detail__value"><a href={`mailto:${brand.email}`} aria-label={`${info.email_label}: ${brand.email}`}>{brand.email}</a></p>
                    </div>
                  )}
                  {brand.response_time && (
                    <div>
                      <p className="contact-detail__label">{info.response_label}</p>
                      <p className="contact-detail__value">{brand.response_time}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="contact-form-wrap reveal">
              {phase !== "done" && (
                <div id="inquiry-form-wrap" ref={formWrap}>
                  <form
                    className="contact-form"
                    id="inquiry-form"
                    aria-label={hero.eyebrow || info.title}
                    noValidate
                    onSubmit={(e) => { e.preventDefault(); submit(); }}
                  >
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="field-name">{f.name_label}</label>
                        <input type="text" id="field-name" name="name" placeholder={f.name_placeholder} autoComplete="name" required aria-required="true" maxLength={100} value={form.name} onChange={set("name")} />
                      </div>
                      <div className="form-field">
                        <label htmlFor="field-email">{f.email_label}</label>
                        <input type="email" id="field-email" name="email" placeholder={f.email_placeholder} autoComplete="email" required aria-required="true" maxLength={254} value={form.email} onChange={set("email")} />
                      </div>
                    </div>

                    <div className="form-row">
                      <SelectField id="field-type" name="project_type" label={f.type_label} placeholder={f.type_placeholder} options={f.project_types} value={form.project_type} onChange={set("project_type")} />
                      <SelectField id="field-budget" name="budget" label={f.budget_label} placeholder={f.budget_placeholder} options={f.budget_ranges} value={form.budget} onChange={set("budget")} />
                    </div>

                    <div className="form-row">
                      <SelectField id="field-timeline" name="timeline" label={f.timeline_label} placeholder={f.timeline_placeholder} options={f.timelines} value={form.timeline} onChange={set("timeline")} full />
                    </div>

                    <div className="form-row">
                      <div className="form-field form-full">
                        <label htmlFor="field-message">{f.message_label}</label>
                        <textarea id="field-message" name="message" required aria-required="true" maxLength={5000} value={form.message} onChange={set("message")} placeholder={f.message_placeholder} />
                      </div>
                    </div>

                    <div className="hp-field" aria-hidden="true">
                      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                    </div>

                    <div className="form-error" id="form-error" ref={errBox} role="alert" aria-live="polite" style={{ display: error ? "block" : "none" }}>
                      <p id="form-error-text">{error}</p>
                    </div>

                    <div className="form-submit">
                      {note && <p className="form-note">{note}</p>}
                      <button type="submit" className="btn btn-submit" id="btn-submit" aria-disabled={sending || undefined} aria-busy={sending || undefined}>
                        <span className="btn-label" id="btn-label">{sending ? f.sending_label : f.submit_label}</span>
                        <span className="btn-arrow" aria-hidden="true" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div
                className="form-success"
                id="form-success"
                ref={success}
                role="status"
                aria-live="polite"
                aria-label={ok.title}
                style={{ display: phase === "done" ? "flex" : "none" }}
              >
                <div className="form-success__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg></div>
                <h2 className="form-success__title">{ok.title}</h2>
                <p className="form-success__body">{ok.body}</p>
                {ok.back_label && <Btn href="/" label={ok.back_label} className="btn--visible" />}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
