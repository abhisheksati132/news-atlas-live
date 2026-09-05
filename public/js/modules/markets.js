window.toggleMarketCategory = (category) => {
  const content = document.getElementById(`${category}-content`);
  const chevron = document.getElementById(`${category}-chevron`);
  if (!content || !chevron) return;
  content.classList.toggle("hidden");
  chevron.classList.toggle("fa-chevron-down");
  chevron.classList.toggle("fa-chevron-up");
};
function renderMarketUnavailable(container, label, retryFn) {
  if (!container) return;
  container.innerHTML = `
    <div class="p-6 text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
        <i class="fas fa-exclamation-triangle text-amber-400"></i> ${label}
      </div>
      <p class="text-slate-500 text-[11px] font-mono mb-3">Data unavailable or rate-limited</p>
      ${retryFn ? `<button type="button" onclick="${retryFn}()" class="px-4 py-1 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors">Retry</button>` : ''}
    </div>`;
}

function drawSpark(canvas, values, up) {
  if (!canvas) return;
  if (!values || values.length < 2) {
    canvas.style.display = "none";
    return;
  }
  const w = 64, h = 20;
  canvas.width = w;
  canvas.height = h;
  canvas.style.display = "";
  const ctx = canvas.getContext("2d");
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = (i / (values.length - 1)) * (w - 2) + 1;
    const y = h - 2.5 - ((v - min) / range) * (h - 5);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = up ? "#34d399" : "#fb7185";
  ctx.lineWidth = 1.4;
  ctx.lineJoin = "round";
  ctx.stroke();
}

function animatePrice(el, formatted) {
  if (el && window.animateNumber) window.animateNumber(el, formatted, 500);
}

