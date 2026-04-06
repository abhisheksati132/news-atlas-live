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
      const changeClass = change >= 0 ? "text-emerald-600" : "text-rose-600";
      const row = document.createElement("div");
      row.className = "flex items-center justify-between py-5 px-8 border-b border-gray-100 hover:bg-gray-50 transition-colors group";
      row.innerHTML = `
                <div class="flex items-center gap-5">
                  <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[10px] tracking-tight border border-blue-100">${sym}</div>
                  <div class="flex flex-col">
                    <span class="text-[13px] font-bold text-slate-900 uppercase tracking-tight font-sans">${name}</span>
                    <div class="flex items-center gap-3">
                      <span class="text-[9px] text-slate-500 uppercase font-bold tracking-widest font-sans">Depth: High</span>
                      <span class="text-[9px] text-slate-400 uppercase font-medium tracking-widest font-sans">/ Spot Exchange</span>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <div class="text-[18px] font-bold text-slate-900 font-sans leading-none tracking-tight">${(data.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span class="text-[10px] text-slate-400 ml-1">${cur}</span></div>
                  <div class="${changeClass} text-[11px] font-bold font-sans text-right flex items-center gap-1.5 px-2 py-0.5 rounded-full ${change >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}">
                    ${change >= 0 ? '<i class="fas fa-caret-up text-[9px]"></i>' : '<i class="fas fa-caret-down text-[9px]"></i>'}
                    ${Math.abs(change).toFixed(2)}%
                  </div>
                </div>`;
      container.appendChild(row);
    });
    if (container.children.length === 0) container.innerHTML = '<div class="text-slate-400 text-[11px] py-10 text-center uppercase font-bold tracking-widest">Exchange Sync Unavailable</div>';
  } catch { container.innerHTML = '<div class="text-rose-600 text-[11px] py-10 text-center uppercase font-bold tracking-widest">Market Protocol Connectivity Error</div>'; }
}

