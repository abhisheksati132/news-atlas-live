// Regenerate public/data/countries.json from mledoze/countries (slim format).
// Output matches scripts/build-countries.js: whitelisted fields, minified.
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '../public/data/countries.json');

const LEFT_DRIVE = new Set([
  'AG','AU','BD','BB','BM','BN','BS','BT','BW','CY','DM','FJ','FK','GB','GD','GG',
  'GI','GM','GY','HK','ID','IE','IM','IN','JM','JP','KE','KI','KN','KY','LC','LK',
  'LS','MU','MV','MW','MY','MZ','NA','NR','NP','NZ','PG','PK','SB','SC','SG','SH',
  'SL','SR','SZ','TC','TH','TK','TO','TT','TV','TZ','UG','VC','VG','VU','WS','ZA','ZM','ZW'
]);

async function fetchCountries() {
  console.log('Fetching countries...');
  const res = await fetch('https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  const formatted = data.map((c) => ({
    name: { common: c.name?.common || '', official: c.name?.official || c.name?.common || '' },
    cca2: c.cca2 || '',
    cca3: c.cca3 || '',
    capital: c.capital || [],
    region: c.region || '',
    subregion: c.subregion || '',
    currencies: c.currencies || {},
    idd: c.idd || {},
    car: { side: c.cca2 && LEFT_DRIVE.has(c.cca2.toUpperCase()) ? 'left' : 'right' },
    flags: { svg: c.cca2 ? `https://flagcdn.com/${c.cca2.toLowerCase()}.svg` : '', png: c.cca2 ? `https://flagcdn.com/w80/${c.cca2.toLowerCase()}.png` : '' },
    latlng: c.latlng || [0, 0],
    area: c.area ?? null,
    population: null,
    gini: null,
    demonyms: c.demonyms || null,
    languages: c.languages || {}
  }));

  formatted.sort((a, b) => a.name.common.localeCompare(b.name.common));
  mkdirSync(resolve(__dirname, '../public/data'), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(formatted), 'utf-8');
  console.log(`Wrote ${formatted.length} countries. Run "node scripts/build-countries.js" afterwards to enrich with World Bank data.`);
}

fetchCountries().catch((e) => {
  console.error('Failed:', e.message);
  process.exit(1);
});
