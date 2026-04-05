import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/orders", "/profile"],
    },
    sitemap: "https://www.wavetcgmarket.com/sitemap.xml",
  };
}
