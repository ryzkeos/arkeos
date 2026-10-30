import type { Metadata } from "next";
import "@/styles/about.css";
import PageEffects from "@/components/PageEffects";
import PageHero from "@/components/PageHero";
import SectionH2 from "@/components/SectionH2";
import CtaSection from "@/components/CtaSection";
import { TEAM } from "@/lib/data";

export const metadata: Metadata = {
  title: { absolute: "Studio — ARKEOS Creative Studio" },
  description:
    "Arkeos is a premium creative web and motion studio. We are obsessives, craftspeople, and strategists. This is our story.",
  openGraph: {
    title: "Studio — ARKEOS Creative Studio",
    description: "Obsessives, craftspeople, strategists. This is who we are.",
  },
};

const STATS = [
  { n: 47, label: "PROJECTS COMPLETED", desc: "Every single one delivered on time, on spec, and above expectation. No exceptions." },
  { n: 3, label: "YEARS ACTIVE", desc: "Three years of refusing to ship anything we wouldn't put our name on. That standard doesn't drop." },
  { n: 31, label: "CLIENTS SERVED", desc: "From solo founders to funded startups. Every client gets the same obsessive attention." },
];

const VALUES = [
  { title: "OBSESSION OVER PROCESS", desc: "We don't follow a process until it works. We stay obsessed until it's extraordinary. Frameworks are starting points, not finish lines." },
  { title: "CRAFT WITHOUT COMPROMISE", desc: "There is no \"good enough\" at Arkeos. Every pixel is intentional. Every millisecond of animation is choreographed. The details that most people skip are exactly where we live." },
  { title: "HONESTY IN FULL", desc: "We tell clients the truth, even when it's uncomfortable. If a brief is wrong, we say so. If a direction won't work, we explain why. Flattery doesn't ship great work." },
  { title: "PERFORMANCE IS NON-NEGOTIABLE", desc: "Beautiful and broken is not beautiful. Every experience we build is fast, accessible, and robust by default — not as an afterthought, not as an upgrade." },
];

export default function AboutPage() {
  return (
    <main className="pg-about">
      <PageEffects />
      <PageHero
        grouped
        ariaLabel="About page hero"
        ghost="STUDIO"
        label="The Studio"
        lines={["BUILT", "BY", "OBSESSIVES."]}
        sub="Arkeos exists because most digital work is forgettable. We built a studio that refuses to make anything that isn't worth remembering."
      />

      <section id="story" aria-label="Studio story">
        <span className="section-lbl">Our Story</span>
        <SectionH2 lines={["WHERE", "WE COME FROM."]} />
        <div className="story-grid">
          <div className="story-copy">
            <p className="reveal"><strong>Arkeos started as a rejection.</strong> A rejection of the agency model, of the template culture, of the race to the bottom that convinced clients that fast and cheap was the same as good. We knew there was another way — and we decided to build it instead of complain about it.</p>
            <p className="reveal">We started with a single principle: <strong>every project we touch becomes the best thing in its category.</strong> Not the most expensive. Not the most complex. The most effective, the most considered, the most impossible to ignore. Three years in, that principle hasn&apos;t moved an inch.</p>
            <p className="reveal">Today Arkeos operates at the intersection of engineering precision and art direction. We are motion designers who write production code. We are developers who think cinematically. The result is digital work that doesn&apos;t look like it came from a studio — it looks like it came from somewhere else entirely.</p>
          </div>
          {/* drop a studio image here. pure black is the intentional fallback. */}
          <div className="about-img-wrap" aria-label="Arkeos studio" />
        </div>
      </section>

      <section id="stats" aria-label="Studio statistics">
        <span className="section-lbl">By the Numbers</span>
        <SectionH2 lines={["THE", "RECORD."]} />
        <div className="stats-grid" role="list">
          {STATS.map((s) => (
            <div key={s.label} className="stat-item reveal" role="listitem">
              <div className="stat-num" data-counter={s.n} aria-label={String(s.n)}>0</div>
              <h3 className="stat-label">{s.label}</h3>
              <p className="stat-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="values" aria-label="Studio values">
        <span className="section-lbl">What We Stand For</span>
        <SectionH2 lines={["CORE", "VALUES."]} />
        <div className="val-grid" role="list">
          {VALUES.map((v, i) => (
            <div key={v.title} className="val-item reveal" role="listitem">
              <span className="val-num">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="val-title">{v.title}</h3>
              <p className="val-desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="team" aria-label="Studio team">
        <span className="section-lbl">The People</span>
        <SectionH2 lines={["WHO", "WE ARE."]} />
        <div className="team-grid" role="list" id="team-grid">
          {TEAM.map((m) => (
            <article key={m.name} className="team-card reveal" role="listitem" aria-label={`Team member: ${m.name}`}>
              <div className="team-card__photo" aria-hidden={m.photo ? "false" : "true"}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {m.photo && <img src={m.photo} alt={`Portrait of ${m.name}`} loading="lazy" />}
              </div>
              <h3 className="team-card__name">{m.name.toUpperCase()}</h3>
              <p className="team-card__role">{m.role}</p>
              <p className="team-card__bio">{m.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <div id="about-image" aria-label="Arkeos studio space">
        <div className="about-img-full about-img-wrap" aria-label="Studio environment" />
      </div>

      <CtaSection />
    </main>
  );
}
