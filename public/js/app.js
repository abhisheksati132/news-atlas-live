import './core.js';
import './ui.js';
import './modules/mapbox-engine.js';
import './modules/news.js';
import './modules/weather.js';
import './modules/markets.js';
import './modules/economics.js';
import './modules/geography.js';
import './global-fx.js';
import './enhancements.js';

let selectedCountry = null;
let currencyCode = null;
let iso2Code = null;
let countryUTCOffset = null;
let projectionType = "3d";
window.projectionType = "3d";
let worldFeatures = [];
let globalSearchData = [];
let currentCategory = "top";

window.selectedCountry = selectedCountry;
window.currencyCode = currencyCode;
window.iso2Code = iso2Code;
window.currentCategory = currentCategory;

function magColor(m) {
  return m >= 7 ? "#ef4444" : m >= 6 ? "#f97316" : m >= 5 ? "#eab308" : "#10b981";
}

function safeEl(id) {
  return document.getElementById(id);
}

function setText(id, text) {
  const el = safeEl(id);
  if (el) el.innerText = text;
}

function setSrc(id, src) {
  const el = safeEl(id);
  if (el) el.src = src;
}

function runWhenIdle(callback, timeout = 2000) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => callback(), { timeout });
  } else {
    setTimeout(callback, timeout);
  }
}

async function runBootSequence() {
  // Permanent dark protocol.
}

function showBackendRequiredBanner() {
  if (document.getElementById("backend-required-banner")) return;
  const banner = document.createElement("div");
  banner.id = "backend-required-banner";
  banner.className = "fixed top-20 left-1/2 -translate-x-1/2 z-[10001] px-4 py-3 rounded-xl border border-amber-500/50 bg-slate-900/95 backdrop-blur text-center shadow-xl max-w-[90vw]";
  banner.innerHTML = `
    <p class="text-amber-300 font-mono text-xs font-bold mb-2">API not available — backend not running.</p>
    <p class="text-slate-400 text-[11px] mb-2">Do not use Live Server (e.g. port 5500). Run the Node server instead:</p>
    <code class="block bg-black/40 px-3 py-1.5 rounded text-emerald-400 text-[11px] font-mono mb-2">npm run dev</code>
    <p class="text-slate-500 text-[10px]">Then open <a href="http://localhost:3000" class="text-blue-400 underline">http://localhost:3000</a></p>
    <button type="button" onclick="this.closest('#backend-required-banner').remove()" class="mt-2 text-slate-500 hover:text-white text-[10px] font-mono">Dismiss</button>
  `;
  document.body.appendChild(banner);
}

async function initTerminal() {
  runBootSequence();
  let config = {};
  try {
    const res = await fetch("/api/config");
    if (res.status === 404) showBackendRequiredBanner();
    if (res.ok) {
        const data = await res.json();
        config = data.firebase || {};
    }
  } catch (e) {
    showBackendRequiredBanner();
  }
  
  fetchGlobalSearchData();
  
  const hasFirebaseConfig = config && config.apiKey && config.projectId;
  if (hasFirebaseConfig && window.firebaseCore) {
    try {
      const firebaseApp = window.firebaseCore.initializeApp(config);
      const auth = window.firebaseCore.getAuth(firebaseApp);
      const db = window.firebaseCore.getFirestore(firebaseApp);
      await window.firebaseCore.signInAnonymously(auth);
      window.firebaseCore.onAuthStateChanged(auth, (u) => {
        if (u) {
          const idEl = safeEl("neural-id");
          if (idEl) idEl.innerText = `SESSION: ${u.uid.substring(0, 8).toUpperCase()}`;
        }
      });
    } catch (e) {
      setText("neural-id", "GUEST SESSION");
    }
  } else { 
    setText("neural-id", "GUEST SESSION"); 
  }

  try {
    const res = await fetch("/api/countries?all=true");
    if (res.ok) {
      const data = await res.json();
      window.globalSearchData = data;
      if (window.renderTrendingHeader) window.renderTrendingHeader();
    }
  } catch (e) {}

  try {
    window.fetchNews();
    startStockTicker();
  } catch (e) {}

  runWhenIdle(() => {
    try {
      if (window.generateAIBriefing) window.generateAIBriefing("Global Context");
      if (window.fetchGDELTEvents) window.fetchGDELTEvents("");
      if (window.initializeMarkets) window.initializeMarkets("Global");
    } catch (e) {}
  });
}

