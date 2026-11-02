import type { MetadataRoute } from "next";
import { abs_url } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: abs_url("/sitemap.xml"),
  };
}
