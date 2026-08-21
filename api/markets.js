import { getCache, setCache } from "./_utils/cache.js";

const FX_QUOTES = ["EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "INR", "CNY", "SGD", "HKD", "BRL"];

// Country to benchmark index ticker mappings
const COUNTRY_INDICES = {
  "india": [
    { symbol: "^NSEI", label: "NIFTY 50" },
    { symbol: "^BSESN", label: "BSE SENSEX" },
    { symbol: "^NSEBANK", label: "NIFTY BANK" }
  ],
  "united states": [
    { symbol: "^GSPC", label: "S&P 500" },
    { symbol: "^IXIC", label: "NASDAQ Composite" },
    { symbol: "^DJI", label: "Dow Jones" },
    { symbol: "^RUT", label: "Russell 2000" }
  ],
  "united kingdom": [
    { symbol: "^FTSE", label: "FTSE 100" },
    { symbol: "^FTMC", label: "FTSE 250" }
  ],
  "germany": [
    { symbol: "^GDAXI", label: "DAX 40" },
    { symbol: "^MDAXI", label: "MDAX" }
  ],
  "japan": [
    { symbol: "^N225", label: "Nikkei 225" },
    { symbol: "1306.T", label: "TOPIX Index" }
  ],
  "france": [
    { symbol: "^FCHI", label: "CAC 40" }
  ],
  "china": [
    { symbol: "000001.SS", label: "SSE Composite" },
    { symbol: "399001.SZ", label: "SZSE Component" }
  ],
  "hong kong": [
    { symbol: "^HSI", label: "Hang Seng" }
  ],
  "brazil": [
    { symbol: "^BVSP", label: "IBOVESPA" }
  ],
  "canada": [
    { symbol: "^GSPTSE", label: "S&P/TSX Composite" }
  ],
  "australia": [
    { symbol: "^AXJO", label: "S&P/ASX 200" }
  ],
  "global": [
    { symbol: "^GSPC", label: "S&P 500 (US)" },
    { symbol: "^IXIC", label: "NASDAQ (US)" },
    { symbol: "^FTSE", label: "FTSE 100 (UK)" },
    { symbol: "^GDAXI", label: "DAX 40 (DE)" },
    { symbol: "^N225", label: "Nikkei 225 (JP)" },
    { symbol: "^NSEI", label: "NIFTY 50 (IN)" }
  ]
};

const METALS_LIST = [
  { symbol: "GC=F", code: "XAU", name: "Gold (Spot)", icon: "🪙" },
  { symbol: "SI=F", code: "XAG", name: "Silver (Spot)", icon: "🥈" },
  { symbol: "PL=F", code: "XPT", name: "Platinum (Spot)", icon: "⚪" },
  { symbol: "PA=F", code: "XPD", name: "Palladium", icon: "🔘" }
];

const COMMODITIES_LIST = [
  { symbol: "BZ=F", name: "Brent Crude Oil", unit: "USD / bbl", icon: "🛢️" },
  { symbol: "CL=F", name: "WTI Crude Oil", unit: "USD / bbl", icon: "🛢️" },
  { symbol: "NG=F", name: "Natural Gas", unit: "USD / MMBtu", icon: "🔥" },
  { symbol: "HG=F", name: "Copper", unit: "USD / lbs", icon: "🧱" },
  { symbol: "ZW=F", name: "Wheat", unit: "USd / bu", icon: "🌾" },
  { symbol: "ZC=F", name: "Corn", unit: "USd / bu", icon: "🌽" },
  { symbol: "KC=F", name: "Coffee", unit: "USd / lbs", icon: "☕" }
];

async function fetchYahooQuote(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      signal: AbortSignal.timeout(4500)
    });
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const price = meta.regularMarketPrice ?? meta.previousClose ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;
    return { price, prevClose, change };
  } catch (err) {
    return null;
  }
}

