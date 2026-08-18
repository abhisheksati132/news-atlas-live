export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  return res.status(503).json({
    error: "GDELT Geo is unavailable from its upstream provider. Hotspot visualization is disabled.",
    code: "GDELT_GEO_UNAVAILABLE"
  });
}
