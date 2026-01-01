# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    # IJS Stationery — SSG & SEO Guide

    This project uses a client-side React app combined with a prerender (SSG) step to produce SEO-friendly HTML for crawlers and social previews.

    What this repo provides

    - `src/components/Seo.tsx` — reusable per-route SEO component that uses `react-helmet-async`.
    - `scripts/prerender.js` — a Puppeteer-based script that:
      - Prerenders `/`, `/collections`, and all collection detail routes discovered from the Google Sheet data.
      - Generates `dist/sitemap.xml` based on the prerendered routes.
    - `package.json` includes the script `build:ssg` which runs the Vite build and then prerenders pages.

    Quick start

    1. Install dependencies:

    ```bash
    npm install
    ```

    2. Provide environment variables (create a `.env` at project root or set in CI):

    ```
    VITE_SHEET_ID=your_google_sheet_id_here
    SITE_URL=https://ijsstationery.com
    ```

    3. Build and prerender:

    ```bash
    npm run build:ssg
    ```

    4. Preview the generated `dist/` (or deploy the generated static output):

    ```bash
    npx serve dist
    ```

    Notes about the dynamic sitemap

    - The project no longer keeps a static `public/sitemap.xml` in the repo. The prerender script generates `dist/sitemap.xml` during the build using the latest collection data from your Google Sheet.
    - If you want to submit the sitemap to Google automatically after deployment, you can ping:

    ```
    https://www.google.com/ping?sitemap=${SITE_URL}/sitemap.xml
    ```

    Deployment notes (Vercel)

    - Vercel handles CDN invalidation automatically on deploy. Deploying each new build will make the updated prerendered HTML and sitemap available to crawlers.
    - Make sure `VITE_SHEET_ID` and `SITE_URL` are set in the Vercel project environment variables.

    Further improvements you may request

    - Add incremental regeneration (ISR) or SSR for real-time content updates.
    - Add a CI job that runs `npm run build:ssg` and deploys to Vercel when your sheet changes (via webhook).
    - Add a post-deploy script to ping search engines.

    If you'd like, I can add an optional `scripts/ping-search-engines.js` and a CI snippet to run it after deployments.
