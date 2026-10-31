import type { Project } from "@/lib/types";
import ProjectCard, { type CardLayout } from "./ProjectCard";

const GROUP_MAX = 5;

const FULL: CardLayout[] = [
  { c: 7, r: 4, ct: 2, rt: 4, rm: 4 },
  { c: 5, r: 2, ct: 1, rt: 3, rm: 3 },
  { c: 5, r: 2, ct: 1, rt: 3, rm: 3 },
  { c: 5, r: 3, ct: 1, rt: 3, rm: 3 },
  { c: 7, r: 3, ct: 1, rt: 3, rm: 4 },
];

const LAYOUTS: Record<number, CardLayout[]> = {
  5: FULL,
  4: [FULL[0], FULL[1], FULL[2], { c: 12, r: 3, ct: 2, rt: 3, rm: 4 }],
  3: [FULL[0], FULL[1], FULL[2]],
  2: [{ c: 7, r: 4, ct: 1, rt: 4, rm: 4 }, { c: 5, r: 4, ct: 1, rt: 4, rm: 3 }],
  1: [{ c: 12, r: 4, ct: 2, rt: 4, rm: 4 }],
};

type Props = { projects: Project[] | null; variant: "home" | "grid"; id?: string };

export default function ProjectGrid({ projects, variant, id }: Props) {
  const list = projects ?? [];
  const groups: Project[][] = [];
  for (let i = 0; i < list.length; i += GROUP_MAX) groups.push(list.slice(i, i + GROUP_MAX));

  return (
    <div className="proj-groups" id={id} aria-busy={projects === null}>
      {groups.map((group, g) => (
        <div key={g} className="proj-grid" role="list">
          {group.map((p, i) => (
            <ProjectCard
              key={p.id ?? p.title}
              project={p}
              index={g * GROUP_MAX + i}
              variant={variant}
              layout={LAYOUTS[group.length][i]}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
