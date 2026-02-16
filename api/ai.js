import fetch from 'node-fetch';

export default async function handler(req, res) {

    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

    if (req.method === "OPTIONS") return res.status(200).end();

    const apiKey = process.env.GROQ_API_KEY;

    let body = req.body;
    try {
        if (typeof body === 'string') body = JSON.parse(body);
    } catch (e) {
        return res.status(400).json({ error: "Invalid JSON" });
    }
    
    const prompt = (body?.prompt || "").toLowerCase();

    const returnSimulation = () => {
        let responseText = "";
        if (prompt.includes("briefing") || prompt.includes("tactical") || prompt.includes("intel")) {
            responseText = "SECURE LINK ESTABLISHED. LIVE FEED OFFLINE (MISSING API KEY). SWITCHING TO CACHED INTELLIGENCE. REGIONAL STABILITY: MODERATE. SECTOR ANALYSIS: ONGOING.";
        } else if (prompt.includes("stock market") || prompt.includes("indices") || prompt.includes("market")) {
            responseText = `[INDICES]
• S&P 500: 5,200.00 (+0.5%)
• NASDAQ: 16,400.00 (+0.8%)
[METALS]
• Gold (10g): 2,340.50
• Silver (1kg): 28.15
[BRIEF]
Market volatility detected; tech sector rallying despite geopolitical tension.`;
        } else {
            const jsonResponse = {
                gdp_billions: "2900",
                gdp_growth_percent: "2.1",
                gdp_per_capita: "2400",
                inflation_rate: "4.2",
                unemployment_rate: "3.8",
                interest_rate: "6.5",
                debt_to_gdp: "84",
                major_exports: ["Technology", "Refined Petroleum", "Pharmaceuticals"],
                market_summary: "VOLATILITY DETECTED. ASSETS STABLE."
            };
            responseText = JSON.stringify(jsonResponse);
        }
        return res.status(200).json({
            candidates: [{ content: { parts: [{ text: responseText }] } }]
        });
    };

    if (!apiKey) {
        console.warn("GROQ_API_KEY is missing in Vercel Environment Variables");
        return returnSimulation();
    }

    const url = "https://api.groq.com/openai/v1/chat/completions";

    let systemInstruction = "You are a tactical military intelligence interface. Be concise, professional, and data-driven.";
    
    if (prompt.includes("json") || prompt.includes("economy")) {
        systemInstruction += " You MUST return ONLY valid JSON. Do not use Markdown code blocks.";
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: body.prompt }
                ],
                temperature: 0.5,
                max_tokens: 500
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Groq API Error:", data.error);
            return returnSimulation();
        }

        const aiText = data.choices[0].message.content;

        res.status(200).json({
            candidates: [{
                content: { parts: [{ text: aiText }] }
            }]
        });

    } catch (error) {
        console.error("Server Connection Error:", error);
        return returnSimulation();
    }
}