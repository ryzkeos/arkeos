import { page_meta } from "@/lib/site";
import ProjectsView from "@/components/ProjectsView";

export const metadata = page_meta({
  path: "/projects",
  title: "Projects",
  share_title: "Arkeos | Projects",
  description: "Selected web, system and motion projects by Arkeos.",
});

export default function Page() {
  return <ProjectsView />;
}