async function displayPreciousMetals() {
  const container = document.getElementById("metals-content");
  if (!container) return;
  container.innerHTML = '<div class="text-slate-500 text-xs py-4 uppercase font-mono font-bold tracking-widest text-center animate-pulse">Loading metals...</div>';
  try {
    const curSelect = document.getElementById("market-currency-select");
    const cur = (curSelect ? curSelect.value : (window.currencyCode || "USD")).toUpperCase();
    const res = await fetch(`/api/markets?type=metals&currency=${cur}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Live metals data is unavailable");
    container.innerHTML = "";
    const metalDisplay = { XAU: "Gold (Spot)", XAG: "Silver (Spot)", XPT: "Platinum (Spot)", XPD: "Palladium" };
    const metalSymbol = { XAU: "Au", XAG: "Ag", XPT: "Pt", XPD: "Pd" };
    Object.entries(json.data || {}).forEach(([sym, data]) => {
      const name = metalDisplay[sym] || sym;
      const change = data.change || 0;
      const changeClass = change >= 0 ? "text-emerald-400" : "text-red-400";
      const row = document.createElement("div");
      row.className = "flex items-center justify-between py-2.5 px-3 hover:bg-[var(--bg-surface-subtle)] transition-colors rounded-lg";
      row.innerHTML = `
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg border border-[var(--border-subtle)] flex items-center justify-center text-[11px] font-mono font-bold bg-[var(--bg-surface-subtle)] text-slate-200">${metalSymbol[sym] || sym.slice(0, 2)}</div>
          <div class="flex flex-col">
            <span class="text-xs font-bold text-slate-100 uppercase tracking-tight">${name}</span>
            <span class="text-[9px] text-slate-500 uppercase font-mono font-bold">${sym} · ${cur}</span>
          </div>
        </div>
        <div class="flex items-center gap-3 font-mono">
          <canvas class="spark" width="64" height="20"></canvas>
          <div class="text-xs font-bold text-slate-100 mk-price">${(data.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div class="${changeClass} text-[10px] font-bold min-w-[48px] text-right">${change >= 0 ? "+" : ""}${change.toFixed(2)}%</div>
        </div>`;
      container.appendChild(row);
      drawSpark(row.querySelector(".spark"), data.spark, change >= 0);
      animatePrice(row.querySelector(".mk-price"), (data.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    });
    if (container.children.length === 0) renderMarketUnavailable(container, "Metals Quotes Unavailable", "window.displayPreciousMetals");
  } catch {
    renderMarketUnavailable(container, "Metals Quotes Unavailable", "window.displayPreciousMetals");
  }
}

async function displayCountryIndices(countryName) {
  const container = document.getElementById("indices-content");
  if (!container) return;
  const targetCountry = countryName || window._currentCountryName || "Global";
  const indicesLabelEl = document.getElementById("indices-country");
  if (indicesLabelEl) indicesLabelEl.innerText = targetCountry.toUpperCase();
  container.innerHTML = `<div class="text-slate-500 text-xs py-4 uppercase font-mono font-bold tracking-widest text-center animate-pulse">Loading ${targetCountry.toUpperCase()} indices...</div>`;
  try {
    const res = await fetch(`/api/markets?type=ticker&country=${encodeURIComponent(targetCountry)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Live index data is unavailable");
    container.innerHTML = "";
    (json.data || []).forEach((data) => {
      const change = data.change || 0;
      const changeClass = change >= 0 ? "text-emerald-400" : "text-red-400";
      const row = document.createElement("div");
      row.className = "flex items-center justify-between py-2.5 px-3 hover:bg-[var(--bg-surface-subtle)] transition-colors rounded-lg";
      row.innerHTML = `
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg border border-[var(--border-subtle)] flex items-center justify-center text-[10px] bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-mono font-bold">IDX</div>
          <div class="flex flex-col">
            <span class="text-xs font-bold text-slate-100 uppercase tracking-tight">${data.label}</span>
            <span class="text-[9px] text-slate-500 uppercase font-mono">Market Index</span>
          </div>
        </div>
        <div class="flex items-center gap-3 font-mono">
          <canvas class="spark" width="64" height="20"></canvas>
          <div class="text-xs font-bold text-slate-100 mk-price">${(data.price || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}</div>
          <div class="${changeClass} text-[10px] font-bold min-w-[48px] text-right">${change >= 0 ? "+" : ""}${change.toFixed(2)}%</div>
        </div>`;
      container.appendChild(row);
      drawSpark(row.querySelector(".spark"), data.spark, change >= 0);
      animatePrice(row.querySelector(".mk-price"), (data.price || 0).toLocaleString(undefined, { maximumFractionDigits: 1 }));
    });
    if (container.children.length === 0) renderMarketUnavailable(container, "Indices Quotes Unavailable", `() => window.displayCountryIndices('${targetCountry}')`);
  } catch {
    renderMarketUnavailable(container, "Indices Quotes Unavailable", `() => window.displayCountryIndices('${targetCountry}')`);
  }
}
window.getIndicesForCountry = () => ({});

async function displayForex() {
  const container = document.getElementById("forex-content");
  if (!container) return;
  container.innerHTML = '<div class="text-slate-500 text-xs py-4 uppercase font-mono font-bold tracking-widest text-center animate-pulse">Loading exchange rates...</div>';
  try {
    const curSelect = document.getElementById("market-currency-select");
    const base = (curSelect ? curSelect.value : (window.currencyCode || "USD")).toUpperCase();
    const res = await fetch(`/api/markets?type=forex&currency=${base}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Live FX data is unavailable");
    container.innerHTML = "";
    Object.entries(json.rates || {}).filter(([c]) => c !== base).slice(0, 14).forEach(([pair, rate]) => {
      const row = document.createElement("div");
      row.className = "flex items-center justify-between py-2 px-3 hover:bg-[var(--bg-surface-subtle)] transition-colors rounded-lg font-mono";
      row.innerHTML = `
        <div class="flex flex-col">
          <div class="text-xs font-bold text-slate-200 tracking-tight">${base} <span class="text-slate-500">/</span> ${pair}</div>
          <div class="text-[9px] text-slate-500 uppercase">Spot rate</div>
        </div>
        <div class="text-xs font-bold text-slate-100">${rate.toFixed(4)}</div>`;
      container.appendChild(row);
    });
  } catch {
    renderMarketUnavailable(container, "Forex Feed Offline", "window.displayForex");
  }
}

async function displayCommodities() {
  const container = document.getElementById("commodities-content");
  if (!container) return;
  container.innerHTML = '<div class="text-slate-500 text-xs py-4 uppercase font-mono font-bold tracking-widest text-center animate-pulse">Loading commodities...</div>';
  try {
    const curSelect = document.getElementById("market-currency-select");
    const cur = (curSelect ? curSelect.value : (window.currencyCode || "USD")).toUpperCase();
    const res = await fetch(`/api/markets?type=commodities&currency=${cur}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Live commodity data is unavailable");
    container.innerHTML = "";
    const commodityCode = { "Brent Crude Oil": "OIL", "WTI Crude Oil": "WTI", "Natural Gas": "GAS", "Copper": "CU", "Wheat": "WHT", "Corn": "CRN", "Coffee": "CFE" };
    Object.entries(json.data || {}).forEach(([name, data]) => {
      const change = data.change || 0;
      const changeClass = change >= 0 ? "text-emerald-400" : "text-red-400";
      const row = document.createElement("div");
      row.className = "flex items-center justify-between py-2.5 px-3 hover:bg-[var(--bg-surface-subtle)] transition-colors rounded-lg";
      row.innerHTML = `
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-mono font-bold bg-[var(--bg-surface-subtle)] text-slate-200">${commodityCode[name] || name.slice(0, 3).toUpperCase()}</div>
          <div class="flex flex-col">
            <span class="text-xs font-bold text-slate-100 uppercase tracking-tight">${name}</span>
            <span class="text-[9px] text-slate-500 uppercase font-mono">${data.unit || "Unit"}</span>
          </div>
        </div>
        <div class="flex items-center gap-3 font-mono">
          <canvas class="spark" width="64" height="20"></canvas>
          <div class="text-xs font-bold text-slate-100"><span class="mk-price">${(data.price || 0).toFixed(2)}</span> <span class="text-[9px] text-slate-500">${cur}</span></div>
          <div class="${changeClass} text-[10px] font-bold min-w-[48px] text-right">${change >= 0 ? "+" : ""}${change.toFixed(2)}%</div>
        </div>`;
      container.appendChild(row);
      drawSpark(row.querySelector(".spark"), data.spark, change >= 0);
      animatePrice(row.querySelector(".mk-price"), (data.price || 0).toFixed(2));
    });
    if (container.children.length === 0) renderMarketUnavailable(container, "Commodity Feed Unavailable", "window.displayCommodities");
  } catch {
    renderMarketUnavailable(container, "Commodity Feed Unavailable", "window.displayCommodities");
  }
}
function initializeMarkets(countryName) {
  displayPreciousMetals();
  displayCountryIndices(countryName || "Global");
  displayForex();
  displayCommodities();
}
window.displayPreciousMetals = displayPreciousMetals;
window.displayCountryIndices = displayCountryIndices;
window.displayForex = displayForex;
window.displayCommodities = displayCommodities;
window.initializeMarkets = initializeMarkets;
let _marketsRefreshTimer = null;
function startMarketsAutoRefresh() {
    if (_marketsRefreshTimer) clearInterval(_marketsRefreshTimer);
    _marketsRefreshTimer = setInterval(() => {
        const activeTab = window.store ? window.store.get("tab") : window._currentTab;
        if (document.visibilityState === 'visible' && activeTab === 'tab-markets') {
            initializeMarkets(window._currentCountryName || "Global");
        }
    }, 60 * 1000);
}
startMarketsAutoRefresh();
