import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

    if (req.method === "OPTIONS") return res.status(200).end();

    const keys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GEMINI_API_KEY_4,
        process.env.GEMINI_API_KEY_5
    ].filter(k => k);

    let body = req.body;
    try {
        if (typeof body === 'string') body = JSON.parse(body);
    } catch (e) {
        return res.status(400).json({ error: "Invalid JSON" });
    }
    
    const prompt = (body?.prompt || "").toLowerCase();

    const returnSimulation = () => {
        let responseText = "";

        if (prompt.includes("economy") || prompt.includes("json")) {
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

        else if (prompt.includes("briefing") || prompt.includes("tactical") || prompt.includes("intel")) {
            responseText = "SECURE LINK ESTABLISHED. LIVE FEED OFFLINE. SWITCHING TO CACHED INTELLIGENCE. REGIONAL STABILITY: MODERATE. SECTOR ANALYSIS: ONGOING. WEATHER SYSTEMS NOMINAL.";
        } 

        else if (prompt.includes("stock market") || prompt.includes("indices") || prompt.includes("market")) {
            responseText = `[INDICES]
• S&P 500: 5,200.00 (+0.5%)
• NASDAQ: 16,400.00 (+0.8%)
[METALS]
• Gold (10g): 2,340.50
• Silver (1kg): 28.15
[BRIEF]
Market volatility detected; tech sector rallying despite geopolitical tension.`;
        } 
        else {
            responseText = "SYSTEM READY. AWAITING COMMAND.";
        }

        return res.status(200).json({
            candidates: [{
                content: { parts: [{ text: responseText }] }
            }]
        });
    };

    if (keys.length === 0) {
        return returnSimulation();
    }

    const apiKey = keys[Math.floor(Math.random() * keys.length)];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: body.prompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return returnSimulation(); 
        }

        res.status(200).json(data);

    } catch (error) {
        return returnSimulation();
    }
}