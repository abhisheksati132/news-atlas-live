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
  const promptText = (body?.prompt || "").toLowerCase();
  const returnSimulation = (returnTextOnly = false) => {
    let responseText = "";
    if (
      promptText.includes("stock market") ||
      promptText.includes("indices") ||
      promptText.includes("market") ||
      promptText.includes("financial")
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
    } else if (
      promptText.includes("weather") ||
      promptText.includes("atmospheric") ||
      promptText.includes("meteorological")
    ) {
      responseText = `Atmospheric conditions are nominal across the designated sector. No severe meteorological anomalies detected in the immediate area. Visibility remains unobstructed for aerial reconnaissance and satellite telemetry. Ground mobility is unrestricted. Surface temperatures are holding within anticipated parameters. Proceed with standard operational guidelines.`;
    } else if (
      promptText.includes("briefing") ||
      promptText.includes("tactical") ||
      promptText.includes("intel")
    ) {
      responseText = `[STRATEGIC METRICS DASHBOARD]

      [EXECUTIVE_SUMMARY]
      The target sector is currently undergoing a period of significant geopolitical recalibration. Strategic alliances are being tested by shifting trade priorities and energy dependency. Regional security remains the primary concern as borders face increased scrutiny and defense spending reaches a five-year high.

      [GOV_STABILITY]
      Tactical Rating: 6/10
      The executive branch is maintaining legislative control, but rising polarization within the assembly suggests potential gridlock in the coming fiscal quarter. Bureaucratic efficiency remains nominal across core sectors, though judicial independence is facing minor administrative pressures. Immediate risk remains low but requires persistent monitoring.

      [BORDER_INTEGRITY]
      Tactical Rating: 8/10
      Perimeter surveillance networks are operating at peak efficiency, utilizing a multi-layered sensor mesh across terrestrial and maritime boundaries. Minor infractions have been reported in the northern corridors, likely due to increased seasonal migration patterns. Deployment of automated response units is being considered for high-traffic sectors.

      [CYBER_THREAT]
      Tactical Rating: 4/10
      Active state-sponsored probing has been detected targeting grid infrastructure and financial clearance protocols. Advanced persistent threats (APTs) are utilizing zero-day vulnerabilities in legacy logistics software. Defensive countermeasures are being upgraded to a hardened neural-firewall architecture to prevent large-scale data exfiltration.

      [CIVIL_UNREST]
      Tactical Rating: 7/10
      Internal security maintains a stable posture, with domestic protests restricted to localized urban centers. Economic grievances regarding inflation remain the primary catalyst for public discourse, but organized subversion remains minimal. Law enforcement readiness is at Code Yellow, focusing on critical utility protection.

      [MILITARY_READINESS]
      Tactical Rating: 9/10
      Combat capability is currently at peak readiness following localized joint-task maneuvers. Strategic assets, including orbital surveillance and long-range logistics, are fully integrated into the defense command. Supply chains for munitions and fuel are stockpiled for a 60-day high-intensity operational window.

      [ENERGY_RESERVES]
      Tactical Rating: 5/10
      Strategic petroleum stockpiles are currently stabilized but remain vulnerable to global supply chain disruptions. Grid resilience is being tested by high seasonal demand, leading to occasional load-balancing maneuvers in industrial zones. Diversification into alternative energetic sources is progressing but remains below required capacity.

      [SUPPLY_CHAIN]
      Tactical Rating: 5/10
      Critical logistics flow is facing several bottlenecks due to maritime port congestion and semiconductor import delays. Just-in-time manufacturing models are being deprioritized in favor of regional warehousing strategies. Trade vulnerabilities are most acute in the high-tech and raw material sectors.

      [INFLATION_PRESSURE]
      Tactical Rating: 3/10
      Monetary stability is facing headwinds as consumer price indices reach a decade-high. Core commodity costs are driving a broad-based inflationary spiral, requiring aggressive central bank intervention. Currency valuations are exhibiting increased volatility against global reserve assets.

      [FOREIGN_RELATIONS]
      Tactical Rating: 6/10
      Diplomatic tension between key regional partners is currently high, following disagreements over maritime trade routes. Multi-lateral treaty compliance remains active, but informal alliances are shifting toward more transactional arrangements. Negotiation channels remain open but are becoming increasingly performative.

      [INFRASTRUCTURE]
      Tactical Rating: 7/10
      Telecommunications networks and logistical backbones are maintaining 98% efficiency across primary metro hubs. Rural sectors continue to lag in high-speed data integration, creating a digital divide that impacts decentralized governance. Modernization of the rail and waterway systems is currently underway but underfunded.`;
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

    if (returnTextOnly) {
      return responseText;
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
        temperature: 0.6,
        max_tokens: 2000,
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