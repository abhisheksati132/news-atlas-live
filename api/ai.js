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
    try { body = JSON.parse(body); } catch (e) { console.warn("Body parse fail"); }
  }

  const promptText = (body.prompt || "").toLowerCase();

  const returnSimulation = (returnTextOnly = false) => {
    let responseText = "";
    const isGlobal = promptText.includes("global") || promptText.includes("world") || promptText.includes("coordinate stack");

    if (promptText.includes("market") || promptText.includes("indices") || promptText.includes("financial") || (isGlobal && (promptText.includes("economy") || promptText.includes("business")))) {
      responseText = `[GLOBAL INDICES]
* S&P 500: 5,203.45 (+0.5%) - Tech & Semis Leading
* NASDAQ: 16,420.10 (+0.8%) - AI Sector Breakout
* DOW JONES: 39,150.80 (-0.1%) - Manufacturing Drag
* NIKKEI 225: 40,100.20 (+1.2%) - Export Strength
* FTSE 100: 7,950.30 (+0.3%) - Financials Stable
[COMMODITIES & FOREX]
* GOLD_PRICE: 2,320.10
* SILVER_PRICE: 28.15
* Crude Oil (WTI): 82.40 (+1.5% - Supply Tightening)
* EUR/USD: 1.085 (Neutral)
[STRATEGIC ANALYSIS]
Global equity markets are exhibiting high variance due to shifting interest rate expectations. The technology sector remains the primary driver of liquidity, obscuring weaknesses in traditional manufacturing. Geopolitical friction in energy-producing regions is creating upward pressure on crude futures, signaling potential inflationary headwinds next quarter.`;
    } else if (promptText.includes("weather") || promptText.includes("atmospheric") || promptText.includes("meteorological")) {
      responseText = `Atmospheric conditions are nominal across the designated sector. No severe meteorological anomalies detected in the immediate area. Visibility remains unobstructed for aerial reconnaissance and satellite telemetry. Ground mobility is unrestricted. Surface temperatures are holding within anticipated parameters. Proceed with standard operational guidelines.`;
    } else if (promptText.includes("briefing") || promptText.includes("tactical") || promptText.includes("intel") || isGlobal) {
      const targetName = isGlobal ? "GLOBAL SURVEILLANCE" : "TARGET SECTOR";
      responseText = `[STRATEGIC METRICS DASHBOARD]

[EXECUTIVE_SUMMARY]
${isGlobal ? "Global metrics indicate a period of heightened geopolitical complexity. Polarization between major powers is impacting international trade routes and energy security protocols." : "The target sector is currently undergoing a period of significant geopolitical recalibration. Strategic alliances are being tested by shifting trade priorities and energy dependency."} Regional security remains the primary concern as borders face increased scrutiny and defense spending reaches a five-year high.

[GOV_STABILITY]
Tactical Rating: ${isGlobal ? "7" : "6"}/10
The executive branch is maintaining legislative control, but rising polarization suggests potential gridlock in the coming fiscal quarter. Bureaucratic efficiency remains nominal across core sectors.

[BORDER_INTEGRITY]
Tactical Rating: 8/10
Perimeter surveillance networks are operating at peak efficiency, utilizing a multi-layered sensor mesh across terrestrial and maritime boundaries.

[CYBER_THREAT]
Tactical Rating: 4/10
Active state-sponsored probing has been detected targeting grid infrastructure and financial clearance protocols. Advanced persistent threats (APTs) are utilizing zero-day vulnerabilities in legacy logistics software.

[MILITARY_READINESS]
Tactical Rating: 9/10
Combat capability is currently at peak readiness following localized joint-task maneuvers. Strategic assets, including orbital surveillance and long-range logistics, are fully integrated.

[ENERGY_RESERVES]
Tactical Rating: 5/10
Strategic petroleum stockpiles are currently stabilized but remain vulnerable to global supply chain disruptions. Grid resilience is being tested by high seasonal demand.`;
    } else {
      responseText = "Uplink nominal. Intelligence matrix is currently operating in simulation mode. Sector analysis indicates stable geopolitical parameters for the selected coordinate stack. Monitoring for shifts in local atmospheric or tactical metrics.";
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

