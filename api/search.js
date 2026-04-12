export default async function handler(req, res) {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Missing query parameter" });

    const token = process.env.MAPBOX_TOKEN;
    if (!token) return res.status(503).json({ error: "Geocoding service unavailable" });

    try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${token}&types=place,region,locality&limit=5`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Mapbox relay failed");
        const data = await response.json();
        return res.status(200).json(data);
    } catch (err) {
        console.error("[search]", err.message);
        return res.status(200).json({ features: [] });
    }
}
