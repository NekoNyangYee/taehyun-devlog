/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://taehyun-devlog.vercel.app", // 본인 도메인
  generateRobotsTxt: true,
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
