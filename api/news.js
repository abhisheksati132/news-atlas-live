export default async function handler(req, res) {
    const apiKey = process.env.NEWS_API_KEY;
    const { category, country, q } = req.query;

    const params = new URLSearchParams({
        apikey: apiKey,
        language: 'en',
        size: '10',
        removeduplicate: '1'
    });

    if (category && category !== 'top') params.append('category', category);
    if (country) params.append('country', country);
    if (q && q !== 'undefined' && q !== 'null') params.append('q', q);

    const externalUrl = `https://newsdata.io/api/1/latest?${params.toString()}`;

    try {
        const response = await fetch(externalUrl);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch news data' });
    }
}