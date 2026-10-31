"use client";
import HeroLayout from "./hero/HeroLayout";

type Props = {
  ariaLabel: string;
  ghost: string;
  label: string;
  lines: string[];
  sub: string;
  grouped?: boolean;
};

export default function PageHero({ ariaLabel, ghost, label, lines, sub }: Props) {
  return (
    <HeroLayout
      variant="page"
      ariaLabel={ariaLabel}
      copy={{ eyebrow: label, lines, sub, ghost, cta: null }}
    />
  );
}
