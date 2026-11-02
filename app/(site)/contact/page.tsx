import { page_meta } from "@/lib/site";
import ContactView from "@/components/ContactView";

export const metadata = page_meta({
  path: "/contact",
  title: "Contact",
  share_title: "Arkeos | Contact",
  description: "Start a web or system development project with Arkeos. Send your scope, budget and timeline.",
});

export default function Page() {
  return <ContactView />;
}
