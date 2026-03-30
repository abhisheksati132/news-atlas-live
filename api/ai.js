export default async function handler(req, res) {
    const apiKey = process.env.GROQ_API_KEY;
    let body = req.body || {};
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
    const promptText = (body.prompt || "").toLowerCase();
    const returnSimulation = () => {
        const now = new Date().toUTCString();
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        let responseText = `[AI SIMULATION — ${now}]\n\nEnvironment scan complete. Sector: Global Intelligence\nStrategic Summary: Analyzing patterns in real-time.`;
        if (promptText.includes("market") || promptText.includes("stock")) responseText = `[MARKETS — ${now}]\n\nS&P 500: ${5200 + rand(-100, 200)} (+0.42%)\nNASDAQ: ${16400 + rand(-200, 400)} (+0.81%)`;
        return res.status(200).json({ candidates: [{ content: { parts: [{ text: responseText }] } }] });
    };
    if (!apiKey) return returnSimulation();
    try {
        const messages = [{ role: "system", content: "Tactical intelligence interface. Concise, data-driven. Headers: [EXECUTIVE_SUMMARY], [CATEGORY]." }];
        if (body.history && Array.isArray(body.history)) body.history.slice(-6).forEach(msg => messages.push(msg));
        messages.push({ role: "user", content: body.prompt || "briefing report" });
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages, temperature: 0.6, max_tokens: 1200 })
        });
        if (!response.ok) throw new Error(`${response.status}`);
        const data = await response.json();
        const aiText = data.choices?.[0]?.message?.content || "SIMULATION_FALLBACK";
        return res.status(200).json({ candidates: [{ content: { parts: [{ text: aiText }] } }] });
    } catch { return returnSimulation(); }
}
