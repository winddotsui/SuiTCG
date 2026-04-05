import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.wavetcgmarket.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/marketplace`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/sell`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/optcg`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/oracle`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/deckbuilder`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/price-checker`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/alerts`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/users`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/analytics`, lastModified: new Date(), changeFrequency: "daily", priority: 0.5 },
    { url: `${base}/download`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];
}
