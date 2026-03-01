import fetch from 'node-fetch';
import { getCache, setCache } from './utils/cache.js';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const countryParam = String(req.query.country || "USA");
  // Support multi-country via comma separated list
  const countries = countryParam
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter((c) => c);
  const defaultCountries = ["USA", "IND", "GBR", "JPN", "CHN"];
  const selected = countries.length > 0 ? countries : defaultCountries;
  const ttl = 60 * 1000; // 1 minute TTL for overall multi-request response

  try {
    // If all data are cached individually, assemble results
    const countryDataPromises = selected.map(async (cc) => {
      const cacheKey = `econ_${cc}`;
      const cached = getCache(cacheKey);
      if (cached) return { country: cc, ...cached };
      // GDP
      const gdpRes = await fetch(`https://api.worldbank.org/v2/country/${cc}/indicator/NY.GDP.MKTP.CD?format=json`);
      const gdpJson = await gdpRes.json();
      let gdpHistory = [];
      let latestGDP = null;
      if (Array.isArray(gdpJson) && gdpJson.length > 1 && Array.isArray(gdpJson[1])) {
        gdpHistory = gdpJson[1]
          .filter((d) => d.value !== null && d.value !== undefined)
          .map((d) => ({ year: d.date, value: d.value }));
        if (gdpHistory.length > 0) latestGDP = gdpHistory[gdpHistory.length - 1];
      }
      // FX & Crypto could be shared; fetch once if not cached
      const fxRes = await fetch("https://open.er-api.com/v6/latest/USD");
      const fxJson = await fxRes.json();
      const fx = fxJson && fxJson.rates ? {
        EUR: fxJson.rates.EUR, GBP: fxJson.rates.GBP, JPY: fxJson.rates.JPY, INR: fxJson.rates.INR, CNY: fxJson.rates.CNY
      } : {}
      const cryptoRes = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false",
      );
      const cryptoRaw = await cryptoRes.ok ? cryptoRes.json() : [];
      const crypto = (Array.isArray(cryptoRaw) ? cryptoRaw : []).map((c) => ({ name: c.name, symbol: c.symbol?.toUpperCase(), price: c.current_price, change24h: c.price_change_percentage_24h }))
    // Save per-country data for quick subsequent responses
    const result = { country: cc, latest: latestGDP, history: gdpHistory }
    setCache(cacheKey, result, ttl)
    return { country: cc, latest: latestGDP, history: gdpHistory }
    })

    const perCountry = await Promise.all(countryDataPromises)

    // FX+Crypto are global; fetch once
    const fxRes = await fetch("https://open.er-api.com/v6/latest/USD");
    const fxJson = await fxRes.json();
    const fx = fxJson && fxJson.rates ? { EUR: fxJson.rates.EUR, GBP: fxJson.rates.GBP, JPY: fxJson.rates.JPY, INR: fxJson.rates.INR, CNY: fxJson.rates.CNY } : {}
    const cryptoRes = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false");
    const cryptoRaw = await cryptoRes.ok ? cryptoRes.json() : [];
    const crypto = (Array.isArray(cryptoRaw) ? cryptoRaw : []).map((c) => ({ name: c.name, symbol: c.symbol?.toUpperCase(), price: c.current_price, change24h: c.price_change_percentage_24h }))

    const resultAll = { status: 'success', countries: perCountry, fx, crypto };
    // Cache individual country entries already done above; cache the aggregated result too (optional)
    res.status(200).json(resultAll)
  } catch (err) {
    console.error('Economics Proxy Error:', err.message);
    res.status(500).json({ error: 'Economics fetch failed', details: err.message });
  }
}
