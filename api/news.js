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

// Country-specific RSS feeds — keyed by ISO2 lowercase code
const COUNTRY_FEEDS = {
    in: [
        { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', category: 'world', source: 'Times of India' },
        { url: 'https://feeds.feedburner.com/ndtvnews-top-stories', category: 'world', source: 'NDTV' },
        { url: 'https://www.thehindu.com/news/national/feeder/default.rss', category: 'world', source: 'The Hindu' },
        { url: 'https://indianexpress.com/feed/', category: 'world', source: 'Indian Express' },
        { url: 'https://www.indiatoday.in/rss/home', category: 'world', source: 'India Today' },
        { url: 'https://economictimes.indiatimes.com/rssfeedsdefault.cms', category: 'business', source: 'Economic Times' },
        { url: 'https://www.livemint.com/rss/news', category: 'business', source: 'Mint' },
        { url: 'https://www.business-standard.com/rss/home_page_top_stories.rss', category: 'business', source: 'Business Standard' },
        { url: 'https://feeds.feedburner.com/NDTV-TechNews', category: 'technology', source: 'NDTV Tech' },
        { url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', category: 'world', source: 'Hindustan Times' },
    ],
    us: [
        { url: 'https://feeds.npr.org/1001/rss.xml', category: 'world', source: 'NPR News' },
        { url: 'https://rssfeeds.usatoday.com/usatoday-NewsTopStories', category: 'world', source: 'USA Today' },
        { url: 'https://feeds.washingtonpost.com/rss/politics', category: 'world', source: 'Washington Post' },
        { url: 'https://www.latimes.com/local/rss2.0.xml', category: 'world', source: 'LA Times' },
        { url: 'https://rss.politico.com/politics-news.xml', category: 'world', source: 'Politico' },
        { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', category: 'business', source: 'MarketWatch' },
        { url: 'https://abcnews.go.com/abcnews/usheadlines', category: 'world', source: 'ABC News' },
        { url: 'https://feeds.foxnews.com/foxnews/national', category: 'world', source: 'Fox News' },
        { url: 'https://www.axios.com/feeds/feed.rss', category: 'world', source: 'Axios' },
        { url: 'https://thehill.com/rss/syndicator/19110', category: 'world', source: 'The Hill' },
    ],
    gb: [
        { url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', category: 'world', source: 'BBC UK' },
        { url: 'https://www.theguardian.com/uk-news/rss', category: 'world', source: 'Guardian UK' },
        { url: 'https://www.independent.co.uk/news/uk/rss', category: 'world', source: 'The Independent' },
        { url: 'https://www.telegraph.co.uk/news/rss.xml', category: 'world', source: 'The Telegraph' },
        { url: 'https://www.dailymail.co.uk/news/index.rss', category: 'world', source: 'Daily Mail' },
    ],
    cn: [
        { url: 'https://www.chinadaily.com.cn/rss/china_rss.xml', category: 'world', source: 'China Daily' },
        { url: 'http://feeds.bbci.co.uk/zhongwen/simp/rss.xml', category: 'world', source: 'BBC Chinese' },
        { url: 'https://www.sixthtone.com/feed', category: 'world', source: 'Sixth Tone' },
        { url: 'https://www.scmp.com/rss/91/feed', category: 'world', source: 'SCMP China' },
    ],
    ru: [
        { url: 'https://tass.com/rss/v2.xml', category: 'world', source: 'TASS' },
        { url: 'https://www.themoscowtimes.com/rss', category: 'world', source: 'Moscow Times' },
        { url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml', category: 'world', source: 'BBC Europe' },
    ],
    de: [
        { url: 'https://www.dw.com/de/rss/rdf/de/rdf.xml', category: 'world', source: 'Deutsche Welle' },
        { url: 'https://www.spiegel.de/schlagzeilen/tops/index.rss', category: 'world', source: 'Der Spiegel' },
    ],
    fr: [
        { url: 'https://www.lemonde.fr/rss/une.xml', category: 'world', source: 'Le Monde' },
        { url: 'https://www.france24.com/en/rss', category: 'world', source: 'France 24' },
    ],
    jp: [
        { url: 'https://www3.nhk.or.jp/nhkworld/en/news/feeds/rss.xml', category: 'world', source: 'NHK World' },
        { url: 'https://japantoday.com/feed', category: 'world', source: 'Japan Today' },
    ],
    au: [
        { url: 'https://www.abc.net.au/news/feed/51120/rss.xml', category: 'world', source: 'ABC Australia' },
        { url: 'https://www.smh.com.au/rss/feed.xml', category: 'world', source: 'Sydney Morning Herald' },
    ],
    ca: [
        { url: 'https://www.cbc.ca/webfeed/rss/rss-canada', category: 'world', source: 'CBC Canada' },
        { url: 'https://globalnews.ca/feed/', category: 'world', source: 'Global News' },
    ],
    br: [
        { url: 'https://feeds.bbci.co.uk/portuguese/brazil/rss.xml', category: 'world', source: 'BBC Brazil' },
        { url: 'https://g1.globo.com/rss/g1/index.rss', category: 'world', source: 'Globo' },
    ],
    pk: [
        { url: 'https://www.dawn.com/feeds/home', category: 'world', source: 'Dawn Pakistan' },
        { url: 'https://arynews.tv/feed/', category: 'world', source: 'ARY News' },
    ],
};

export default async function handler(req, res) {
    // CORS headers
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    const { category, q, iso2 } = req.query;

    try {
        let selectedFeeds = [...FEEDS];

        // Inject country-specific feeds when a country is selected
        if (iso2) {
            const countryCode = iso2.toLowerCase();
            const countrySpecific = COUNTRY_FEEDS[countryCode] || [];
            // Merge: country feeds first, then global, deduplicate by url
            const allUrls = new Set();
            const merged = [];
            for (const f of [...countrySpecific, ...FEEDS]) {
                if (!allUrls.has(f.url)) { allUrls.add(f.url); merged.push(f); }
            }
            selectedFeeds = merged;
        }

        // Filter by category if requested
        if (category && category !== 'top') {
            const catFiltered = selectedFeeds.filter(f => f.category === category);
            selectedFeeds = catFiltered.length > 0 ? catFiltered : selectedFeeds;
        }

        // Process up to 20 feeds simultaneously for speed
        const feedsToProcess = selectedFeeds.slice(0, 20);

        const feedPromises = feedsToProcess.map(async (feed) => {
            try {
                const feedContent = await parser.parseURL(feed.url);
                return feedContent.items.map(item => ({
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    source_id: feed.source.toLowerCase().replace(/\s+/g, ''),
                    source_url: feed.url,
                    source_icon: null,
                    language: 'english',
                    country: [iso2 || 'global'],
                    category: [feed.category],
                    description: item.contentSnippet || item.content || "",
                    image_url: item.media?.['$']?.url || item.enclosure?.url || null
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

        const responseData = {
            status: "success",
            totalResults: allArticles.length,
            results: allArticles.slice(0, 200)
        };

        res.status(200).json(responseData);

    } catch (error) {
        console.error("RSS Handler Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

