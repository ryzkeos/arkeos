import type { Metadata } from "next";
import ContactView from "@/components/ContactView";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a project inquiry with your scope, budget and timeline.",
  openGraph: {
    title: "Contact | ARKEOS",
    description: "Send a project inquiry with your scope, budget and timeline.",
  },
};

export default function Page() {
  return <ContactView />;
}
