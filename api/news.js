import Parser from 'rss-parser';

const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'media'],
            ['content:encoded', 'contentEncoded'],
        ]
    }
});

const FEEDS = [
    // GLOBAL NEWS
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'world', source: 'BBC News' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'world', source: 'Al Jazeera' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'world', source: 'NY Times' },

    // TECH
    { url: 'https://techcrunch.com/feed/', category: 'technology', source: 'TechCrunch' },
    { url: 'https://www.theverge.com/rss/index.xml', category: 'technology', source: 'The Verge' },
    { url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'technology', source: 'Ars Technica' },

    // BUSINESS / FINANCE / MARKETS
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', category: 'business', source: 'CNBC' },
    { url: 'https://finance.yahoo.com/news/rssindex', category: 'markets', source: 'Yahoo Finance' },

    // CRYPTO
    { url: 'https://cointelegraph.com/rss', category: 'crypto', source: 'CoinTelegraph' },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'crypto', source: 'CoinDesk' },

    // SCIENCE / ENVIRONMENT
    { url: 'https://www.sciencedaily.com/rss/all.xml', category: 'science', source: 'ScienceDaily' },
    { url: 'https://phys.org/rss-feed/', category: 'science', source: 'Phys.org' }
];

export default async function handler(req, res) {
    // CORS headers
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    const { category, q } = req.query;

    try {
        let selectedFeeds = FEEDS;

        // Filter by category if requested
        if (category && category !== 'top') {
            selectedFeeds = FEEDS.filter(f => f.category === category || category === 'top');
            // If strict category match returns nothing (e.g. 'health' not in our list), fallback to all
            if (selectedFeeds.length === 0) selectedFeeds = FEEDS;
        }

        // Shuffle feeds to get diversity each time
        selectedFeeds = selectedFeeds.sort(() => 0.5 - Math.random()).slice(0, 5); // Take random 5 sources

        const feedPromises = selectedFeeds.map(async (feed) => {
            try {
                const feedContent = await parser.parseURL(feed.url);
                return feedContent.items.map(item => ({
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    source_id: feed.source.toLowerCase().replace(/\s+/g, ''),
                    source_url: feed.url,
                    source_icon: null, // RSS doesn't give icons usually
                    language: 'english',
                    country: ['global'],
                    category: [feed.category],
                    description: item.contentSnippet || item.content || "",
                    image_url: item.media?.['$']?.url || item.enclosure?.url || null // Try to find an image
                }));
            } catch (err) {
                console.error(`Failed to parse feed ${feed.url}:`, err.message);
                return [];
            }
        });

        const results = await Promise.all(feedPromises);
        let allArticles = results.flat();

        // Filter by search query if provided
        if (q) {
            const lowerQ = q.toLowerCase();
            allArticles = allArticles.filter(a =>
                (a.title && a.title.toLowerCase().includes(lowerQ)) ||
                (a.description && a.description.toLowerCase().includes(lowerQ))
            );
        }

        // Sort by date (newest first)
        allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // Format to match old API response structure partially
        const responseData = {
            status: "success",
            totalResults: allArticles.length,
            results: allArticles.slice(0, 50) // Limit to 50 items
        };

        res.status(200).json(responseData);

    } catch (error) {
        console.error("RSS Handler Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
