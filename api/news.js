import { getCache, setCache } from "./utils/cache.js";

const CACHE_TTL = 5 * 60 * 1000;
const BASE_URL = "https://newsapi.org/v2";

function decodeXml(value = "") {
    return value
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}

function tagValue(xml, tag) {
    return decodeXml((xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i")) || [])[1] || "").trim();
}

async function fetchGoogleNews({ category, q, iso2, size }) {
    const searchTerm = q?.trim() || (category && category !== "top" ? `${category} news` : "world news");
    const countryHint = iso2 ? ` ${iso2}` : "";
    const feedUrl = `https://news.google.com/rss/search?${new URLSearchParams({ q: `${searchTerm}${countryHint}`, hl: "en-US", gl: "US", ceid: "US:en" })}`;
    const response = await fetch(feedUrl, { headers: { "User-Agent": "NewsAtlas/1.0" } });
    if (!response.ok) throw new Error(`Google News RSS HTTP ${response.status}`);

    const xml = await response.text();
    const results = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => {
        const item = match[1];
        const sourceMatch = item.match(/<source(?:\s+url="([^"]*)")?>([\s\S]*?)<\/source>/i);
        return {
            title: tagValue(item, "title"),
            link: tagValue(item, "link"),
            pubDate: tagValue(item, "pubDate") || null,
            source: decodeXml(sourceMatch?.[2] || "Google News"),
            source_id: "google-news-rss",
            source_url: decodeXml(sourceMatch?.[1] || ""),
            category: category || "general",
            description: tagValue(item, "description"),
            image: null,
            image_url: null,
            author: null,
        };
    }).filter((article) => article.title && article.link).slice(0, size);

    return {
        status: "success",
        totalResults: results.length,
        results,
        source: "Google News RSS",
        freshness: "provider-managed",
    };
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    const { category, q, iso2, page = 1, pageSize = 12 } = req.query || {};
    const pageNum = Math.min(100, Math.max(1, parseInt(String(page), 10) || 1));
    const sizeNum = Math.min(100, Math.max(1, parseInt(String(pageSize), 10) || 12));
    const apiKey = process.env.NEWS_API_KEY;
    const cacheKey = `news|${iso2 || "global"}|${category || "general"}|${q || ""}|${pageNum}|${sizeNum}`;
    const cached = getCache(cacheKey);
    if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(cached);
    }

    if (!apiKey) {
        try {
            const payload = await fetchGoogleNews({ category, q, iso2, size: sizeNum });
            setCache(cacheKey, payload, CACHE_TTL);
            res.setHeader("X-Cache", "MISS");
            return res.status(200).json(payload);
        } catch (err) {
            console.error("[news] Google News RSS fallback failed:", err.message);
            return res.status(502).json({
                status: "error",
                code: "GOOGLE_NEWS_RSS_UPSTREAM_ERROR",
                message: "Live news is currently unavailable."
            });
        }
    }

    try {
        const params = new URLSearchParams({
            apiKey,
            language: "en",
            pageSize: String(sizeNum),
            page: String(pageNum),
        });

        let endpoint;
        if (q) {
            params.set("q", q);
            endpoint = `${BASE_URL}/everything?${params.toString()}`;
        } else {
            const supportedCountries = ['ae','ar','at','au','be','bg','br','ca','ch','cn','co','cu','cz','de','eg','fr','gb','gr','hk','hu','id','ie','il','in','it','jp','kr','lt','lv','ma','mx','my','ng','nl','no','nz','ph','pl','pt','ro','rs','ru','sa','se','sg','si','sk','th','tr','tw','ua','us','ve','za'];
            if (iso2 && supportedCountries.includes(iso2.toLowerCase())) params.set("country", iso2.toLowerCase());
            
            const validCats = ['business','entertainment','general','health','science','sports','technology'];
            let targetCat = (category || 'general').toLowerCase();
            if (targetCat === 'top' || !validCats.includes(targetCat)) targetCat = 'general';
            params.set("category", targetCat);
            endpoint = `${BASE_URL}/top-headlines?${params.toString()}`;
        }

        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.status === "error") {
            return res.status(502).json({ status: "error", message: data.message || "NewsAPI.org error" });
        }

        // If top-headlines returned 0 results for a country, try /everything with iso2 as keyword
        if ((!data.articles || data.articles.length === 0) && !q && iso2) {
            console.warn(`[news] No headlines for ${iso2}, falling back to Everything search...`);
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
            results: results.slice(0, sizeNum),
        };

        setCache(cacheKey, payload, CACHE_TTL);
        res.setHeader("X-Cache", "MISS");
        return res.status(200).json(payload);

    } catch (err) {
        return res.status(500).json({ status: "error", message: err.message });
    }
}
