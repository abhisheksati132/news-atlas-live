// Rebuild public/data/countries.json — slim, enriched, minified.
// Sources: existing registry (structure) + World Bank API (population, GINI)
// + embedded driving-side dataset. Output: ~150 KB minified (was 926 KB).
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, '../public/data/countries.json');

// Countries that drive on the left (ISO2)
const LEFT_DRIVE = new Set([
  'AG','AU','BD','BB','BM','BN','BS','BT','BW','CY','DM','FJ','FK','GB','GD','GG',
  'GI','GM','GY','HK','ID','IE','IM','IN','JM','JP','KE','KI','KN','KY','LC','LK',
  'LS','MU','MV','MW','MY','MZ','NA','NR','NP','NZ','PG','PK','SB','SC','SG','SH',
  'SL','SR','SZ','TC','TH','TK','TO','TT','TV','TZ','UG','VC','VG','VU','WS','ZA','ZM','ZW'
]);

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function worldBankMap(indicator) {
  try {
    const data = await fetchJson(
      `https://api.worldbank.org/v2/country/all/indicator/${indicator}?format=json&mrv=1&per_page=400`
    );
    const rows = Array.isArray(data) ? data[1] || [] : [];
    const map = new Map();
    for (const row of rows) {
      if (row.value != null && row.countryiso3code) {
        map.set(row.countryiso3code, row.value);
      }
    }
    console.log(`World Bank ${indicator}: ${map.size} entries`);
    return map;
  } catch (e) {
    console.warn(`World Bank ${indicator} failed: ${e.message}`);
    return new Map();
  }
}

async function main() {
  const existing = JSON.parse(readFileSync(dbPath, 'utf8'));
  console.log(`Existing registry: ${existing.length} entries`);

  const [populationMap, giniMap] = await Promise.all([
    worldBankMap('SP.POP.TOTL'),
    worldBankMap('SI.POV.GINI')
  ]);

  const slim = existing.map((c) => {
    const pop = populationMap.get(c.cca3);
    const gini = giniMap.get(c.cca3);
    const driveSide = c.cca2 && LEFT_DRIVE.has(c.cca2.toUpperCase()) ? 'left' : 'right';
    return {
      name: {
        common: c.name?.common || '',
        official: c.name?.official || c.name?.common || ''
      },
      cca2: c.cca2,
      cca3: c.cca3,
      capital: c.capital || [],
      region: c.region || '',
      subregion: c.subregion || '',
      currencies: c.currencies || {},
      idd: c.idd || {},
      car: { side: driveSide },
      flags: {
        svg: c.flags?.svg || '',
        png: c.flags?.png || ''
      },
      latlng: c.latlng || [0, 0],
      area: c.area ?? null,
      population: typeof c.population === 'number' ? c.population : (pop != null ? Math.round(pop) : null),
      gini: gini != null ? Math.round(gini * 10) / 10 : null,
      demonyms: c.demonyms || null,
      languages: c.languages || {}
    };
  });

  slim.sort((a, b) => a.name.common.localeCompare(b.name.common));
  writeFileSync(dbPath, JSON.stringify(slim), 'utf8');
  const sizeKB = (readFileSync(dbPath).length / 1024).toFixed(0);
  const withPop = slim.filter((c) => c.population != null).length;
  console.log(`Wrote ${slim.length} entries, ${sizeKB} KB (was 926 KB). Population present for ${withPop}.`);
}

main();
