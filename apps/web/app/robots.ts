import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/assessment", "/roadmap", "/learn", "/resume", "/settings", "/onboarding", "/api"],
      },
    ],
    sitemap: `${process.env.BETTER_AUTH_URL ?? "https://gradifyhub.com"}/sitemap.xml`,
  };
}
