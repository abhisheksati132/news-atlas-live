import { getCache, setCache } from "./_utils/cache.js";

// Per-instance rate limit (protects the AI keys on serverless too)
const aiHits = new Map();
const AI_RATE_WINDOW = 60000;
const AI_RATE_MAX = 20;
setInterval(() => aiHits.clear(), AI_RATE_WINDOW).unref();

function rateLimited(req) {
  const key = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  const count = (aiHits.get(key) || 0) + 1;
  aiHits.set(key, count);
  return count > AI_RATE_MAX;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (rateLimited(req)) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment.", code: "RATE_LIMITED" });
  }

  let body = req.body;
  if (typeof body === "string" && body.length > 0) {
    try { body = JSON.parse(body); } catch { body = {}; }
  } else if (!body || typeof body !== "object") {
    body = {};
  }

  const isStream = req.query?.stream === "true";
  const userPrompt = String(body.prompt || body.message || "Strategic situation briefing").trim();
  const locName = userPrompt.match(/Location: ([^.]+)/)?.[1]?.trim() || "Global Sector";

  const cacheKey = `ai_intel_${locName.replace(/\s+/g, '_')}_${userPrompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '')}`;
  const cached = getCache(cacheKey);
  if (cached && !isStream) return res.status(200).json(cached);

  const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1. Try GROQ (llama-3.1-8b-instant / llama-3.3-70b-versatile)
  if (groqKey) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "You are the NewsAtlas Intelligence Engine. Provide concise, high-density situational awareness briefings using headers like [EXECUTIVE_SUMMARY], [SECURITY_ASSESSMENT], [MACROECONOMIC_OUTLOOK]. Be direct, tactical, and factual. No fluff."
            },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 450
        }),
        signal: AbortSignal.timeout(6000)
      });

      if (response.ok) {
        const data = await response.json();
        const aiText = data.choices?.[0]?.message?.content?.trim();
        if (aiText) {
          const payload = {
            candidates: [{ content: { parts: [{ text: aiText }] } }],
            response: aiText,
            provider: "groq"
          };
          setCache(cacheKey, payload, 300);
          return res.status(200).json(payload);
        }
      }
    } catch (e) {
      console.warn("[ai] Groq attempt failed, trying fallbacks:", e.message);
    }
  }

  // 2. Try GEMINI
  if (geminiKey) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: { maxOutputTokens: 450, temperature: 0.3 }
        }),
        signal: AbortSignal.timeout(6000)
      });

      if (response.ok) {
        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (aiText) {
          const payload = {
            candidates: [{ content: { parts: [{ text: aiText }] } }],
            response: aiText,
            provider: "gemini"
          };
          setCache(cacheKey, payload, 300);
          return res.status(200).json(payload);
        }
      }
    } catch (e) {
      console.warn("[ai] Gemini attempt failed:", e.message);
    }
  }

  // 3. Try OPENAI
  if (openaiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are the NewsAtlas Intelligence Engine. Tactical, concise situational briefs." },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 450
        }),
        signal: AbortSignal.timeout(6000)
      });

      if (response.ok) {
        const data = await response.json();
        const aiText = data.choices?.[0]?.message?.content?.trim();
        if (aiText) {
          const payload = {
            candidates: [{ content: { parts: [{ text: aiText }] } }],
            response: aiText,
            provider: "openai"
          };
          setCache(cacheKey, payload, 300);
          return res.status(200).json(payload);
        }
      }
    } catch (e) {}
  }

  // No provider keys configured or all providers failed — fail honestly.
  console.error("[ai] All providers unavailable");
  return res.status(503).json({
    error: "AI service temporarily unavailable.",
    code: "AI_UNAVAILABLE"
  });
}
