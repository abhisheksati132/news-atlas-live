window.toggleMarketCategory = (category) => {
  const content = document.getElementById(`${category}-content`);
  const chevron = document.getElementById(`${category}-chevron`);
  if (!content || !chevron) return;
  content.classList.toggle("hidden");
  chevron.classList.toggle("fa-chevron-down");
  chevron.classList.toggle("fa-chevron-up");
};
async function displayPreciousMetals() {
  const container = document.getElementById("metals-content");
  if (!container) return;
  container.innerHTML = '<div class="text-slate-500 text-[10px] py-4 uppercase font-bold tracking-widest text-center animate-pulse">Establishing Metal Exchange Uplink...</div>';
  try {
    const cur = (window.currencyCode || "USD").toUpperCase();
    const res = await fetch(`/api/markets?type=metals&currency=${cur}`);
    const json = await res.json();
    container.innerHTML = "";
    const metalDisplay = { XAU: "Gold (Spot)", XAG: "Silver (Spot)", XPT: "Platinum (Spot)", XPD: "Palladium" };
    Object.entries(json.data || {}).forEach(([sym, data]) => {
      const name = metalDisplay[sym] || sym;
      const change = data.change || 0;
      const changeClass = change >= 0 ? "text-emerald-400" : "text-red-400";
      const row = document.createElement("div");
      row.className = "flex items-center justify-between py-3 px-4 hover:bg-white/[0.02] transition-colors group";
      row.innerHTML = `
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-none border border-white/5 flex items-center justify-center text-lg bg-white/5">${data.icon || "🪙"}</div>
                  <div class="flex flex-col">
                    <span class="text-[12px] font-bold text-white uppercase tracking-tight">${name}</span>
                    <span class="text-[9px] text-slate-500 uppercase font-bold tracking-widest">${sym} / ${cur}</span>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-[14px] font-black text-white font-mono">${(data.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div class="${changeClass} text-[10px] font-bold font-mono min-w-[50px] text-right">${change >= 0 ? "+" : ""}${change.toFixed(2)}%</div>
                </div>`;
      container.appendChild(row);
    });
    if (container.children.length === 0) container.innerHTML = '<div class="text-slate-500 text-[10px] py-6 text-center uppercase font-black">Link Offline</div>';
  } catch { container.innerHTML = '<div class="text-red-500 text-[10px] py-6 text-center uppercase font-black tracking-widest">Protocol Sync Failure</div>'; }
}

