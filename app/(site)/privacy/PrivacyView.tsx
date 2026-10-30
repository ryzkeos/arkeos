"use client";
import "@/styles/privacy.css";
import Link from "next/link";
import { getIdentity } from "@/lib/content";
import { useSiteSettings } from "@/components/SiteSettings";

export default function PrivacyView({ updated }: { updated: string }) {
  const settings = useSiteSettings();
  const { name, email } = getIdentity(settings);

  return (
    <main className="pg-privacy">
      <article className="privacy" aria-label="Privacy policy">
        <header className="privacy__head">
          <span className="section-lbl">Legal</span>
          <h1 className="privacy__title">PRIVACY POLICY</h1>
          <p className="privacy__updated">Last updated: {updated}</p>
        </header>

        <section className="privacy__sec">
          <h2>Overview</h2>
          <p>
            This page explains what personal data this website collects and how it is handled. {name} is the owner of this website.
          </p>
        </section>

        <section className="privacy__sec">
          <h2>Inquiry form</h2>
          <p>When you send an inquiry through the contact form, the following details are stored:</p>
          <ul>
            <li>name</li>
            <li>email address</li>
            <li>project type</li>
            <li>budget range</li>
            <li>timeline</li>
            <li>your message</li>
          </ul>
          <p>This data is used to read and answer your inquiry.</p>
        </section>

        <section className="privacy__sec">
          <h2>Page views</h2>
          <p>
            When a page is opened, the site records the page path and the time of the visit in an analytics table. This record is not linked to your name or email address.
          </p>
        </section>

        <section className="privacy__sec">
          <h2>Where data is stored</h2>
          <p>
            Inquiries and page view records are stored in the studio&apos;s hosted database. Access is limited to the studio through its admin panel.
          </p>
        </section>

        <section className="privacy__sec">
          <h2>Your rights</h2>
          <p>
            This website follows the Data Privacy Act of 2012 (Republic Act No. 10173) of the Philippines. Under this law you may ask to see the personal data we hold about you, ask us to correct it, ask us to delete or block it, object to its processing, and withdraw your consent. You may also file a complaint with the National Privacy Commission.
          </p>
        </section>

        <section className="privacy__sec">
          <h2>Contact</h2>
          {email ? (
            <p>
              To make a request about your data, write to <a href={`mailto:${email}`}>{email}</a>.
            </p>
          ) : (
            <p>
              To make a request about your data, use the form on the <Link href="/contact">contact page</Link>.
            </p>
          )}
        </section>
      </article>
    </main>
  );
}
