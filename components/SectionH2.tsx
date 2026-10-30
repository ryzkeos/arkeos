type Props = { lines: string[]; as?: "h1" | "h2"; className?: string };

export default function SectionH2({ lines, as: Tag = "h2", className = "" }: Props) {
  return (
    <Tag className={`section-h2 ${className}`.trim()}>
      {lines.map((l) => (
        <span key={l}><em>{l}</em></span>
      ))}
    </Tag>
  );
}
