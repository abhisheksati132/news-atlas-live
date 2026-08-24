import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COUNTRIES_DB_PATH = resolve(__dirname, '../public/data/countries.json');

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

const NAME_MAPPINGS = {
    'united states of america': 'United States',
    'united states': 'United States',
    'russian federation': 'Russia',
    'united kingdom': 'United Kingdom',
    'great britain': 'United Kingdom',
    'south korea': 'South Korea',
    'viet nam': 'Vietnam',
    'syrian arab republic': 'Syria',
    'venezuela bolivarian republic of': 'Venezuela',
    'iran islamic republic of': 'Iran',
    'peoples republic of china': 'China',
    'republic of korea': 'South Korea',
    'korea (republic of)': 'South Korea',
    'korea': 'South Korea'
};

let countriesCache = null;

function loadCountries() {
    if (countriesCache) return countriesCache;
    const candidatePaths = [
        COUNTRIES_DB_PATH,
        resolve(process.cwd(), 'public/data/countries.json'),
        resolve(process.cwd(), 'dist/data/countries.json'),
        resolve(__dirname, '../../public/data/countries.json')
    ];

    for (const p of candidatePaths) {
        try {
            const fileContent = readFileSync(p, 'utf-8');
            if (fileContent) {
                countriesCache = JSON.parse(fileContent);
                return countriesCache;
            }
        } catch {}
    }
    throw new Error("Could not find countries.json database file in deployment paths");
}

export default async function handler(req, res) {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { all, name, code } = req.query || {};

    try {
        const countries = loadCountries();

        // Return all countries for the global search index or when no specific filters are requested
        if (all === 'true' || (!name && !code)) {
            return res.status(200).json(countries);
        }

        // Lookup by ISO code
        if (code) {
            const codeUpper = code.toUpperCase();
            const matches = countries.filter(
                (c) => c.cca2 === codeUpper || c.cca3 === codeUpper
            );
            if (matches.length > 0) return res.status(200).json(matches);
        }

        // Lookup by name
        if (name) {
            let normalizedName = name.trim();
            const lowerName = normalizedName.toLowerCase();
            const resolvedName = NAME_MAPPINGS[lowerName] || normalizedName;
            const searchName = resolvedName.toLowerCase();

            // First try exact match
            let matches = countries.filter(
                (c) => c.name.common.toLowerCase() === searchName
            );

            // Fallback to fuzzy substring match
            if (matches.length === 0) {
                matches = countries.filter(
                    (c) => c.name.common.toLowerCase().includes(searchName) ||
                           searchName.includes(c.name.common.toLowerCase())
                );
            }

            if (matches.length > 0) return res.status(200).json(matches);
        }

        return res.status(404).json({ error: 'Country not found in local registry' });
    } catch (err) {
        console.error('[countries] handler error:', err.message);
        return res.status(500).json({ error: 'Failed to query country registry' });
    }
}
