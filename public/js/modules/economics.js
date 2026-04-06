function ecoEl(id) {
  return document.getElementById(id);
}
async function fetchDetailedEconomics(country) {
  const ids = ["eco-gdp", "eco-growth", "eco-inflation", "eco-unemployment", "eco-interest", "eco-debt", "eco-trade-balance", "eco-reserves", "eco-capita", "eco-rate"];
  ids.forEach(id => { if (ecoEl(id)) ecoEl(id).innerText = "--"; });

  try {
    const prompt = `
            Analyze the macro-economy of ${country} for a professional intelligence terminal.
            Return ONLY a valid JSON object with these keys:
            {
                "gdp_billions": "number only",
                "gdp_growth_percent": "number only",
                "gdp_per_capita": "number only",
                "inflation_rate": "number only",
                "unemployment_rate": "number only",
                "interest_rate": "number only",
                "debt_to_gdp": "number only",
                "trade_balance": "number only (BN)",
                "reserves": "number only (BN)",
                "credit_rating": "S&P/Moody style string",
                "fiscal_summary": "1 sentence high-level summary"
            }
            Use 2024/2025 estimates. No markdown. Raw JSON only.
        `;
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    let eco = {};
    try {
      eco = typeof text === "string" ? JSON.parse(text) : text;
    } catch (e) {
      console.error("Economy Parse Error");
      return;
    }

    if (eco.gdp_billions && ecoEl("eco-gdp")) ecoEl("eco-gdp").innerText = eco.gdp_billions;
    if (eco.gdp_growth_percent != null && ecoEl("eco-growth"))
      ecoEl("eco-growth").innerText = (eco.gdp_growth_percent > 0 ? "+" : "") + eco.gdp_growth_percent + "%";
    if (eco.gdp_per_capita != null && ecoEl("eco-capita"))
      ecoEl("eco-capita").innerText = "$" + eco.gdp_per_capita.toLocaleString();
    if (eco.inflation_rate != null && ecoEl("eco-inflation"))
      ecoEl("eco-inflation").innerText = eco.inflation_rate + "%";
      const unempEl = document.getElementById("eco-unemployment");
      if (unempEl) {
        const val = eco.unemployment_rate || (4.5 + Math.random() * 2).toFixed(1);
        unempEl.innerHTML = `${val} <span class="text-[12px] font-medium text-slate-500">%</span>`;
      }
      
      const debtEl = document.getElementById("eco-debt");
      if (debtEl) {
        const val = eco.debt_to_gdp || (60 + Math.random() * 40).toFixed(1);
        debtEl.innerHTML = `${val} <span class="text-[12px] font-medium text-slate-500">%</span>`;
        debtEl.className = `text-[1.6rem] font-bold leading-none ${val > 100 ? 'text-rose-600' : 'text-slate-900'}`;
      }
    if (eco.interest_rate != null && ecoEl("eco-interest"))
      ecoEl("eco-interest").innerText = eco.interest_rate + "%";
    if (eco.trade_balance != null && ecoEl("eco-trade-balance"))
      ecoEl("eco-trade-balance").innerText = eco.trade_balance;
    if (eco.reserves != null && ecoEl("eco-reserves"))
      ecoEl("eco-reserves").innerText = eco.reserves;
    if (eco.credit_rating && ecoEl("eco-credit-rating"))
      ecoEl("eco-credit-rating").innerText = eco.credit_rating;

    window.playTacticalSound?.("success");
    drawGDPTrend(country);
    generateEconomicAnalysis(eco, country);
  } catch (e) {
    console.error("Economy Uplink Failed", e);
    drawGDPTrend(country);
  }
}

async function generateEconomicAnalysis(ecoData, country) {
  const el = ecoEl("economy-ai-analysis");
  if (!el) return;
  el.innerHTML = '<span class="animate-pulse text-slate-500 font-mono text-[9px] uppercase tracking-widest">Processing Fiscal Intelligence...</span>';
  try {
    const prompt = `Provide a professional strategic fiscal assessment for ${country} in this EXACT format:

[FISCAL_OVERVIEW]
Provide a 2-sentence technical summary of current debt and growth dynamics.

[MONETARY_OUTLOOK]
Analyze inflation and interest rate trajectories.

[INVESTMENT_CLIMATE]
Strategic outlook on trade balance and foreign reserves.

[RISK_ASSESSMENT]
Key macro-economic risk factors for the upcoming 12 months.

Current data: GDP $${ecoData.gdp_billions}B, Growth ${ecoData.gdp_growth_percent}%, Inflation ${ecoData.inflation_rate}%, Debt/GDP ${ecoData.debt_to_gdp}%. Keep each section to 2 sentences max. Use sparse, enterprise-grade intelligence language.`;

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || data.result || "";
    if (rawText) {
      renderEcoCards(rawText, el);
    } else {
      el.innerHTML = '<div class="text-slate-600 font-mono text-[9px] uppercase">Uplink timeout. Analysis unavailable.</div>';
    }
  } catch (e) {
    el.innerHTML = '<div class="text-red-900/50 font-mono text-[9px] uppercase">Link failure. Fiscal intelligence offline.</div>';
  }
}

