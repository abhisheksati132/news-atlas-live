import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '../public/data/countries.json');

async function fetchCountries() {
  console.log('Fetching countries...');
  const urls = [
    'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,latlng,flags,population,capital,region',
    'https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json'
  ];

  for (const url of urls) {
    try {
      console.log(`Trying URL: ${url}`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        // Standardize keys if we are using the mledoze countries dataset
        const formatted = data.map(c => {
          // If using the raw github list, it has different structure: c.name.common and c.cca2 are usually there.
          // Let's verify and map if needed.
          const commonName = c.name?.common || c.name;
          const cca2 = c.cca2 || c.cca2;
          const cca3 = c.cca3 || c.cca3;
          const latlng = c.latlng || [0, 0];
          const flags = c.flags?.svg || c.flags?.png || c.flags || '';
          
          return {
            name: { common: commonName },
            cca2: cca2,
            cca3: cca3,
            latlng: latlng,
            flags: { svg: flags, png: flags },
            population: c.population || 0,
            capital: Array.isArray(c.capital) ? c.capital : [c.capital || ''],
            region: c.region || ''
          };
        });

        // Sort alphabetically by common name
        formatted.sort((a, b) => a.name.common.localeCompare(b.name.common));

        mkdirSync(resolve(__dirname, '../public/data'), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(formatted, null, 2), 'utf-8');
        console.log(`✅ Successfully saved ${formatted.length} countries to ${outputPath}`);
        return;
      } else {
        console.warn(`URL did not return an array: ${url}`);
      }
    } catch (err) {
      console.error(`❌ Failed with ${url}:`, err.message);
    }
  }

  process.exit(1);
}

fetchCountries();
