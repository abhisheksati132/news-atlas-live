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
    { url: 'http://rss.cnn.com/rss/edition_world.rss', category: 'world', source: 'CNN' },
    { url: 'https://www.theguardian.com/world/rss', category: 'world', source: 'The Guardian' },

    // TECH
    { url: 'https://techcrunch.com/feed/', category: 'technology', source: 'TechCrunch' },
    { url: 'https://www.theverge.com/rss/index.xml', category: 'technology', source: 'The Verge' },
    { url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'technology', source: 'Ars Technica' },
    { url: 'https://www.engadget.com/rss.xml', category: 'technology', source: 'Engadget' },
    { url: 'https://www.wired.com/feed/rss', category: 'technology', source: 'Wired' },

    // BUSINESS / FINANCE / MARKETS
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', category: 'business', source: 'CNBC' },
    { url: 'https://finance.yahoo.com/news/rssindex', category: 'markets', source: 'Yahoo Finance' },
    { url: 'https://www.forbes.com/business/feed/', category: 'business', source: 'Forbes' },
    { url: 'https://www.economist.com/sections/business-finance/rss.xml', category: 'business', source: 'The Economist' },

    // CRYPTO
    { url: 'https://cointelegraph.com/rss', category: 'crypto', source: 'CoinTelegraph' },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'crypto', source: 'CoinDesk' },
    { url: 'https://bitcoinmagazine.com/.rss/full/', category: 'crypto', source: 'Bitcoin Magazine' },

    // SCIENCE / ENVIRONMENT
    { url: 'https://www.sciencedaily.com/rss/all.xml', category: 'science', source: 'ScienceDaily' },
    { url: 'https://phys.org/rss-feed/', category: 'science', source: 'Phys.org' },
    { url: 'https://www.nature.com/nature.rss', category: 'science', source: 'Nature' }
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

        // Increased diversity: Process up to 15 random feeds simultaneously
        selectedFeeds = selectedFeeds.sort(() => 0.5 - Math.random()).slice(0, 15);

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
            results: allArticles.slice(0, 200) // Significantly increased limit to 200 items
        };

        res.status(200).json(responseData);

    } catch (error) {
        console.error("RSS Handler Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
