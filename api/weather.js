import fetch from "node-fetch";
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  if (req.method === "OPTIONS") return res.status(200).end();
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing coordinates" });
  }
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,dew_point_2m",
    hourly:
      "temperature_2m,weather_code,visibility,uv_index,precipitation_probability",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum",
    timezone: "auto",
  });
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi&timezone=auto`;
  try {
    const [weatherRes, aqRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(aqUrl)
    ]);
    if (!weatherRes.ok) throw new Error("Weather API failed");
    const data = await weatherRes.json();
    if (aqRes.ok) {
      const aqData = await aqRes.json();
      if (aqData.current && aqData.current.european_aqi !== undefined) {
        data.current.aqi = Math.round(aqData.current.european_aqi);
      }
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weather telemetry" });
  }
}