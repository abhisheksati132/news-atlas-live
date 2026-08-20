export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { country, state, level } = req.query || {};

    // Tactical Fallback Registry for Mission Sectors
    const FallbackRegistry = {
        "India": {
            states: [
                { name: "Maharashtra", code: "MH" }, { name: "Delhi", code: "DL" }, { name: "Karnataka", code: "KA" },
                { name: "Tamil Nadu", code: "TN" }, { name: "Gujarat", code: "GJ" }, { name: "West Bengal", code: "WB" },
                { name: "Uttar Pradesh", code: "UP" }, { name: "Rajasthan", code: "RJ" }, { name: "Kerala", code: "KL" }
            ],
            cities: {
                "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
                "Delhi": ["New Delhi", "Dwarka", "Rohini"],
                "Karnataka": ["Bengaluru", "Mysuru", "Hubballi"]
            }
        },
        "United States": {
            states: [
                { name: "California", code: "CA" }, { name: "New York", code: "NY" }, { name: "Texas", code: "TX" },
                { name: "Florida", code: "FL" }, { name: "Illinois", code: "IL" }, { name: "Washington", code: "WA" }
            ],
            cities: {
                "California": ["Los Angeles", "San Francisco", "San Diego"],
                "New York": ["New York City", "Buffalo", "Albany"],
                "Texas": ["Houston", "Austin", "Dallas"]
            }
        }
    };

    try {
        if (level === "states") {
            if (!country || !String(country).trim()) {
                return res.status(400).json({ error: "Missing country parameter" });
            }
            // Attempt to fetch real states from CountriesNow API
            const response = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ country: country })
            });
            const data = await response.json();
            
            if (data && !data.error && data.data) {
                return res.status(200).json({ states: data.data.states });
            }
            
            // Fallback to internal registry
            const fallback = FallbackRegistry[country];
            if (fallback) return res.status(200).json({ states: fallback.states, source: "local-fallback" });
            return res.status(502).json({ error: "Regional data provider is unavailable for this country", states: [] });
        }

        if (level === "cities") {
            if (!country || !String(country).trim() || !state || !String(state).trim()) {
                return res.status(400).json({ error: "Missing country or state parameter" });
            }
            const response = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ country: country, state: state })
            });
            const data = await response.json();

            if (data && !data.error && data.data) {
                return res.status(200).json({ cities: data.data });
            }

            // Fallback to internal registry
            const fallback = FallbackRegistry[country];
            const cities = fallback?.cities?.[state];
            if (cities) return res.status(200).json({ cities, source: "local-fallback" });
            return res.status(502).json({ error: "Regional data provider is unavailable for this location", cities: [] });
        }

        return res.status(400).json({ error: "Invalid level request" });
    } catch (err) {
        console.error("[geo]", err.message);
        const fallback = FallbackRegistry[country];
        if (level === "cities") {
            return res.status(502).json({ error: "Regional data provider request failed", cities: fallback?.cities?.[state] || [] });
        }
        return res.status(502).json({ error: "Regional data provider request failed", states: fallback?.states || [] });
    }
}
