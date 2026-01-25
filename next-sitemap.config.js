/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://taehyun-devlog.vercel.app", // 본인 도메인
  generateRobotsTxt: true,
  generateIndexSitemap: false, // ✅ 단일 파일로 통합
  sitemapSize: 7000,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  },
};
