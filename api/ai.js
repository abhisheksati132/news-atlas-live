export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

    if (req.method === "OPTIONS") return res.status(200).end();

    const apiKey = process.env.GEMINI_API_KEY;
    const { prompt } = req.body || {};

    if (!apiKey) return res.status(500).json({ error: "Server Error: Missing API Key" });
    if (!prompt) return res.status(400).json({ error: "Client Error: No prompt provided" });

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
            console.error("Gemini API Error:", data.error);
            return res.status(500).json({ error: "AI Error", details: data.error.message });
        }

        res.status(200).json(data);

    } catch (error) {
        console.error("Server Crash:", error);
        res.status(500).json({ error: "Server Connection Failed", details: error.message });
    }
}