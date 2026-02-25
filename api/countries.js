import fetch from "node-fetch";

const FALLBACK_COUNTRIES = [
    { name: { common: "United States" }, cca2: "US", latlng: [38, -97], flags: { png: "https://flagcdn.com/w320/us.png" }, region: "Americas" },
    { name: { common: "India" }, cca2: "IN", latlng: [20, 77], flags: { png: "https://flagcdn.com/w320/in.png" }, region: "Asia" },
    { name: { common: "China" }, cca2: "CN", latlng: [35, 105], flags: { png: "https://flagcdn.com/w320/cn.png" }, region: "Asia" },
    { name: { common: "United Kingdom" }, cca2: "GB", latlng: [54, -2], flags: { png: "https://flagcdn.com/w320/gb.png" }, region: "Europe" },
    { name: { common: "France" }, cca2: "FR", latlng: [46, 2], flags: { png: "https://flagcdn.com/w320/fr.png" }, region: "Europe" },
    { name: { common: "Germany" }, cca2: "DE", latlng: [51, 9], flags: { png: "https://flagcdn.com/w320/de.png" }, region: "Europe" },
    { name: { common: "Russia" }, cca2: "RU", latlng: [60, 100], flags: { png: "https://flagcdn.com/w320/ru.png" }, region: "Europe" },
    { name: { common: "Japan" }, cca2: "JP", latlng: [36, 138], flags: { png: "https://flagcdn.com/w320/jp.png" }, region: "Asia" },
    { name: { common: "Brazil" }, cca2: "BR", latlng: [-10, -55], flags: { png: "https://flagcdn.com/w320/br.png" }, region: "Americas" },
    { name: { common: "Australia" }, cca2: "AU", latlng: [-27, 133], flags: { png: "https://flagcdn.com/w320/au.png" }, region: "Oceania" },
    { name: { common: "Canada" }, cca2: "CA", latlng: [60, -95], flags: { png: "https://flagcdn.com/w320/ca.png" }, region: "Americas" },
    { name: { common: "Israel" }, cca2: "IL", latlng: [31, 35], flags: { png: "https://flagcdn.com/w320/il.png" }, region: "Asia" },
    { name: { common: "Ukraine" }, cca2: "UA", latlng: [49, 32], flags: { png: "https://flagcdn.com/w320/ua.png" }, region: "Europe" },
    { name: { common: "Iran" }, cca2: "IR", latlng: [32, 53], flags: { png: "https://flagcdn.com/w320/ir.png" }, region: "Asia" },
    { name: { common: "Pakistan" }, cca2: "PK", latlng: [30, 70], flags: { png: "https://flagcdn.com/w320/pk.png" }, region: "Asia" }
];

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    const query = req.query || {};
    let allParam = String(query.all || "").replace(/\\$/, '');

    try {
        if (allParam === "true" || req.url.includes("all=true")) {
            try {
                const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,latlng,flags,population,capital,region,capitalInfo", {
                    timeout: 5000,
                    headers: { "User-Agent": "Mozilla/5.0" }
                });
                if (response.ok) return res.status(200).json(await response.json());
            } catch (e) {
                console.warn("[Proxy] RestCountries timed out, using fallback list");
            }
            return res.status(200).json(FALLBACK_COUNTRIES);
        }

        const name = String(query.name || "").replace(/\\$/, '');
        const code = String(query.code || "").replace(/\\$/, '');

        if (code) {
            const response = await fetch(`https://restcountries.com/v3.1/alpha/${encodeURIComponent(code)}`);
            if (response.ok) return res.status(200).json(await response.json());
        } else if (name) {
            let response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=true`);
            if (!response.ok) response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}`);
            if (response.ok) return res.status(200).json(await response.json());
        }

        // Final fallback for specific country search
        const found = FALLBACK_COUNTRIES.find(c => c.name.common.toLowerCase() === name.toLowerCase());
        if (found) return res.status(200).json([found]);

        return res.status(404).json({ error: "Data unavailable" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
