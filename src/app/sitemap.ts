import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { blogEnabled, siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!blogEnabled) return [{ url: siteUrl, priority: 1 }];
  const posts = await getAllPosts();
  return [
    { url: siteUrl, priority: 1 },
    { url: `${siteUrl}/blog`, lastModified: posts[0]?.date, priority: 0.8 },
    ...posts.map((p) => ({
      url: `${siteUrl}/blog/${p.slug}`,
      lastModified: p.date,
      priority: 0.7,
    })),
  ];
}
