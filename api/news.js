import { getCache, setCache } from "./utils/cache.js";

const CACHE_TTL = 5 * 60 * 1000;
const BASE_URL = "https://newsapi.org/v2";

export default async function handler(req, res) {
    const { category, q, iso2, page = 1, pageSize = 12 } = req.query;
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
        console.warn("NEWS_API_KEY not found. Running in simulation mode.");
        const results = [
            { title: "Global Markets Stabilize Amidst Policy Shifts", link: "#", pubDate: new Date().toISOString(), source: "Intelligence Feed", description: "Market analysts report a stabilized baseline for global equities.", category: "general", image: null },
            { title: "Geopolitical Tensions Ease in Strategic Corridors", link: "#", pubDate: new Date().toISOString(), source: "Global Monitor", description: "Diplomatic efforts lead to successful de-escalation in key trade zones.", category: "general", image: null },
            { title: "Climate Summit Reaches Historic Agreement", link: "#", pubDate: new Date().toISOString(), source: "Environment Desk", description: "World leaders commit to accelerated emissions reduction targets.", category: "general", image: null },
            { title: "Technology Sector Drives Economic Momentum", link: "#", pubDate: new Date().toISOString(), source: "Tech Intel", description: "AI and semiconductor industries lead global GDP contributions this quarter.", category: "general", image: null },
            { title: "Strategic Infrastructure Investments Announced", link: "#", pubDate: new Date().toISOString(), source: "Policy Watch", description: "Major economies unveil coordinated infrastructure spending programs.", category: "general", image: null },
            { title: "Energy Transition Accelerates Across G20 Nations", link: "#", pubDate: new Date().toISOString(), source: "Energy Monitor", description: "Renewable capacity additions reach record levels for second consecutive year.", category: "general", image: null }
        ];
        return res.status(200).json({ status: "success", results, totalResults: results.length });
    }

    const cacheKey = `news|${iso2 || "global"}|${category || "general"}|${q || ""}|${page}`;
    const cached = getCache(cacheKey);
    if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(cached);
    }

    try {
        const params = new URLSearchParams({
            apiKey,
            language: "en",
            pageSize: 100,
            page: parseInt(page)
        });

        // NewsAPI.org: if we have a search query, use /everything, else use /top-headlines
        let endpoint = `${BASE_URL}/top-headlines?${params}`;

        if (q) {
            endpoint = `${BASE_URL}/everything?${params}&q=${encodeURIComponent(q)}`;
        } else {
            const supportedCountries = ['ae','ar','at','au','be','bg','br','ca','ch','cn','co','cu','cz','de','eg','fr','gb','gr','hk','hu','id','ie','il','in','it','jp','kr','lt','lv','ma','mx','my','ng','nl','no','nz','ph','pl','pt','ro','rs','ru','sa','se','sg','si','sk','th','tr','tw','ua','us','ve','za'];
            if (iso2 && supportedCountries.includes(iso2.toLowerCase())) params.set("country", iso2.toLowerCase());
            
            const validCats = ['business','entertainment','general','health','science','sports','technology'];
            let targetCat = (category || 'general').toLowerCase();
            if (targetCat === 'top' || !validCats.includes(targetCat)) targetCat = 'general';
            params.set("category", targetCat);
            endpoint = `${BASE_URL}/top-headlines?${params}`;
        }

        const response = await fetch(endpoint);
        const data = await response.json();

        // FALLBACK LOGIC: If top-headlines returned 0 results for a country, try /everything with the country/category as a query
        if ((!data.results || data.results.length === 0) && (!data.articles || data.articles.length === 0) && !q && iso2) {
            console.log(`[news] No headlines for ${iso2}, falling back to Everything search...`);
            const fallbackParams = new URLSearchParams({
                apiKey,
                language: "en",
                pageSize: 40,
                q: iso2, // Search for the country ID as a keyword
                sortBy: "relevance"
            });
            const fallbackRes = await fetch(`${BASE_URL}/everything?${fallbackParams}`);
            const fallbackData = await fallbackRes.json();
            if (fallbackData.status !== 'error') {
                data.articles = (data.articles || []).concat(fallbackData.articles || []);
                data.totalResults = (data.totalResults || 0) + (fallbackData.totalResults || 0);
            }
        }

        if (data.status === 'error') {
            return res.status(502).json({ status: "error", message: data.message || "NewsAPI.org error" });
        }

        const results = (data.articles || [])
            .filter(a => a.title && a.title !== '[Removed]')
            .map(a => ({
                title: a.title,
                link: a.url,
                pubDate: a.publishedAt,
                source: a.source?.name || "Global News",
                source_id: a.source?.id || "newsapi",
                source_url: a.url,
                category: category || "general",
                description: a.description || "",
                image: a.urlToImage || null,
                image_url: a.urlToImage || null,
                author: a.author || null,
            }));

        const payload = {
            status: "success",
            totalResults: data.totalResults || results.length,
            results,
        };

        setCache(cacheKey, payload, CACHE_TTL);
        res.setHeader("X-Cache", "MISS");
        return res.status(200).json(payload);

    } catch (err) {
        return res.status(500).json({ status: "error", message: err.message });
    }
}