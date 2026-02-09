export default async function handler(req, res) {
    const apiKey = process.env.GEMINI_API_KEY; 

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;

    if (!apiKey) {
        console.error("API Key missing in Vercel Environment");
        return res.status(500).json({ error: "Server missing API Key" });
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Google API Error:", JSON.stringify(errorData));
            return res.status(response.status).json({ error: "Google API Error", details: errorData });
        }

        const data = await response.json();
        res.status(200).json(data);

    } catch (error) {
        console.error("Server processing error:", error);
        res.status(500).json({ error: "AI Processing Failed" });
    }
}