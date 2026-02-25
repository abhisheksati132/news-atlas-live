export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    if (req.method === "OPTIONS") return res.status(200).end();

    const { query, timespan = "72H" } = req.query;
    if (!query) return res.status(400).json({ error: "Missing query parameter" });

    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=ArtList&maxrecords=50&sort=DateDesc&format=json&timespan=${timespan}`;

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 NewsAtlas/1.0",
            },
            signal: AbortSignal.timeout(8000), 
        });

        if (!response.ok) {
            throw new Error(`GDELT API error: ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error("GDELT Proxy Error:", error.message);
        res.status(500).json({ error: "Failed to fetch intelligence dispatch", details: error.message });
    }
}
