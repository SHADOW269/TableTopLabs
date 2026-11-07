import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/account",
        "/profile",
        "/auth",
        "/write-review",
        "/reset-password",
        "/collection/cart",
        "/cart",
        "/collection/checkout",
        "/checkout",
        "/mods/checkout",
        "/order/",
        "/maintenance",
        "/unauthorized",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
