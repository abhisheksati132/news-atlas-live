import { getCache, setCache } from "./utils/cache.js";

const CACHE_TTL = 5 * 60 * 1000;
const BASE_URL = "https://gnews.io/api/v4";

export default async function handler(req, res) {
    const { category, q, iso2, page = 1, pageSize = 10 } = req.query;
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
            token: apiKey,
            lang: "en",
            max: Math.min(parseInt(pageSize), 10),
        });

        if (q || iso2) {
            params.set("q", q || iso2);
        } else {
            params.set("topic", category || "breaking-news");
        }

        const response = await fetch(`${BASE_URL}/search?${params}`);
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
                source_id: a.source?.name || "Unknown",
                source_url: a.source?.url || "",
                category: category || "general",
                description: a.description || "",
                image: a.image || null,
                image_url: a.image || null,
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