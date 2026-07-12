/** Minimal fallback list if restcountries.com is unavailable */
const FALLBACK_COUNTRIES = [
    { name: { common: 'United States' }, cca2: 'US', cca3: 'USA', latlng: [38, -97], flags: { png: 'https://flagcdn.com/w320/us.png' }, region: 'Americas', population: 331000000, capital: ['Washington, D.C.'] },
    { name: { common: 'India' }, cca2: 'IN', cca3: 'IND', latlng: [20, 77], flags: { png: 'https://flagcdn.com/w320/in.png' }, region: 'Asia', population: 1380000000, capital: ['New Delhi'] },
    { name: { common: 'China' }, cca2: 'CN', cca3: 'CHN', latlng: [35, 105], flags: { png: 'https://flagcdn.com/w320/cn.png' }, region: 'Asia', population: 1400000000, capital: ['Beijing'] },
    { name: { common: 'United Kingdom' }, cca2: 'GB', cca3: 'GBR', latlng: [54, -2], flags: { png: 'https://flagcdn.com/w320/gb.png' }, region: 'Europe', population: 67000000, capital: ['London'] },
    { name: { common: 'France' }, cca2: 'FR', cca3: 'FRA', latlng: [46, 2], flags: { png: 'https://flagcdn.com/w320/fr.png' }, region: 'Europe', population: 67000000, capital: ['Paris'] },
    { name: { common: 'Germany' }, cca2: 'DE', cca3: 'DEU', latlng: [51, 9], flags: { png: 'https://flagcdn.com/w320/de.png' }, region: 'Europe', population: 83000000, capital: ['Berlin'] },
    { name: { common: 'Russia' }, cca2: 'RU', cca3: 'RUS', latlng: [60, 100], flags: { png: 'https://flagcdn.com/w320/ru.png' }, region: 'Europe', population: 144000000, capital: ['Moscow'] },
    { name: { common: 'Japan' }, cca2: 'JP', cca3: 'JPN', latlng: [36, 138], flags: { png: 'https://flagcdn.com/w320/jp.png' }, region: 'Asia', population: 126000000, capital: ['Tokyo'] },
    { name: { common: 'Brazil' }, cca2: 'BR', cca3: 'BRA', latlng: [-10, -55], flags: { png: 'https://flagcdn.com/w320/br.png' }, region: 'Americas', population: 213000000, capital: ['Brasília'] },
    { name: { common: 'Australia' }, cca2: 'AU', cca3: 'AUS', latlng: [-27, 133], flags: { png: 'https://flagcdn.com/w320/au.png' }, region: 'Oceania', population: 26000000, capital: ['Canberra'] },
    { name: { common: 'Canada' }, cca2: 'CA', cca3: 'CAN', latlng: [60, -95], flags: { png: 'https://flagcdn.com/w320/ca.png' }, region: 'Americas', population: 38000000, capital: ['Ottawa'] },
    { name: { common: 'Ukraine' }, cca2: 'UA', cca3: 'UKR', latlng: [49, 32], flags: { png: 'https://flagcdn.com/w320/ua.png' }, region: 'Europe', population: 44000000, capital: ['Kyiv'] },
    { name: { common: 'Pakistan' }, cca2: 'PK', cca3: 'PAK', latlng: [30, 70], flags: { png: 'https://flagcdn.com/w320/pk.png' }, region: 'Asia', population: 220000000, capital: ['Islamabad'] },
];

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

export default async function handler(req, res) {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { all, name, code } = req.query;

    try {
        // Return all countries for the global search index
        if (all === 'true') {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 6000);
            try {
                const response = await fetch(
                    'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,latlng,flags,population,capital,region,capitalInfo',
                    { signal: controller.signal, headers: { 'User-Agent': 'NewsAtlas/1.0' } }
                );
                clearTimeout(timer);
                if (response.ok) return res.status(200).json(await response.json());
            } catch {
                clearTimeout(timer);
                console.warn('[countries] restcountries timed out, using fallback');
            }
            return res.status(200).json(FALLBACK_COUNTRIES);
        }

        // Lookup by ISO code
        if (code) {
            try {
                const response = await fetch(`https://restcountries.com/v3.1/alpha/${encodeURIComponent(code)}`);
                if (response.ok) return res.status(200).json(await response.json());
            } catch (err) {
                console.warn('[countries] Code lookup failed, trying fallback:', err.message);
            }
            // Try lookup in local fallback
            const codeUpper = code.toUpperCase();
            const found = FALLBACK_COUNTRIES.find(
                (c) => c.cca2 === codeUpper || c.cca3 === codeUpper
            );
            if (found) return res.status(200).json([found]);
        }

        // Lookup by name (exact first, then partial)
        if (name) {
            let normalizedName = name.trim();
            const lowerName = normalizedName.toLowerCase();
            if (NAME_MAPPINGS[lowerName]) {
                normalizedName = NAME_MAPPINGS[lowerName];
            }
            try {
                let response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(normalizedName)}?fullText=true`);
                if (!response.ok) {
                    response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(normalizedName)}`);
                }
                if (response.ok) return res.status(200).json(await response.json());
            } catch (err) {
                console.warn('[countries] Name lookup failed, trying fallback:', err.message);
            }

            // Fallback to local list (exact match or bidirectional substring match)
            const searchName = normalizedName.toLowerCase();
            const found = FALLBACK_COUNTRIES.find(
                (c) => c.name.common.toLowerCase() === searchName ||
                       c.name.common.toLowerCase().includes(searchName) ||
                       searchName.includes(c.name.common.toLowerCase())
            );
            if (found) return res.status(200).json([found]);
        }

        return res.status(404).json({ error: 'Country not found' });
    } catch (err) {
        console.error('[countries] Global Catch Error:', err.message);
        if (all === 'true') {
            return res.status(200).json(FALLBACK_COUNTRIES);
        }
        
        // Final fallback safeguard for code or name if an unexpected exception escaped
        if (code) {
            const codeUpper = code.toUpperCase();
            const found = FALLBACK_COUNTRIES.find(
                (c) => c.cca2 === codeUpper || c.cca3 === codeUpper
            );
            if (found) return res.status(200).json([found]);
        }
        if (name) {
            const lowerName = name.toLowerCase();
            const resolvedName = NAME_MAPPINGS[lowerName] || name;
            const searchName = resolvedName.toLowerCase();
            const found = FALLBACK_COUNTRIES.find(
                (c) => c.name.common.toLowerCase() === searchName ||
                       c.name.common.toLowerCase().includes(searchName) ||
                       searchName.includes(c.name.common.toLowerCase())
            );
            if (found) return res.status(200).json([found]);
        }

        return res.status(404).json({ error: 'Country not found or lookup failed' });
    }
}
