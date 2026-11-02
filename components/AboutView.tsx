"use client";
import { useMemo } from "react";
import { dbPublicUrl } from "@/lib/db";
import { fill_vars } from "@/lib/copy";
import { useCopy, useCopyVars } from "@/lib/use_copy";
import { useArkeosAnimations } from "@/hooks/useArkeosAnimations";
import { use_stats } from "@/hooks/use_stats";
import { useProjects } from "@/lib/useContent";
import { useSiteSettingsLoaded } from "./SiteSettings";
import HeroLayout from "./hero/HeroLayout";
import SectionHeader from "./SectionHeader";
import CtaSection from "./CtaSection";

function pickImage(value?: string): string | null {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  return /^(https?:)?\/\//.test(raw) || raw.startsWith("/") ? raw : dbPublicUrl("", raw);
}

export default function AboutView() {
  const loaded = useSiteSettingsLoaded();
  const copy = useCopy("about");
  const vars = useCopyVars();
  const t = (text: string) => fill_vars(text, vars);
  const projects = useProjects();
  const stats = use_stats();
  const ready = loaded && projects !== null;
  useArkeosAnimations({ pageHero: true, ready });

  const name = String(vars.name);
  const story = copy.story_paragraphs;
  const values = copy.values_items;
  const team = copy.team_members;
  const storyImage = pickImage(copy.about_image);
  const wideImage = pickImage(copy.about_image_wide);
  const hasAny =
    story.length > 0 || stats.length > 0 || values.length > 0 || team.length > 0 || !!storyImage || !!wideImage;
  const hero = { ...copy.hero, sub: t(copy.hero.sub) };
  const section = (c: typeof copy.story) => ({ ...c, intro: t(c.intro) });

  return (
    <main className="pg-about">
      <HeroLayout variant="full" ariaLabel={hero.lines.join(" ")} copy={hero} />

      {loaded && story.length + (storyImage ? 1 : 0) > 0 && (
        <section id="story" aria-label={copy.story.label}>
          <SectionHeader copy={section(copy.story)} />
          <div className={storyImage && story.length > 0 ? "story-grid" : "story-grid story-grid--solo"}>
            {story.length > 0 && (
              <div className="story-copy">
                {story.map((p, i) => (
                  <p key={i} className="reveal">{t(p)}</p>
                ))}
              </div>
            )}
            {storyImage && (
              <div className="about-img-wrap">
                <img decoding="async" src={storyImage} alt={copy.story.label} loading="lazy" />
              </div>
            )}
          </div>
        </section>
      )}

      {ready && stats.length > 0 && (
        <section id="stats" aria-label={copy.stats.label}>
          <SectionHeader copy={section(copy.stats)} />
          <div className="stats-grid" role="list">
            {stats.map((s) => (
              <div key={s.label} className="stat-item reveal" role="listitem">
                <div className="stat-num" data-counter={s.n} aria-label={String(s.n)}>0</div>
                <h3 className="stat-label">{s.label}</h3>
                {s.desc && <p className="stat-desc">{t(s.desc)}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {loaded && values.length > 0 && (
        <section id="values" aria-label={copy.values.label}>
          <SectionHeader copy={section(copy.values)} />
          <div className="val-grid" role="list">
            {values.map((v, i) => (
              <div key={v.title} className="val-item sweep-line sweep-line--bottom reveal" role="listitem" data-num={String(i + 1).padStart(2, "0")}>
                <span className="val-num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="val-title">{v.title}</h3>
                {v.desc && <p className="val-desc">{t(v.desc)}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {loaded && team.length > 0 && (
        <section id="team" aria-label={copy.team.label}>
          <SectionHeader copy={section(copy.team)} />
          <div className="team-grid" role="list" id="team-grid">
            {team.map((m) => (
              <article key={m.name} className="team-card reveal" role="listitem" aria-label={m.name}>
                {m.photo && (
                  <div className="team-card__photo">
                    <img decoding="async" src={m.photo} alt={m.name} loading="lazy" />
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
            <img decoding="async" src={wideImage} alt={name} loading="lazy" />
          </div>
        </div>
      )}

      {loaded && !hasAny && (
        <section className="about-empty">
          <p>{copy.empty_text}</p>
        </section>
      )}

      <CtaSection />
    </main>
  );
}
