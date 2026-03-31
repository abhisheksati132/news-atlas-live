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
  const savedTheme = localStorage.getItem('terminal-theme');
  if (savedTheme === 'light') document.body.classList.add('light-theme');
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
    console.warn("Config fetch failed:", e);
    showBackendRequiredBanner();
    if (window.showToast) window.showToast("Config unavailable. Running in local mode.", "info");
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
          if (idEl && !u.isAnonymous && u.displayName) {
            idEl.innerText = `SESSION: ${u.displayName.toUpperCase()}`;
            idEl.classList.add("text-emerald-500");
          } else if (idEl && u.isAnonymous) {
            idEl.innerText = `SESSION: ${u.uid.substring(0, 8).toUpperCase()}`;
          }
          try {
            const userRef = window.firebaseCore.doc(db, "visitors", u.uid);
            window.firebaseCore.setDoc(userRef, { last_login: window.firebaseCore.serverTimestamp(), device: navigator.userAgent }, { merge: true });
          } catch (e) { }
        }
      });
    } catch (e) {
      console.warn("Auth limited:", e);
      setText("neural-id", "GUEST SESSION");
    }
  } else { setText("neural-id", "GUEST SESSION"); }
  try {
    const res = await fetch("/api/countries?all=true");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    globalSearchData = await res.json();
    window.globalSearchData = globalSearchData;
    if (window.renderTrendingHeader) window.renderTrendingHeader();
  } catch (e) { 
    console.error("Search data load failed:", e); 
    window.globalSearchData = [];
  }
  try {
    window.fetchNews();
    startStockTicker();
  } catch (e) { console.error("Critical systems load failed:", e); }
  runWhenIdle(() => {
    try {
      if (window.generateAIBriefing) window.generateAIBriefing("Global Context");
      if (window.fetchGDELTEvents) window.fetchGDELTEvents("");
      if (window.initializeMarkets) window.initializeMarkets("Global");
    } catch (e) { console.warn("Background systems failed:", e); }
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
      const dot = `<span style="color:rgba(255,255,255,.12);margin:0 .25rem">│</span>`;
      html += `<div class="ticker-item">${dot}<span class="text-slate-400">${stock.label}</span> <span class="text-white font-black">${priceStr}</span> <span class="${color} ml-1">${arrow} ${Math.abs(stock.change).toFixed(2)}%</span></div>`;
    });
    tickerContent.innerHTML = html + html;
  }
  async function fetchAndRender() {
    try {
      const fetcher = window.fetchWithRetry || fetch;
      const res = await fetcher("/api/markets?type=ticker", {}, { retries: 1, timeoutMs: 10000 });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        renderTicker(data.data);
        setTickerLastUpdated();
        const dot = document.querySelector(".ticker-wrap")?.previousElementSibling?.querySelector(".bg-red-400");
        if (dot) dot.classList.replace("bg-red-400", "bg-emerald-400");
      }
    } catch (e) { }
  }
  function setTickerLastUpdated() {
    const el = document.getElementById("ticker-last-updated");
    if (el) el.innerText = new Date().toLocaleTimeString();
  }
  fetchAndRender();
  setInterval(fetchAndRender, 60000);
}
async function fetchAllData(countryName) {
  try {
    const res = await fetch(`/api/countries?name=${encodeURIComponent(countryName)}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    const c = Array.isArray(data) ? data[0] : data;
    if (c) {
      currencyCode = c.currencies ? Object.keys(c.currencies)[0] : "USD";
      iso2Code = c.cca2 || "";
      window._isoAlpha3 = c.cca3 || "";
      window.iso2Code = iso2Code;
      window.currencyCode = currencyCode;
      setText("fact-pop", (c.population / 1000000).toFixed(1) + "M");
      setText("fact-cap", c.capital ? c.capital[0] : "N/A");
      setText("fact-region", c.region || "--");
      setText("fact-area", c.area ? c.area.toLocaleString() : "--");
      setText("fact-code", c.idd ? (c.idd.root || "") + (c.idd.suffixes ? c.idd.suffixes[0] : "") : "--");
      setText("fact-demonym", c.demonyms?.eng?.m || "--");
      setText("fact-gini", c.gini ? Object.values(c.gini)[0] : "N/A");
      setText("fact-drive", c.car ? c.car.side.toUpperCase() : "--");
      const flagEl = safeEl("sector-flag");
      const nameEl = safeEl("sector-name");
      const globeIcon = safeEl("sector-globe-icon");
      if (flagEl && nameEl) {
        flagEl.src = c.flags?.svg || "";
        flagEl.classList.remove("hidden");
        if (globeIcon) globeIcon.classList.add("hidden");
        nameEl.innerText = c.name.common;
      }
      const headerFlagContainer = safeEl("search-flag-container");
      const headerFlagImg = safeEl("search-active-flag");
      const headerSearchIcon = safeEl("search-icon-main");
      const headerInput = safeEl("map-search-input");
      if (headerFlagContainer && headerFlagImg && headerSearchIcon) {
        headerFlagImg.src = c.flags?.svg || "";
        headerFlagContainer.classList.remove("hidden");
        headerSearchIcon.classList.add("hidden");
        if (headerInput) headerInput.value = c.name.common;
      }
      countryUTCOffset = c.timezones ? c.timezones[0] : "UTC+00:00";
      let lat = 0, lon = 0;
      if (c.latlng && c.latlng.length === 2) [lat, lon] = c.latlng;
      else if (c.capitalInfo && c.capitalInfo.latlng) [lat, lon] = c.capitalInfo.latlng;
      const capitalName = c.capital ? c.capital[0] : c.name.common;
      window._currentWeatherLocation = `${capitalName}, ${c.name.common}`;
      if (lat || lon) window.fetchWeather(lat, lon);
      setText("fact-pop-2", (c.population / 1000000).toFixed(1) + "M");
      setText("fact-gini-2", c.gini ? Object.values(c.gini)[0] : "N/A");
      setText("fact-demonym-2", c.demonyms?.eng?.m || "--");
      setText("fact-area-2", c.area ? c.area.toLocaleString() + " km²" : "--");
      window.fetchNews();
      if (window.fetchDetailedEconomics) window.fetchDetailedEconomics(c.name.common);
    }
  } catch (e) {
    console.error("Data Fetch Error", e);
    if (window.showToast) window.showToast("Country data failed.", "error");
  }
}
window.fetchAllData = fetchAllData;
function renderBriefingCards(rawText) {
  const container = safeEl("ai-briefing-text");
  if (!container) return;
  let clean = rawText.replace(/\[(STRATEGIC METRICS DASHBOARD|OVERVIEW)\]\s*/gi, '').trim();
  const parts = clean.split(/(?=\[[A-Z_ ]+\])/);
  let html = '<div class="space-y-6 pt-2">';
  parts.forEach(block => {
    const headerMatch = block.match(/\[([A-Z_ ]+)\]/);
    if (!headerMatch) return;
    const key = headerMatch[1].trim();
    const displayName = key.replace(/_/g, ' ');
    const bodyRaw = block.slice(block.indexOf(']') + 1).trim().replace(/Rating:\s*\d+\s*\/\s*10\n?/gi, '').replace(/\*\*/g, '');
    if (!bodyRaw) return;
    html += `
      <div class="mb-6">
        <h4 class="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5">${displayName}</h4>
        <p class="intel-summary-text px-1">${bodyRaw}</p>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}
async function generateAIBriefing(loc) {
  const box = safeEl("ai-briefing-box");
  const text = safeEl("ai-briefing-text");
  const loading = safeEl("ai-briefing-loading");
  const actions = safeEl("ai-briefing-actions");
  if (box) box.classList.remove("hidden");
  if (text) {
    text.innerHTML = `
      <div class="space-y-4 w-full mt-2">
        <div class="skeleton-pulse skeleton-text-block short"></div>
        <div class="skeleton-pulse skeleton-text-block"></div>
        <div class="skeleton-pulse skeleton-text-block" style="width: 80%;"></div>
      </div>
    `;
    text.classList.add("ai-streaming");
  }
  if (loading) loading.classList.remove("hidden");
  if (actions) actions.classList.add("hidden");
  const briefingPrompt = `Location: ${loc || 'Global Overview'}. Deep news analysis. Categories: [POLITICAL_STABILITY], [TRADE_RELATIONS], [TECHNOLOGY], [ECONOMY], [SOCIAL_TRENDS], [ENERGY], [SUPPLY_CHAIN], [INFLATION], [DIPLOMACY], [INFRASTRUCTURE]. Give Rating: X/10 and a concise summary for each. Paragraphs only.`;
  try {
    const res = await fetch("/api/ai?stream=true", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: briefingPrompt }) });
    if (!res.ok || !res.body) throw new Error("Stream unavailable");
    if (loading) loading.classList.add("hidden");
    if (text) { text.innerText = ""; text.__streaming = true; }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") break;
        try {
          const parsed = JSON.parse(data);
          const token = parsed?.choices?.[0]?.delta?.content || "";
          if (token) { accumulated += token; if (text) text.innerText = accumulated.replace(/\*\*/g, "").trim(); }
        } catch { }
      }
    }
    if (text) { text.__streaming = false; text.classList.remove("ai-streaming"); renderBriefingCards(accumulated); }
    if (actions) actions.classList.remove("hidden");
  } catch (e) {
    if (loading) loading.classList.add("hidden");
    if (text) { text.innerText = "Briefing failed."; text.__streaming = false; }
  }
}
window.generateAIBriefing = generateAIBriefing;
window.switchTab = (id) => {
  window.playTacticalSound("tab");
  document.querySelectorAll(".nav-tab").forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
  document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
  const tabBtn = Array.from(document.querySelectorAll(".nav-tab")).find((btn) => btn.innerText.toLowerCase().trim().includes(id.toLowerCase()));
  if (tabBtn) { tabBtn.classList.add("active"); tabBtn.setAttribute("aria-selected", "true"); }
  const targetContent = document.getElementById(`tab-${id}`);
  if (targetContent) targetContent.classList.add("active");
  if (id === "intel") { if (window.fetchGDELTEvents) window.fetchGDELTEvents(window.selectedCountry); }
  if (id === "economic") { if (window.fetchECBRates) window.fetchECBRates(); }
  if (id === "markets") { if (window.initializeMarkets) window.initializeMarkets(window.selectedCountry || "Global"); }
};
window.handleCountryClick = async function (event, d) {
  window.playTacticalSound("click");
  selectedCountry = d;
  window.selectedCountry = d;
  window.switchTab("intel");
  if (d && d.properties) {
    const countryName = d.properties.name;
    setText("selected-country-name", countryName);
    const flagEl = document.getElementById("header-country-flag");
    if (flagEl) {
      const iso = d.properties.iso_a2 || d.properties.ISO_A2;
      if (iso) { flagEl.src = `https://flagcdn.com/w40/${iso.toLowerCase()}.png`; flagEl.classList.remove("hidden"); }
      else flagEl.classList.add("hidden");
    }
    const backWrap = safeEl("back-to-global-wrap");
    if (backWrap) backWrap.classList.remove("hidden");
    fetchAllData(countryName);
    if (window.mapEngine && window.mapEngine.ready) {
      if (event && event.lngLat) { window.mapEngine.flyToCountry(event.lngLat, 4.5); }
    }
    generateAIBriefing(countryName);
  }
};
window.resetToGlobalCenter = () => {
  selectedCountry = null;
  window.selectedCountry = null;
  setText("selected-country-name", "Worldwide");
  
  // Reset Sector HUD
  const globeIcon = document.getElementById("sector-globe-icon");
  const flagImg = document.getElementById("sector-flag");
  const sectorName = document.getElementById("sector-name");
  if (globeIcon) globeIcon.classList.remove("hidden");
  if (flagImg) flagImg.classList.add("hidden");
  if (sectorName) sectorName.innerText = "Global Sector";

  const backWrap = safeEl("back-to-global-wrap");
  if (backWrap) backWrap.classList.add("hidden");
  if (window.generateAIBriefing) window.generateAIBriefing("Global Context");
  
  if (window.mapEngine && window.mapEngine.map) {
    window.mapEngine.clearSelection();
    window.mapEngine.map.flyTo({ center: [20, 20], zoom: 1.6, duration: 2000 });
  }
  
  window.fetchNews();
  const headerFlagContainer = safeEl("search-flag-container");
  const headerSearchIcon = safeEl("search-icon-main");
  const headerInput = safeEl("map-search-input");
  if (headerFlagContainer) headerFlagContainer.classList.add("hidden");
  if (headerSearchIcon) headerSearchIcon.classList.remove("hidden");
  if (headerInput) headerInput.value = "";
};
window.toggleTheme = function() {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem('terminal-theme', isLight ? 'light' : 'dark');
};

