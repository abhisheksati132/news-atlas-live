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
    let responseText = "Uplink nominal. Intelligence matrix is currently operating in simulation mode. [NO_API_KEY_DETECTED]";
    if (promptText.includes("market") || promptText.includes("economic")) {
      responseText = "[MARKET_SIM] Global indices are showing high fidelity. Semis and Tech leading sector growth. Geopolitical markers remain stable.";
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
    let systemInstruction = "You are a tactical military intelligence interface. Be concise, professional, and data-driven.";
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
