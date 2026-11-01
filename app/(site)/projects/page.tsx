import type { Metadata } from "next";
import ProjectsView from "@/components/ProjectsView";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects by Arkeos.",
  openGraph: {
    title: "Arkeos | Projects",
    description: "Selected projects by Arkeos.",
  },
};

export default function Page() {
  return <ProjectsView />;
}
