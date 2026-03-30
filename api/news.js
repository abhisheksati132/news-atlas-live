import { getCache, setCache } from "./utils/cache.js";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const BASE_URL = "https://newsapi.org/v2";

export default async function handler(req, res) {
    const { category, q, iso2, page = 1, pageSize = 30 } = req.query;
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ status: "error", message: "NEWS_API_KEY not configured." });
    }

    const cacheKey = `news|${iso2 || "global"}|${category || "general"}|${q || ""}|${page}`;
    const cached = getCache(cacheKey);
    if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(cached);
    }

    try {
        let endpoint, params;

        if (q || iso2) {
            // Search by country name or keyword
            endpoint = `${BASE_URL}/everything`;
            const query = q || iso2; // use country name as search query
            params = new URLSearchParams({
                q: query,
                language: "en",
                sortBy: "publishedAt",
                pageSize: Math.min(parseInt(pageSize), 100),
                page,
                apiKey,
            });
        } else {
            // Top headlines by category
            endpoint = `${BASE_URL}/top-headlines`;
            params = new URLSearchParams({
                language: "en",
                category: category || "general",
                pageSize: Math.min(parseInt(pageSize), 100),
                page,
                apiKey,
            });
        }

        const response = await fetch(`${endpoint}?${params}`);
        const data = await response.json();

        if (data.status !== "ok") {
            return res.status(502).json({ status: "error", message: data.message || "NewsAPI error" });
        }

        // Normalize article shape
        const results = (data.articles || [])
            .filter(a => a.title && a.title !== "[Removed]")
            .map(a => ({
                title: a.title,
                link: a.url,
                pubDate: a.publishedAt,
                source: a.source?.name || "Unknown",
                category: category || "general",
                description: a.description || "",
                image: a.urlToImage || null,
                author: a.author || null,
            }));

        const payload = {
            status: "success",
            totalResults: data.totalResults,
            results,
        };

        setCache(cacheKey, payload, CACHE_TTL);
        res.setHeader("X-Cache", "MISS");
        return res.status(200).json(payload);

    } catch (err) {
        return res.status(500).json({ status: "error", message: err.message });
    }
}