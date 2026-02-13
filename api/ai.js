export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

    if (req.method === "OPTIONS") return res.status(200).end();

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Helper to return simulation data if API fails
    const returnSimulation = (msg) => {
        return res.status(200).json({
            candidates: [{
                content: { parts: [{ text: JSON.stringify({
                    briefing: `>> SYSTEM ALERT: ${msg} >> SIMULATION MODE ACTIVE. Sector stability nominal.`,
                    economics: { gdp: "EST. 2.4T", inflation: "3.2%", unemployment: "4.1%", exports: ["Simulated Data", "Energy", "Tech"] },
                    market: { summary: "Market data simulated due to connection failure.", gold: "2045.00", silver: "28.50" }
                }) }] }
            }]
        });
    };

    if (!apiKey) {
        console.warn("API Key Missing");
        return returnSimulation("API KEY MISSING");
    }

    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    const prompt = body?.prompt;

    // Use standard 1.5 Flash (Most stable for free tier)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();

        // Handle Google Errors (Quota Exceeded, etc.)
        if (data.error) {
            console.warn("Gemini API Error:", data.error.message);
            return returnSimulation("QUOTA EXCEEDED / UPLINK UNSTABLE");
        }

        res.status(200).json(data);

    } catch (error) {
        console.error("Server Connection Error:", error);
        return returnSimulation("SERVER CONNECTION FAILED");
    }
}