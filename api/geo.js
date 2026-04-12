export default async function handler(req, res) {
    const { country, state, level } = req.query;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

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
            const fallback = FallbackRegistry[country] || FallbackRegistry["United States"];
            return res.status(200).json({ states: fallback.states });
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
            const fallback = FallbackRegistry[country] || FallbackRegistry["United States"];
            const cities = fallback.cities[state] || ["Main Sector Hub", "Regional Center"];
            return res.status(200).json({ cities: cities });
        }

        return res.status(400).json({ error: "Invalid level request" });
    } catch (err) {
        console.error("[geo]", err.message);
        const fallback = FallbackRegistry[country] || FallbackRegistry["United States"];
        if (level === "cities") {
            const cities = fallback.cities?.[state] || ["Main Sector Hub", "Regional Center"];
            return res.status(200).json({ cities });
        }
        return res.status(200).json({ states: fallback.states });
    }
}
