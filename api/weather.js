import { getCache, setCache } from "./utils/cache.js";

export default async function handler(req, res) {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing latitude/longitude query params' });
  }

  const cacheKey = `weather_${lat}_${lon}`;
  const cached = getCache(cacheKey);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    return res.status(200).json(cached);
  }

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,dew_point_2m',
    hourly: 'temperature_2m,weather_code,visibility,uv_index,precipitation_probability',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum',
    timezone: 'auto',
  });

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?${params}`;
  const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi&timezone=auto`;

  try {
    let weatherRes;
    try {
      weatherRes = await fetch(weatherUrl);
    } catch (e) {
      throw new Error(`Weather API fetch failed: ${e.message}`);
    }
    if (!weatherRes.ok) throw new Error(`Weather API error: ${weatherRes.status}`);

    const data = await weatherRes.json();
    let aqRes = null;
    try {
      aqRes = await fetch(aqUrl);
    } catch (e) {
      console.warn('[weather] Air Quality fetch failed:', e.message);
    }

    if (aqRes && aqRes.ok) {
      try {
        const aqData = await aqRes.json();
        if (aqData?.current?.european_aqi !== undefined) {
          data.current.aqi = Math.round(aqData.current.european_aqi);
        }
      } catch { /* AQ is supplementary, ignore parse errors */ }
    }

    setCache(cacheKey, data, 900); // 15 min cache
    res.setHeader("X-Cache", "MISS");
    res.status(200).json(data);
  } catch (error) {
    console.error('[weather] Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}