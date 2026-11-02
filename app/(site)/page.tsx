import HomeView from "@/components/HomeView";
import JsonLd from "@/components/JsonLd";
import { SITE_DESCRIPTION, page_meta } from "@/lib/site";

export const metadata = page_meta({ path: "/", description: SITE_DESCRIPTION });

export default function Page() {
  return (
    <>
      <JsonLd />
      <HomeView />
    </>
  );
}
