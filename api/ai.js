export default async function handler(req, res) {
    // Diagnostic Probe: Check if AI sector key exists in the environment
    const rawKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
    const hasKey = !!rawKey;
    const isStream = req.query.stream === "true";
    
    // Mission Request Normalization
    let body = req.body;
    if (!body || (typeof body === "object" && Object.keys(body).length === 0)) {
        // Fallback for some serverless environments
        try { body = JSON.parse(req.body); } catch (e) { body = req.body || {}; }
    }

    const locName = body.prompt?.match(/Location: ([^.]+)/)?.[1]?.trim() || "Global Sector";
    const promptText = (body.prompt || "").toLowerCase();

    const returnSimulation = (reason = "Key Probe Failed") => {
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        let responseText = `[SITREP: SIMULATED]\n[SIGNAL_STATUS: ${reason.toUpperCase()}]\n\n[EXECUTIVE_SUMMARY]\nRating: ${rand(6,9)}/10\nSituational awareness for ${locName} sector complete. Tactical baseline maintained.`;
        responseText += `\n\n[POLITICAL_STABILITY]\nRating: ${rand(5,9)}/10\nGovernment sectors in ${locName} are stable. Standard mission parameters active.`;
        responseText += `\n\n[TRADE_RELATIONS]\nRating: ${rand(5,8)}/10\nCross-border relay for ${locName} is within monitored thresholds.`;
        responseText += `\n\n[ECONOMY]\nRating: ${rand(4,7)}/10\nEconomic telemetry for ${locName} show mission-ready resilience.`;
        responseText += `\n\n[TECHNOLOGY]\nRating: ${rand(7,9)}/10\nDigital infrastructure across ${locName} is operating at peak capacity.`;
        responseText += `\n\n[INFLATION]\nRating: ${rand(3,6)}/10\nInflationary pressures in the ${locName} sector are currently stable.`;
        responseText += `\n\n[FOREIGN_RELATIONS]\nRating: ${rand(6,9)}/10\n${locName} diplomatic channels are open and active.`;
        responseText += `\n\n[INFRASTRUCTURE]\nRating: ${rand(7,9)}/10\nMission-critical infrastructure in ${locName} is fully operational.`;

        if (isStream) {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            const words = responseText.split(" ");
            let i = 0;
            const interval = setInterval(() => {
                if (i >= words.length) {
                    res.write("data: [DONE]\n\n");
                    clearInterval(interval);
                    res.end(); return;
                }
                const payload = JSON.stringify({ choices: [{ delta: { content: words.slice(i, i + 3).join(" ") + " " } }] });
                res.write(`data: ${payload}\n\n`);
                i += 3;
            }, 50);
            return;
        }
        return res.status(200).json({ candidates: [{ content: { parts: [{ text: responseText }] } }] });
    };

    if (!hasKey) return returnSimulation("Key Probe Failed: Verify Environment Variables");

    const apiURL = "https://api.groq.com/openai/v1/chat/completions";

    try {
        const messages = [
            { role: "system", content: "You are a professional tactical intelligence interface. Be concise and data-driven. Format with [EXECUTIVE_SUMMARY] and [CATEGORY] headers." },
            { role: "user", content: body.prompt || "Strategic briefing" }
        ];

        const response = await fetch(apiURL, {
            method: "POST",
            headers: { "Authorization": `Bearer ${rawKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ 
                model: "llama-3.3-70b-versatile", 
                messages: messages, 
                temperature: 0.5, 
                stream: isStream 
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(`Groq Uplink Lost: ${errData.error?.message || response.status}`);
        }

        if (isStream) {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            
            if (!response.body) throw new Error("No stream content from Groq");
            
            // Stable stream pipeline
            const reader = response.body.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
            }
            return res.end();
        }

        const data = await response.json();
        const aiText = data.choices?.[0]?.message?.content || "No response generated.";
        return res.status(200).json({ candidates: [{ content: { parts: [{ text: aiText }] } }] });
    } catch (err) {
        return returnSimulation(`Relay Intercepted: ${err.message}`);
    }
}
