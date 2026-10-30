"use client";
import "@/styles/contact.css";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { sbSubmitInquiry } from "@/lib/supabase";
import { useArkeosAnimations } from "@/hooks/useArkeosAnimations";
import PageHero from "./PageHero";

const EMAIL = "hello@arkeos.studio";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Form = { name: string; email: string; project_type: string; budget: string; timeline: string; message: string };
const EMPTY: Form = { name: "", email: "", project_type: "", budget: "", timeline: "", message: "" };

export default function ContactView() {
  useArkeosAnimations({ pageHero: true });

  const [form, setForm] = useState<Form>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [phase, setPhase] = useState<"form" | "leaving" | "done">("form");
  const formWrap = useRef<HTMLDivElement>(null);
  const success = useRef<HTMLDivElement>(null);
  const errBox = useRef<HTMLDivElement>(null);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (error && errBox.current && !prefersReducedMotion())
      gsap.from(errBox.current, { opacity: 0, y: 8, duration: 0.4, ease: "power2.out" });
  }, [error]);

  /* form fades out, then success fades in */
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
    const v = Object.fromEntries(Object.entries(form).map(([k, x]) => [k, x.trim()])) as Form;
    if (!v.name || !v.email || !v.project_type || !v.budget || !v.timeline || !v.message)
      return "Please fill in all fields before submitting.";
    if (!EMAIL_RE.test(v.email)) return "Please enter a valid email address.";
    return null;
  };

  const submit = async () => {
    if (sending) return;
    setError(null);
    const problem = validate();
    if (problem) return setError(problem);

    setSending(true);
    try {
      await sbSubmitInquiry(Object.fromEntries(Object.entries(form).map(([k, x]) => [k, x.trim()])));
      setPhase("leaving");
    } catch (err) {
      const msg = err instanceof TypeError
        ? `Network error. Please email us directly at ${EMAIL}.`
        : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="pg-contact">
      <PageHero
        grouped
        ariaLabel="Contact page hero"
        ghost="CONTACT"
        label="Start a Project"
        lines={["LET'S", "TALK."]}
        sub="Fill in the brief below and we'll respond within 48 hours. No sales calls. No NDAs before hello. Just a direct conversation about what you're building."
      />

      <section id="contact" aria-label="Client inquiry form">
        <div className="contact-layout">
          <div className="contact-info reveal">
            <h2 className="contact-info__title">TELL US EVERYTHING.</h2>
            <p className="contact-info__body">
              The more context you give us, the better the conversation we can have. Don&apos;t hold back — scope, budget, timeline, the politics of the project — we can handle it.
            </p>
            <div className="contact-details">
              <div>
                <p className="contact-detail__label">Email</p>
                <p className="contact-detail__value"><a href={`mailto:${EMAIL}`} aria-label="Send email to Arkeos">{EMAIL}</a></p>
              </div>
              <div>
                <p className="contact-detail__label">Response Time</p>
                <p className="contact-detail__value">Within 48 hours, always.</p>
              </div>
              <div>
                <p className="contact-detail__label">Location</p>
                <p className="contact-detail__value">Remote-first. Timezone-flexible.</p>
              </div>
            </div>
          </div>

          <div className="contact-form-wrap reveal">
            {phase !== "done" && (
              <div id="inquiry-form-wrap" ref={formWrap}>
                <form
                  className="contact-form"
                  id="inquiry-form"
                  aria-label="Project inquiry form"
                  noValidate
                  onSubmit={(e) => { e.preventDefault(); submit(); }}
                >
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="field-name">Your Name</label>
                      <input type="text" id="field-name" name="name" placeholder="Full name" autoComplete="name" required aria-required="true" value={form.name} onChange={set("name")} />
                    </div>
                    <div className="form-field">
                      <label htmlFor="field-email">Email Address</label>
                      <input type="email" id="field-email" name="email" placeholder="your@email.com" autoComplete="email" required aria-required="true" value={form.email} onChange={set("email")} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="field-type">Project Type</label>
                      <select id="field-type" name="project_type" required aria-required="true" value={form.project_type} onChange={set("project_type")}>
                        <option value="" disabled>Select a type</option>
                        <option value="Web">Web Development</option>
                        <option value="Motion">Motion Design</option>
                        <option value="Interactive">Interactive Experience</option>
                        <option value="Branding">Branding System</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label htmlFor="field-budget">Budget Range</label>
                      <select id="field-budget" name="budget" required aria-required="true" value={form.budget} onChange={set("budget")}>
                        <option value="" disabled>Select a range</option>
                        <option value="Under $1k">Under $1,000</option>
                        <option value="$1k–$5k">$1,000 – $5,000</option>
                        <option value="$5k–$10k">$5,000 – $10,000</option>
                        <option value="$10k+">$10,000+</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field form-full">
                      <label htmlFor="field-timeline">Timeline</label>
                      <select id="field-timeline" name="timeline" required aria-required="true" value={form.timeline} onChange={set("timeline")}>
                        <option value="" disabled>When do you need this?</option>
                        <option value="ASAP">ASAP</option>
                        <option value="1 Month">Within 1 Month</option>
                        <option value="3 Months">Within 3 Months</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field form-full">
                      <label htmlFor="field-message">Tell Us About the Project</label>
                      <textarea id="field-message" name="message" required aria-required="true" value={form.message} onChange={set("message")}
                        placeholder="What are you building? What's the goal? What's broken about the current state of things? Give us everything." />
                    </div>
                  </div>

                  <div className="form-error" id="form-error" ref={errBox} role="alert" aria-live="polite" style={{ display: error ? "block" : "none" }}>
                    <p id="form-error-text">{error}</p>
                  </div>

                  <div className="form-submit">
                    <button type="submit" className="btn btn-submit" id="btn-submit" aria-label="Submit project inquiry" aria-disabled={sending || undefined}>
                      <span className="btn-label" id="btn-label">{sending ? "Sending…" : "Send Inquiry"}</span>
                      <span className="btn-arrow" aria-hidden="true" />
                    </button>
                    <p className="form-note">We respond within 48 hours.</p>
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
              aria-label="Form submitted successfully"
              style={{ display: phase === "done" ? "flex" : "none" }}
            >
              <div className="form-success__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg></div>
              <h2 className="form-success__title">INQUIRY RECEIVED.</h2>
              <p className="form-success__body">
                We&apos;ve got your brief and we&apos;re already thinking about it. Expect a response within 48 hours — usually sooner. Talk soon.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
