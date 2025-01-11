import { ghostApi } from "@/app/(doc)/blog/constants";
import { env } from "@/lib/env";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogRoutes = ghostApi
    ? await ghostApi.posts.browse({
        limit: 100,
      })
    : undefined;

  return [
    {
      url: `${env.NEXT_PUBLIC_SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${env.NEXT_PUBLIC_SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...(blogRoutes
      ? blogRoutes.map((post) => ({
          url: `${env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
          lastModified: new Date(post.updated_at || Date.now()),
          changeFrequency: "daily" as const,
          priority: 0.9,
        }))
      : []),
    {
      url: `${env.NEXT_PUBLIC_SITE_URL}/support`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
