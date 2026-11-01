import type { Metadata } from "next";
import ProjectsView from "@/components/ProjectsView";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects by ARKEOS.",
  openGraph: {
    title: "Projects | ARKEOS",
    description: "Selected projects by ARKEOS.",
  },
};

export default function Page() {
  return <ProjectsView />;
}
