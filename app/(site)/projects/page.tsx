import { page_meta } from "@/lib/site";
import ProjectsView from "@/components/ProjectsView";

export const metadata = page_meta({ path: "/projects", description:
  "Selected websites and systems by Arkeos. Quality output, rich visuals and smooth animations, lightweight and responsive on any device." });

export default function Page() {
  return <ProjectsView />;
}
