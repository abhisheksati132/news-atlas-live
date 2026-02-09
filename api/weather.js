export default async function handler(req, res) {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and Longitude required" });
    }

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,visibility,surface_pressure,uv_index,cloudcover&timezone=auto`;
        
        const response = await fetch(url);
        const data = await response.json();

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
}