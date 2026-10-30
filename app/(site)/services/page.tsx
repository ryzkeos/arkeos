import type { Metadata } from "next";
import "@/styles/services.css";
import PageEffects from "@/components/PageEffects";
import PageHero from "@/components/PageHero";
import SectionH2 from "@/components/SectionH2";
import CtaSection from "@/components/CtaSection";

export const metadata: Metadata = {
  title: { absolute: "Services — ARKEOS Creative Studio" },
  description:
    "What Arkeos builds: premium web development, cinematic motion design, interactive experiences, branding systems, performance auditing, and ongoing maintenance.",
  openGraph: {
    title: "Services — ARKEOS Creative Studio",
    description: "Six disciplines. One obsession: work that refuses to be forgotten.",
  },
};

const SERVICES = [
  {
    title: "WEB DEVELOPMENT", price: "From $3,500",
    desc: "Custom-built digital experiences engineered for performance, precision, and permanence. We write code the way a craftsman works wood — every line intentional, nothing wasted. No templates. No shortcuts. No compromises.",
    tags: ["Vanilla JS", "GSAP", "Next.js", "Webflow", "CMS"],
    icon: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
  },
  {
    title: "MOTION DESIGN", price: "From $2,000",
    desc: "Cinematic animation and interactive storytelling that transforms the emotional response to your brand. From micro-interactions that reward attention to full-scale title sequences that demand it — motion is how we make people feel.",
    tags: ["GSAP", "After Effects", "Lottie", "Three.js"],
    icon: <polygon points="5 3 19 12 5 21 5 3" />,
  },
  {
    title: "INTERACTIVE EXPERIENCES", price: "From $5,000",
    desc: "Experiences that respond, react, and reward. WebGL environments, cursor-reactive layouts, scroll-driven narratives — we build the spaces people explore, not just the pages people read. Designed for wonder, optimized for humans.",
    tags: ["WebGL", "Three.js", "Canvas", "ScrollTrigger"],
    icon: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
  },
  {
    title: "BRANDING SYSTEMS", price: "From $4,000",
    desc: "Visual identity built to dominate. Not just a logo — a complete system of marks, typography, color, motion, and voice that owns its category on sight. We build brands with the same precision we bring to code — systematic, scalable, unmistakable.",
    tags: ["Identity", "Typography", "Motion ID", "Guidelines"],
    icon: <><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></>,
  },
  {
    title: "PERFORMANCE AUDITING", price: "From $800",
    desc: "A slow site isn't just annoying — it's revenue walking out the door. We forensically audit your existing platform: Core Web Vitals, render-blocking assets, animation jank, layout shift, and everything else that costs you users before they see your first word.",
    tags: ["Core Web Vitals", "Lighthouse", "Bundle Analysis", "CLS/LCP/FID"],
    icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  },
  {
    title: "MAINTENANCE PLANS", price: "From $350/mo",
    desc: "Your site after launch is still our site. Monthly retainers covering content updates, dependency management, performance monitoring, security patches, and priority support. We built it — we know exactly where the bodies are buried.",
    tags: ["Retainer", "Updates", "Monitoring", "Priority Support"],
    icon: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />,
  },
];

const PROCESS = [
  { title: "DISCOVERY", desc: "We start by understanding what you're actually trying to dominate — not just what you want the site to look like. Goals, competitors, audiences, constraints. No guessing." },
  { title: "DIRECTION", desc: "Creative direction delivered as a tight brief — visual language, motion philosophy, copy tone, interaction patterns. You see the vision before a single line of code is written." },
  { title: "BUILD", desc: "We build in full fidelity from day one. No wireframes that don't match the output. Weekly check-ins. You always know exactly where your project stands." },
  { title: "LAUNCH", desc: "Deployment is a ceremony, not an afterthought. Performance testing, accessibility audit, cross-browser QA, and a launch checklist that leaves nothing to chance." },
];

export default function ServicesPage() {
  return (
    <main className="pg-services">
      <PageEffects />
      <PageHero
        ariaLabel="Services page hero"
        ghost="SERVICES"
        label="What We Build"
        lines={["SIX", "DISCIPLINES."]}
        sub="One obsession. Every service we offer is built to make your category irrelevant — because you'll own it."
      />

      <section id="services" aria-label="Studio services">
        <div>
          <span className="section-lbl">Our Capabilities</span>
          <SectionH2 lines={["WHAT", "WE DO."]} />
        </div>
        <div className="svc-grid" role="list">
          {SERVICES.map((s, i) => (
            <article key={s.title} className="svc-row reveal" role="listitem" aria-label={`Service: ${s.title}`}>
              <div className="svc-ico" aria-hidden="true"><svg viewBox="0 0 24 24">{s.icon}</svg></div>
              <div className="svc-body">
                <p className="svc-num">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="svc-title">{s.title}</h3>
                <p className="svc-desc">{s.desc}</p>
                <div className="svc-tags">{s.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
              </div>
              <div className="svc-meta"><span className="svc-price">{s.price}</span></div>
            </article>
          ))}
        </div>
      </section>

      <section id="process" aria-label="Our process">
        <span className="section-lbl">How We Work</span>
        <SectionH2 lines={["THE", "PROCESS."]} />
        <div className="process-grid" role="list">
          {PROCESS.map((p, i) => (
            <div key={p.title} className="process-step reveal" role="listitem">
              <div className="process-step__num">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="process-step__title">{p.title}</h3>
              <p className="process-step__desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaSection />
    </main>
  );
}
