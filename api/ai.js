export default async function handler(req, res) {
    const apiKey = process.env.GROQ_API_KEY;
    const isStream = req.query.stream === "true";
    let body = req.body || {};

    if (typeof body === "string") {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const promptText = (body.prompt || "").toLowerCase();

    const returnSimulation = () => {
        const now = new Date().toUTCString();
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        let responseText = `[EXECUTIVE_SUMMARY]\nRating: ${rand(6,9)}/10\nEnvironment scan complete. Intelligence systems operating in simulation mode. Strategic baseline indicators are stable. Monitoring global developments across key sectors.\n\n[GOV_STABILITY]\nRating: ${rand(5,9)}/10\nGovernment institutions are maintaining operational continuity. Policy frameworks remain intact with standard legislative activity underway.\n\n[BORDER_INTEGRITY]\nRating: ${rand(5,8)}/10\nBorder monitoring systems indicate nominal flow. Regional security postures are maintained with standard patrol protocols.\n\n[CYBER_THREAT]\nRating: ${rand(4,7)}/10\nCyber threat assessment shows elevated baseline activity. Standard defensive protocols are engaged across critical infrastructure networks.\n\n[CIVIL_UNREST]\nRating: ${rand(6,9)}/10\nCivil stability indicators are within acceptable parameters. No significant unrest events detected in the current monitoring window.\n\n[MILITARY_READINESS]\nRating: ${rand(6,9)}/10\nDefense posture remains at standard readiness levels. No extraordinary mobilisation events detected in the current assessment window.\n\n[ENERGY_RESERVES]\nRating: ${rand(5,8)}/10\nEnergy infrastructure is operating within expected capacity. Strategic reserves are at adequate levels for current demand projections.\n\n[SUPPLY_CHAIN]\nRating: ${rand(6,8)}/10\nLogistics networks are functioning with minor disruptions across select corridors. Overall supply chain resilience remains strong.\n\n[INFLATION_PRESSURE]\nRating: ${rand(4,7)}/10\nInflationary pressures are present but being managed through monetary policy adjustments. Consumer price indices remain within monitored thresholds.\n\n[FOREIGN_RELATIONS]\nRating: ${rand(6,9)}/10\nDiplomatic channels are active and functioning. Bilateral and multilateral engagements are proceeding through established frameworks.\n\n[INFRASTRUCTURE]\nRating: ${rand(6,9)}/10\nCore infrastructure systems are operational. Planned maintenance and upgrade programs are progressing according to schedule.`;

        if (promptText.includes("weather") || promptText.includes("temperature")) {
            responseText = `[EXECUTIVE SUMMARY]\nTactical Rating: ${rand(6,9)}/10\nAtmospheric conditions are within operational parameters. Standard weather monitoring protocols are active.\n\n[WEATHER ASSESSMENT]\nTactical Rating: ${rand(5,8)}/10\nCurrent conditions are stable. 7-day forecast indicates gradual seasonal transitions with no extreme weather events anticipated.\n\n[TRAVEL ADVISORIES]\nTactical Rating: ${rand(6,9)}/10\nTravel conditions are generally favorable. Standard precautions apply for regional movement.\n\n[HEALTH WARNINGS]\nTactical Rating: ${rand(6,9)}/10\nNo significant health-weather advisories at this time. UV exposure remains within manageable levels.\n\n[OUTDOOR IMPACT]\nTactical Rating: ${rand(6,9)}/10\nOutdoor operations are feasible under current conditions. Monitor for rapid changes in the 24-hour window.\n\n[RECOMMENDED ACTIONS]\nTactical Rating: ${rand(7,9)}/10\nContinue standard operational protocols. Maintain awareness of local weather advisories and adjust plans as conditions evolve.`;
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
