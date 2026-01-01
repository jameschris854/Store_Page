/*
Prerender script (CommonJS)
- Starts a static SPA server serving `dist/`
- Uses Puppeteer to visit routes and save rendered HTML into `dist/<route>/index.html`

Run AFTER `vite build`
*/

const http = require("http");
const handler = require("serve-handler");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const DIST_DIR = path.resolve(__dirname, "../dist");
const PORT = 4173;

// Trailing slash is important for static hosting
const routes = ["/", "/collections/"];

async function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      return handler(req, res, {
        public: DIST_DIR,

        // 🔑 SPA fallback — VERY IMPORTANT
        rewrites: [{ source: "**", destination: "/index.html" }],
      });
    });

    server.listen(PORT, (err) => {
      if (err) return reject(err);
      resolve(server);
    });
  });
}

async function prerender() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error("❌ dist folder not found. Run `vite build` first.");
    process.exit(1);
  }

  console.log("🧱 Prerendering routes:", routes);

  const server = await startServer();
  console.log(`🚀 Static server running at http://localhost:${PORT}`);

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  for (const route of routes) {
    try {
      const url = `http://localhost:${PORT}${route}`;
      console.log("➡️ Rendering", url);

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      // Wait for React to hydrate
      await page.waitForSelector("#root", { timeout: 10000 });

      const html = await page.content();

      const outPath =
        route === "/"
          ? path.join(DIST_DIR, "index.html")
          : path.join(DIST_DIR, route.replace(/^\/|\/$/g, ""), "index.html");

      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, html, "utf8");

      console.log("✅ Wrote", outPath);
    } catch (err) {
      console.error("❌ Failed to prerender", route, err);
    }
  }

  // 🔍 Generate sitemap.xml
  try {
    const baseUrl =
      process.env.SITE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:5173");

    const lastmod = new Date().toISOString().split("T")[0];

    const urlEntries = routes
      .map((r) => {
        const loc = r === "/" ? `${baseUrl}/` : `${baseUrl}${r}`;
        return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      })
      .join("\n");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

    const sitemapPath = path.join(DIST_DIR, "sitemap.xml");
    fs.writeFileSync(sitemapPath, sitemap, "utf8");

    console.log("🗺️ Sitemap written to", sitemapPath);
  } catch (e) {
    console.warn("⚠️ Sitemap generation failed:", e?.message || e);
  }

  await browser.close();
  server.close();

  console.log("🎉 Prerender complete.");
}

prerender().catch((err) => {
  console.error(err);
  process.exit(1);
});
