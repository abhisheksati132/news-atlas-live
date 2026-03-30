export default async function handler(req, res) {
    const apiKey = process.env.GROQ_API_KEY;
    let body = req.body || {};

    if (typeof body === "string") {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const promptText = (body.prompt || "").toLowerCase();

    // Professional Simulation Core
    const returnSimulation = () => {
        const now = new Date().toUTCString();
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        
        let responseText = `[AI SIMULATION — ${now}]\n\nEnvironment scan complete. No external API key detected. Running in locally synthesized intelligence mode.\n\nSector: Global Intelligence\nStrategic Summary: Stabilized baseline. Analyzing patterns in real-time.`;

        if (promptText.includes("market") || promptText.includes("stock")) {
            responseText = `[MARKET ANALYSIS — ${now}]\n\nS&P 500: ${5200 + rand(-100, 200)} (+0.42%)\nNASDAQ: ${16400 + rand(-200, 400)} (+0.81%)\n\nSentiment: Cautiously Optimistic. Monitoring Fed guidance.`;
        }

        return res.status(200).json({
            candidates: [{ content: { parts: [{ text: responseText }] } }]
        });
    };

    if (!apiKey) return returnSimulation();

    const apiURL = "https://api.groq.com/openai/v1/chat/completions";

    try {
        const systemInstruction = "You are a professional tactical intelligence interface. Be concise and data-driven. Format with [EXECUTIVE_SUMMARY] and [CATEGORY] headers.";
        const messages = [{ role: "system", content: systemInstruction }];
        
        if (body.history && Array.isArray(body.history)) {
            body.history.slice(-6).forEach(msg => messages.push(msg));
        }
        messages.push({ role: "user", content: body.prompt || "briefing report" });

        const response = await fetch(apiURL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: messages,
                temperature: 0.6,
                max_tokens: 1200,
            })
        });

        if (!response.ok) throw new Error(`Groq API Error: ${response.status}`);

        const data = await response.json();
        const aiText = data.choices?.[0]?.message?.content || "SIMULATION_FALLBACK: NO_CONTENT";
        
        return res.status(200).json({
            candidates: [{ content: { parts: [{ text: aiText }] } }]
        });
    } catch (err) {
        console.error("AI Error:", err);
        return returnSimulation();
    }
}
