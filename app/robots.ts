import { MetadataRoute } from "next";
import { SITE_URL } from "@components/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin/", "/private/"], // 필요한 경우 수정
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
