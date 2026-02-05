import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin/", "/private/"], // 필요한 경우 수정
        },
        sitemap: "https://taehyun-devlog.vercel.app/sitemap.xml",
    };
}
