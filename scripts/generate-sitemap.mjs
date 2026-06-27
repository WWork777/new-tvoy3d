import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = "https://tvoy3d.ru";
const maxUrlsPerSitemap = 45000;

const citiesSource = await readFile(resolve(root, "src/data/cities.ts"), "utf8");
const servicesSource = await readFile(resolve(root, "src/data/services.ts"), "utf8");
const seoLandingSource = await readFile(resolve(root, "src/data/seoLandingPages.ts"), "utf8");
const blogSource = await readFile(resolve(root, "src/data/blog.ts"), "utf8");

const slugPattern = /["']?slug["']?\s*:\s*"([^"]+)"/g;
const citySlugs = [...new Set([...citiesSource.matchAll(slugPattern)].map((match) => match[1]))];
const serviceSlugs = [
  ...new Set([
    ...[...servicesSource.matchAll(slugPattern)].map((match) => match[1]),
    ...[...seoLandingSource.matchAll(slugPattern)].map((match) => match[1]),
  ]),
];
const blogSlugs = [...new Set([...blogSource.matchAll(slugPattern)].map((match) => match[1]))];

const basePaths = [
  "/",
  "/about",
  "/contact",
  "/gallery",
  "/blog",
  ...serviceSlugs.map((slug) => `/services/${slug}`),
  ...blogSlugs.map((slug) => `/blog/${slug}`),
];

const cityPaths = citySlugs.flatMap((city) => [
  `/${city}`,
  `/${city}/about`,
  `/${city}/contact`,
  `/${city}/gallery`,
  `/${city}/blog`,
  ...serviceSlugs.map((slug) => `/${city}/services/${slug}`),
  ...blogSlugs.map((slug) => `/${city}/blog/${slug}`),
]);

const today = new Date().toISOString().slice(0, 10);
const urls = [...basePaths, ...cityPaths];

const urlsetXml = (paths) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (path) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${path.includes("/services/") ? "weekly" : "monthly"}</changefreq>
    <priority>${path === "/" ? "1.0" : path.split("/").length <= 2 ? "0.9" : "0.8"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

const sitemapIndexXml = (files) => `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${files
  .map(
    (file) => `  <sitemap>
    <loc>${siteUrl}/${file}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`,
  )
  .join("\n")}
</sitemapindex>
`;

const chunks = [];
for (let index = 0; index < urls.length; index += maxUrlsPerSitemap) {
  chunks.push(urls.slice(index, index + maxUrlsPerSitemap));
}

await mkdir(resolve(root, "public"), { recursive: true });

if (chunks.length === 1) {
  await writeFile(resolve(root, "public/sitemap.xml"), urlsetXml(urls), "utf8");
  console.log(`Generated public/sitemap.xml with ${urls.length} URLs.`);
} else {
  const sitemapFiles = chunks.map((_, index) => `sitemap-${index + 1}.xml`);

  await Promise.all(
    chunks.map((chunk, index) =>
      writeFile(resolve(root, "public", sitemapFiles[index]), urlsetXml(chunk), "utf8"),
    ),
  );
  await writeFile(resolve(root, "public/sitemap.xml"), sitemapIndexXml(sitemapFiles), "utf8");
  console.log(
    `Generated public/sitemap.xml index with ${sitemapFiles.length} sitemaps and ${urls.length} URLs.`,
  );
}
