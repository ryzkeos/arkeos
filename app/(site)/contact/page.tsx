import { page_meta } from "@/lib/site";
import ContactView from "@/components/ContactView";

export const metadata = page_meta({
  path: "/contact",
  title: "Start a Project",
  share_title: "Arkeos | Start a Project",
  description: "Start a web or system development project with Arkeos. Send your scope, budget and timeline.",
});

export default function Page() {
  return <ContactView />;
}
