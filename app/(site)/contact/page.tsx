import { page_meta } from "@/lib/site";
import ContactView from "@/components/ContactView";

export const metadata = page_meta({ path: "/contact", description:
  "Start a project with Arkeos. Send your scope, budget and timeline for a quality, lightweight build with rich visuals that works on any device." });

export default function Page() {
  return <ContactView />;
}
