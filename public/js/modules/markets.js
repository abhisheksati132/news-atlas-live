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
      row.className = "flex items-center justify-between py-4 px-6 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group";
      row.innerHTML = `
                <div class="flex items-center gap-4">
                  <div class="text-[10px] font-black text-blue-500 font-mono tracking-tighter h-8 flex items-center">[ ${sym}/${cur} ]</div>
                  <div class="flex flex-col">
                    <span class="text-[11px] font-bold text-white uppercase tracking-tight font-mono">${name}</span>
                    <div class="flex items-center gap-2">
                      <span class="text-[8px] text-slate-600 uppercase font-black tracking-widest font-mono">NODE: NOMINAL</span>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <div class="text-[16px] font-black text-white font-mono leading-none">${(data.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div class="${changeClass} text-[10px] font-bold font-mono text-right flex items-center gap-1.5">
                    ${change >= 0 ? '<i class="fas fa-caret-up text-[8px]"></i>' : '<i class="fas fa-caret-down text-[8px]"></i>'}
                    ${Math.abs(change).toFixed(2)}%
                  </div>
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
      row.className = "flex items-center justify-between py-4 px-6 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group";
      row.innerHTML = `
                <div class="flex items-center gap-4">
                  <div class="text-[10px] font-black text-cyan-500 font-mono tracking-tighter h-8 flex items-center">[ ${data.ticker || 'INDEX'} ]</div>
                  <div class="flex flex-col">
                    <span class="text-[11px] font-bold text-white uppercase tracking-tight font-mono">${data.label}</span>
                    <div class="flex items-center gap-2">
                       <span class="text-[8px] text-slate-600 uppercase font-black tracking-widest font-mono">REGISTRY: ONLINE</span>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <div class="text-[16px] font-black text-white font-mono leading-none">${(data.price || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}</div>
                  <div class="${changeClass} text-[10px] font-bold font-mono text-right flex items-center gap-1.5">
                    ${change >= 0 ? '<i class="fas fa-caret-up text-[8px]"></i>' : '<i class="fas fa-caret-down text-[8px]"></i>'}
                    ${Math.abs(change).toFixed(2)}%
                  </div>
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
      row.className = "flex items-center justify-between py-4 px-6 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group";
      row.innerHTML = `
                <div class="flex items-center gap-4">
                  <div class="text-[10px] font-black text-emerald-500 font-mono tracking-tighter h-8 flex items-center">[ ${base}/${pair} ]</div>
                  <div class="flex flex-col">
                    <span class="text-[11px] font-bold text-white uppercase tracking-tight font-mono">Currency Flow</span>
                    <div class="flex items-center gap-2">
                       <span class="text-[8px] text-slate-600 uppercase font-black tracking-widest font-mono">BAND_7: OPEN</span>
                    </div>
                  </div>
                </div>
                <div class="text-[16px] font-black text-cyan-400 font-mono leading-none">${rate.toFixed(4)}</div>`;
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
      row.className = "flex items-center justify-between py-4 px-6 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group";
      row.innerHTML = `
                <div class="flex items-center gap-4">
                  <div class="text-[10px] font-black text-orange-500 font-mono tracking-tighter h-8 flex items-center">[ ${name.toUpperCase().slice(0, 3)} ]</div>
                  <div class="flex flex-col">
                    <span class="text-[11px] font-bold text-white uppercase tracking-tight font-mono">${name}</span>
                    <div class="flex items-center gap-2">
                       <span class="text-[8px] text-slate-600 uppercase font-black tracking-widest font-mono">P_LINE: STABLE</span>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <div class="text-[16px] font-black text-white font-mono leading-none">${(data.price || 0).toFixed(2)} <span class="text-[9px] text-slate-700">${cur}</span></div>
                  <div class="${changeClass} text-[10px] font-bold font-mono text-right flex items-center gap-1.5">
                    ${change >= 0 ? '<i class="fas fa-caret-up text-[8px]"></i>' : '<i class="fas fa-caret-down text-[8px]"></i>'}
                    ${Math.abs(change).toFixed(2)}%
                  </div>
                </div>`;
      container.appendChild(row);
    });
    if (container.children.length === 0) container.innerHTML = '<div class="text-slate-500 text-[10px] py-6 text-center uppercase font-black">Data Offline</div>';
  } catch { container.innerHTML = '<div class="text-red-500 text-[10px] py-6 text-center uppercase font-black">Pipeline Failure</div>'; }
}
function renderTVChart(countryName) {
  if (typeof TradingView === 'undefined') {
      console.warn("TradingView not ready, retrying in 500ms...");
      setTimeout(() => renderTVChart(countryName), 500);
      return;
  }
  
  const tab = document.getElementById('tab-markets');
  if (tab && tab.style.display === 'none') {
      return; // Handled by switchTab later
  }
  
  const countryToSymbol = {
    "united states": "NASDAQ:NDX",
    "usa": "NASDAQ:NDX",
    "china": "TVC:SHCOMP",
    "japan": "TVC:NI225",
    "germany": "XETR:DAX",
    "united kingdom": "TVC:UKX",
    "uk": "TVC:UKX",
    "france": "EURONEXT:PX1",
    "india": "BSE:SENSEX",
    "brazil": "BMFBOVESPA:IBOV",
    "canada": "TSX:TSX",
    "australia": "ASX:XJO"
  };
  
  const symbol = countryToSymbol[(countryName || "Global").toLowerCase()] || "NASDAQ:NDX";

  document.getElementById("tv-advanced-chart").innerHTML = "";
  new TradingView.widget({
    "autosize": true,
    "symbol": symbol,
    "interval": "D",
    "timezone": "Etc/UTC",
    "theme": "dark",
    "style": "3", // Area chart
    "locale": "en",
    "enable_publishing": false,
    "backgroundColor": "rgba(2, 6, 23, 1)",
    "gridColor": "rgba(255, 255, 255, 0.03)",
    "hide_top_toolbar": false,
    "hide_legend": false,
    "save_image": false,
    "container_id": "tv-advanced-chart",
    "toolbar_bg": "rgba(2, 6, 23, 1)",
    "studies": []
  });
}

function initializeMarkets(countryName) {
  renderTVChart(countryName);
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
window.renderTVChart = renderTVChart;
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