import type { Metadata } from "next";
import ProjectsView from "@/components/ProjectsView";

export const metadata: Metadata = {
  title: { absolute: "Work | ARKEOS" },
  description: "Selected projects by ARKEOS.",
  openGraph: {
    title: "Work | ARKEOS",
    description: "Selected projects by ARKEOS.",
  },
};

export default function Page() {
  return <ProjectsView />;
}