async function getUsdConversionRate(targetCurrency) {
  if (targetCurrency === "USD") return 1;
  const cacheKey = `fx_usd_${targetCurrency}`;
  const cached = getCache(cacheKey);
  if (cached) return cached.rate;

  try {
    const res = await fetch(`https://api.frankfurter.dev/v2/rates?base=USD&quotes=${targetCurrency}`, {
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const data = await res.json();
      const rate = data?.[0]?.rate || 1;
      setCache(cacheKey, { rate }, 21600);
      return rate;
    }
  } catch (e) {}
  return 1;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const type = String(req.query?.type || "forex").toLowerCase();
  const currency = String(req.query?.currency || "USD").toUpperCase();
  const country = String(req.query?.country || "").trim().toLowerCase();

  // 1. FOREX MATRIX
  if (type === "forex") {
    const cacheKey = `forex_${currency}`;
    const cached = getCache(cacheKey);
    if (cached) return res.status(200).json({ ...cached, cached: true });

    try {
      const quotes = FX_QUOTES.filter((quote) => quote !== currency).join(",");
      const upstream = await fetch(
        `https://api.frankfurter.dev/v2/rates?base=${encodeURIComponent(currency)}&quotes=${quotes}`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (!upstream.ok) throw new Error(`Frankfurter HTTP ${upstream.status}`);

      const rows = await upstream.json();
      const rates = Object.fromEntries(rows.map((row) => [row.quote, row.rate]));
      const payload = {
        base: currency,
        rates,
        timestamp: rows[0]?.date || new Date().toISOString(),
        source: "Frankfurter / Central-Bank Telemetry",
        freshness: "live"
      };
      setCache(cacheKey, payload, 3600);
      return res.status(200).json(payload);
    } catch (error) {
      console.error("[markets:forex]", error.message);
      return res.status(502).json({
        error: "Foreign-exchange reference rates are currently unavailable.",
        code: "FOREX_UPSTREAM_ERROR"
      });
    }
  }

  // 2. PRECIOUS METALS
  if (type === "metals") {
    const cacheKey = `metals_${currency}`;
    const cached = getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    try {
      const fxRate = await getUsdConversionRate(currency);
      const results = {};

      await Promise.all(
        METALS_LIST.map(async (m) => {
          const q = await fetchYahooQuote(m.symbol);
          if (q) {
            results[m.code] = {
              price: q.price * fxRate,
              change: q.change,
              icon: m.icon,
              name: m.name
            };
          }
        })
      );

      if (Object.keys(results).length === 0) {
        throw new Error("No live metal quotes retrieved");
      }

      const payload = {
        data: results,
        currency,
        timestamp: new Date().toISOString()
      };
      setCache(cacheKey, payload, 60);
      return res.status(200).json(payload);
    } catch (err) {
      console.error("[markets:metals]", err.message);
      return res.status(502).json({
        error: "Metals quotes currently unavailable.",
        code: "METALS_UPSTREAM_ERROR"
      });
    }
  }

  // 3. STOCK INDICES
  if (type === "ticker") {
    const cacheKey = `indices_${country || "global"}`;
    const cached = getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    try {
      const targetIndices = COUNTRY_INDICES[country] || COUNTRY_INDICES["global"];
      const results = [];

      await Promise.all(
        targetIndices.map(async (item) => {
          const q = await fetchYahooQuote(item.symbol);
          if (q) {
            results.push({
              symbol: item.symbol,
              label: item.label,
              price: q.price,
              change: q.change
            });
          }
        })
      );

      if (results.length === 0 && country !== "global") {
        await Promise.all(
          COUNTRY_INDICES["global"].map(async (item) => {
            const q = await fetchYahooQuote(item.symbol);
            if (q) {
              results.push({
                symbol: item.symbol,
                label: item.label,
                price: q.price,
                change: q.change
              });
            }
          })
        );
      }

      if (results.length === 0) {
        throw new Error("No indices quotes retrieved");
      }

      const payload = {
        data: results,
        country: country || "global",
        timestamp: new Date().toISOString()
      };
      setCache(cacheKey, payload, 60);
      return res.status(200).json(payload);
    } catch (err) {
      console.error("[markets:indices]", err.message);
      return res.status(502).json({
        error: "Indices quotes currently unavailable.",
        code: "INDICES_UPSTREAM_ERROR"
      });
    }
  }

  // 4. ENERGY & COMMODITIES
  if (type === "commodities") {
    const cacheKey = `commodities_${currency}`;
    const cached = getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    try {
      const fxRate = await getUsdConversionRate(currency);
      const results = {};

      await Promise.all(
        COMMODITIES_LIST.map(async (item) => {
          const q = await fetchYahooQuote(item.symbol);
          if (q) {
            results[item.name] = {
              price: q.price * fxRate,
              change: q.change,
              unit: currency === "USD" ? item.unit : `${currency} equivalent`,
              icon: item.icon
            };
          }
        })
      );

      if (Object.keys(results).length === 0) {
        throw new Error("No commodity quotes retrieved");
      }

      const payload = {
        data: results,
        currency,
        timestamp: new Date().toISOString()
      };
      setCache(cacheKey, payload, 60);
      return res.status(200).json(payload);
    } catch (err) {
      console.error("[markets:commodities]", err.message);
      return res.status(502).json({
        error: "Commodity pipeline currently unavailable.",
        code: "COMMODITIES_UPSTREAM_ERROR"
      });
    }
  }

  return res.status(400).json({
    error: "Invalid market query type. Supported: forex, metals, ticker, commodities.",
    code: "INVALID_MARKET_TYPE"
  });
}
