import Link from "next/link";

type Props = {
  href: string;
  label: string;
  ariaLabel?: string;
  id?: string;
  className?: string;
  children?: never;
};

export default function Btn({ href, label, ariaLabel, id, className }: Props) {
  return (
    <Link href={href} id={id} className={`btn${className ? ` ${className}` : ""}`} aria-label={ariaLabel ?? label}>
      <span className="btn-label">{label}</span>
      <span className="btn-arrow" aria-hidden="true" />
    </Link>
  );
}
