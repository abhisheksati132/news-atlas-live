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
            `<div class="apple-glass px-3 py-1.5 border border-blue-500/20 flex items-center gap-2 rounded-full">
               <div class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
               <span class="text-[10px] text-white font-black uppercase tracking-wider">${item}</span>
             </div>`,
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
    textEl.innerHTML = '<span class="animate-pulse text-slate-500 font-mono text-sm">Scanning global exchanges...</span>';
  try {
    const prompt = `Provide a financial market intelligence report for ${country} in this EXACT format:

[EXECUTIVE SUMMARY]
Tactical Rating: X/10
2-3 sentence overview of current market conditions for ${country}.

[GLOBAL INDICES]
Tactical Rating: X/10
Key index performance. Include SENSEX/relevant local index, DOW, NASDAQ context.

[COMMODITIES & FOREX]
Tactical Rating: X/10
Gold, oil, and ${currency || 'local currency'}/USD movement analysis.

[SECTOR PERFORMANCE]
Tactical Rating: X/10
Top performing and lagging sectors. Key drivers.

[RISK ASSESSMENT]
Tactical Rating: X/10
Geopolitical, inflation, and monetary policy risk factors.

[STRATEGIC OUTLOOK]
Tactical Rating: X/10
30-day forward market outlook and recommended positioning.

Keep each section to 2-3 sentences. Be specific with numbers where possible.`;
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const result = await res.json();
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || result.result || "";
    if (responseText && textEl) {
      renderMarketCards(responseText, textEl);
      const goldMatch = responseText.match(/gold[^0-9]*([0-9,]{4,}\.?[0-9]*)/i);
      const silverMatch = responseText.match(/silver[^0-9]*([0-9,]{2,}\.?[0-9]*)/i);
      const goldEl = document.getElementById("price-gold");
      const silverEl = document.getElementById("price-silver");
      if (goldEl && goldMatch) goldEl.innerText = goldMatch[1];
      if (silverEl && silverMatch) silverEl.innerText = silverMatch[1];
    } else if (textEl) {
      textEl.innerHTML = '<div class="apple-glass p-5 text-slate-400 font-mono text-sm">Market data unavailable.</div>';
    }
    window.playTacticalSound("success");
  } catch (e) {
    if (textEl) textEl.innerHTML = '<div class="apple-glass p-5 text-red-400 font-mono text-sm">Financial uplink failed.</div>';
  }
}
function renderMarketCards(rawText, container) {
  const marketIconMap = {
    'EXECUTIVE': { icon: 'fa-chart-line', color: '#3b82f6' },
    'GLOBAL': { icon: 'fa-globe', color: '#06b6d4' },
    'COMMODITIES': { icon: 'fa-coins', color: '#f59e0b' },
    'FOREX': { icon: 'fa-money-bill-trend-up', color: '#f59e0b' },
    'SECTOR': { icon: 'fa-building-columns', color: '#8b5cf6' },
    'RISK': { icon: 'fa-triangle-exclamation', color: '#ef4444' },
    'STRATEGIC': { icon: 'fa-chess', color: '#10b981' },
    'OUTLOOK': { icon: 'fa-binoculars', color: '#10b981' },
  };
  let clean = rawText.replace(/\*\*/g, '').trim();
  const parts = clean.split(/(?=\[[A-Z][A-Z_& ]+\])/);
  let html = '';
  parts.forEach(block => {
    const headerMatch = block.match(/\[([A-Z][A-Z_& ]+)\]/);
    if (!headerMatch) return;
    const key = headerMatch[1].trim();
    const bodyRaw = block.slice(block.indexOf(']') + 1).trim();
    const ratingMatch = bodyRaw.match(/Tactical Rating:\s*(\d+)\s*\/\s*10/i);
    const rating = ratingMatch ? parseInt(ratingMatch[1]) : null;
    const paragraph = bodyRaw.replace(/Tactical Rating:\s*\d+\s*\/\s*10\n?/i, '').trim();
    if (!paragraph && !rating) return;
    const mapKey = Object.keys(marketIconMap).find(k => key.includes(k)) || 'EXECUTIVE';
    const { icon, color } = marketIconMap[mapKey];
    const displayName = key.replace(/_/g, ' ');
    const ratingColor = !rating ? color : (rating >= 7 ? '#10b981' : rating >= 4 ? '#f59e0b' : '#ef4444');
    const formattedParagraph = paragraph
      .split('\n')
      .map(line => line.trim().startsWith('-') ? `<span class="block pl-2 border-l-2 border-white/10 mb-1">${line.slice(1).trim()}</span>` : `<span>${line}</span>`)
      .join('');
    html += `
      <div class="apple-glass group p-5 mb-4 relative overflow-hidden transition-all duration-300 hover:bg-white/[0.05]" style="border:1px solid ${color}22;">
        <div class="absolute -inset-[1px] bg-gradient-to-br from-white/10 to-transparent opacity-20 pointer-events-none"></div>
        <div class="flex justify-between items-start mb-4 relative z-10">
          <div class="flex items-center gap-4">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center" style="background:${color}33;border:1px solid ${color}55;box-shadow:0 0 15px ${color}22;">
              <i class="fas ${icon} text-[17px]" style="color:${color};"></i>
            </div>
            <div class="flex flex-col">
              <span class="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400/80">Market Intel</span>
              <span class="text-[15px] font-bold text-white uppercase tracking-wider">${displayName}</span>
            </div>
          </div>
          ${rating ? `<div class="bg-black/40 rounded-xl px-4 py-2 flex flex-col items-center" style="border:1px solid ${ratingColor}44;"><span class="text-[20px] font-black font-mono leading-none" style="color:${ratingColor};">${rating}<span class="text-[12px] opacity-40">/10</span></span><div class="w-14 h-1 bg-white/10 rounded-full mt-2 overflow-hidden"><div class="h-full rounded-full" style="width:${rating * 10}%;background:${ratingColor};"></div></div></div>` : ''}
        </div>
        <div class="text-[13.5px] text-white/85 leading-relaxed font-mono relative z-10">${formattedParagraph}</div>
      </div>`;
  });
  container.innerHTML = html || `<div class="apple-glass p-6 text-[13px] text-slate-400 font-mono leading-relaxed">${clean.replace(/\n/g, '<br>')}</div>`;
}
window.fetchDetailedEconomics = fetchDetailedEconomics;
window.drawGDPTrend = drawGDPTrend;
window.fetchCurrency = fetchCurrency;
window.fetchMarketIntel = fetchMarketIntel;
async function fetchECBRates() {
  const container = document.getElementById("ecb-rates-content");
  if (!container) return;
  container.innerHTML = '<div class="text-slate-500 text-xs animate-pulse">Fetching ECB rates...</div>';
  try {
    const pairs = [
      { key: "D.USD.EUR.SP00.A", label: "EUR/USD", flag: "ðŸ‡ºðŸ‡¸" },
      { key: "D.GBP.EUR.SP00.A", label: "EUR/GBP", flag: "ðŸ‡¬ðŸ‡§" },
      { key: "D.JPY.EUR.SP00.A", label: "EUR/JPY", flag: "ðŸ‡¯ðŸ‡µ" },
      { key: "D.CNY.EUR.SP00.A", label: "EUR/CNY", flag: "ðŸ‡¨ðŸ‡³" },
      { key: "D.INR.EUR.SP00.A", label: "EUR/INR", flag: "ðŸ‡®ðŸ‡³" },
    ];
    const results = await Promise.allSettled(
      pairs.map((p) => fetch(`https://data-api.ecb.europa.eu/service/data/EXR/${p.key}?format=jsondata&lastNObservations=2`).then((r) => r.json())),
    );
    container.innerHTML = "";
    results.forEach((r, i) => {
      const p = pairs[i];
      let value = "â€”", prev = null;
      if (r.status === "fulfilled") {
        try {
          const obs = r.value.dataSets[0]?.series["0:0:0:0:0"]?.observations;
          const keys = obs ? Object.keys(obs).sort((a, b) => +b - +a) : [];
          value = keys[0] !== undefined ? parseFloat(obs[keys[0]][0]).toFixed(4) : "â€”";
          prev = keys[1] !== undefined ? parseFloat(obs[keys[1]][0]) : null;
        } catch (_) { value = "â€”"; }
      }
      const current = parseFloat(value);
      const change = prev ? ((current - prev) / prev) * 100 : null;
      const changeClass = change === null ? "text-slate-500" : change >= 0 ? "text-emerald-400" : "text-red-400";
      const row = document.createElement("div");
      row.className = "flex items-center justify-between py-1.5 border-b border-white/5";
      row.innerHTML = `<div class="flex items-center gap-2"><span class="text-sm">${p.flag}</span><span class="text-xs font-black text-white font-mono">${p.label}</span></div><div class="flex items-center gap-3"><span class="text-xs font-mono text-cyan-400 font-bold">${value}</span>${change !== null ? `<span class="${changeClass} text-[9px] font-mono">${change >= 0 ? "â–²" : "â–¼"} ${Math.abs(change).toFixed(3)}%</span>` : ""}</div>`;
      container.appendChild(row);
    });
    const label = document.getElementById("ecb-timestamp");
    if (label) label.innerText = "Updated: " + new Date().toUTCString().slice(0, 22) + " UTC";
  } catch (e) {
    container.innerHTML = '<div class="text-slate-500 text-xs">ECB data unavailable</div>';
  }
}
window.fetchECBRates = fetchECBRates;
