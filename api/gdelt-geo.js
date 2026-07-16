export default async function handler(req, res) {
  const { query = "war", timespan = "24h" } = req.query;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const gdeltGeoUrl = new URL("https://api.gdeltproject.org/api/v2/geo/geo");
  gdeltGeoUrl.searchParams.set("query", query);
  gdeltGeoUrl.searchParams.set("mode", "pointmap");
  gdeltGeoUrl.searchParams.set("format", "geojson");
  gdeltGeoUrl.searchParams.set("timespan", timespan);

  try {
    const r = await fetch(gdeltGeoUrl, {
      headers: { "User-Agent": "NewsAtlas/1.0" },
    });
    if (!r.ok) {
      return res.status(502).json({ error: `GDELT Geo HTTP ${r.status}`, type: "FeatureCollection", features: [] });
    }
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("[gdelt-geo]", err.message);
    return res.status(502).json({ error: err.message, type: "FeatureCollection", features: [] });
  }
}