window.toggleMapProjection = function() {
  if (!window.mapEngine) return;
  const current = window.mapEngine.getProjection();
  const next = current === 'globe' ? 'mercator' : 'globe';
  window.mapEngine.setProjection(next);
  const btn = document.getElementById('projection-toggle-btn');
  if (btn) btn.innerHTML = next === 'globe' ? '<i class="fas fa-globe text-sm"></i>' : '<i class="fas fa-map text-sm"></i>';
};

window.toggleMapStyle = function() {
  if (!window.mapEngine) return;
  const styles = ['dark-v11', 'light-v11', 'satellite-streets-v12'];
  window._styleIdx = (window._styleIdx || 0) + 1;
  if (window._styleIdx >= styles.length) window._styleIdx = 0;
  window.mapEngine.setStyle('mapbox://styles/mapbox/' + styles[window._styleIdx]);
};

window.toggleGlobeTheme = function() {
  window.toggleTheme();
  if (window.mapEngine) {
    const isLight = document.body.classList.contains('light-theme');
    window.mapEngine.setStyle(isLight ? 'mapbox://styles/mapbox/light-v11' : 'mapbox://styles/mapbox/dark-v11');
  }
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
      const so = safeEl("search-overlay");
      const ao = safeEl("about-overlay");
      if (so && !so.classList.contains("hidden")) so.classList.add("hidden");
      if (ao && !ao.classList.contains("hidden")) ao.classList.add("hidden");
    }
  });
}
function updateSystemTime() {
  const now = new Date();
  const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' };
  const timeStr = now.toLocaleTimeString('en-US', options);
  setText("ist-time", `${timeStr} IST`);
}

