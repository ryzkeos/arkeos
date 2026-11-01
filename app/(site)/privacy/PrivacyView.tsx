"use client";
import "@/styles/privacy.css";
import Link from "next/link";
import { fill_vars } from "@/lib/copy";
import { useCopy, useCopyVars } from "@/lib/use_copy";

export default function PrivacyView({ updated }: { updated: string }) {
  const copy = useCopy("privacy");
  const shared = useCopy("shared");
  const vars = useCopyVars();
  const t = (text: string) => fill_vars(text, vars);
  const email = shared.brand.email;
  const contact = shared.nav.find((n) => n.href === "/contact");
  const last = copy.sections.length - 1;

  return (
    <main className="pg-privacy">
      <article className="privacy" aria-label={t(copy.title)}>
        <header className="privacy__head">
          <span className="section-lbl">{copy.label}</span>
          <h1 className="privacy__title">{t(copy.title)}</h1>
          <p className="privacy__updated">{copy.updated_label} {updated}</p>
        </header>

        {copy.sections.map((sec, i) => (
          <section key={`${i}-${sec.heading}`} className="privacy__sec">
            <h2>{t(sec.heading)}</h2>
            {sec.paragraphs.map((p, j) => (
              <p key={j}>{t(p)}</p>
            ))}
            {i === last && email ? (
              <p><a href={`mailto:${email}`}>{email}</a></p>
            ) : null}
            {i === last && !email && contact ? (
              <p><Link href={contact.href}>{contact.label}</Link></p>
            ) : null}
          </section>
        ))}
      </article>
    </main>
  );
}
