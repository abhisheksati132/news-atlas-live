export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    if (req.method === "OPTIONS") return res.status(200).end();

    const { mode = "artlist", ...rest } = req.query;
    const base = mode.toLowerCase() === "geo"
        ? "https://api.gdeltproject.org/api/v2/geo/geo"
        : "https://api.gdeltproject.org/api/v2/doc/doc";

    const params = new URLSearchParams();
    Object.entries(rest).forEach(([k, v]) => params.append(k, v));

    const url = `${base}?${params.toString()}`;

    try {
        const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 NewsAtlas/1.0" },
            signal: AbortSignal.timeout(12000),
        });

        if (!response.ok) throw new Error(`GDELT API error: ${response.status}`);

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error("GDELT Proxy Error:", error.message);
        res.status(500).json({ error: "GDELT Uplink Failed", details: error.message });
    }
}
