export default async function handler(req, res) {

    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

    if (req.method === "OPTIONS") return res.status(200).end();

    const apiKey = process.env.NEWS_API_KEY;
    const { category, country, q } = req.query;

    const params = new URLSearchParams({
        apikey: apiKey,
        language: 'en',
        size: '50',
        removeduplicate: '1'
    });

    // Category mapping: newsdata.io supports: business, entertainment, environment,
    // food, health, politics, science, sports, technology, tourism, world, top
    // "crypto" is NOT a valid category — map it to a search query instead
    const categoryQueryMap = {
        'crypto': 'cryptocurrency bitcoin ethereum',
        'markets': 'stock market finance trading'
    };

    const validCategories = ['business', 'entertainment', 'environment', 'food', 'health', 'politics', 'science', 'sports', 'technology', 'tourism', 'world'];

    if (category && category !== 'top') {
        if (categoryQueryMap[category]) {
            // Use q param for unsupported categories
            params.append('q', categoryQueryMap[category]);
        } else if (validCategories.includes(category)) {
            params.append('category', category);
        }
    }

    // Country filter
    if (country && country !== 'undefined' && country !== 'null' && country !== '') {
        params.append('country', country);
    }

    // User search query (overrides/augments country q)
    if (q && q !== 'undefined' && q !== 'null' && q !== '') {
        // If we already appended a q for category, combine; otherwise just set
        if (params.has('q')) {
            const existing = params.get('q');
            params.set('q', `${existing} ${q}`);
        } else {
            params.append('q', q);
        }
    }

    const externalUrl = `https://newsdata.io/api/1/news?${params.toString()}`;

    try {
        const response = await fetch(externalUrl);
        const data = await response.json();

        if (data.status === "error") {
            return res.status(400).json({ error: data.results?.message || "API Error" });
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Server connection failed' });
    }
}