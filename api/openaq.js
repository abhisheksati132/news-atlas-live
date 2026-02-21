export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const r = await fetch(
      "https://api.openaq.org/v2/latest?limit=100&parameter=pm25",
      {
        headers: { Accept: "application/json" },
      },
    );
    const d = await r.json();
    return res.status(200).json(d);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "OpenAQ fetch failed", detail: err.message });
  }
}