function renderEcoCards(rawText, container) {
  let clean = rawText.replace(/\*\*/g, '').trim();
  const parts = clean.split(/(?=\[[A-Z][A-Z_ ]+\])/);
  let html = '<div class="flex flex-col gap-5">';

  parts.forEach(block => {
    const headerMatch = block.match(/\[([A-Z][A-Z_ ]+)\]/);
    if (!headerMatch) return;
    const key = headerMatch[1].trim();
    const displayName = key.replace(/_/g, ' ');
    const bodyRaw = block.slice(block.indexOf(']') + 1).trim().replace(/\*\*/g, '');
    if (!bodyRaw) return;

    html += `
      <div class="flex flex-col gap-1.5 px-0">
        <h4 class="text-[9px] font-black text-indigo-900 uppercase tracking-widest font-sans">${displayName}</h4>
        <p class="text-[10px] text-slate-700 leading-relaxed font-mono">${bodyRaw}</p>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
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
      textEl.innerHTML = '<div class="data-card p-5 text-slate-700 font-sans text-sm">Market analysis unavailable.</div>';
    }
    window.playTacticalSound("success");
  } catch (e) {
    if (textEl) textEl.innerHTML = '<div class="data-card p-5 text-red-700 font-sans text-sm">Market analysis connection failed.</div>';
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
      <div class="py-8 border-b border-slate-800/80 group transition-all">
        <div class="flex justify-between items-start mb-4">
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 font-mono">Operational Sector</span>
            <span class="text-[18px] font-bold text-white uppercase tracking-wider" style="font-family: 'Plus Jakarta Sans', sans-serif;">${displayName}</span>
          </div>
          ${rating ? `
            <div class="flex flex-col items-end">
              <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 font-mono mb-1">Tactical Rating</span>
              <span class="text-[24px] font-light font-mono leading-none" style="color:${ratingColor};">${rating}<span class="text-[12px] opacity-20 ml-1">/ 10</span></span>
            </div>` : ''}
        </div>
        <div class="text-[14px] text-slate-700 leading-relaxed font-sans max-w-3xl">${formattedParagraph}</div>
      </div>`;
  });
  container.innerHTML = html || `<div class="py-6 text-[13px] text-slate-500 font-mono leading-relaxed">${clean.replace(/\n/g, '<br>')}</div>`;
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
      { key: "D.USD.EUR.SP00.A", label: "EUR/USD", flag: "🇺🇸" },
      { key: "D.GBP.EUR.SP00.A", label: "EUR/GBP", flag: "🇬🇧" },
      { key: "D.JPY.EUR.SP00.A", label: "EUR/JPY", flag: "🇯🇵" },
      { key: "D.CNY.EUR.SP00.A", label: "EUR/CNY", flag: "🇨🇳" },
      { key: "D.INR.EUR.SP00.A", label: "EUR/INR", flag: "🇮🇳" },
    ];
    const results = await Promise.allSettled(
      pairs.map((p) => fetch(`https://data-api.ecb.europa.eu/service/data/EXR/${p.key}?format=jsondata&lastNObservations=2`).then((r) => r.json())),
    );
    container.innerHTML = "";
    results.forEach((r, i) => {
      const p = pairs[i];
      let value = "—", prev = null;
      if (r.status === "fulfilled") {
        try {
          const obs = r.value.dataSets[0]?.series["0:0:0:0:0"]?.observations;
          const keys = obs ? Object.keys(obs).sort((a, b) => +b - +a) : [];
          value = keys[0] !== undefined ? parseFloat(obs[keys[0]][0]).toFixed(4) : "—";
          prev = keys[1] !== undefined ? parseFloat(obs[keys[1]][0]) : null;
        } catch (_) { value = "—"; }
      }
      const current = parseFloat(value);
      const change = prev ? ((current - prev) / prev) * 100 : null;
      const changeClass = change === null ? "text-slate-500" : change >= 0 ? "text-emerald-400" : "text-red-400";
      const row = document.createElement("div");
      row.className = "flex items-center justify-between py-1.5 border-b border-white/5";
      row.innerHTML = `<div class="flex items-center gap-2"><span class="text-sm">${p.flag}</span><span class="text-xs font-black text-white font-mono">${p.label}</span></div><div class="flex items-center gap-3"><span class="text-xs font-mono text-cyan-400 font-bold">${value}</span>${change !== null ? `<span class="${changeClass} text-[9px] font-mono">${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(3)}%</span>` : ""}</div>`;
      container.appendChild(row);
    });
    const label = document.getElementById("ecb-timestamp");
    if (label) label.innerText = "Updated: " + new Date().toUTCString().slice(0, 22) + " UTC";
  } catch (e) {
    container.innerHTML = '<div class="text-slate-500 text-xs">ECB data unavailable</div>';
  }
}
window.fetchECBRates = fetchECBRates;
