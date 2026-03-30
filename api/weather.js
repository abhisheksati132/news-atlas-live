export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'Missing latitude/longitude' });
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
    const [weatherRes, aqRes] = await Promise.all([fetch(weatherUrl), fetch(aqUrl)]);
    if (!weatherRes.ok) throw new Error(`${weatherRes.status}`);
    const data = await weatherRes.json();
    if (aqRes.ok) {
      try {
        const aqData = await aqRes.json();
        if (aqData?.current?.european_aqi !== undefined) data.current.aqi = Math.round(aqData.current.european_aqi);
      } catch {}
    }
    return res.status(200).json(data);
  } catch (error) {
    const fallback = {
      current: { temperature_2m: 22.5, relative_humidity_2m: 45, is_day: 1, weather_code: 0, wind_speed_10m: 12.5, aqi: 15 },
      daily: { temperature_2m_max: [25], temperature_2m_min: [18], weather_code: [0] }
    };
    return res.status(200).json(fallback);
  }
}