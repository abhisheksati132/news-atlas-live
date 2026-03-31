export default async function handler(req, res) {
    const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
    const isStream = req.query.stream === "true";
    let body = req.body || {};

    if (typeof body === "string") {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const promptText = (body.prompt || "").toLowerCase();

    const returnSimulation = (reason = "No API Key Detected") => {
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        let location = "Global Intelligence";
        const locMatch = body.prompt?.match(/Location: ([^.]+)/);
        if (locMatch) location = locMatch[1].trim();

        let responseText = `[SITREP: SIMULATED]\n[SIGNAL_STATUS: ${reason.toUpperCase()}]\n\n[EXECUTIVE_SUMMARY]\nRating: ${rand(6,9)}/10\nIntelligence sweep for ${location} complete. Strategic baseline indicators are stable. Monitoring local developments across key sectors.`;
        responseText += `\n\n[POLITICAL_STABILITY]\nRating: ${rand(5,9)}/10\nGovernment institutions in ${location} are maintaining operational continuity. Policy frameworks remain intact with standard activity.`;
        responseText += `\n\n[TRADE_RELATIONS]\nRating: ${rand(5,8)}/10\nCross-border trade flows for ${location} are within monitored thresholds. Strategic corridors remain open.`;
        responseText += `\n\n[ECONOMY]\nRating: ${rand(4,7)}/10\nEconomic indicators for ${location} show resilience. Employment data is stable with growth sectors maintained.`;

        if (isStream) {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            const words = responseText.split(" ");
            let i = 0;
            const interval = setInterval(() => {
                if (i >= words.length) {
                    res.write("data: [DONE]\n\n");
                    clearInterval(interval);
                    res.end();
                    return;
                }
                const chunk = words.slice(i, i + 3).join(" ") + " ";
                const payload = JSON.stringify({ choices: [{ delta: { content: chunk } }] });
                res.write(`data: ${payload}\n\n`);
                i += 3;
            }, 40);
            return;
        }
        return res.status(200).json({ candidates: [{ content: { parts: [{ text: responseText }] } }] });
    };

    if (!apiKey) return returnSimulation("Key Missing from Environment");

    const apiURL = "https://api.groq.com/openai/v1/chat/completions";

    try {
        const messages = [
            { role: "system", content: "You are a professional tactical intelligence interface. Be concise and data-driven. Format with [EXECUTIVE_SUMMARY] and [CATEGORY] headers." },
            { role: "user", content: body.prompt || "briefing report" }
        ];

        // Attempt primary model, fallback to 8b if it fails
        const fetchBriefing = async (modelName) => {
            return await fetch(apiURL, {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({ model: modelName, messages: messages, temperature: 0.5, max_tokens: 1000, stream: isStream })
            });
        };

        let response = await fetchBriefing("llama-3.3-70b-versatile");
        if (!response.ok) {
            console.warn("Primary model failed, failing over to llama3-8b-8192");
            response = await fetchBriefing("llama3-8b-8192");
        }

        if (!response.ok) throw new Error(`Groq Gateway Error: ${response.status}`);

        if (isStream) {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            response.body.pipe(res);
            return;
        }

        const data = await response.json();
        const aiText = data.choices?.[0]?.message?.content || "No response generated.";
        return res.status(200).json({ candidates: [{ content: { parts: [{ text: aiText }] } }] });
    } catch (err) {
        return returnSimulation(`Connection Blocked: ${err.message}`);
    }
}
