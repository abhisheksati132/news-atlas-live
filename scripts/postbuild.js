// Post-build: make landing.html serve at / and terminal serve at /app
import { copyFileSync, renameSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = resolve(__dirname, '../dist');

const landingHtml = `${dist}/landing.html`;
const indexHtml   = `${dist}/index.html`;
const appHtml     = `${dist}/app.html`;

if (!existsSync(landingHtml)) {
  console.error('❌ dist/landing.html not found. Check vite.config.js rollupOptions.input.');
  process.exit(1);
}

// 1. Copy terminal (index.html) → app.html  — assets are absolute /assets/... paths, safe to copy
copyFileSync(indexHtml, appHtml);
console.log('✅ Copied dist/index.html → dist/app.html (terminal at /app)');

// 2. Overwrite index.html with landing page content so / serves landing
copyFileSync(landingHtml, indexHtml);
console.log('✅ Copied dist/landing.html → dist/index.html (landing at /)');

console.log('🚀 Post-build swap complete.');
