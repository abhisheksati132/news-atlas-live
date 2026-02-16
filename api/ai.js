import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

    if (req.method === "OPTIONS") return res.status(200).end();

    const apiKey = process.env.GEMINI_API_KEY;

    const returnSimulation = () => {
        const simulatedData = {
            briefing: ">> SECURE LINK ESTABLISHED. LIVE FEED OFFLINE. SWITCHING TO CACHED INTELLIGENCE. REGIONAL STABILITY: MODERATE. SECTOR ANALYSIS: ONGOING.",
            economics: { 
                gdp: "EST. 2.9T", 
                inflation: "4.2% (Proj)", 
                unemployment: "3.8%", 
                exports: ["Technology", "Refined Petroleum", "Pharmaceuticals"] 
            },
            market: { 
                summary: "MARKET VOLATILITY DETECTED. ASSETS STABLE.", 
                gold: "2,340.50", 
                silver: "28.15" 
            },
            gdp_billions: "2900",
            gdp_growth_percent: "2.1",
            inflation_rate: "4.2",
            unemployment_rate: "3.8",
            major_exports: ["Technology", "Petroleum", "Pharma"]
        };

        return res.status(200).json({
            candidates: [{
                content: { parts: [{ text: JSON.stringify(simulatedData) }] }
            }]
        });
    };

    if (!apiKey) {
        console.warn("API Key Missing");
        return returnSimulation();
    }

    let body = req.body;
    try {
        if (typeof body === 'string') body = JSON.parse(body);
    } catch (e) {
        return res.status(400).json({ error: "Invalid JSON" });
    }
    
    const prompt = body?.prompt || "Status report.";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.warn("Gemini API Error:", data.error.message);
            return returnSimulation(); 
        }

        res.status(200).json(data);

    } catch (error) {
        console.error("Server Connection Error:", error);
        return returnSimulation();
    }
}