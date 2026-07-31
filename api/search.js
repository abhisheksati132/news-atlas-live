export default async function handler(req, res) {
    const { q } = req.query;
    if (!q || typeof q !== "string") return res.status(400).json({ error: "Missing query parameter", features: [] });

    const cleanQuery = q.trim();
    if (!cleanQuery) return res.status(200).json({ features: [] });

    const token = process.env.MAPBOX_TOKEN;

    if (token) {
        try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanQuery)}.json?access_token=${token}&types=place,region,locality&limit=5`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                if (data.features && data.features.length > 0) {
                    return res.status(200).json(data);
                }
            }
        } catch (err) {
            console.warn("[search] Mapbox relay failed, attempting OpenStreetMap fallback:", err.message);
        }
    }

    // OpenStreetMap (Nominatim) Fallback Geocoder
    try {
        const nomUrl = `https://nominatim.openstreetmap.org/search?format=geojson&q=${encodeURIComponent(cleanQuery)}&limit=5`;
        const response = await fetch(nomUrl, {
            headers: { "User-Agent": "NewsAtlas/1.0" }
        });
        if (!response.ok) throw new Error(`Nominatim HTTP ${response.status}`);
        const data = await response.json();

        const features = (data.features || []).map(f => {
            const name = f.properties?.name || (f.properties?.display_name || "").split(",")[0];
            const fullName = f.properties?.display_name || name;
            const placeType = f.properties?.type ? [f.properties.type] : ["place"];
            return {
                id: `nom-${f.properties?.place_id || Math.random().toString(36).substring(7)}`,
                text: name,
                place_name: fullName,
                center: f.geometry?.coordinates || [0, 0],
                place_type: placeType,
                properties: f.properties || {}
            };
        });

        return res.status(200).json({ type: "FeatureCollection", features });
    } catch (err) {
        console.error("[search] Nominatim fallback error:", err.message);
        return res.status(200).json({ type: "FeatureCollection", features: [] });
    }
}

