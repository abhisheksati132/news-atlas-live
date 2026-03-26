import fetch from 'node-fetch';
import { getCache, setCache } from './utils/cache.js';

const TTL = 5 * 60 * 1000; // 5 minute cache

async function fetchGDP(cc) {
  const res = await fetch(
    `https://api.worldbank.org/v2/country/${cc}/indicator/NY.GDP.MKTP.CD?format=json&mrv=6&per_page=6`
  );
  const json = await res.json();
  if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) return { latest: null, history: [] };
  const history = json[1]
    .filter((d) => d.value !== null && d.value !== undefined)
    .map((d) => ({ year: d.date, value: d.value }))
    .sort((a, b) => a.year - b.year);
  const latest = history.length > 0 ? history[history.length - 1] : null;
  return { latest, history };
}

async function fetchFX() {
  const cacheKey = 'fx_usd';
  const cached = getCache(cacheKey);
  if (cached) return cached;
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) return {};
    const json = await res.json();
    const rates = json.rates
      ? { EUR: json.rates.EUR, GBP: json.rates.GBP, JPY: json.rates.JPY, INR: json.rates.INR, CNY: json.rates.CNY }
      : {};
    setCache(cacheKey, rates, TTL);
    return rates;
  } catch {
    return {};
  }
}

async function fetchCrypto() {
  const cacheKey = 'crypto_top5';
  const cached = getCache(cacheKey);
  if (cached) return cached;
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false'
    );
    if (!res.ok) return [];
    const raw = await res.json();
    const coins = Array.isArray(raw)
      ? raw.map((c) => ({
        name: c.name,
        symbol: c.symbol?.toUpperCase(),
        price: c.current_price,
        change24h: c.price_change_percentage_24h,
      }))
      : [];
    setCache(cacheKey, coins, TTL);
    return coins;
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const countryParam = String(req.query.country || 'USA');
  const countries = countryParam
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  const selected = countries.length > 0 ? countries : ['USA', 'IND', 'GBR', 'JPN', 'CHN'];

  try {
    // Fetch FX and crypto once, shared across all countries
    const [fx, crypto] = await Promise.all([fetchFX(), fetchCrypto()]);

    const perCountry = await Promise.all(
      selected.map(async (cc) => {
        const cacheKey = `econ_gdp_${cc}`;
        const cached = getCache(cacheKey);
        if (cached) return { country: cc, ...cached };
        const gdpData = await fetchGDP(cc);
        setCache(cacheKey, gdpData, TTL);
        return { country: cc, ...gdpData };
      })
    );

    res.status(200).json({ status: 'success', countries: perCountry, fx, crypto });
  } catch (err) {
    console.error('Economics Proxy Error:', err.message);
    res.status(500).json({ error: 'Economics fetch failed', details: err.message });
  }
}
