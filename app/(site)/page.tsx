import HomeView from "@/components/HomeView";
import JsonLd from "@/components/JsonLd";
import { SITE_DESCRIPTION, SITE_NAME, SITE_SUMMARY, page_meta } from "@/lib/site";

const TITLE = `${SITE_NAME} | ${SITE_SUMMARY}`;

export const metadata = page_meta({ path: "/", title: { absolute: TITLE }, share_title: TITLE, description: SITE_DESCRIPTION });

export default function Page() {
  return (
    <>
      <JsonLd />
      <HomeView />
    </>
  );
}
