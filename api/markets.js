import { getCache, setCache } from "./utils/cache.js";

const FX_QUOTES = ["EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "INR", "CNY", "SGD", "HKD", "BRL"];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const type = String(req.query?.type || "").toLowerCase();
  const currency = String(req.query?.currency || "USD").toUpperCase();

  if (type === "forex") {
    const cacheKey = `forex_${currency}`;
    const cached = getCache(cacheKey);
    if (cached) return res.status(200).json({ ...cached, cached: true });

    try {
      const quotes = FX_QUOTES.filter((quote) => quote !== currency).join(",");
      const upstream = await fetch(
        `https://api.frankfurter.dev/v2/rates?base=${encodeURIComponent(currency)}&quotes=${quotes}`
      );
      if (!upstream.ok) throw new Error(`Frankfurter HTTP ${upstream.status}`);

      const rows = await upstream.json();
      const rates = Object.fromEntries(rows.map((row) => [row.quote, row.rate]));
      const payload = {
        base: currency,
        rates,
        timestamp: rows[0]?.date || null,
        source: "Frankfurter / central-bank reference rates",
        freshness: "daily"
      };
      setCache(cacheKey, payload, 21600);
      return res.status(200).json(payload);
    } catch (error) {
      console.error("[markets:forex]", error.message);
      return res.status(502).json({
        error: "Foreign-exchange reference rates are currently unavailable.",
        code: "FOREX_UPSTREAM_ERROR"
      });
    }
  }

  return res.status(503).json({
    error: "Live index, metal, and commodity quotes require a configured market-data provider.",
    code: "MARKET_QUOTE_PROVIDER_NOT_CONFIGURED",
    requestedType: type || null
  });
}
