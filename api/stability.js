import { getCache } from "./utils/cache.js";

export default async function handler(req, res) {
    // Collect all cached news results
    const cacheKeys = [
        "news|global|top||1|12",
        "news|us|top||1|12",
        "news|in|top||1|12",
        "news|gb|top||1|12",
        "news|jp|top||1|12"
    ];

    const regions = {
        "Global": { coords: [0, 20], score: 0 },
        "USA": { coords: [-95, 37], score: 0 },
        "India": { coords: [78, 20], score: 0 },
        "UK": { coords: [-2, 54], score: 0 },
        "Japan": { coords: [138, 36], score: 0 }
    };

    const newsData = cacheKeys.map(k => getCache(k)).filter(Boolean);
    
    // Simple sentiment keywords
    const stressWords = ["war", "conflict", "clash", "protest", "strike", "crisis", "threat", "sanction", "crash", "dead", "attack"];
    
    newsData.forEach((data, index) => {
        const regionKey = Object.keys(regions)[index];
        if (!regionKey || !data.results) return;

        let stressCount = 0;
        data.results.forEach(art => {
            const text = (art.title + " " + (art.description || "")).toLowerCase();
            if (stressWords.some(w => text.includes(w))) stressCount++;
        });

        // Normalize score between 0 and 1
        regions[regionKey].score = Math.min(1, stressCount / (data.results.length || 1));
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
