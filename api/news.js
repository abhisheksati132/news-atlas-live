import { getCache, setCache } from "./utils/cache.js";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const BASE_URL = "https://gnews.io/api/v4";

export default async function handler(req, res) {
    const { category, q, iso2, page = 1, pageSize = 10 } = req.query;
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
        const params = new URLSearchParams({
            token: apiKey,
            lang: "en",
            max: Math.min(parseInt(pageSize), 10),
        });

        if (q || iso2) {
            params.set("q", q || iso2);
        } else {
            params.set("topic", category || "breaking-news");
        }

        const response = await fetch(`${BASE_URL}/search/titlesonly?${params}`);
        const data = await response.json();

        if (data.errors) {
            return res.status(502).json({ status: "error", message: data.errors[0] || "GNews API error" });
        }

        const results = (data.articles || [])
            .filter(a => a.title)
            .map(a => ({
                title: a.title,
                link: a.url,
                pubDate: a.publishedAt,
                source: a.source?.name || "Unknown",
                category: category || "general",
                description: a.description || "",
                image: a.image || null,
                author: null,
            }));

        const payload = {
            status: "success",
            totalResults: data.totalArticles || results.length,
            results,
        };

        setCache(cacheKey, payload, CACHE_TTL);
        res.setHeader("X-Cache", "MISS");
        return res.status(200).json(payload);

    } catch (err) {
        return res.status(500).json({ status: "error", message: err.message });
    }
}