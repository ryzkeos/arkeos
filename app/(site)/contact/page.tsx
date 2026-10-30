import type { Metadata } from "next";
import ContactView from "@/components/ContactView";

export const metadata: Metadata = {
  title: { absolute: "Contact — ARKEOS Creative Studio" },
  description:
    "Start a project with Arkeos. Tell us what you're building and we'll tell you how we can make it the best in its category.",
  openGraph: {
    title: "Contact — ARKEOS Creative Studio",
    description: "Tell us what you're building. We'll make it the best in its category.",
  },
};

export default function Page() {
  return <ContactView />;
}
