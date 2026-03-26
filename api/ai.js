import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") return res.status(200).end();

  const apiKey = process.env.GROQ_API_KEY;
  let body = req.body || {};

  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { }
  }

  const promptText = (body.prompt || "").toLowerCase();

  const returnSimulation = (returnTextOnly = false) => {
    const now = new Date().toUTCString();
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const trend = () => ["stable", "improving", "under pressure", "mixed", "elevated"][rand(0, 4)];

    let responseText = "";

    if (promptText.includes("market") || promptText.includes("stock") || promptText.includes("finance") || promptText.includes("indices")) {
      responseText = `[MARKET SUMMARY — ${now}]

Global equity markets are showing ${trend()} conditions. Key indices:

• S&P 500: ${(5100 + rand(-200, 300)).toLocaleString()} (${rand(-1,2) > 0 ? '+' : ''}${(rand(1,15) / 10).toFixed(2)}%)
• NASDAQ: ${(16000 + rand(-500, 800)).toLocaleString()} (${rand(-1,2) > 0 ? '+' : ''}${(rand(1,20) / 10).toFixed(2)}%)
• NIKKEI 225: ${(39000 + rand(-800, 1200)).toLocaleString()} (${rand(-1,2) > 0 ? '+' : ''}${(rand(1,18) / 10).toFixed(2)}%)
• FTSE 100: ${(7800 + rand(-200, 400)).toLocaleString()} (${rand(-1,2) > 0 ? '+' : ''}${(rand(1,12) / 10).toFixed(2)}%)

Commodities: Gold at $${(2280 + rand(-50, 100)).toFixed(0)}/oz · Crude Oil at $${(78 + rand(-8, 12)).toFixed(1)}/bbl

Sentiment: ${["bullish", "cautiously optimistic", "neutral", "risk-off"][rand(0, 3)]}. Interest rate expectations and inflation data remain key drivers. Monitoring central bank communications closely.`;

    } else if (promptText.includes("weather") || promptText.includes("climate") || promptText.includes("temperature")) {
      responseText = `[WEATHER OVERVIEW — ${now}]

Atmospheric conditions are largely ${["stable", "unsettled", "clear", "variable"][rand(0, 3)]} across most regions. No severe weather events currently affecting major population centers. UV index is ${trend()}. Wind patterns suggest ${["calm", "moderate breeze", "gusty conditions", "light winds"][rand(0, 3)]} over the next 24 hours.

For precise local forecasts, select a country or city on the map and the Weather panel will update with live Open-Meteo data.`;

    } else if (promptText.includes("news") || promptText.includes("headlines") || promptText.includes("briefing") || promptText.includes("summary")) {
      responseText = `[NEWS BRIEFING — ${now}]

[GLOBAL OVERVIEW]
The news cycle is currently dominated by ${["geopolitical tensions in Eastern Europe", "ongoing peace negotiations in the Middle East", "economic policy debates among G20 nations", "tensions in the Asia-Pacific region", "climate summit discussions"][rand(0, 4)]}. International institutions are monitoring the situation closely.

[ECONOMIC]
Global trade volumes remain ${trend()}. Central banks across major economies are navigating a delicate balance between growth and inflation control. Currency markets reflect ${["investor caution", "risk appetite", "mixed sentiment", "renewed optimism"][rand(0, 3)]}.

[TECHNOLOGY]
AI and semiconductor developments continue to reshape global supply chains and geopolitical alignments. Major tech firms report ${["strong earnings", "cautious guidance", "robust demand", "supply challenges"][rand(0, 3)]}.

[HEALTH]
WHO indicators remain within normal parameters globally. No active health emergencies of international concern reported.`;

    } else {
      responseText = `[AI ASSISTANT — ${now}]

I'm here to help you navigate global news and data. You can ask me about:
• Current market conditions and economic trends
• Country-specific news and political developments  
• Weather and climate patterns
• Breaking news summaries
• Data analysis for any region on the map

Select a country on the map first for region-specific insights, or ask me any question about global affairs.`;
    }

    if (returnTextOnly) return responseText;
    return res.status(200).json({
      candidates: [{ content: { parts: [{ text: responseText }] } }]
    });
  };


  const isStream = req.query?.stream === "true";

  if (!apiKey) {
    if (isStream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      const sim = returnSimulation(true);
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: sim } }] })}\n\n`);
      res.write("data: [DONE]\n\n");
      return res.end();
    }
    return returnSimulation();
  }

  const apiURL = "https://api.groq.com/openai/v1/chat/completions";

  try {
    let systemInstruction = "You are a tactical military intelligence interface. Be concise, professional, and data-driven. \n\nFORMATTING RULES:\n1. Start with [EXECUTIVE_SUMMARY]\n2. Follow with category headers in brackets like [GOV_STABILITY]\n3. For each category, include 'Tactical Rating: X/10' on its own line.\n4. Avoid markdown bold/italics.";
    if (promptText.includes("json") || promptText.includes("economy")) {
      systemInstruction += " You MUST return ONLY valid JSON.";
    }

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
        stream: isStream
      })
    });

    if (!response.ok) {
      console.error("Groq Error Status:", response.status);
      return returnSimulation();
    }

    if (isStream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("X-Accel-Buffering", "no");

      const streamBody = response.body;
      if (streamBody.on) {
        streamBody.on("data", (chunk) => res.write(chunk));
        streamBody.on("end", () => res.end());
        streamBody.on("error", () => res.end());
      } else if (streamBody.getReader) {
        const reader = streamBody.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      } else {
        return returnSimulation();
      }
    } else {
      const data = await response.json();
      const aiText = data.choices?.[0]?.message?.content || "SIMULATION_FALLBACK: NO_CONTENT";
      return res.status(200).json({
        candidates: [{ content: { parts: [{ text: aiText }] } }]
      });
    }
  } catch (err) {
    console.error("AI Route Exception:", err);
    return returnSimulation();
  }
}

