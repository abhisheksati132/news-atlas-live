// ═══════════════════════════════════════════════════════
// GEO API — Real states/provinces and cities for any country
// Uses CountriesNow API (free, no key required)
// ═══════════════════════════════════════════════════════
export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    if (req.method === "OPTIONS") return res.status(200).end();

    const { country, state, level } = req.query;

    if (!country) return res.status(400).json({ error: 'country param required' });

    try {
        if (level === 'cities' && state) {
            // Fetch cities for a specific state
            const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country, state })
            });
            const data = await response.json();
            if (data.error) return res.status(404).json({ error: data.msg || 'Not found' });
            return res.status(200).json({ cities: data.data || [] });
        } else {
            // Fetch states/provinces for a country
            const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country })
            });
            const data = await response.json();
            if (data.error) return res.status(404).json({ error: data.msg || 'Not found' });
            const states = (data.data?.states || []).map(s => ({
                name: s.name,
                code: s.state_code || ''
            }));
            return res.status(200).json({ states });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Geo fetch failed', detail: err.message });
    }
}