async function startStockTicker() {
  const tickerContent = document.getElementById("stock-ticker-content");
  if (!tickerContent) return;
  function renderTicker(stocks) {
    let html = "";
    stocks.filter(s => !s.label.includes("BTC") && !s.label.includes("ETH")).forEach((stock) => {
      const up = stock.change >= 0;
      const color = up ? "text-emerald-400" : "text-red-400";
      const arrow = up ? "▲" : "▼";
      const priceStr = stock.price >= 1000 ? stock.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : stock.price.toFixed(stock.price < 10 ? 4 : 2);
      html += `<div class="ticker-item"><span style="color:rgba(255,255,255,.12);margin:0 .25rem">│</span><span class="text-slate-400">${stock.label}</span> <span class="text-white font-black">${priceStr}</span> <span class="${color} ml-1">${arrow} ${Math.abs(stock.change).toFixed(2)}%</span></div>`;
    });
    tickerContent.innerHTML = html + html;
  }
  async function fetchAndRender() {
    try {
      const res = await fetch(`/api/markets?type=ticker&region=${window._isoAlpha3 || 'IN'}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data) renderTicker(data.data);
      }
    } catch (e) {}
  }
  fetchAndRender();
  setInterval(fetchAndRender, 60000);
}

async function fetchAllData(countryName) {
  try {
    const res = await fetch(`/api/countries?name=${encodeURIComponent(countryName)}`);
    const data = await res.json();
    const c = Array.isArray(data) ? data[0] : data;
    if (c) {
      currencyCode = c.currencies ? Object.keys(c.currencies)[0] : "USD";
      iso2Code = c.cca2 || "";
      window.iso2Code = iso2Code;
      window.currencyCode = currencyCode;
      setText("fact-pop", (c.population / 1000000).toFixed(1) + "M");
      setText("fact-cap", c.capital ? c.capital[0] : "N/A");
      
      const flagEl = safeEl("sector-flag");
      const nameEl = safeEl("sector-name");
      const globeIcon = safeEl("sector-globe-icon");
      if (flagEl && nameEl) {
        flagEl.src = c.flags?.svg || "";
        flagEl.classList.remove("hidden");
        if (globeIcon) globeIcon.classList.add("hidden");
        nameEl.innerText = c.name.common;
      }
      
      window.fetchNews(c.name.common);
      if (window.initializeMarkets) window.initializeMarkets(c.name.common);
      if (window.generateAIBriefing) window.generateAIBriefing(c.name.common);
    }
  } catch (e) {}
}

window.fetchAllData = fetchAllData;

window.switchTab = (id) => {
  if (id === 'summary') id = 'intel';
  if (id === 'weather') id = 'atmosphere';

  const modSector = document.getElementById("modular-intelligence-sector");
  if (modSector) modSector.classList.add("active");

  document.querySelectorAll(".nav-sector-link").forEach(link => {
    const action = link.getAttribute('onclick') || "";
    if (action.includes(`'${id}'`) || 
        (id === 'intel' && action.includes("'summary'")) ||
        (id === 'atmosphere' && action.includes("'weather'"))) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  document.querySelectorAll(".tab-content").forEach((c) => {
    c.classList.remove("active");
    c.style.display = 'none';
  });
  
  const targetContent = document.getElementById(`tab-${id}`);
  if (targetContent) {
    targetContent.style.display = 'block';
    requestAnimationFrame(() => targetContent.classList.add("active"));
  }
};

window.backToOrbital = () => {
  const modSector = document.getElementById("modular-intelligence-sector");
  if (modSector) modSector.classList.remove("active");
  document.querySelectorAll(".nav-sector-link").forEach(link => link.classList.remove("active"));
  window.history.pushState({}, "", "/app");
};

// LIVE IST CLOCK
setInterval(() => {
  const time = new Date().toLocaleTimeString("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  });
  setText("ist-time", `${time} IST`);
}, 1000);

window.handleCountryClick = async function (event, d) {
  window.selectedCountry = d;
  window.switchTab("intel");
  if (d && d.properties) {
    const countryName = d.properties.name;
    setText("selected-country-name", countryName);
    fetchAllData(countryName);
    if (window.mapEngine && window.mapEngine.ready && event && event.lngLat) {
       window.mapEngine.flyToCountry(event.lngLat, 4.5);
    }
    generateAIBriefing(countryName);
  }
};

window.resetToGlobalCenter = () => {
  window.selectedCountry = null;
  setText("selected-country-name", "Worldwide");
  window.backToOrbital();
  if (window.mapEngine && window.mapEngine.map) {
    window.mapEngine.clearSelection();
    window.mapEngine.map.flyTo({ center: [20, 20], zoom: 1.6, duration: 2000 });
  }
  window.fetchNews();
};

window.toggleMapProjection = function() {
  if (!window.mapEngine) return;
  const current = window.mapEngine.getProjection();
  const next = current === 'globe' ? 'mercator' : 'globe';
  window.mapEngine.setProjection(next);
};

window.toggleMapStyle = function() {
  if (!window.mapEngine) return;
  const styles = [
    'mapbox://styles/mapbox/satellite-streets-v12',
    'mapbox://styles/mapbox/dark-v11'
  ];
  window._styleIdx = ((window._styleIdx || 0) + 1) % styles.length;
  window.mapEngine.setStyle(styles[window._styleIdx]);
};

window.zoomMap = function(factor) {
  if (window.mapEngine && window.mapEngine.map) {
    const current = window.mapEngine.map.getZoom();
    window.mapEngine.map.zoomTo(factor > 1 ? current + 1 : current - 1);
  }
};

function setupEventListeners() {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      window.backToOrbital();
    }
  });
}

async function fetchGlobalSearchData() {
  try {
    const res = await fetch("/api/countries?all=true");
    if (res.ok) window.globalSearchData = await res.json();
  } catch (e) {}
}

window.searchCityForTab = async (tabId) => {
  const inputEl = document.getElementById(`${tabId}-city-search`);
  if (!inputEl) return;
  const q = inputEl.value.trim();
  if (!q) return;
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&format=json`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const city = data.results[0];
      if (window.mapEngine && window.mapEngine.map) {
        window.mapEngine.map.flyTo({ center: [city.longitude, city.latitude], zoom: 9, duration: 2000 });
      }
      setText("selected-country-name", city.name.toUpperCase());
    }
  } catch (e) {}
};

window.mapEngine = new MapboxEngine('map-container');
window.mapEngine.init(); // interactions enabled inside style.load callback in mapbox-engine.js

initTerminal();
setupEventListeners();

window.initializeMarkets = (loc) => {
    if (window.displayPreciousMetals) window.displayPreciousMetals();
    if (window.displayCountryIndices) window.displayCountryIndices(loc);
    if (window.displayForex) window.displayForex();
    if (window.displayCommodities) window.displayCommodities();
};
