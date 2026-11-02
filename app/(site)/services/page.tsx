import { page_meta } from "@/lib/site";
import ServicesView from "@/components/ServicesView";

export const metadata = page_meta({ path: "/services", description:
  "Web, system and software development by Arkeos. Quality output, rich visuals and animations, lightweight builds that work on any device." });

export default function ServicesPage() {
  return <ServicesView />;
}
