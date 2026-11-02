import { getIdentity } from "@/lib/content";
import { load_settings } from "@/lib/server_content";
import { SITE_DESCRIPTION, SITE_NAME, abs_url } from "@/lib/site";
import { getSocials } from "@/lib/socials";

const SERVICE_TYPES = ["Web development", "System development", "Software development"];

export default async function JsonLd() {
  const settings = await load_settings();
  const identity = getIdentity(settings);
  const same_as = getSocials(settings).map((s) => s.href);
  const url = abs_url("/");
  const graph = [
    {
      "@type": "Organization",
      "@id": `${url}#organization`,
      name: SITE_NAME,
      url,
      logo: abs_url("/apple-icon.png"),
      email: identity.email,
      foundingDate: String(identity.foundedYear),
      description: SITE_DESCRIPTION,
      areaServed: "Worldwide",
      knowsAbout: SERVICE_TYPES,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: identity.email,
        availableLanguage: "English",
        url: abs_url("/contact"),
      },
      ...(same_as.length > 0 ? { sameAs: same_as } : {}),
    },
    {
      "@type": "WebSite",
      "@id": `${url}#website`,
      url,
      name: SITE_NAME,
      alternateName: `${SITE_NAME} Studio`,
      inLanguage: "en",
      publisher: { "@id": `${url}#organization` },
    },
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name: "Web & System Development",
      url,
      description: SITE_DESCRIPTION,
      serviceType: SERVICE_TYPES,
      areaServed: "Worldwide",
      provider: { "@id": `${url}#organization` },
    },
  ];
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
