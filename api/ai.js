import fetch from "node-fetch";
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  if (req.method === "OPTIONS") return res.status(200).end();
  const apiKey = process.env.GROQ_API_KEY;
  let body = req.body;
  try {
    if (typeof body === "string") body = JSON.parse(body);
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  const prompt = (body?.prompt || "").toLowerCase();
  const returnSimulation = () => {
    let responseText = "";
    if (
      prompt.includes("briefing") ||
      prompt.includes("tactical") ||
      prompt.includes("intel")
    ) {
      responseText = `[STRATEGIC METRICS DASHBOARD]
    1. [GOV_STABILITY]: 68/100 (Moderate) - Executive branch facing legislative gridlock.
    2. [BORDER_INTEGRITY]: 92% - Surveillance nominal, minor infractions in Sector 4.
    3. [CYBER_THREAT]: HIGH - Active state-sponsored probing on grid infrastructure.
    4. [CIVIL_UNREST]: LOW - Isolated protests restricted to metropolitan centers.
    5. [MILITARY_READINESS]: DEFCON 4 - Standard peacetime operations; naval exercises ongoing.
    6. [ENERGY_RESERVES]: 85% - Strategic petroleum stockpiles above seasonal average.
    7. [SUPPLY_CHAIN]: STRESSED - Semiconductor imports delayed by 2 weeks.
    8. [INFLATION_PRESSURE]: RISING - CPI projections adjusted upward to 4.5%.
    9. [FOREIGN_RELATIONS]: STRAINED - Diplomatic channels with trade partners are tense.
    10. [INFRASTRUCTURE]: NOMINAL - Power and logistics networks operating at 98% efficiency.`;
    } else if (
      prompt.includes("stock market") ||
      prompt.includes("indices") ||
      prompt.includes("market")
    ) {
      responseText = `[GLOBAL INDICES]
    • S&P 500: 5,203.45 (+0.5%) - Tech & Semis Leading
    • NASDAQ: 16,420.10 (+0.8%) - AI Sector Breakout
    • DOW JONES: 39,150.80 (-0.1%) - Manufacturing Drag
    • NIKKEI 225: 40,100.20 (+1.2%) - Export Strength
    • FTSE 100: 7,950.30 (+0.3%) - Financials Stable
    [COMMODITIES & FOREX]
    • GOLD_PRICE: 2,320.10
    • SILVER_PRICE: 28.15
    • Crude Oil (WTI): 82.40 (+1.5% - Supply Tightening)
    • EUR/USD: 1.085 (Neutral)
    [STRATEGIC ANALYSIS]
    Global equity markets are exhibiting high variance due to shifting interest rate expectations. The technology sector remains the primary driver of liquidity, obscuring weaknesses in traditional manufacturing. Geopolitical friction in energy-producing regions is creating upward pressure on crude futures, signaling potential inflationary headwinds next quarter.`;
    } else {
      const jsonResponse = {
        gdp_billions: "2900",
        gdp_growth_percent: "2.1",
        gdp_per_capita: "2400",
        inflation_rate: "4.2",
        unemployment_rate: "3.8",
        interest_rate: "6.5",
        debt_to_gdp: "84",
        major_exports: ["Technology", "Refined Petroleum", "Pharmaceuticals"],
        market_summary:
          "Market volatility has increased significantly following the latest central bank announcements. Industrial output remains sluggish, but the services sector is showing unexpected resilience. Investors are pivoting toward defensive assets as global trade tensions escalate.",
      };
      responseText = JSON.stringify(jsonResponse);
    }
    return res.status(200).json({
      candidates: [
        {
          content: { parts: [{ text: responseText }] },
        },
      ],
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
  const url = "https://api.groq.com/openai/v1/chat/completions";
  let systemInstruction =
    "You are a tactical military intelligence interface. Be concise, professional, and data-driven.";
  if (prompt.includes("json") || prompt.includes("economy")) {
    systemInstruction +=
      " You MUST return ONLY valid JSON. Do not use Markdown code blocks.";
  }
  try {
    const messages = [{ role: "system", content: systemInstruction }];
    if (body.history && Array.isArray(body.history)) {
      body.history.slice(-6).forEach(msg => messages.push(msg));
    }
    messages.push({ role: "user", content: body.prompt });
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.5,
        max_tokens: 800,
        stream: isStream,
      }),
    });
    if (isStream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("X-Accel-Buffering", "no");
      for await (const chunk of response.body) {
        res.write(chunk);
      }
      return res.end();
    }
    const data = await response.json();
    if (data.error) return returnSimulation();
    const aiText = data.choices[0].message.content;
    res.status(200).json({
      candidates: [{ content: { parts: [{ text: aiText }] } }],
    });
  } catch (error) {
    return returnSimulation();
  }
}