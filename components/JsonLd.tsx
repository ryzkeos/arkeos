import { DEFAULTS } from "@/defaults";
import { SITE_DESCRIPTION, SITE_NAME, abs_url } from "@/lib/site";

export default function JsonLd() {
  const url = abs_url("/");
  const brand = DEFAULTS.shared.brand;
  const graph = [
    {
      "@type": "Organization",
      "@id": `${url}#organization`,
      name: SITE_NAME,
      url,
      logo: abs_url("/apple-icon.png"),
      email: brand.email,
      foundingDate: String(brand.founded_year),
      description: SITE_DESCRIPTION,
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
      "@type": "ProfessionalService",
      "@id": `${url}#service`,
      name: SITE_NAME,
      url,
      description: SITE_DESCRIPTION,
      serviceType: ["Web development", "System development", "Software development"],
      provider: { "@id": `${url}#organization` },
    },
  ];
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
