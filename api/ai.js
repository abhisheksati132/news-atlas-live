import { getCache, setCache } from "./_utils/cache.js";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(200).end();

    const rawKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
    const hasKey = Boolean(rawKey);
    const isStream = req.query?.stream === "true";
    
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

    if (!hasKey) {
        return res.status(503).json({
            error: "AI briefing is unavailable because GROQ_API_KEY is not configured.",
            code: "AI_NOT_CONFIGURED"
        });
    }

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

        if (!response.ok) {
            return res.status(502).json({
                error: "Groq could not complete this request.",
                code: "GROQ_UPSTREAM_ERROR",
                upstreamStatus: response.status
            });
        }

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
        console.error("[ai]", err.message);
        return res.status(502).json({
            error: "AI briefing service could not be reached.",
            code: "GROQ_NETWORK_ERROR"
        });
    }
}
