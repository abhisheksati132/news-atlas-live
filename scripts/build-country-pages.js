// Generates static SEO pages: public/country/<slug>/index.html + public/sitemap.xml
// Data: public/data/countries.json (slim registry). Run after build-countries.js.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dbPath = resolve(root, 'public/data/countries.json');
const outDir = resolve(root, 'public/country');
const SITE = process.env.SITE_URL || 'https://news-atlas-live.vercel.app';

const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const slugify = (name) =>
  name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'x';

const fmtPop = (n) => {
  if (n == null) return '—';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + ' billion';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' million';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + ' thousand';
  return String(n);
};

const fmtArea = (n) => (n == null ? '—' : Math.round(n).toLocaleString('en-US') + ' km²');

function page(c, url) {
  const currencyEntries = Object.entries(c.currencies || {});
  const currency = currencyEntries.length
    ? `${currencyEntries[0][0]}${currencyEntries[0][1]?.name ? ` — ${currencyEntries[0][1].name}` : ''}`
    : '—';
  const languages = Object.values(c.languages || {}).join(', ') || '—';
  const capital = (c.capital && c.capital[0]) || '—';
  const idd = c.idd?.root ? `${c.idd.root}${(c.idd.suffixes || [])[0] || ''}` : '—';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(c.name.common)} — News, Markets, Weather & Economy | NewsAtlas</title>
<meta name="description" content="Live news, stock indices, exchange rates, World Bank economic indicators and weather for ${esc(c.name.common)}. Capital: ${esc(capital)}. Population: ${esc(fmtPop(c.population))}. Explore ${esc(c.name.common)} on the interactive globe." />
<link rel="canonical" href="${url}" />
<meta property="og:title" content="${esc(c.name.common)} on the interactive globe | NewsAtlas" />
<meta property="og:description" content="Real-time news, markets, economy and weather for ${esc(c.name.common)}." />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary" />
<link rel="icon" href="${SITE}/favicon.ico" />
<style>
:root{--bg:#0a0a0a;--surface:#111;--border:rgba(255,255,255,.08);--t1:#fafafa;--t2:#a1a1aa;--t3:#71717a}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--t1);font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;letter-spacing:-.01em;-webkit-font-smoothing:antialiased;line-height:1.6}
a{color:inherit;text-decoration:none}
.wrap{max-width:760px;margin:0 auto;padding:0 24px}
nav{display:flex;justify-content:space-between;align-items:center;height:60px;border-bottom:1px solid var(--border)}
.logo{font-size:15px;font-weight:650}
.logo span{color:var(--t3)}
.btn{display:inline-flex;align-items:center;height:32px;padding:0 14px;background:var(--t1);color:#09090b;font-size:13px;font-weight:600;border-radius:8px}
h1{font-size:clamp(34px,6vw,54px);font-weight:650;letter-spacing:-.04em;line-height:1.05;padding:72px 0 16px}
.sub{color:var(--t2);font-size:17px;max-width:560px;padding-bottom:40px}
.flag{width:96px;border-radius:8px;border:1px solid var(--border);margin:36px 0 8px}
.facts{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin:32px 0}
.fact{background:var(--bg);padding:18px 20px}
.fact small{display:block;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-bottom:6px}
.fact b{font-size:15px;font-weight:600}
@media(max-width:560px){.facts{grid-template-columns:1fr}}
.cta{border-top:1px solid var(--border);margin-top:56px;padding:64px 0;text-align:center}
.cta p{color:var(--t2);margin-bottom:24px}
.cta .btn{height:44px;padding:0 24px;font-size:14px}
footer{border-top:1px solid var(--border);padding:24px 0;font-size:12.5px;color:var(--t3);text-align:center}
.mono{font-family:'JetBrains Mono',monospace}
</style>
</head>
<body>
<nav><div class="wrap" style="display:flex;justify-content:space-between;align-items:center;height:100%"><a class="logo" href="/">News<span>Atlas</span></a><a class="btn" href="${SITE}/app">Open app</a></div></nav>
<div class="wrap">
<img class="flag" src="${esc(c.flags?.svg || c.flags?.png || '')}" alt="Flag of ${esc(c.name.common)}" />
<h1>${esc(c.name.common)}</h1>
<p class="sub">${esc(c.name.official && c.name.official !== c.name.common ? c.name.official + '. ' : '')}Explore ${esc(c.name.common)} with live news, market data, macroeconomic indicators and weather — all on an interactive 3D globe.</p>
<div class="facts">
<div class="fact"><small>Capital</small><b>${esc(capital)}</b></div>
<div class="fact"><small>Population</small><b>${esc(fmtPop(c.population))}</b></div>
<div class="fact"><small>Region</small><b>${esc(c.subregion || c.region || '—')}</b></div>
<div class="fact"><small>Area</small><b>${esc(fmtArea(c.area))}</b></div>
<div class="fact"><small>Currency</small><b>${esc(currency)}</b></div>
<div class="fact"><small>Languages</small><b>${esc(languages)}</b></div>
<div class="fact"><small>Calling code</small><b class="mono">${esc(idd)}</b></div>
<div class="fact"><small>ISO codes</small><b class="mono">${esc(c.cca2)} · ${esc(c.cca3)}</b></div>
</div>
<div class="cta">
<p>See ${esc(c.name.common)} live — news, markets, weather and the economy, updated continuously.</p>
<a class="btn" href="${SITE}/app">Explore ${esc(c.name.common)} on the globe →</a>
</div>
</div>
<footer><div class="wrap">Part of <a href="${SITE}" style="text-decoration:underline">NewsAtlas</a> — the whole world, on one map.</div></footer>
</body>
</html>`;
}

function main() {
  const countries = JSON.parse(readFileSync(dbPath, 'utf8'));
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const usedSlugs = new Set();
  const urls = [];

  for (const c of countries) {
    let slug = slugify(c.name.common);
    if (usedSlugs.has(slug)) slug = `${slug}-${c.cca2.toLowerCase()}`;
    usedSlugs.add(slug);

    const url = `${SITE}/country/${slug}/`;
    const dir = resolve(outDir, slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'index.html'), page(c, url), 'utf8');
    urls.push({ url, name: c.name.common });
  }

  const today = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${SITE}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
<url><loc>${SITE}/app</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>
${urls.map((u) => `<url><loc>${u.url}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>`;
  writeFileSync(resolve(root, 'public/sitemap.xml'), sitemap, 'utf8');

  const popular = ['india', 'united-states', 'united-kingdom', 'japan', 'germany', 'france', 'brazil', 'canada']
    .filter((s) => usedSlugs.has(s));
  console.log(`Generated ${urls.length} country pages + sitemap.xml (${popular.length} popular slugs matched)`);
}

main();
