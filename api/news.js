import { getCache, setCache } from "./_utils/cache.js";

const BASE_URL = "https://newsapi.org/v2";
const CACHE_TTL = 300; // 5 minutes

async function fetchGoogleNews({ category, q, iso2, size = 12 }) {
    let queryTerm = q || "";
    if (!queryTerm && iso2) {
        queryTerm = iso2;
    }
    if (!queryTerm && category && category !== "general" && category !== "top") {
        queryTerm = category;
    }
    if (!queryTerm) {
        queryTerm = "world";
    }

    const encodedQuery = encodeURIComponent(queryTerm);
    const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

    const res = await fetch(rssUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        signal: AbortSignal.timeout(4000)
    });

    if (!res.ok) {
        throw new Error(`Google News RSS HTTP ${res.status}`);
    }

    const xml = await res.text();
    const results = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && results.length < size) {
        const itemContent = match[1];
        const titleMatch = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemContent.match(/<title>([\s\S]*?)<\/title>/i);
        const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/i);
        const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
        const sourceMatch = itemContent.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
        const descMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || itemContent.match(/<description>([\s\S]*?)<\/description>/i);

        let cleanTitle = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "Intelligence Dispatch";
        const cleanLink = linkMatch ? linkMatch[1].trim() : "#";
        const cleanPubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
        const sourceName = sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "Google News";

        let cleanDesc = "";
        if (descMatch) {
            cleanDesc = descMatch[1].replace(/<[^>]*>?/gm, "").replace(/<!\[CDATA\[|\]\]>/g, "").trim();
        }

        const sourceSplit = cleanTitle.split(" - ");
        if (sourceSplit.length > 1) {
            cleanTitle = sourceSplit.slice(0, -1).join(" - ");
        }

        results.push({
            title: cleanTitle,
            link: cleanLink,
            pubDate: cleanPubDate,
            source: sourceName,
            source_id: sourceName.toLowerCase().replace(/[^a-z0-9]/g, ""),
            source_url: cleanLink,
            category: category || "general",
            description: cleanDesc || "Live verified intelligence dispatch.",
            image: null,
            image_url: null,
            author: null
        });
    }

    return {
        status: "success",
        totalResults: results.length,
        results
    };
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    const { category, q, iso2: rawIso2, page = 1, pageSize = 12, type } = req.query || {};
    const iso2 = rawIso2 ? String(rawIso2).toLowerCase() : undefined;

    if (type === "alerts") {
        return res.status(204).end();
    }

    const pageNum = Math.min(100, Math.max(1, parseInt(String(page), 10) || 1));
    const sizeNum = Math.min(100, Math.max(1, parseInt(String(pageSize), 10) || 12));
    const apiKey = process.env.NEWS_API_KEY;
    const cacheKey = `news|${iso2 || "global"}|${category || "general"}|${q || ""}|${pageNum}|${sizeNum}`;
    const cached = getCache(cacheKey);
    if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(cached);
    }

    // Try NewsAPI if key exists
    if (apiKey) {
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

            const response = await fetch(endpoint, { signal: AbortSignal.timeout(3500) });
            const data = await response.json();

            if (data.status !== "error" && data.articles && data.articles.length > 0) {
                const results = data.articles
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
                res.setHeader("X-Cache", "MISS-NEWSAPI");
                return res.status(200).json(payload);
            }
        } catch (err) {
            console.warn("[news] NewsAPI attempt failed, falling back to Google News:", err.message);
        }
    }

    // Resilient fallback to Google News RSS
    try {
        const payload = await fetchGoogleNews({ category, q, iso2, size: sizeNum });
        setCache(cacheKey, payload, CACHE_TTL);
        res.setHeader("X-Cache", "MISS-GOOGLE");
        return res.status(200).json(payload);
    } catch (err) {
        console.error("[news] Google News fallback failed:", err.message);
        return res.status(502).json({
            status: "error",
            code: "NEWS_FEED_UNAVAILABLE",
            message: "Live news feed temporarily unavailable."
        });
    }
}
