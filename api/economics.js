import { getCache, setCache } from "./_utils/cache.js";

const INDICATORS = {
  gdp_billions: "NY.GDP.MKTP.CD",
  gdp_growth_percent: "NY.GDP.MKTP.KD.ZG",
  gdp_per_capita: "NY.GDP.PCAP.CD",
  inflation_rate: "FP.CPI.TOTL.ZG",
  unemployment_rate: "SL.UEM.TOTL.ZS",
  debt_to_gdp: "GC.DOD.TOTL.GD.ZS",
};

function latestObservation(observations = []) {
  return observations.find((item) => item?.value !== null && item?.value !== undefined) || null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const iso3 = String(req.query?.iso3 || "").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(iso3)) {
    return res.status(400).json({ error: "A three-letter ISO country code is required." });
  }

  const cacheKey = `economics_${iso3}`;
  const cached = getCache(cacheKey);
  if (cached) return res.status(200).json(cached);

  try {
    const indicatorKeys = Object.entries(INDICATORS);
    const settledResults = await Promise.allSettled(indicatorKeys.map(async ([key, indicator]) => {
      const response = await fetch(`https://api.worldbank.org/v2/country/${iso3}/indicator/${indicator}?format=json&mrv=10&per_page=10`, {
        signal: AbortSignal.timeout(4000)
      });
      if (!response.ok) return [key, null];
      const [, observations] = await response.json();
      return [key, latestObservation(observations)];
    }));

    const values = {};
    settledResults.forEach((res, idx) => {
      const key = indicatorKeys[idx][0];
      if (res.status === "fulfilled" && Array.isArray(res.value)) {
        values[res.value[0]] = res.value[1];
      } else {
        values[key] = null;
      }
    });
    const payload = {
      source: "World Bank Open Data",
      updated: Object.fromEntries(Object.entries(values).map(([key, observation]) => [key, observation?.date || null])),
      gdp_billions: values.gdp_billions?.value != null ? +(values.gdp_billions.value / 1e9).toFixed(1) : null,
      gdp_growth_percent: values.gdp_growth_percent?.value != null ? +values.gdp_growth_percent.value.toFixed(1) : null,
      gdp_per_capita: values.gdp_per_capita?.value != null ? Math.round(values.gdp_per_capita.value) : null,
      inflation_rate: values.inflation_rate?.value != null ? +values.inflation_rate.value.toFixed(1) : null,
      unemployment_rate: values.unemployment_rate?.value != null ? +values.unemployment_rate.value.toFixed(1) : null,
      debt_to_gdp: values.debt_to_gdp?.value != null ? +values.debt_to_gdp.value.toFixed(1) : null,
      interest_rate: null,
      major_exports: [],
      market_summary: "Macroeconomic indicators from the latest available World Bank observations.",
    };
    setCache(cacheKey, payload, 24 * 60 * 60);
    return res.status(200).json(payload);
  } catch (error) {
    console.error("[economics] World Bank request failed:", error.message);
    return res.status(502).json({ error: "Live macroeconomic data is currently unavailable.", code: "WORLD_BANK_UPSTREAM_ERROR" });
  }
}
