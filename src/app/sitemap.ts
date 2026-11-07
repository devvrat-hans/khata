import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-11-07");
  return [
    { url: SITE.url, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/sign-in`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE.url}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