async function displayCountryIndices(countryName) {
  const container = document.getElementById("indices-content");
  if (!container) return;
  const indicesLabelEl = document.getElementById("indices-country");
  if (indicesLabelEl) indicesLabelEl.innerText = `${countryName.toUpperCase()} EQUITY INDICES`;
  container.innerHTML = `<div class="text-slate-400 text-[11px] py-10 uppercase font-bold tracking-widest text-center animate-pulse">Syncing ${countryName.toUpperCase()} Equity Markets...</div>`;
  try {
    const res = await fetch(`/api/markets?type=ticker&country=${encodeURIComponent(countryName)}`);
    const json = await res.json();
    container.innerHTML = "";
    (json.data || []).forEach((data) => {
      const change = data.change || 0;
      const changeClass = change >= 0 ? "text-emerald-600" : "text-rose-600";
      const row = document.createElement("div");
      row.className = "flex items-center justify-between py-5 px-8 border-b border-gray-100 hover:bg-gray-50 transition-colors group";
      row.innerHTML = `
                <div class="flex items-center gap-5">
                  <div class="w-12 h-10 rounded-lg bg-slate-50 flex flex-col items-center justify-center text-slate-600 font-bold text-[9px] tracking-tighter border border-slate-100 uppercase">${data.ticker || 'IDX'}</div>
                  <div class="flex flex-col">
                    <span class="text-[13px] font-bold text-slate-900 uppercase tracking-tight font-sans">${data.label}</span>
                    <div class="flex items-center gap-3">
                       <span class="text-[9px] text-slate-500 uppercase font-bold tracking-widest font-sans">Status: Open</span>
                       <span class="text-[9px] text-slate-400 uppercase font-medium tracking-widest font-sans">/ Index Trading</span>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <div class="text-[18px] font-bold text-slate-900 font-sans leading-none tracking-tight">${(data.price || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}</div>
                  <div class="${changeClass} text-[11px] font-bold font-sans text-right flex items-center gap-1.5 px-2 py-0.5 rounded-full ${change >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}">
                    ${change >= 0 ? '<i class="fas fa-caret-up text-[9px]"></i>' : '<i class="fas fa-caret-down text-[9px]"></i>'}
                    ${Math.abs(change).toFixed(2)}%
                  </div>
                </div>`;
      container.appendChild(row);
    });
    if (container.children.length === 0) container.innerHTML = '<div class="text-slate-400 text-[11px] py-10 text-center uppercase font-bold tracking-widest">No Regional Index Match Found</div>';
  } catch { container.innerHTML = '<div class="text-rose-600 text-[11px] py-10 text-center uppercase font-bold tracking-widest">Regional Equity Sync Failed</div>'; }
}
window.getIndicesForCountry = () => ({});
async function displayForex() {
  const container = document.getElementById("forex-content");
  if (!container) return;
  container.innerHTML = '<div class="text-slate-400 text-[11px] py-10 uppercase font-bold tracking-widest text-center animate-pulse">Establishing Foreign Exchange Matrix...</div>';
  try {
    const base = (window.currencyCode || "USD").toUpperCase();
    const res = await fetch(`/api/markets?type=forex&currency=${base}`);
    const json = await res.json();
    container.innerHTML = "";
    Object.entries(json.rates || {}).filter(([c]) => c !== base).slice(0, 16).forEach(([pair, rate]) => {
      const row = document.createElement("div");
      row.className = "flex items-center justify-between py-5 px-8 border-b border-gray-100 hover:bg-gray-50 transition-colors group";
      row.innerHTML = `
                <div class="flex items-center gap-5">
                  <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-[9px] tracking-tight border border-emerald-100">${base}/${pair}</div>
                  <div class="flex flex-col">
                    <span class="text-[13px] font-bold text-slate-900 uppercase tracking-tight font-sans">Currency Flow</span>
                    <div class="flex items-center gap-3">
                       <span class="text-[9px] text-slate-500 uppercase font-bold tracking-widest font-sans">Liquidity: Prime</span>
                    </div>
                  </div>
                </div>
                <div class="text-[18px] font-bold text-slate-900 font-sans leading-none tracking-tight">${rate.toFixed(4)}</div>`;
      container.appendChild(row);
    });
  } catch { container.innerHTML = '<div class="text-slate-400 text-[11px] py-10 text-center uppercase font-bold tracking-widest">FX Matrix Offline</div>'; }
}
async function displayCommodities() {
  const container = document.getElementById("commodities-content");
  if (!container) return;
  container.innerHTML = '<div class="text-slate-400 text-[11px] py-10 uppercase font-bold tracking-widest text-center animate-pulse">Tracing Commodity Pipeline Infrastructure...</div>';
  try {
    const cur = (window.currencyCode || "USD").toUpperCase();
    const res = await fetch(`/api/markets?type=commodities&currency=${cur}`);
    const json = await res.json();
    container.innerHTML = "";
    Object.entries(json.data || {}).forEach(([name, data]) => {
      const change = data.change || 0;
      const changeClass = change >= 0 ? "text-emerald-600" : "text-rose-600";
      const row = document.createElement("div");
      row.className = "flex items-center justify-between py-5 px-8 border-b border-gray-100 hover:bg-gray-50 transition-colors group";
      row.innerHTML = `
                <div class="flex items-center gap-5">
                  <div class="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-700 font-bold text-[9px] tracking-tight border border-orange-100">${name.toUpperCase().slice(0, 3)}</div>
                  <div class="flex flex-col">
                    <span class="text-[13px] font-bold text-slate-900 uppercase tracking-tight font-sans">${name}</span>
                    <div class="flex items-center gap-3">
                       <span class="text-[9px] text-slate-500 uppercase font-bold tracking-widest font-sans">Status: Stable</span>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <div class="text-[18px] font-bold text-slate-900 font-sans leading-none tracking-tight">${(data.price || 0).toFixed(2)} <span class="text-[10px] text-slate-400 ml-1">${cur}</span></div>
                  <div class="${changeClass} text-[11px] font-bold font-sans text-right flex items-center gap-1.5 px-2 py-0.5 rounded-full ${change >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}">
                    ${change >= 0 ? '<i class="fas fa-caret-up text-[9px]"></i>' : '<i class="fas fa-caret-down text-[9px]"></i>'}
                    ${Math.abs(change).toFixed(2)}%
                  </div>
                </div>`;
      container.appendChild(row);
    });
    if (container.children.length === 0) container.innerHTML = '<div class="text-slate-400 text-[11px] py-10 text-center uppercase font-bold tracking-widest">Global Commodity Data Unavailable</div>';
  } catch { container.innerHTML = '<div class="text-rose-600 text-[11px] py-10 text-center uppercase font-bold tracking-widest">Pipeline Data Transmission Error</div>'; }
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