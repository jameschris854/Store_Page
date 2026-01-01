/*
Prerender script (CommonJS)
- Start a simple static server serving `dist/`
- Use Puppeteer to visit routes and save rendered HTML into `dist/<route>/index.html`

Usage: run after `vite build`.
*/

const http = require('http');
const handler = require('serve-handler');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DIST_DIR = path.resolve(__dirname, '../dist');
const PORT = 4173;

// We prerender only top-level routes to keep builds fast and simple.
const routes = ['/', '/collections'];

async function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      return handler(req, res, { public: DIST_DIR });
    });
    server.listen(PORT, (err) => {
      if (err) return reject(err);
      resolve(server);
    });
  });
}

async function prerender() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('dist folder not found. Run `vite build` first.');
    process.exit(1);
  }

  console.log('Prerendering top-level routes:', routes);

  const server = await startServer();
  console.log(`Static server started at http://localhost:${PORT}`);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  for (const route of routes) {
    try {
      const url = `http://localhost:${PORT}${route}`;
      console.log('Rendering', url);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

      const html = await page.content();

      // Determine output path
      const outPath = route === '/' ? path.join(DIST_DIR, 'index.html') : path.join(DIST_DIR, route.replace(/^\//, ''), 'index.html');
      const outDir = path.dirname(outPath);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outPath, html, 'utf8');
      console.log('Wrote', outPath);
    } catch (err) {
      console.error('Failed to prerender', route, err);
    }
  }

  // Generate sitemap.xml in the dist folder from the prerendered routes
  try {
    const baseUrl = process.env.SITE_URL || process.env.BASE_URL || 'https://ijsstationery.vercel.app';
    const lastmod = new Date().toISOString().split('T')[0];
    const uniqRoutes = Array.from(new Set(routes));
    const urlEntries = uniqRoutes.map((r) => {
      const loc = r === '/' ? `${baseUrl}/` : `${baseUrl}${r}`;
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    }).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`;

    const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log('Wrote sitemap to', sitemapPath);
  } catch (e) {
    console.warn('Failed to generate sitemap.xml:', e && e.message ? e.message : e);
  }

  await browser.close();
  server.close();
  console.log('Prerender complete.');
}

prerender().catch((e) => {
  console.error(e);
  process.exit(1);
});
