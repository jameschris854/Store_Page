/**
 * LOCAL PRERENDER SCRIPT - CORRECT FOR SPA
 * 
 * This script:
 * 1. Builds your app to dist/
 * 2. Prerenders each route
 * 3. Saves HTML to dist/<route>/index.html
 * 4. Generates sitemap.xml and robots.txt in dist/
 * 5. You commit dist/ folder
 * 
 * Usage: node prerender-local.js
 */

import { execSync } from 'child_process';
import { createServer } from 'http';
import handler from 'serve-handler';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import puppeteer from 'puppeteer';

// ========== CONFIG ==========
const SITE_URL = 'https://ijsstationery.in';
const ROUTES = ['/', '/collections'];
const DIST_DIR = './dist';
const PORT = 4173;

// ========== BUILD ==========
console.log('📦 Building app...');
execSync('npm run build', { stdio: 'inherit' });

if (!existsSync(DIST_DIR)) {
  console.error('❌ dist/ folder not found!');
  process.exit(1);
}

// ========== START SERVER ==========
const server = createServer((req, res) =>
  handler(req, res, {
    public: DIST_DIR,
    rewrites: [{ source: '**', destination: '/index.html' }],
  })
);
await new Promise(r => server.listen(PORT, r));
console.log('🚀 Server started on port', PORT);

// ========== PRERENDER ==========
const browser = await puppeteer.launch({ 
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();

console.log('\n📄 Prerendering routes...\n');

for (const route of ROUTES) {
  try {
    console.log(`   ${route}`);
    
    await page.goto(`http://localhost:${PORT}${route}`, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    const html = await page.content();
    
    // Save to dist/<route>/index.html
    const outPath = route === '/' 
      ? join(DIST_DIR, 'index.html')
      : join(DIST_DIR, route.replace(/^\/|\/$/g, ''), 'index.html');
    
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    
    console.log(`   ✅ ${outPath}`);
  } catch (err) {
    console.error(`   ❌ Failed: ${route} - ${err.message}`);
  }
}

await browser.close();
server.close();

// ========== GENERATE SITEMAP ==========
console.log('\n🗺️  Generating sitemap.xml...');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(route => `  <url>
    <loc>${SITE_URL}${route === '/' ? '' : route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

writeFileSync(join(DIST_DIR, 'sitemap.xml'), sitemap);
console.log('   ✅ dist/sitemap.xml');

// ========== GENERATE ROBOTS.TXT ==========
const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`;

writeFileSync(join(DIST_DIR, 'robots.txt'), robots);
console.log('   ✅ dist/robots.txt');

// ========== SUMMARY ==========
console.log('\n🎉 PRERENDER COMPLETE!\n');
console.log('📁 Files created in dist/:');
console.log('   - index.html (prerendered)');
ROUTES.filter(r => r !== '/').forEach(r => {
  console.log(`   - ${r.replace(/^\/|\/$/g, '')}/index.html (prerendered)`);
});
console.log('   - sitemap.xml');
console.log('   - robots.txt');
console.log('   - assets/ (JS/CSS)');

console.log('\n📝 Next steps:');
console.log('   1. Remove dist/ from .gitignore');
console.log('   2. git add dist/');
console.log('   3. git commit -m "Add prerendered pages"');
console.log('   4. git push');

console.log('\n📋 vercel.json should have:');
console.log('   {');
console.log('     "buildCommand": "echo \'Using prebuilt dist\'",');
console.log('     "outputDirectory": "dist"');
console.log('   }');

process.exit(0);