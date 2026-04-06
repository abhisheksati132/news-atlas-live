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
      row.className = "stat-cell";
      row.style.cursor = "pointer";
      row.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem;">
          <div>
            <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.3rem;">${sym}</div>
            <div style="font-size:12px;font-weight:700;color:var(--text);font-family:var(--font-sans);">${name}</div>
          </div>
          <div class="${changeClass}" style="font-size:10px;font-weight:700;background:var(--surface-2);padding:0.2rem 0.4rem;border-radius:4px;border:1px solid var(--border);">
            ${change >= 0 ? '<i class="fas fa-caret-up"></i>' : '<i class="fas fa-caret-down"></i>'} ${Math.abs(change).toFixed(2)}%
          </div>
        </div>
        <div>
          <div style="font-size:1.5rem;font-weight:800;color:var(--text);font-family:var(--font-sans);letter-spacing:-0.03em;">
            ${(data.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style="font-size:12px;color:var(--text-muted);">${cur}</span>
          </div>
          <div style="font-size:9px;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.05em;margin-top:0.4rem;">Spot Exchange</div>
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
      row.className = "stat-cell";
      row.style.cursor = "pointer";
      row.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem;">
          <div>
            <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.3rem;">${data.ticker || 'IDX'}</div>
            <div style="font-size:12px;font-weight:700;color:var(--text);font-family:var(--font-sans);">${data.label}</div>
          </div>
          <div class="${changeClass}" style="font-size:10px;font-weight:700;background:var(--surface-2);padding:0.2rem 0.4rem;border-radius:4px;border:1px solid var(--border);">
            ${change >= 0 ? '<i class="fas fa-caret-up"></i>' : '<i class="fas fa-caret-down"></i>'} ${Math.abs(change).toFixed(2)}%
          </div>
        </div>
        <div>
          <div style="font-size:1.5rem;font-weight:800;color:var(--text);font-family:var(--font-sans);letter-spacing:-0.03em;">
            ${(data.price || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </div>
          <div style="font-size:9px;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.05em;margin-top:0.4rem;">Index Trading / Open</div>
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
    Object.entries(json.rates || {}).filter(([c]) => c !== base).slice(0, 16).forEach(([c, rate]) => {
      const row = document.createElement("div");
      row.className = "stat-cell";
      row.style.cursor = "pointer";
      row.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem;">
          <div>
            <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.3rem;">Forex</div>
            <div style="font-size:12px;font-weight:700;color:var(--text);font-family:var(--font-sans);">${base}/${c}</div>
          </div>
        </div>
        <div>
          <div style="font-size:1.5rem;font-weight:800;color:var(--text);font-family:var(--font-sans);letter-spacing:-0.03em;">
            ${Number(rate).toFixed(4)}
          </div>
          <div style="font-size:9px;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.05em;margin-top:0.4rem;">Currency Flow / Liquidity</div>
        </div>`;
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
      row.className = "stat-cell";
      row.style.cursor = "pointer";
      row.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem;">
          <div>
            <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.3rem;">${name.toUpperCase().slice(0, 3)}</div>
            <div style="font-size:12px;font-weight:700;color:var(--text);font-family:var(--font-sans);">${name}</div>
          </div>
          <div class="${changeClass}" style="font-size:10px;font-weight:700;background:var(--surface-2);padding:0.2rem 0.4rem;border-radius:4px;border:1px solid var(--border);">
            ${change >= 0 ? '<i class="fas fa-caret-up"></i>' : '<i class="fas fa-caret-down"></i>'} ${Math.abs(change).toFixed(2)}%
          </div>
        </div>
        <div>
          <div style="font-size:1.5rem;font-weight:800;color:var(--text);font-family:var(--font-sans);letter-spacing:-0.03em;">
            ${(data.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style="font-size:12px;color:var(--text-muted);">${cur}</span>
          </div>
          <div style="font-size:9px;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.05em;margin-top:0.4rem;">Futures Contract</div>
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