window.switchTab = (id) => {
  const tabs = document.querySelectorAll(".nav-tab");
  const contents = document.querySelectorAll(".tab-content");
  
  // 1. Try to find by custom data-target or ID if 'id' looks like an ID
  let targetTab = document.getElementById(`tab-btn-${id}`) || 
                  Array.from(tabs).find(t => t.id === id || t.getAttribute("data-target") === id);

  // 2. If not found, try text match
  if (!targetTab) {
    tabs.forEach(tab => {
        const txt = tab.innerText.trim().toLowerCase();
        if (txt.includes(id.toLowerCase())) {
            targetTab = tab;
        }
    });
  }

  if (!targetTab) {
    console.warn("Sector Uplink Lost: Tab not found for", id);
    return;
  }

  const targetContentId = targetTab.getAttribute("aria-controls") || 
                          targetTab.getAttribute("data-target") || 
                          (targetTab.id ? targetTab.id.replace('btn-', '') : null);
  
  if (!targetContentId) return;

  tabs.forEach(t => t.classList.remove("active"));
  contents.forEach(c => c.classList.remove("active"));
  
  targetTab.classList.add("active");
  const targetContent = document.getElementById(targetContentId);
  if (targetContent) {
    targetContent.classList.add("active");
    // Trigger any resize or refresh events
    window.dispatchEvent(new Event('resize'));
  }

  const sidebar = document.getElementById("sidebar");
  if (sidebar && targetTab) {
    targetTab.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

async function fetchGlobalSearchData() {
  try {
    const res = await fetch("/api/countries?all=true");
    if (!res.ok) throw new Error("Index relay failed");
    window.globalSearchData = await res.json();
    if (window.renderTrendingHeader) window.renderTrendingHeader();
  } catch (e) { window.globalSearchData = []; }
}
window.renderTrendingHeader = () => {
  const container = document.getElementById("trending-quick-container");
  if (!container || !window.globalSearchData || window.globalSearchData.length === 0) return;
  const trending = ["India", "United States", "Japan", "Russia", "United Kingdom"];
  container.innerHTML = trending.map(name => {
    const c = window.globalSearchData.find(x => x.name.common === name || (name === "United States" && x.name.common === "United States of America"));
    if (!c) return "";
    return `<button onclick="window.handleCountryClick(null, {properties:{name:'${c.name.common.replace(/'/g, "\\'")}',iso_a2:'${c.cca2}'}})" class="w-7 h-4.5 rounded-sm overflow-hidden border border-white/10 hover:border-blue-400 hover:scale-110 transition-all shadow-sm">
               <img src="${c.flags.svg}" class="w-full h-full object-cover">
             </button>`;
  }).join("");
};
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
        if (window.mapEngine.setHoloHUD) window.mapEngine.setHoloHUD([city.longitude, city.latitude], city.name, { TARGET: "CITY" });
      }
      setText("selected-country-name", city.name.toUpperCase());
      window.generateAIBriefing(city.name);
      inputEl.value = "";
    }
  } catch (e) { }
};
window.mapEngine = new MapboxEngine('map-container');
window.mapEngine.init();
initTerminal();
setupEventListeners();
setInterval(updateSystemTime, 1000);
window.playTacticalSound = function() {};
window.showToast = function() {};
window.toggleShortcuts = () => {
    window.showToast("Shortcuts: Esc=Close, Ctrl+K=Search, ?=Help", "info");
};
window.onCountrySelected = (name) => {
    console.log("Country selected:", name);
};
window.resetWeatherData = () => {
    setText("atmo-feels", "--");
    setText("atmo-hl", "-- / --");
};
window.initializeMarkets = (loc) => {
    if (window.displayPreciousMetals) window.displayPreciousMetals();
    if (window.displayCountryIndices) window.displayCountryIndices(loc);
    if (window.displayForex) window.displayForex();
    if (window.displayCommodities) window.displayCommodities();
};
window.fetchMarketIntel = (loc, cur) => {
    console.log("Market intel for", loc, cur);
};
window.activateMapInteraction = () => {
    const map = document.getElementById('map-container');
    const overlay = document.getElementById('map-interaction-overlay');
    if (map) {
        map.classList.remove('map-locked');
        map.classList.add('map-unlocked');
    }
    if (overlay) overlay.classList.add('hidden');
    if (window.playTacticalSound) window.playTacticalSound('success');
    if (window.mapEngine && !window.mapEngine.ready) {
        window.mapEngine.init();
    }
};
