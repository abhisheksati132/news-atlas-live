import { getCache } from "./utils/cache.js";

export default async function handler(req, res) {
    const regionMapping = [
        { name: "Global", cacheKey: "news|global|top||1|12", coords: [0, 20] },
        { name: "USA", cacheKey: "news|us|top||1|12", coords: [-95, 37] },
        { name: "India", cacheKey: "news|in|top||1|12", coords: [78, 20] },
        { name: "UK", cacheKey: "news|gb|top||1|12", coords: [-2, 54] },
        { name: "Japan", cacheKey: "news|jp|top||1|12", coords: [138, 36] }
    ];

    const regions = {};
    
    // Simple sentiment keywords
    const stressWords = ["war", "conflict", "clash", "protest", "strike", "crisis", "threat", "sanction", "crash", "dead", "attack"];
    
    regionMapping.forEach(r => {
        regions[r.name] = { coords: r.coords, score: 0 };
        const data = getCache(r.cacheKey);
        if (!data || !data.results) return;

        let stressCount = 0;
        data.results.forEach(art => {
            const text = (art.title + " " + (art.description || "")).toLowerCase();
            if (stressWords.some(w => text.includes(w))) stressCount++;
        });

        // Normalize score between 0 and 1
        regions[r.name].score = Math.min(1, stressCount / (data.results.length || 1));
    });

    res.status(200).json({
        status: "success",
        timestamp: new Date().toISOString(),
        data: Object.entries(regions).map(([name, val]) => ({
            name,
            coordinates: val.coords,
            score: val.score
        }))
    });
}
