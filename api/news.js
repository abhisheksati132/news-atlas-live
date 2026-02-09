export default async function handler(req, res) {
    const apiKey = process.env.NEWS_API_KEY; 
    const { category, country, q } = req.query;
    let externalUrl = `https://newsdata.io/api/1/latest?apikey=${apiKey}&language=en`;
    
    if (category && category !== 'top') externalUrl += `&category=${category}`;
    if (country) externalUrl += `&country=${country}`;
    if (q) externalUrl += `&q=${q}`;

    try {
        const response = await fetch(externalUrl);
        const data = await response.json();

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch news data' });
    }
}