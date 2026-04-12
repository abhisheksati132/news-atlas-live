import { getCache, setCache } from "./utils/cache.js";

export default async function handler(req, res) {
    const rawKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
    const hasKey = !!rawKey;
    const isStream = req.query.stream === "true";
    
    let body = req.body;
    if (typeof body === "string" && body.length > 0) {
        try { body = JSON.parse(body); } catch { body = {}; }
    } else if (!body || typeof body !== "object") {
        body = {};
    }

    const locName = body.prompt?.match(/Location: ([^.]+)/)?.[1]?.trim() || "Global Sector";
    const promptText = (body.prompt || "").toLowerCase();

    // AI Intelligence Cache
    const cacheKey = `ai_intel_${locName.replace(/\s+/g, '_')}_${isStream ? 'stream' : 'static'}`;
    const cached = getCache(cacheKey);
    if (cached && !isStream) return res.status(200).json(cached);

    const returnSimulation = () => {
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const isJsonReq = promptText.includes("json") || promptText.includes("{");

        if (isJsonReq) {
            const jsonResp = {
                gdp_billions: rand(500, 4500),
                gdp_growth_percent: (rand(1, 8) + rand(0, 9) / 10).toFixed(1),
                inflation_rate: (rand(2, 12) + rand(0, 9) / 10).toFixed(1),
                market_sentiment: rand(40, 95),
                risk_level: rand(10, 60),
                major_exports: ["Precision Optics", "Energy Relays", "Sector Logistics"],
                strategic_outlook: "STABLE"
            };
            return res.status(200).json({ candidates: [{ content: { parts: [{ text: JSON.stringify(jsonResp) }] } }] });
        }

        let responseText = `[EXECUTIVE_SUMMARY]\nRating: ${rand(7,9)}/10\nStrategic situational awareness for ${locName} sector is complete. High-priority baselines are nominal. No disruptive anomalies detected in the current mission window.`;
        responseText += `\n\n[POLITICAL_STABILITY]\nRating: ${rand(5,9)}/10\nInternal governance sectors in ${locName} maintain standard operational stability. Diplomatic channels remain mission-ready with standard throughput.`;
        responseText += `\n\n[ECONOMY]\nRating: ${rand(5,8)}/10\nMacroeconomic telemetry for ${locName} indicates sustained growth patterns. Fiscal resilience metrics are within primary target bands.`;
        responseText += `\n\n[SUPPLY_CHAIN]\nRating: ${rand(5,8)}/10\nLogistical channels and supply-side metrics for ${locName} are operating at optimized capacity. No significant bottleneck signatures detected.`;

        const payload = { candidates: [{ content: { parts: [{ text: responseText }] } }] };
        setCache(cacheKey, payload, 1800); // 30 min cache for simulations
        return res.status(200).json(payload);
    };

    if (!hasKey) return returnSimulation();

    const apiURL = "https://api.groq.com/openai/v1/chat/completions";

    try {
        // RAG-lite: Attempt to fetch news context for this location from the cache
        const newsCacheKey = `news|global|top||1|12`; // Simplified context grab
        const newsContext = getCache(newsCacheKey);
        let dynamicContext = "";
        
        if (newsContext && newsContext.results) {
            const headlines = newsContext.results.slice(0, 5).map(r => r.title).join("; ");
            dynamicContext = `\n\nCURRENT GLOBAL CONTEXT: ${headlines}`;
        }

        const systemPrompt = `You are the NewsAtlas Intelligence Engine. Goal: Provide high-density, multi-domain situational awareness briefings. Correlate news headlines with economic indicators and regional stability. Identify underlying trends or risks. Be concise, tactical, and direct (2-4 sentences max). Use categorical headers like [EXECUTIVE_SUMMARY], [RISK_ANALYSIS], etc. ${dynamicContext}`;

        const response = await fetch(apiURL, {
            method: "POST",
            headers: { "Authorization": `Bearer ${rawKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ 
                model: "llama-3.3-70b-versatile", 
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: body.prompt || "Strategic briefing" }
                ], 
                temperature: 0.4, 
                stream: isStream 
            })
        });

        if (!response.ok) throw new Error("Groq Uplink Lost");

        if (isStream) {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            if (!response.body) throw new Error("No stream content");
            const reader = response.body.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
            }
            return res.end();
        }

        const data = await response.json();
        const aiText = data.choices?.[0]?.message?.content || "No response generated.";
        const finalPayload = { candidates: [{ content: { parts: [{ text: aiText }] } }] };
        
        setCache(cacheKey, finalPayload, 300); // 5 min cache for real AI
        return res.status(200).json(finalPayload);
    } catch (err) {
        return returnSimulation();
    }
}
