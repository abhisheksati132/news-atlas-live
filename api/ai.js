export default async function handler(req, res) {

    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

    if (req.method === "OPTIONS") return res.status(200).end();

    const apiKey = process.env.GEMINI_API_KEY;
    const body = req.body;
    const prompt = typeof body === 'string' ? JSON.parse(body).prompt : body?.prompt;

    if (!apiKey) {
        console.warn("API Key Missing - Switching to Simulation Mode");
        return res.status(200).json({
            candidates: [{
                content: { parts: [{ text: ">> SYSTEM ALERT: AI CORE OFFLINE (API KEY MISSING). \n>> DISPLAYING PREDICTIVE MODEL: Sector stability appears nominal. Recommend manual surveillance of key economic indicators." }] }
            }]
        });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();

        if (data.error) {
            console.warn("Google API Error - Switching to Simulation Mode", data.error);
            return res.status(200).json({
                candidates: [{
                    content: { parts: [{ text: `>> SYSTEM ALERT: AI UPLINK UNSTABLE (${data.error.message}). \n>> MAINTAINING VISUALS.` }] }
                }]
            });
        }

        res.status(200).json(data);

    } catch (error) {
        console.error("Server Connection Error", error);
        res.status(200).json({
            candidates: [{
                content: { parts: [{ text: ">> SYSTEM ALERT: UPLINK FAILED. CHECK SERVER LOGS." }] }
            }]
        });
    }
}