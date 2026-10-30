"use client";
import { useMemo } from "react";
import { STATIC_IDENTITY } from "@/data";
import { dbPublicUrl } from "@/lib/db";
import { getIdentity, getStats, getStory, getTeam, getValues } from "@/lib/content";
import { useArkeosAnimations } from "@/hooks/useArkeosAnimations";
import { useSiteSettings, useSiteSettingsLoaded } from "./SiteSettings";
import PageHero from "./PageHero";
import SectionH2 from "./SectionH2";
import CtaSection from "./CtaSection";

function pickImage(fromSettings?: string, fromStatic?: string): string | null {
  const raw = [fromSettings, fromStatic].find((v) => typeof v === "string" && v.trim());
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  return /^(https?:)?\/\//.test(value) || value.startsWith("/") ? value : dbPublicUrl("", value);
}

export default function AboutView() {
  const settings = useSiteSettings();
  const loaded = useSiteSettingsLoaded();
  useArkeosAnimations({ pageHero: true, ready: loaded });

  const content = useMemo(
    () => ({
      name: getIdentity(settings).name,
      story: getStory(settings),
      stats: getStats(settings),
      values: getValues(settings),
      team: getTeam(settings),
      storyImage: pickImage(settings.about_image, STATIC_IDENTITY.aboutImage),
      wideImage: pickImage(settings.about_image_wide, STATIC_IDENTITY.aboutImageWide),
    }),
    [settings]
  );

  const { name, story, stats, values, team, storyImage, wideImage } = content;
  const hasAny =
    story.length > 0 || stats.length > 0 || values.length > 0 || team.length > 0 || !!storyImage || !!wideImage;

  return (
    <main className="pg-about">
      <PageHero
        grouped
        ariaLabel="About page hero"
        ghost="STUDIO"
        label="The Studio"
        lines={["ABOUT", "THE STUDIO."]}
        sub={`The story, values and people behind ${name}.`}
      />

      {loaded && story.length + (storyImage ? 1 : 0) > 0 && (
        <section id="story" aria-label="Studio story">
          <span className="section-lbl">Our Story</span>
          <SectionH2 lines={["WHERE", "WE COME FROM."]} />
          <div className={storyImage && story.length > 0 ? "story-grid" : "story-grid story-grid--solo"}>
            {story.length > 0 && (
              <div className="story-copy">
                {story.map((p, i) => (
                  <p key={i} className="reveal">{p}</p>
                ))}
              </div>
            )}
            {storyImage && (
              <div className="about-img-wrap">
                <img src={storyImage} alt={`${name} studio`} loading="lazy" />
              </div>
            )}
          </div>
        </section>
      )}

      {loaded && stats.length > 0 && (
        <section id="stats" aria-label="Studio statistics">
          <span className="section-lbl">By the Numbers</span>
          <SectionH2 lines={["THE", "RECORD."]} />
          <div className="stats-grid" role="list">
            {stats.map((s) => (
              <div key={s.label} className="stat-item reveal" role="listitem">
                <div className="stat-num" data-counter={s.n} aria-label={String(s.n)}>0</div>
                <h3 className="stat-label">{s.label}</h3>
                {s.desc && <p className="stat-desc">{s.desc}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {loaded && values.length > 0 && (
        <section id="values" aria-label="Studio values">
          <span className="section-lbl">What We Stand For</span>
          <SectionH2 lines={["CORE", "VALUES."]} />
          <div className="val-grid" role="list">
            {values.map((v, i) => (
              <div key={v.title} className="val-item reveal" role="listitem">
                <span className="val-num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="val-title">{v.title}</h3>
                {v.desc && <p className="val-desc">{v.desc}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {loaded && team.length > 0 && (
        <section id="team" aria-label="Studio team">
          <span className="section-lbl">The People</span>
          <SectionH2 lines={["WHO", "WE ARE."]} />
          <div className="team-grid" role="list" id="team-grid">
            {team.map((m) => (
              <article key={m.name} className="team-card reveal" role="listitem" aria-label={`Team member: ${m.name}`}>
                {m.photo && (
                  <div className="team-card__photo">
                    <img src={m.photo} alt={`Portrait of ${m.name}`} loading="lazy" />
                  </div>
                )}
                <h3 className="team-card__name">{m.name.toUpperCase()}</h3>
                {m.role && <p className="team-card__role">{m.role}</p>}
                {m.bio && <p className="team-card__bio">{m.bio}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      {loaded && wideImage && (
        <div id="about-image">
          <div className="about-img-full about-img-wrap">
            <img src={wideImage} alt={`${name} studio space`} loading="lazy" />
          </div>
        </div>
      )}

      {loaded && !hasAny && (
        <section className="about-empty" aria-label="About">
          <p>Nothing to show yet.</p>
        </section>
      )}

      <CtaSection />
    </main>
  );
}
