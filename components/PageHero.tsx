import SectionH2 from "./SectionH2";

type Props = {
  ariaLabel: string;
  ghost: string;
  label: string;
  lines: string[];
  sub: string;
  /** about + contact wrap label and title in one column */
  grouped?: boolean;
};

export default function PageHero({ ariaLabel, ghost, label, lines, sub, grouped }: Props) {
  const title = <SectionH2 as="h1" lines={lines} />;
  return (
    <section className="page-hero" aria-label={ariaLabel}>
      <div className="page-hero__ghost" aria-hidden="true">{ghost}</div>
      <div className="page-hero__body">
        {grouped ? (
          <div>
            <span className="section-lbl">{label}</span>
            {title}
          </div>
        ) : (
          <>
            <span className="section-lbl">{label}</span>
            {title}
          </>
        )}
        <p className="page-hero__sub">{sub}</p>
      </div>
    </section>
  );
}
