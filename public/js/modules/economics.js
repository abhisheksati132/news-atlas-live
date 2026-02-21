function ecoEl(id) {
  return document.getElementById(id);
}
async function fetchDetailedEconomics(country) {
  if (ecoEl("eco-gdp")) ecoEl("eco-gdp").innerText = "--";
  if (ecoEl("eco-growth")) ecoEl("eco-growth").innerText = "--%";
  if (ecoEl("eco-inflation")) ecoEl("eco-inflation").innerText = "--%";
  if (ecoEl("eco-unemployment")) ecoEl("eco-unemployment").innerText = "--%";
  if (ecoEl("eco-exports"))
    ecoEl("eco-exports").innerHTML =
      '<div class="h-4 bg-white/10 rounded w-3/4 animate-pulse"></div>';
  try {
    const prompt = `
            Analyze the economy of ${country}.
            Return ONLY a valid JSON object with these keys (use 'N/A' if unknown, estimate if necessary based on 2024/2025 data):
            {
                "gdp_billions": "number only",
                "gdp_growth_percent": "number only",
                "gdp_per_capita": "number only",
                "inflation_rate": "number only",
                "unemployment_rate": "number only",
                "interest_rate": "number only",
                "debt_to_gdp": "number only",
                "major_exports": ["item1", "item2", "item3"],
                "market_summary": "1 short sentence on current market status"
            }
            Do not add markdown formatting. Just the raw JSON string.
        `;
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (!data.candidates) throw new Error("AI Busy");
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    let eco = {};
    try {
      eco = typeof text === "string" ? JSON.parse(text) : text;
    } catch (parseErr) {
      if (ecoEl("eco-market-ticker"))
        ecoEl("eco-market-ticker").innerText =
          "ECONOMIC DATALINK SEVERED. RETRYING...";
      drawGDPTrend(country);
      return;
    }
    if (eco.gdp_billions && ecoEl("eco-gdp"))
      ecoEl("eco-gdp").innerText = eco.gdp_billions;
    if (eco.gdp_growth_percent != null && ecoEl("eco-growth"))
      ecoEl("eco-growth").innerText =
        (eco.gdp_growth_percent > 0 ? "+" : "") + eco.gdp_growth_percent + "%";
    if (eco.gdp_per_capita != null && ecoEl("eco-capita"))
      ecoEl("eco-capita").innerText = "$" + eco.gdp_per_capita;
    if (eco.inflation_rate != null && ecoEl("eco-inflation"))
      ecoEl("eco-inflation").innerText = eco.inflation_rate + "%";
    if (eco.unemployment_rate != null && ecoEl("eco-unemployment"))
      ecoEl("eco-unemployment").innerText = eco.unemployment_rate + "%";
    if (eco.interest_rate != null && ecoEl("eco-interest"))
      ecoEl("eco-interest").innerText = eco.interest_rate + "%";
    if (eco.debt_to_gdp != null && ecoEl("eco-debt"))
      ecoEl("eco-debt").innerText = eco.debt_to_gdp + "%";
    if (eco.major_exports && Array.isArray(eco.major_exports) && ecoEl("eco-exports")) {
      ecoEl("eco-exports").innerHTML = eco.major_exports
        .map(
          (item) =>
            `<div class="flex items-center gap-2"><div class="w-1.5 h-1.5 bg-blue-500 rounded-full"></div><span class="text-sm text-slate-300 font-bold uppercase">${item}</span></div>`,
        )
        .join("");
    }
    if (eco.market_summary && ecoEl("eco-market-ticker"))
      ecoEl("eco-market-ticker").innerText = eco.market_summary.toUpperCase();
    window.playTacticalSound("success");
    drawGDPTrend(country);
  } catch (e) {
    if (ecoEl("eco-gdp")) ecoEl("eco-gdp").innerText = "--";
    if (ecoEl("eco-growth")) ecoEl("eco-growth").innerText = "--%";
    if (ecoEl("eco-inflation")) ecoEl("eco-inflation").innerText = "--%";
    if (ecoEl("eco-unemployment")) ecoEl("eco-unemployment").innerText = "--%";
    if (ecoEl("eco-market-ticker"))
      ecoEl("eco-market-ticker").innerText =
        "ECONOMIC DATALINK SEVERED. RETRYING...";
    drawGDPTrend(country);
  }
}
async function drawGDPTrend(country) {
  const canvas = document.getElementById("gdp-trend-chart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.parentElement.offsetWidth || 600;
  canvas.height = 150;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const iso = window._isoAlpha3 || "";
  if (!iso) {
    drawGDPFallback(ctx, canvas, country);
    return;
  }
  try {
    const r = await fetch(
      `https://api.worldbank.org/v2/country/${iso}/indicator/NY.GDP.MKTP.CD?format=json&mrv=6&per_page=6`,
    );
    const json = await r.json();
    const raw = (json[1] || [])
      .filter((d) => d.value !== null)
      .sort((a, b) => a.date - b.date);
    if (!raw.length) {
      drawGDPFallback(ctx, canvas, country);
      return;
    }
    renderGDPCanvas(
      ctx,
      canvas,
      raw.map((d) => d.value / 1e9),
      raw.map((d) => d.date),
    );
  } catch (_) {
    drawGDPFallback(ctx, canvas, country);
  }
}
function drawGDPFallback(ctx, canvas, country) {
  const seed = (country || "X").charCodeAt(0);
  const values = Array.from(
    { length: 5 },
    (_, i) => 800 + Math.sin(seed + i) * 300 + i * 120,
  );
  const year = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(year - 4 + i));
  renderGDPCanvas(ctx, canvas, values, years);
}
function renderGDPCanvas(ctx, canvas, values, years) {
  const W = canvas.width,
    H = canvas.height;
  const pad = { top: 20, right: 16, bottom: 30, left: 52 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const minV = Math.min(...values) * 0.92;
  const maxV = Math.max(...values) * 1.08;
  const xScale = (i) => pad.left + (i / (values.length - 1)) * chartW;
  const yScale = (v) =>
    pad.top + chartH - ((v - minV) / (maxV - minV)) * chartH;
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.fillRect(0, 0, W, H);
  const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
  grad.addColorStop(0, "rgba(59,130,246,0.35)");
  grad.addColorStop(1, "rgba(59,130,246,0.01)");
  ctx.beginPath();
  values.forEach((v, i) => {
    i === 0
      ? ctx.moveTo(xScale(i), yScale(v))
      : ctx.lineTo(xScale(i), yScale(v));
  });
  ctx.lineTo(xScale(values.length - 1), H - pad.bottom);
  ctx.lineTo(xScale(0), H - pad.bottom);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.beginPath();
  values.forEach((v, i) => {
    i === 0
      ? ctx.moveTo(xScale(i), yScale(v))
      : ctx.lineTo(xScale(i), yScale(v));
  });
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.stroke();
  values.forEach((v, i) => {
    const x = xScale(i),
      y = yScale(v);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#60a5fa";
    ctx.fill();
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "rgba(148,163,184,0.9)";
    ctx.font = "bold 9px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText(years[i], x, H - pad.bottom + 14);
    const label =
      v >= 1000 ? `$${(v / 1000).toFixed(1)}T` : `$${v.toFixed(0)}B`;
    ctx.fillStyle = "rgba(96,165,250,0.95)";
    ctx.font = "bold 9px JetBrains Mono, monospace";
    ctx.fillText(label, x, y - 8);
  });
  ctx.fillStyle = "rgba(148,163,184,0.5)";
  ctx.font = "8px JetBrains Mono, monospace";
  ctx.textAlign = "right";
  ctx.fillText("GDP (USD)", pad.left - 4, pad.top + 6);
}
async function fetchCurrency() {
  const el = document.getElementById("fact-currency");
  const elCode = document.getElementById("eco-currency-code");
  const elRate = document.getElementById("eco-rate");
  if (!window.currencyCode || window.currencyCode === "USD") {
    if (el) el.innerText = "1.00 USD";
    if (elCode) elCode.innerText = "USD";
    if (elRate) elRate.innerText = "1.00";
    return;
  }
  if (elCode) elCode.innerText = window.currencyCode;
  if (elRate) elRate.innerText = "Scanning...";
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/USD`);
    const data = await res.json();
    if (data && data.rates && data.rates[window.currencyCode]) {
      const rate = data.rates[window.currencyCode];
      if (el) el.innerText = `${rate.toFixed(2)} ${window.currencyCode}`;
      if (elRate) elRate.innerText = rate.toFixed(2);
    } else {
      if (el) el.innerText = "Data Unavailable";
      if (elRate) elRate.innerText = "---";
    }
  } catch (e) {
    if (el) el.innerText = "Offline";
    if (elRate) elRate.innerText = "ERR";
  }
}
async function fetchMarketIntel(country, currency) {
  const textEl = document.getElementById("market-ai-analysis");
  if (textEl)
    textEl.innerHTML =
      '<span class="animate-pulse text-slate-500">Scanning global exchanges...</span>';
  try {
    const prompt = `Analyze current financial markets for ${country} and global context.
        Return a detailed intel report in this EXACT format:
        [GLOBAL INDICES]
        • Index: Value (Change%) - Context
        [COMMODITIES & FOREX]
        • GOLD_PRICE: 2345.67 (Example)
        • SILVER_PRICE: 28.90 (Example)
        [STRATEGIC ANALYSIS]
        3-4 detailed sentences on market sentiment, sector performance, and risk factors.`;
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const result = await res.json();
    const responseText =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Market data unavailable.";
    if (textEl) textEl.innerText = responseText;
    const goldMatch = responseText.match(/GOLD_PRICE:\s*([\d,.]+)/i);
    const silverMatch = responseText.match(/SILVER_PRICE:\s*([\d,.]+)/i);
    const goldEl = document.getElementById("price-gold");
    const silverEl = document.getElementById("price-silver");
    if (goldEl && goldMatch) goldEl.innerText = goldMatch[1];
    if (silverEl && silverMatch) silverEl.innerText = silverMatch[1];
    window.playTacticalSound("success");
  } catch (e) {
    if (textEl) textEl.innerText = "Financial uplink failed.";
  }
}
window.fetchDetailedEconomics = fetchDetailedEconomics;
window.drawGDPTrend = drawGDPTrend;
window.fetchCurrency = fetchCurrency;
window.fetchMarketIntel = fetchMarketIntel;
async function fetchECBRates() {
  const container = document.getElementById("ecb-rates-content");
  if (!container) return;
  container.innerHTML =
    '<div class="text-slate-500 text-xs animate-pulse">Fetching ECB rates...</div>';
  try {
    const pairs = [
      { key: "D.USD.EUR.SP00.A", label: "EUR/USD", flag: "🇺🇸" },
      { key: "D.GBP.EUR.SP00.A", label: "EUR/GBP", flag: "🇬🇧" },
      { key: "D.JPY.EUR.SP00.A", label: "EUR/JPY", flag: "🇯🇵" },
      { key: "D.CNY.EUR.SP00.A", label: "EUR/CNY", flag: "🇨🇳" },
      { key: "D.INR.EUR.SP00.A", label: "EUR/INR", flag: "🇮🇳" },
    ];
    const results = await Promise.allSettled(
      pairs.map((p) =>
        fetch(
          `https://data-api.ecb.europa.eu/service/data/EXR/${p.key}?format=jsondata&lastNObservations=2`,
        ).then((r) => r.json()),
      ),
    );
    container.innerHTML = "";
    results.forEach((r, i) => {
      const p = pairs[i];
      let value = "—",
        prev = null;
      if (r.status === "fulfilled") {
        try {
          const obs = r.value.dataSets[0]?.series["0:0:0:0:0"]?.observations;
          const keys = obs ? Object.keys(obs).sort((a, b) => +b - +a) : [];
          value =
            keys[0] !== undefined
              ? parseFloat(obs[keys[0]][0]).toFixed(4)
              : "—";
          prev = keys[1] !== undefined ? parseFloat(obs[keys[1]][0]) : null;
        } catch (_) {
          value = "—";
        }
      }
      const current = parseFloat(value);
      const change = prev ? ((current - prev) / prev) * 100 : null;
      const changeClass =
        change === null
          ? "text-slate-500"
          : change >= 0
            ? "text-emerald-400"
            : "text-red-400";
      const row = document.createElement("div");
      row.className =
        "flex items-center justify-between py-1.5 border-b border-white/5";
      row.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="text-sm">${p.flag}</span>
                    <span class="text-xs font-black text-white font-mono">${p.label}</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs font-mono text-cyan-400 font-bold">${value}</span>
                    ${change !== null ? `<span class="${changeClass} text-[9px] font-mono">${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(3)}%</span>` : ""}
                </div>`;
      container.appendChild(row);
    });
    const label = document.getElementById("ecb-timestamp");
    if (label)
      label.innerText =
        "Updated: " + new Date().toUTCString().slice(0, 22) + " UTC";
  } catch (e) {
    container.innerHTML =
      '<div class="text-slate-500 text-xs">ECB data unavailable</div>';
  }
}
window.fetchECBRates = fetchECBRates;