async function displayCountryIndices(countryName) {
  const container = document.getElementById("indices-content");
  if (!container) return;
  const indicesLabelEl = document.getElementById("indices-country");
  if (indicesLabelEl) indicesLabelEl.innerText = `${countryName.toUpperCase()} MARKET INDICES`;
  container.innerHTML = `<div class="text-slate-500 text-[10px] py-4 uppercase font-bold tracking-widest text-center animate-pulse">Scanning ${countryName.toUpperCase()} Sector Indices...</div>`;
  try {
    const res = await fetch(`/api/markets?type=ticker&country=${encodeURIComponent(countryName)}`);
    const json = await res.json();
    container.innerHTML = "";
    (json.data || []).forEach((data) => {
      const change = data.change || 0;
      const changeClass = change >= 0 ? "text-emerald-400" : "text-red-400";
      const row = document.createElement("div");
      row.className = "flex items-center justify-between py-3 px-4 hover:bg-white/[0.02] transition-colors group";
      row.innerHTML = `
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-none border border-white/5 flex items-center justify-center text-sm bg-blue-500/10 text-blue-400 font-bold">IDX</div>
                  <div class="flex flex-col">
                    <span class="text-[12px] font-bold text-white uppercase tracking-tight">${data.label}</span>
                    <span class="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Market Index</span>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-[14px] font-black text-white font-mono">${(data.price || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}</div>
                  <div class="${changeClass} text-[10px] font-bold font-mono min-w-[50px] text-right">${change >= 0 ? "+" : ""}${change.toFixed(2)}%</div>
                </div>`;
      container.appendChild(row);
    });
    if (container.children.length === 0) container.innerHTML = '<div class="text-slate-500 text-[10px] py-6 text-center uppercase font-black">Data Unavailable</div>';
  } catch { container.innerHTML = '<div class="text-red-500 text-[10px] py-6 text-center uppercase font-black">Sync Failure</div>'; }
}
window.getIndicesForCountry = () => ({});
async function displayForex() {
  const container = document.getElementById("forex-content");
  if (!container) return;
  container.innerHTML = '<div class="text-slate-500 text-[10px] py-4 uppercase font-bold tracking-widest text-center animate-pulse">Syncing International Exchange Rates...</div>';
  try {
    const base = (window.currencyCode || "USD").toUpperCase();
    const res = await fetch(`/api/markets?type=forex&currency=${base}`);
    const json = await res.json();
    container.innerHTML = "";
    Object.entries(json.rates || {}).filter(([c]) => c !== base).slice(0, 16).forEach(([pair, rate]) => {
      const row = document.createElement("div");
      row.className = "flex items-center justify-between py-2.5 px-4 hover:bg-white/[0.02] transition-all";
      row.innerHTML = `
                <div class="flex flex-col">
                  <div class="text-[13px] font-bold text-white tracking-tight">${base} <span class="text-cyan-500">/</span> ${pair}</div>
                  <div class="text-[9px] text-slate-500 uppercase font-black tracking-widest">Pair</div>
                </div>
                <div class="text-[15px] font-mono font-black text-cyan-400">${rate.toFixed(4)}</div>`;
      container.appendChild(row);
    });
  } catch { container.innerHTML = '<div class="text-slate-500 text-[10px] py-6 text-center uppercase font-black">Exchange Offline</div>'; }
}
async function displayCommodities() {
  const container = document.getElementById("commodities-content");
  if (!container) return;
  container.innerHTML = '<div class="text-slate-500 text-[10px] py-4 uppercase font-black tracking-widest text-center animate-pulse">Fetching Commodity Pipeline Data...</div>';
  try {
    const cur = (window.currencyCode || "USD").toUpperCase();
    const res = await fetch(`/api/markets?type=commodities&currency=${cur}`);
    const json = await res.json();
    container.innerHTML = "";
    Object.entries(json.data || {}).forEach(([name, data]) => {
      const change = data.change || 0;
      const changeClass = change >= 0 ? "text-emerald-400" : "text-red-400";
      const row = document.createElement("div");
      row.className = "flex items-center justify-between py-3 px-4 hover:bg-white/[0.02] transition-colors group";
      row.innerHTML = `
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-none border border-white/5 flex items-center justify-center text-lg bg-orange-500/10">${data.icon || "📦"}</div>
                  <div class="flex flex-col">
                    <span class="text-[12px] font-bold text-white uppercase tracking-tight">${name}</span>
                    <span class="text-[9px] text-slate-500 uppercase font-black tracking-widest">${data.unit || "N/A"}</span>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-[14px] font-black text-white font-mono">${(data.price || 0).toFixed(2)} <span class="text-[9px] text-slate-500">${cur}</span></div>
                  <div class="${changeClass} text-[10px] font-bold font-mono min-w-[50px] text-right">${change >= 0 ? "+" : ""}${change.toFixed(2)}%</div>
                </div>`;
      container.appendChild(row);
    });
    if (container.children.length === 0) container.innerHTML = '<div class="text-slate-500 text-[10px] py-6 text-center uppercase font-black">Data Offline</div>';
  } catch { container.innerHTML = '<div class="text-red-500 text-[10px] py-6 text-center uppercase font-black">Pipeline Failure</div>'; }
}
async function displayCrypto() {
  const container = document.getElementById("crypto-content");
  if (!container) return;
  container.innerHTML = '<div class="text-slate-500 text-[10px] py-4 uppercase font-black tracking-widest text-center animate-pulse">Initializing Digital Ledger Link...</div>';
  try {
    const res = await fetch(`/api/markets?type=crypto`);
    const json = await res.json();
    container.innerHTML = "";
    Object.entries(json.data || {}).forEach(([sym, data]) => {
      const change = data.change || 0;
      const changeClass = change >= 0 ? "text-emerald-400" : "text-red-400";
      const row = document.createElement("div");
      row.className = "flex items-center justify-between py-3 px-4 hover:bg-white/[0.02] transition-colors group";
      row.innerHTML = `
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-none border border-white/5 flex items-center justify-center text-lg bg-orange-500/10 text-orange-400 font-bold">${data.icon || "₿"}</div>
                  <div class="flex flex-col">
                    <span class="text-[12px] font-bold text-white uppercase tracking-tight">${data.name || sym}</span>
                    <span class="text-[9px] text-slate-500 uppercase font-bold tracking-widest">${sym} / USD</span>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-[14px] font-black text-white font-mono">${(data.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: (data.price < 5 ? 4 : 2) })}</div>
                  <div class="${changeClass} text-[10px] font-bold font-mono min-w-[50px] text-right">${change >= 0 ? "+" : ""}${change.toFixed(2)}%</div>
                </div>`;
      container.appendChild(row);
    });
  } catch { container.innerHTML = '<div class="text-red-500 text-[10px] py-6 text-center uppercase font-black tracking-widest">Protocol Sync Failure</div>'; }
}
async function displayECBRates() {
  const container = document.getElementById("ecb-rates-content");
  if (!container) return;
  try {
    const res = await fetch(`/api/markets?type=ecb`);
    const json = await res.json();
    container.innerHTML = "";
    Object.entries(json.rates || {}).slice(0, 10).forEach(([currency, rate]) => {
      const row = document.createElement("div");
      row.className = "flex items-center justify-between py-2 border-b border-white/[0.03] group hover:bg-white/[0.02] transition-colors px-2";
      row.innerHTML = `
        <div class="text-[11px] font-bold text-slate-400 group-hover:text-cyan-400 transition-colors uppercase font-mono">EUR / ${currency}</div>
        <div class="text-[13px] font-black text-white font-mono">${(1 / rate).toFixed(4)}</div>
      `;
      container.appendChild(row);
    });
    const stamp = document.getElementById("ecb-timestamp");
    if (stamp) stamp.innerText = new Date().toLocaleTimeString() + " Live";
  } catch { container.innerHTML = '<div class="text-red-500/50 text-[10px] py-4 text-center">ECB LINK ERROR</div>'; }
}
function initializeMarkets(countryName) {
  displayPreciousMetals();
  displayCountryIndices(countryName || "Global");
  displayForex();
  displayCommodities();
  displayCrypto();
  displayECBRates();
}
window.displayPreciousMetals = displayPreciousMetals;
window.displayCountryIndices = displayCountryIndices;
window.displayForex = displayForex;
window.displayCommodities = displayCommodities;
window.displayCrypto = displayCrypto;
window.displayECBRates = displayECBRates;
window.initializeMarkets = initializeMarkets;
let _marketsRefreshTimer = null;
function startMarketsAutoRefresh() {
    if (_marketsRefreshTimer) clearInterval(_marketsRefreshTimer);
    _marketsRefreshTimer = setInterval(() => {
        if (document.visibilityState === 'visible' && window._currentTab === 'markets') {
            initializeMarkets(window._currentCountryName || "Global");
        }
    }, 60 * 1000);
}
startMarketsAutoRefresh();