export default async function handler(req, res) {
    const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
    const isStream = req.query.stream === "true";
    let body = req.body || {};

    if (typeof body === "string") {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const promptText = (body.prompt || "").toLowerCase();

    const returnSimulation = () => {
        const now = new Date().toUTCString();
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        
        let location = "Global Intelligence";
        const locMatch = body.prompt?.match(/Location: ([^.]+)/);
        if (locMatch) location = locMatch[1].trim();

        let responseText = `[SIMULATION_MODE]\n[EXECUTIVE_SUMMARY]\nRating: ${rand(6,9)}/10\nIntelligence sweep for ${location} complete. Strategic baseline indicators are stable. Monitoring local developments across key sectors.`;
        responseText += `\n\n[POLITICAL_STABILITY]\nRating: ${rand(5,9)}/10\nGovernment institutions in ${location} are maintaining operational continuity. Policy frameworks remain intact with standard legislative activity underway.`;
        responseText += `\n\n[TRADE_RELATIONS]\nRating: ${rand(5,8)}/10\nCross-border trade flows for ${location} are within monitored thresholds. Strategic corridors remain open despite minor logistical delays globally.`;
        responseText += `\n\n[ECONOMY]\nRating: ${rand(4,7)}/10\nEconomic indicators for ${location} show resilience. Employment data is stable with growth sectors maintaining projected momentum.`;
        responseText += `\n\n[TECHNOLOGY]\nRating: ${rand(6,9)}/10\nDigital infrastructure across ${location} is operating at peak capacity. Cybersecurity protocols are heightened in response to regional threat vectors.`;
        responseText += `\n\n[INFLATION_PRESSURE]\nRating: ${rand(4,7)}/10\nInflationary pressures in ${location} are being managed through fiscal adjustments. Consumer price indices remain within monitored thresholds.`;
        responseText += `\n\n[FOREIGN_RELATIONS]\nRating: ${rand(6,9)}/10\n${location}'s diplomatic channels are active. Bilateral engagements are proceeding through established strategic frameworks.`;
        responseText += `\n\n[INFRASTRUCTURE]\nRating: ${rand(6,9)}/10\nCore infrastructure in ${location} is operational. Planned maintenance and upgrade programs are progressing according to schedule.`;

        if (promptText.includes("weather") || promptText.includes("temperature")) {
            responseText = `[EXECUTIVE SUMMARY]\nTactical Rating: ${rand(6,9)}/10\nAtmospheric conditions in ${location} are within operational parameters. Standard weather monitoring protocols are active.\n\n[WEATHER ASSESSMENT]\nTactical Rating: ${rand(5,8)}/10\nCurrent conditions in ${location} are stable. Short-term forecast indicates standard seasonal transitions.\n\n[TRAVEL ADVISORIES]\nTactical Rating: ${rand(6,9)}/10\nMovement within ${location} is generally favorable. Standard precautions apply for regional transit.\n\n[HEALTH WARNINGS]\nTactical Rating: ${rand(6,9)}/10\nNo significant health-weather advisories detected for the ${location} sector at this time.\n\n[OUTDOOR IMPACT]\nTactical Rating: ${rand(6,9)}/10\nOutdoor operations in ${location} are feasible under current conditions. Monitor for atmospheric shifts in the 24-hour window.\n\n[RECOMMENDED ACTIONS]\nTactical Rating: ${rand(7,9)}/10\nContinue standard operational protocols in ${location}. Maintain awareness of local advisories and adjust plans as conditions evolve.`;
        }

        if (isStream) {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            const words = responseText.split(" ");
            let i = 0;
            const interval = setInterval(() => {
                if (i >= words.length) {
                    res.write("data: [DONE]\n\n");
                    clearInterval(interval);
                    res.end();
                    return;
                }
                const chunk = words.slice(i, i + 3).join(" ") + " ";
                const payload = JSON.stringify({ choices: [{ delta: { content: chunk } }] });
                res.write(`data: ${payload}\n\n`);
                i += 3;
            }, 30);
            return;
        }

        return res.status(200).json({
            candidates: [{ content: { parts: [{ text: responseText }] } }]
        });
    };

    if (!apiKey) return returnSimulation();

    const apiURL = "https://api.groq.com/openai/v1/chat/completions";

    try {
        const systemInstruction = "You are a professional tactical intelligence interface. Be concise and data-driven. Format with [EXECUTIVE_SUMMARY] and [CATEGORY] headers. For each section include Rating: X/10.";
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
                stream: isStream,
            })
        });

        if (!response.ok) throw new Error(`Groq API Error: ${response.status}`);

        if (isStream) {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            response.body.pipe(res);
            return;
        }

        const data = await response.json();
        const aiText = data.choices?.[0]?.message?.content || "No response generated.";

        return res.status(200).json({
            candidates: [{ content: { parts: [{ text: aiText }] } }]
        });
    } catch (err) {
        console.error("AI Error:", err);
        return returnSimulation();
    }
}
