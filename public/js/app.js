import './core.js';
import './ui.js';
import './modules/mapbox-engine.js';
import './modules/news.js';
import './modules/weather.js';
import './modules/markets.js';
import './modules/economics.js';
import './modules/geography.js';
import './modules/map-toolbar.js';
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
const elCache = new Map();
function safeEl(id) {
  if (elCache.has(id)) return elCache.get(id);
  const el = document.getElementById(id);
  if (el) elCache.set(id, el);
  return el;
}
window.safeEl = safeEl;
function setText(id, text) {
  const el = safeEl(id);
  if (el) el.innerText = text;
}
function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
window.escapeHtml = escapeHtml;
window.extractJSON = (str) => {
  if (!str) return null;
  let clean = String(str).replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerE) { }
    }
  }
  return null;
};
function formatPopulationM(n) {
  const p = Number(n);
  if (!Number.isFinite(p) || p < 0) return "—";
  return (p / 1e6).toFixed(1) + "M";
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
function applyTheme(theme) {
  const isLight = theme === 'light';
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
  if (isLight) {
    document.body.classList.add('light-theme');
    document.body.classList.remove('night-theme');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('night-theme');
  }
  localStorage.setItem('terminal-theme', theme);
  localStorage.setItem('theme', theme);

  const themeBtn = document.getElementById('theme-toggle-btn') || document.querySelector('[onclick="toggleTheme()"]');
  if (themeBtn) {
    themeBtn.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    themeBtn.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
  }

  if (window.mapEngine && window.mapEngine.map && typeof mapboxgl !== 'undefined') {
    const isMapboxToken = !!mapboxgl.accessToken && !mapboxgl.accessToken.startsWith('pk.eyJ1IjoiZ3Vlc3Qi');
    const newStyle = isMapboxToken
      ? (isLight ? 'mapbox://styles/mapbox/light-v11' : 'mapbox://styles/mapbox/dark-v11')
      : (isLight
          ? 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
          : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json');
    try {
      window.mapEngine.setStyle(newStyle);
    } catch (e) {}
  }
}
window.applyTheme = applyTheme;

async function runBootSequence() {
  const savedTheme = localStorage.getItem('theme') || localStorage.getItem('terminal-theme');
  const initialTheme = savedTheme || 'dark';
  applyTheme(initialTheme);
  initSidebarResizer();

  const savedPerf = localStorage.getItem('terminal-low-fx');
  if (savedPerf === 'true') {
    document.body.classList.add('low-fx');
    const btn = document.getElementById('perf-toggle');
    if (btn) {
      btn.classList.add('text-indigo-500');
      btn.classList.remove('text-slate-500');
      btn.title = "Performance Mode Active (Low FX)";
    }
  }
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
  try {
    const res = await fetch("/api/config");
    if (res.status === 404) showBackendRequiredBanner();
    if (res.ok) {
      const data = await res.json();
      window.runtimeConfig = data;
      if (data.realtime?.enabled) initIntelligenceLink();
    }
  } catch (e) {
    console.warn("Config fetch failed:", e);
    showBackendRequiredBanner();
    if (window.showToast) window.showToast("Config unavailable. Running in local mode.", "info");
  }
  setText("neural-id", "GUEST SESSION");
  // Registry is already loaded by fetchGlobalSearchData in startApp — reuse it
  if (window.renderTrendingHeader) window.renderTrendingHeader();
  if (window.initAutocompleteSearch) window.initAutocompleteSearch();
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
      const countryParam = encodeURIComponent(window._currentCountryName || "Global");
      const url = `/api/markets?type=ticker&country=${countryParam}`;
      const res = await fetcher(url, {}, { retries: 1, timeoutMs: 10000 });
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
    let c = null;
    if (window.globalSearchData && window.globalSearchData.length > 0) {
      c = window.globalSearchData.find(x => x.name?.common?.toLowerCase() === countryName.toLowerCase());
    }
    
    if (!c) {
      const res = await fetch(`/api/countries?name=${encodeURIComponent(countryName)}`);
      if (res.ok) {
        const data = await res.json();
        c = Array.isArray(data) ? data[0] : data;
      }
    }

    if (!c) {
      throw new Error(`Country ${countryName} not found in local index or API`);
    }

    window._currentCountryName = c.name?.common || null;
    currencyCode = c.currencies ? Object.keys(c.currencies)[0] : "USD";
    iso2Code = c.cca2 || "";
    window._isoAlpha3 = c.cca3 || "";
    window.iso2Code = iso2Code;
    window.currencyCode = currencyCode;
    setText("selected-country-name", c.name?.common || countryName);
    const capitalName = c.capital ? c.capital[0] : "N/A";
    setText("selected-country-capital", `Capital: ${capitalName} · ${(c.subregion || c.region || "").toUpperCase()}`);
    setText("selected-country-code-badge", (c.cca3 || c.cca2 || "ISO").toUpperCase());

    const currObj = c.currencies ? Object.values(c.currencies)[0] : null;
    setText("fact-currency", currObj ? `${currencyCode} (${currObj.symbol || ""})` : currencyCode);
    setText("fact-pop", formatPopulationM(c.population));
    setText("fact-region", c.subregion || c.region || "--");
    setText("fact-area", c.area ? c.area.toLocaleString() : "--");
    setText("fact-code", c.idd ? (c.idd.root || "") + (c.idd.suffixes ? c.idd.suffixes[0] : "") : "--");
    setText("fact-drive", c.car?.side ? c.car.side.toUpperCase() : "--");

    const flagUrl = c.flags?.svg || c.flags?.png || (c.cca2 ? `https://flagcdn.com/w80/${c.cca2.toLowerCase()}.png` : "");
    const detailFlag = document.getElementById("detail-flag");
    const detailFlagPlaceholder = document.getElementById("detail-flag-placeholder");
    if (detailFlag && flagUrl) {
      detailFlag.src = flagUrl;
      detailFlag.classList.remove("hidden");
      if (detailFlagPlaceholder) detailFlagPlaceholder.classList.add("hidden");
    }

    const flagEl = safeEl("sector-flag");
    const nameEl = safeEl("sector-name");
    const globeIcon = safeEl("sector-globe-icon");
    if (flagEl && nameEl) {
      flagEl.src = flagUrl;
      flagEl.classList.remove("hidden");
      if (globeIcon) globeIcon.classList.add("hidden");
      nameEl.innerText = c.name.common;
    }

    const headerFlagContainer = safeEl("search-flag-container");
    const headerFlagImg = safeEl("search-active-flag");
    const headerSearchIcon = safeEl("search-icon-main");
    const headerInput = safeEl("map-search-input");
    if (headerFlagContainer && headerFlagImg && headerSearchIcon) {
      headerFlagImg.src = flagUrl;
      headerFlagContainer.classList.remove("hidden");
      headerSearchIcon.classList.add("hidden");
      if (headerInput) headerInput.value = c.name.common;
    }

    countryUTCOffset = c.timezones ? c.timezones[0] : "UTC+00:00";
    let lat = 0, lon = 0;
    if (c.latlng && c.latlng.length === 2) [lat, lon] = c.latlng;
    else if (c.capitalInfo && c.capitalInfo.latlng) [lat, lon] = c.capitalInfo.latlng;
    window._currentWeatherLocation = `${capitalName}, ${c.name.common}`;

    setText("fact-pop-2", formatPopulationM(c.population));
    setText("fact-gini-2", c.gini ? Object.values(c.gini)[0] : "N/A");
    setText("fact-demonym-2", c.demonyms?.eng?.m || "--");
    setText("fact-area-2", c.area ? c.area.toLocaleString() + " km²" : "--");

    // Fault-tolerant subsystem loading
    if (lat || lon) {
      try { window.fetchWeather(lat, lon); } catch(err) { console.error("Weather load failure:", err); }
    }
    try { window.fetchNews(c.name.common); } catch(err) { console.error("News load failure:", err); }
    try { if (window.initializeMarkets) window.initializeMarkets(c.name.common); } catch(err) { console.error("Markets load failure:", err); }
    try { if (window.fetchDetailedEconomics) window.fetchDetailedEconomics(c.name.common); } catch(err) { console.error("Economics load failure:", err); }
    try { if (window.generateAIBriefing) window.generateAIBriefing(c.name.common); } catch(err) { console.error("AIBriefing load failure:", err); }

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
  
  if (parts.length <= 1 && !clean.includes('[')) {
    container.innerHTML = `<div class="text-xs text-slate-300 font-sans leading-relaxed pt-1">${escapeHtml(clean)}</div>`;
    return;
  }

  let html = '<div class="space-y-3 pt-1">';
  parts.forEach(block => {
    const headerMatch = block.match(/\[([A-Z_ ]+)\]/);
    if (!headerMatch) {
       if (block.trim()) html += `<p class="text-xs text-slate-300 font-sans leading-relaxed mb-2">${escapeHtml(block.trim())}</p>`;
       return;
    }
    const key = headerMatch[1].trim();
    const displayName = key.replace(/_/g, ' ');
    const bodyRaw = block.slice(block.indexOf(']') + 1).trim().replace(/Rating:\s*\d+\s*\/\s*10\n?/gi, '').replace(/\*\*/g, '');
    if (!bodyRaw) return;
    html += `
      <div class="pb-2 border-b border-white/5 last:border-none">
        <h4 class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono mb-1 flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          ${escapeHtml(displayName)}
        </h4>
        <p class="text-xs text-slate-300 font-sans leading-relaxed">${escapeHtml(bodyRaw)}</p>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

window.sendAboutAI = async function(customPrompt) {
  const text = safeEl("ai-briefing-text");
  if (text) {
    text.innerHTML = `
      <div class="space-y-2.5 w-full py-2">
        <div class="h-2.5 bg-white/5 rounded animate-pulse w-3/4"></div>
        <div class="h-2.5 bg-white/5 rounded animate-pulse w-full"></div>
        <div class="h-2.5 bg-white/5 rounded animate-pulse w-5/6"></div>
      </div>
    `;
  }
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: customPrompt, location: window._currentCountryName || 'Global' })
    });
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || data.response || "No data received.";
    renderBriefingCards(rawText);
  } catch (e) {
    if (text) text.innerHTML = `<p class="text-xs text-slate-400 py-2">Intelligence briefing temporarily calibrated to baseline telemetry.</p>`;
  }
};

async function generateAIBriefing(loc) {
  const text = safeEl("ai-briefing-text");
  const loading = safeEl("ai-briefing-loading");
  const actions = safeEl("ai-briefing-actions");
  
  if (text) {
    text.innerHTML = `
      <div class="space-y-2.5 w-full py-2">
        <div class="h-2.5 bg-white/5 rounded animate-pulse w-3/4"></div>
        <div class="h-2.5 bg-white/5 rounded animate-pulse w-full"></div>
        <div class="h-2.5 bg-white/5 rounded animate-pulse w-5/6"></div>
      </div>
    `;
  }
  if (loading) loading.classList.remove("hidden");
  if (actions) actions.classList.add("hidden");

  const targetLoc = loc || window._currentCountryName || 'Global Overview';
  const briefingPrompt = `Location: ${targetLoc}. Strategic Intel Report. Categories: [EXECUTIVE_SUMMARY], [POLITICAL_STABILITY], [MACROECONOMIC_OUTLOOK], [STRATEGIC_RISKS]. Format: [CATEGORY_NAME] followed by a 2-sentence tactical summary. No bullets.`;
  
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: briefingPrompt, location: targetLoc })
    });
    
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || data.response || "No data received.";
    
    if (loading) loading.classList.add("hidden");
    if (actions) actions.classList.remove("hidden");
    
    renderBriefingCards(rawText);
  } catch (e) {
    if (loading) loading.classList.add("hidden");
    if (text) {
      renderBriefingCards(`[EXECUTIVE_SUMMARY] Real-time situational profile for ${targetLoc}. Integrated telemetry monitoring active across sovereign borders, capital markets, and international news corridors.\n[STRATEGIC_OBSERVATION] Global intelligence feed reflects stable baseline operational metrics.`);
    }
  }
}
window.generateAIBriefing = generateAIBriefing;
window.handleCountryClick = async function (event, d) {
  window.playTacticalSound("click");
  
  if (window.compareModeActive && window.primaryCountry && d && d.properties) {
    window.secondaryCountry = d;
    const pName = window.primaryCountry.properties.name;
    const sName = window.secondaryCountry.properties.name;
    const sectorName = document.getElementById("sector-name");
    if (sectorName) sectorName.innerText = `${pName.substring(0,10)} vs ${sName.substring(0,10)}`;
    if (window.showToast) window.showToast(`Comparing ${pName} and ${sName}`, "success");
    window.runGeopoliticalComparison(window.primaryCountry, window.secondaryCountry);
    return;
  }

  selectedCountry = d;
  window.selectedCountry = d;
  window.switchTab("intel");
  if (d && d.properties) {
    const countryName = d.properties.name;
    window._currentCountryName = countryName;
    setText("selected-country-name", countryName);
    const flagEl = document.getElementById("sector-flag");
    const globeIcon = document.getElementById("sector-globe-icon");
    const sectorName = document.getElementById("sector-name");
    const compareBtn = document.getElementById("sector-compare-btn");
    
    const iso = d.properties.iso_a2 || d.properties.ISO_A2 || d.properties.iso_a3 || d.properties.ISO_A3;
    if (iso && flagEl) {
      flagEl.src = `https://flagcdn.com/w40/${iso.toLowerCase().substring(0, 2)}.png`;
      flagEl.classList.remove("hidden");
      if (globeIcon) globeIcon.classList.add("hidden");
    } else if (flagEl) {
      flagEl.classList.add("hidden");
      if (globeIcon) globeIcon.classList.remove("hidden");
    }
    
    if (sectorName) {
      sectorName.innerText = countryName.toUpperCase();
    }
    
    if (compareBtn) {
      compareBtn.classList.remove("hidden");
    }

    const backWrap = safeEl("back-to-global-wrap");
    if (backWrap) backWrap.classList.remove("hidden");
    fetchAllData(countryName);
    if (window.mapEngine && window.mapEngine.ready) {
      if (event && event.lngLat) { window.mapEngine.flyToCountry(event.lngLat, 4.5); }
    }
    generateAIBriefing(countryName);
    if (window.drawGeopoliticalTrendsChart) window.drawGeopoliticalTrendsChart(countryName);
  }
  if (window.updateNotesAndBookmarksUI) window.updateNotesAndBookmarksUI();
};
window.resetToGlobalCenter = () => {
  selectedCountry = null;
  window.selectedCountry = null;
  window._currentCountryName = null;
  window.iso2Code = "";
  iso2Code = "";
  window.currencyCode = "USD";
  currencyCode = "USD";
  setText("selected-country-name", "Worldwide");
  
  // Reset Sector HUD
  const globeIcon = document.getElementById("sector-globe-icon");
  const flagImg = document.getElementById("sector-flag");
  const sectorName = document.getElementById("sector-name");
  if (globeIcon) globeIcon.classList.remove("hidden");
  if (flagImg) flagImg.classList.add("hidden");
  if (sectorName) sectorName.innerText = "Global Sector";

  // Reset Compare Mode
  window.compareModeActive = false;
  window.primaryCountry = null;
  window.secondaryCountry = null;
  const compareBtn = document.getElementById("sector-compare-btn");
  if (compareBtn) {
    compareBtn.innerHTML = '<i class="fas fa-columns text-[10px]"></i>';
    compareBtn.classList.add("hidden");
  }
  
  // Hide trends card
  const trendsCard = document.getElementById("geopolitical-trends-card");
  if (trendsCard) trendsCard.classList.add("hidden");

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
  if (window.updateNotesAndBookmarksUI) window.updateNotesAndBookmarksUI();
};
window.toggleTheme = function() {
  const current = document.documentElement.getAttribute('data-theme') || (document.body.classList.contains('light-theme') ? 'light' : 'dark');
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
};

window.togglePerformanceMode = function() {
  const isLowFx = document.body.classList.toggle('low-fx');
  localStorage.setItem('terminal-low-fx', isLowFx ? 'true' : 'false');
  if (window.mapEngine && window.mapEngine.map) {
    try {
      if (isLowFx) {
        window.mapEngine.map.setTerrain(null);
        window.mapEngine.map.setFog(null);
      } else {
        window.mapEngine._addTerrain();
        window.mapEngine._applyAtmosphere();
      }
    } catch (e) {
      console.warn("Mapbox low-fx update failed:", e.message);
    }
  }
  const btn = document.getElementById('perf-toggle');
  if (btn) {
    if (isLowFx) {
      btn.classList.add('text-sky-400');
      btn.classList.remove('text-slate-500');
      btn.title = "Performance Mode Active (Low FX)";
    } else {
      btn.classList.add('text-slate-500');
      btn.classList.remove('text-sky-400');
      btn.title = "Toggle performance mode (Low FX)";
    }
  }
};

window.toggleMapProjection = function() {
  if (!window.mapEngine) return;
  const current = window.mapEngine.getProjection();
  const next = current === 'globe' ? 'mercator' : 'globe';
  window.mapEngine.setProjection(next);
  const btn = document.getElementById('projection-toggle-btn');
  if (btn) btn.innerHTML = next === 'globe' ? '<i class="fas fa-globe text-sm"></i>' : '<i class="fas fa-map text-sm"></i>';
};

window.goToIndiaHome = function() {
  if (window.mapEngine && window.mapEngine.map) {
    window.mapEngine.map.flyTo({ center: [78.9629, 20.5937], zoom: 4.5, duration: 2000 });
    if (window.fetchAllData) window.fetchAllData("India");
    if (window.playTacticalSound) window.playTacticalSound("success");
  }
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

window.toggleAutoRotate = function() {
  if (!window.mapEngine) return;
  const isRotating = window.mapEngine.toggleAutoRotate();
  const btn = document.getElementById('autorotate-btn');
  if (btn) {
    btn.classList.toggle('text-indigo-400', isRotating);
    btn.classList.toggle('opacity-100', isRotating);
  }
  if (window.showToast) window.showToast(isRotating ? "Auto-rotate enabled" : "Auto-rotate disabled", "info");
};

window.toggleDayNightTerminator = function() {
  if (!window.mapEngine) return;
  const isActive = window.mapEngine.toggleNightLayer();
  const btn = document.getElementById('terminator-btn');
  if (btn) {
    btn.classList.toggle('text-amber-400', isActive);
    btn.classList.toggle('opacity-100', isActive);
  }
  if (window.showToast) window.showToast(isActive ? "Day/Night shadow enabled" : "Day/Night shadow disabled", "info");
};
function setupEventListeners() {
  window.addEventListener("keydown", (e) => {
    // Esc handling
    if (e.key === "Escape") {
      const so = safeEl("search-overlay");
      const ao = safeEl("about-overlay");
      if (so && !so.classList.contains("hidden")) so.classList.add("hidden");
      if (ao && !ao.classList.contains("hidden")) ao.classList.add("hidden");
    }

    // Tab Navigation (1-5)
    // Ignore if user is typing in an input field
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

    const navMap = {
      "1": "intel",
      "2": "news",
      "3": "markets",
      "4": "atmosphere",
      "5": "economic"
    };

    if (navMap[e.key]) {
      e.preventDefault();
      window.switchTab(navMap[e.key]);
      if (window.playTacticalSound) window.playTacticalSound("click");
    }
  });
}
function updateSystemTime() {
  const now = new Date();
  const offsetMin = -now.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const hh = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, "0");
  const mm = String(Math.abs(offsetMin) % 60).padStart(2, "0");
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  setText("ist-time", `${timeStr} UTC${sign}${hh}:${mm}`);
}

window.switchTab = (id) => {
  if (typeof window.playTacticalSound === "function") window.playTacticalSound("tab");
  const normId = (id || "intel").toLowerCase().replace("tab-", "").replace("btn-", "");
  
  const tabs = document.querySelectorAll(".nav-tab");
  const contents = document.querySelectorAll(".tab-content");

  let targetTab = document.getElementById(`tab-btn-${normId}`) || 
                  Array.from(tabs).find(t => t.id === `tab-btn-${normId}` || t.id === normId || t.getAttribute("data-target") === normId);

  if (!targetTab) {
    tabs.forEach(tab => {
        const txt = tab.innerText.trim().toLowerCase();
        if (txt.includes(normId)) {
            targetTab = tab;
        }
    });
  }

  // Handle mobile view state vs desktop
  if (normId === "map") {
    document.body.classList.remove("view-state-analytics");
    document.body.classList.add("view-state-map");
    if (window.mapEngine && window.mapEngine.map) {
      setTimeout(() => window.mapEngine.map.resize(), 120);
    }
  } else {
    document.body.classList.remove("view-state-map");
    document.body.classList.add("view-state-analytics");
  }

  tabs.forEach((t) => {
    t.classList.remove("active");
    t.setAttribute("aria-selected", "false");
  });

  if (targetTab) {
    targetTab.classList.add("active");
    targetTab.setAttribute("aria-selected", "true");
  }

  const targetContentId = normId === "map" 
    ? (window._currentTab || "tab-intel")
    : (normId === "eco" ? "tab-economic" : normId === "atmo" ? "tab-atmosphere" : `tab-${normId}`);

  window._currentTab = targetContentId;

  contents.forEach((c) => {
    c.classList.toggle("active", c.id === targetContentId);
  });

  const countryName = window.selectedCountry?.properties?.name || window._currentCountryName || "India";
  if (targetContentId === "tab-intel" && window.fetchGDELTEvents) {
    window.fetchGDELTEvents(countryName);
  }
  if (targetContentId === "tab-news" && window.fetchNews) {
    window.fetchNews(countryName);
  }
  if (targetContentId === "tab-economic" && window.fetchDetailedEconomics) {
    window.fetchDetailedEconomics(countryName);
  }
  if (targetContentId === "tab-markets" && window.initializeMarkets) {
    window.initializeMarkets(countryName || "Global");
  }
  window.dispatchEvent(new Event("resize"));

  syncMobileBottomNav(normId);
  positionTabIndicator(targetTab);
};

function positionTabIndicator(targetTab) {
  const strip = document.querySelector(".nav-tab-strip");
  if (!strip) return;
  let indicator = strip.querySelector(".tab-indicator");
  if (!indicator) {
    indicator = document.createElement("div");
    indicator.className = "tab-indicator";
    strip.appendChild(indicator);
  }
  const active = (targetTab && targetTab.classList && targetTab.classList.contains("nav-tab"))
    ? targetTab
    : strip.querySelector(".nav-tab.active");
  if (!active || active.closest(".nav-tab-strip") !== strip) {
    indicator.style.width = "0px";
    return;
  }
  const stripRect = strip.getBoundingClientRect();
  const rect = active.getBoundingClientRect();
  indicator.style.left = `${rect.left - stripRect.left + 14}px`;
  indicator.style.width = `${rect.width - 28}px`;
}
window.positionTabIndicator = positionTabIndicator;
window.addEventListener("resize", () => positionTabIndicator());

function initCoachCard() {
  if (localStorage.getItem("newsatlas_coach_done")) return;
  const host = document.querySelector(".main-content");
  if (!host || document.getElementById("coach-card")) return;
  const card = document.createElement("div");
  card.id = "coach-card";
  card.innerHTML = `
    <h4>Quick start</h4>
    <ol>
      <li>Click any country on the globe to open its profile</li>
      <li>Use the tabs above to browse news, markets, weather and economy</li>
      <li>Press <kbd>Ctrl</kbd>+<kbd>K</kbd> to search, <kbd>\`</kbd> for the assistant</li>
    </ol>
    <div class="coach-actions">
      <button type="button" data-coach="skip">Skip</button>
      <button type="button" class="coach-done" data-coach="done">Got it</button>
    </div>
  `;
  host.appendChild(card);
  const dismiss = () => {
    localStorage.setItem("newsatlas_coach_done", "true");
    card.style.transition = "opacity 200ms ease, transform 200ms ease";
    card.style.opacity = "0";
    card.style.transform = "translateY(8px)";
    setTimeout(() => card.remove(), 220);
  };
  card.querySelectorAll("[data-coach]").forEach(btn => btn.addEventListener("click", dismiss));
  setTimeout(() => { if (document.getElementById("coach-card")) dismiss(); }, 25000);
}

function syncMobileBottomNav(tabId) {
  const nav = document.getElementById("mobile-bottom-nav");
  if (!nav) return;
  const mapBtn = nav.querySelector('[data-action="map"]');
  if (tabId === "map") {
    mapBtn?.classList.add("active");
    nav.querySelectorAll(".mobile-nav-item[data-tab]").forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-current", "false");
    });
  } else {
    mapBtn?.classList.remove("active");
    nav.querySelectorAll(".mobile-nav-item[data-tab]").forEach((b) => {
      const on = b.getAttribute("data-tab") === tabId;
      b.classList.toggle("active", on);
      b.setAttribute("aria-current", on ? "page" : "false");
    });
  }
}

function initMobileBottomNav() {
  const nav = document.getElementById("mobile-bottom-nav");
  if (!nav) return;
  const mapBtn = nav.querySelector('[data-action="map"]');
  const tabBtns = nav.querySelectorAll(".mobile-nav-item[data-tab]");

  mapBtn?.addEventListener("click", () => {
    window.switchTab("map");
  });

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-tab");
      if (id) window.switchTab(id);
    });
  });
}

async function fetchGlobalSearchData() {
  try {
    const res = await fetch("/data/countries.json");
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
    return `<button type="button" data-country="${escapeHtml(c.name.common)}" data-iso="${escapeHtml(c.cca2 || "")}" class="w-7 h-4.5 rounded-sm overflow-hidden border border-white/10 hover:border-blue-400 hover:scale-110 transition-all shadow-sm">
               <img src="${c.flags.svg}" class="w-full h-full object-cover">
             </button>`;
  }).join("");
  container.querySelectorAll("button[data-country]").forEach(btn => {
    btn.addEventListener("click", () => {
      window.handleCountryClick(null, { properties: { name: btn.dataset.country, iso_a2: btn.dataset.iso } });
    });
  });
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
      const name = city.name;
      const countryName = city.country || city.admin1 || name;
      
      if (window.mapEngine && window.mapEngine.map) {
        window.mapEngine.map.flyTo({ center: [city.longitude, city.latitude], zoom: 9, duration: 2000 });
        if (window.mapEngine.setHoloHUD) window.mapEngine.setHoloHUD([city.longitude, city.latitude], name, { TARGET: "CITY" });
      }
      
      window._currentWeatherLocation = `${name}, ${countryName}`;
      setText("selected-country-name", name.toUpperCase());

      // Trigger the parent country's map click handler to update active state & dossier
      if (countryName && window.handleCountryClickByName) {
        window.handleCountryClickByName(countryName);
      }
      
      // Delay specific city weather fetch to let country load complete first
      if (window.fetchWeather) {
        setTimeout(() => {
          window.fetchWeather(city.latitude, city.longitude);
          window._currentWeatherLocation = `${name}, ${countryName}`;
          setText("selected-country-name", name.toUpperCase());
        }, 300);
      }
      
      window.fetchNews(countryName);
      if (window.fetchDetailedEconomics) {
        window.fetchDetailedEconomics(countryName);
      }
      if (window.initializeMarkets) {
        window.initializeMarkets(countryName);
      }
      
      window.generateAIBriefing(name);
      inputEl.value = "";
    }
  } catch (e) {
    console.error("Tab search city failure:", e);
  }
};
// Intelligence Link - WebSocket connection (socket.io lazy-loaded on demand)
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

async function initIntelligenceLink() {
  if (window.intelSocket) return;
  try {
    if (typeof io === "undefined") {
      await loadScript("https://cdn.socket.io/4.7.2/socket.io.min.js");
    }
  } catch (e) {
    console.warn("Socket.io not found. Real-time link disabled.");
    return;
  }

  const socket = io();
  window.intelSocket = socket;

  socket.on("connect", () => {
    console.log("%c[LINK] Intelligence Uplink Established: " + socket.id, "color: #10b981; font-weight: bold;");
    const idEl = document.getElementById("neural-id");
    if (idEl) idEl.classList.add("socket-active");
  });

  socket.on("intelligence_link", (data) => {
    console.log("[DATA] System Signal:", data);
    if (window.showToast) window.showToast(`Uplink: ${data.node} ${data.status}`, "success");
  });

  socket.on("breaking_news", (data) => {
    if (window.showToast) window.showToast(`🚨 BREAKING: ${data.title}`, "info");
    // Refresh news if it's the current tab
    if (window._currentTab === "tab-news") window.fetchNews(window._currentCountryName);
  });

  socket.on("disconnect", () => {
    console.log("%c[LINK] Intelligence Uplink Lost", "color: #ef4444; font-weight: bold;");
    const idEl = document.getElementById("neural-id");
    if (idEl) idEl.classList.remove("socket-active");
  });
}

// Command Palette is implemented in ui.js (Ctrl+K)

async function startApp() {
  await fetchGlobalSearchData();
  await initTerminal();
  setupEventListeners();
  initMobileBottomNav();
  setInterval(updateSystemTime, 1000);

  window.mapEngine = new MapboxEngine('map-container');
  await window.mapEngine.init();

  if (window.activateMapInteraction) window.activateMapInteraction();
  if (window.initMapToolbar) window.initMapToolbar();
  initCoachCard();
  positionTabIndicator();

  const defaultCountry = "India";
  if (window.handleCountryClickByName) {
    window.handleCountryClickByName(defaultCountry);
  } else if (window.fetchAllData) {
    window.fetchAllData(defaultCountry);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
window.toggleShortcuts = () => {
    if (window.showToast) window.showToast("Shortcuts: Esc=Close, Ctrl+K=Search, ?=Help", "info");
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


window.loginWithGoogle = function() {
  console.log("Authentication not required - running in offline-first mode.");
};

window.logout = function() {};

window.toggleUserMenu = function() {};

let notesSaveTimeout = null;
window.onNotesInput = function() {
  const notesInput = document.getElementById("classified-notes-input");
  const saveStatus = document.getElementById("notes-save-status");
  if (!notesInput || !window.selectedCountry || !window.selectedCountry.properties) return;

  const countryName = window.selectedCountry.properties.name;
  const content = notesInput.value;

  if (saveStatus) saveStatus.innerText = "Saving...";

  clearTimeout(notesSaveTimeout);
  notesSaveTimeout = setTimeout(() => {
    try {
      localStorage.setItem("newsatlas_notes_" + countryName, content);
      if (saveStatus) saveStatus.innerText = "Saved Locally";
    } catch (e) {
      console.warn("Notes save failed:", e);
      if (saveStatus) saveStatus.innerText = "Error";
    }
  }, 400);
};

window.togglePinCountry = function() {
  if (!window.selectedCountry || !window.selectedCountry.properties) return;

  const countryName = window.selectedCountry.properties.name;
  if (!window.userBookmarks) {
    try {
      window.userBookmarks = JSON.parse(localStorage.getItem("newsatlas_bookmarks") || "[]");
    } catch {
      window.userBookmarks = [];
    }
  }

  const idx = window.userBookmarks.indexOf(countryName);
  let isPinned = false;
  if (idx > -1) {
    window.userBookmarks.splice(idx, 1);
  } else {
    window.userBookmarks.push(countryName);
    isPinned = true;
  }

  const pinBtn = document.getElementById("sector-pin-btn");
  if (pinBtn) {
    pinBtn.innerHTML = isPinned ? '<i class="fas fa-star text-[10px] text-yellow-400"></i>' : '<i class="far fa-star text-[10px]"></i>';
    pinBtn.title = isPinned ? "Unpin Sector" : "Pin Sector";
  }

  try {
    localStorage.setItem("newsatlas_bookmarks", JSON.stringify(window.userBookmarks));
    if (window.showToast) {
      window.showToast(isPinned ? `Pinned ${countryName}.` : `Unpinned ${countryName}.`, "success");
    }
    if (window.renderPinnedSectors) window.renderPinnedSectors();
  } catch (e) {
    console.warn("Bookmark save error:", e);
  }
};

window.updateNotesAndBookmarksUI = async function() {
  if (!window.selectedCountry || !window.selectedCountry.properties) return;
  const countryName = window.selectedCountry.properties.name;
  const notesInput = document.getElementById("classified-notes-input");
  const saveStatus = document.getElementById("notes-save-status");
  const pinBtn = document.getElementById("sector-pin-btn");

  if (notesInput) {
    notesInput.disabled = false;
    try {
      notesInput.value = localStorage.getItem("newsatlas_notes_" + countryName) || "";
    } catch {
      notesInput.value = "";
    }
    if (saveStatus) saveStatus.innerText = "Saved Locally";
  }

  if (pinBtn) {
    if (!window.userBookmarks) {
      try {
        window.userBookmarks = JSON.parse(localStorage.getItem("newsatlas_bookmarks") || "[]");
      } catch {
        window.userBookmarks = [];
      }
    }
    const isPinned = window.userBookmarks && window.userBookmarks.includes(countryName);
    pinBtn.innerHTML = isPinned ? '<i class="fas fa-star text-[10px] text-yellow-400"></i>' : '<i class="far fa-star text-[10px]"></i>';
    pinBtn.title = isPinned ? "Unpin Sector" : "Pin Sector";
  }
};


window.initAutocompleteSearch = function() {
  const searchInputs = [
    { id: "intel-city-search", tab: "intel" },
    { id: "news-city-search", tab: "news" },
    { id: "atmosphere-city-search", tab: "atmosphere" },
    { id: "economic-city-search", tab: "economic" }
  ];

  searchInputs.forEach(({ id, tab }) => {
    const input = document.getElementById(id);
    if (!input) return;

    if (input.parentElement) {
      input.parentElement.style.position = "relative";
    }

    const dropdown = document.createElement("div");
    dropdown.className = "autocomplete-dropdown hidden absolute left-0 right-0 mt-1 bg-[#0e1017] border border-white/10 rounded-xl shadow-2xl z-50 p-1 overflow-hidden";
    dropdown.style.top = "100%";
    input.parentElement.appendChild(dropdown);

    let activeIndex = -1;
    let currentResults = [];

    const hideDropdown = () => {
      dropdown.classList.add("hidden");
      dropdown.innerHTML = "";
      activeIndex = -1;
    };

    const selectResult = (country) => {
      input.value = country.name.common;
      hideDropdown();
      window.handleCountryClick(null, {
        properties: { name: country.name.common, iso_a2: country.cca2 }
      });
      window.switchTab(tab);
    };

    input.addEventListener("input", () => {
      const q = input.value.toLowerCase().trim();
      if (!q || !window.globalSearchData) {
        hideDropdown();
        return;
      }

      currentResults = window.globalSearchData
        .filter(c => c.name.common.toLowerCase().includes(q))
        .slice(0, 5);

      if (currentResults.length === 0) {
        hideDropdown();
        return;
      }

      activeIndex = -1;
      dropdown.innerHTML = currentResults.map((c, idx) => {
        const flagUrl = c.cca2 ? `https://flagcdn.com/w20/${c.cca2.toLowerCase()}.png` : '';
        const flagTag = flagUrl ? `<img src="${flagUrl}" class="w-4 h-2.5 object-cover rounded-sm">` : `<i class="fas fa-globe text-slate-500 text-[10px]"></i>`;
        return `
          <div class="autocomplete-item px-3.5 py-2 hover:bg-white/5 rounded-lg cursor-pointer flex items-center gap-2.5 text-[10px] text-slate-400 hover:text-white font-mono transition-colors uppercase tracking-wider" data-index="${idx}">
            ${flagTag}
            <span>${c.name.common}</span>
          </div>
        `;
      }).join("");

      dropdown.classList.remove("hidden");

      dropdown.querySelectorAll(".autocomplete-item").forEach(item => {
        item.addEventListener("click", () => {
          const idx = parseInt(item.getAttribute("data-index"));
          selectResult(currentResults[idx]);
        });
      });
    });

    input.addEventListener("keydown", (e) => {
      const items = dropdown.querySelectorAll(".autocomplete-item");
      if (dropdown.classList.contains("hidden")) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % currentResults.length;
        items.forEach((item, idx) => {
          if (idx === activeIndex) {
            item.classList.add("bg-white/5", "text-white", "active");
          } else {
            item.classList.remove("bg-white/5", "text-white", "active");
          }
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + currentResults.length) % currentResults.length;
        items.forEach((item, idx) => {
          if (idx === activeIndex) {
            item.classList.add("bg-white/5", "text-white", "active");
          } else {
            item.classList.remove("bg-white/5", "text-white", "active");
          }
        });
      } else if (e.key === "Enter") {
        if (activeIndex >= 0 && activeIndex < currentResults.length) {
          e.preventDefault();
          selectResult(currentResults[activeIndex]);
        }
      } else if (e.key === "Escape") {
        hideDropdown();
      }
    });

    document.addEventListener("click", (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        hideDropdown();
      }
    });
  });
};

window.compareModeActive = false;
window.primaryCountry = null;
window.secondaryCountry = null;

window.toggleCompareMode = function() {
  if (!window.selectedCountry) {
    if (window.showToast) window.showToast("Select a primary country first.", "warning");
    return;
  }
  
  window.compareModeActive = !window.compareModeActive;
  const btn = document.getElementById("sector-compare-btn");
  
  if (window.compareModeActive) {
    window.primaryCountry = window.selectedCountry;
    window.secondaryCountry = null;
    if (btn) btn.innerHTML = '<i class="fas fa-columns text-[10px] text-indigo-400"></i>';
    if (window.showToast) window.showToast("Compare Mode enabled. Select a secondary country.", "info");
  } else {
    window.primaryCountry = null;
    window.secondaryCountry = null;
    if (btn) btn.innerHTML = '<i class="fas fa-columns text-[10px]"></i>';
    if (window.showToast) window.showToast("Compare Mode disabled.", "info");
    if (window.selectedCountry) {
      window.handleCountryClick(null, window.selectedCountry);
    }
  }
};

window.runGeopoliticalComparison = async function(c1, c2) {
  const pName = c1.properties.name;
  const sName = c2.properties.name;
  const getLiveEconomics = async (country) => {
    const iso3 = country.properties.iso_a3 || country.properties.ISO_A3;
    if (!iso3) throw new Error("Country ISO code is unavailable");
    const response = await fetch(`/api/economics?iso3=${encodeURIComponent(iso3)}`);
    if (!response.ok) throw new Error(`Economics API HTTP ${response.status}`);
    return response.json();
  };

  let pEco, sEco;
  try {
    [pEco, sEco] = await Promise.all([getLiveEconomics(c1), getLiveEconomics(c2)]);
  } catch (error) {
    console.warn("Comparison economics request failed:", error.message);
    const ticker = document.getElementById("eco-market-ticker");
    if (ticker) ticker.innerText = "LIVE COMPARISON DATA UNAVAILABLE";
    return;
  }
  
  const renderSplit = (elId, v1, v2) => {
    const el = document.getElementById(elId);
    if (el) el.innerText = `${v1} | ${v2}`;
  };
  
  const metric = (value, suffix = "") => value == null ? "N/A" : `${value}${suffix}`;
  renderSplit("eco-gdp", metric(pEco.gdp_billions, "B"), metric(sEco.gdp_billions, "B"));
  renderSplit("eco-growth", metric(pEco.gdp_growth_percent, "%"), metric(sEco.gdp_growth_percent, "%"));
  renderSplit("eco-capita", pEco.gdp_per_capita == null ? "N/A" : `$${pEco.gdp_per_capita.toLocaleString()}`, sEco.gdp_per_capita == null ? "N/A" : `$${sEco.gdp_per_capita.toLocaleString()}`);
  renderSplit("eco-inflation", metric(pEco.inflation_rate, "%"), metric(sEco.inflation_rate, "%"));
  renderSplit("eco-unemployment", metric(pEco.unemployment_rate, "%"), metric(sEco.unemployment_rate, "%"));
  renderSplit("eco-interest", metric(pEco.interest_rate, "%"), metric(sEco.interest_rate, "%"));
  renderSplit("eco-debt", metric(pEco.debt_to_gdp, "%"), metric(sEco.debt_to_gdp, "%"));
  
  const ticker = document.getElementById("eco-market-ticker");
  if (ticker) ticker.innerText = `COMPARING: ${pName.toUpperCase()} VS ${sName.toUpperCase()}`;
  
  const exportsEl = document.getElementById("eco-exports");
  if (exportsEl) {
    const pTags = (pEco.major_exports || []).slice(0,2).map(item => `
      <div class="apple-glass px-2.5 py-1.5 border border-blue-500/10 flex items-center gap-1.5 rounded-full">
         <span class="text-[8px] text-slate-500 font-black uppercase">${pName.substring(0,3)}:</span>
         <span class="text-[8px] text-white font-black uppercase">${item}</span>
      </div>
    `);
    const sTags = (sEco.major_exports || []).slice(0,2).map(item => `
      <div class="apple-glass px-2.5 py-1.5 border border-indigo-500/10 flex items-center gap-1.5 rounded-full">
         <span class="text-[8px] text-slate-500 font-black uppercase">${sName.substring(0,3)}:</span>
         <span class="text-[8px] text-white font-black uppercase">${item}</span>
      </div>
    `);
    exportsEl.innerHTML = [...pTags, ...sTags].join("") || '<div class="text-slate-500 text-xs">No verified export comparison data available.</div>';
  }

  const lat1 = c1.properties.lat || 20;
  const lon1 = c1.properties.lon || 20;
  const lat2 = c2.properties.lat || 20;
  const lon2 = c2.properties.lon || 20;
  
  const weatherUrl1 = `https://api.open-meteo.com/v1/forecast?latitude=${lat1}&longitude=${lon1}&current=temperature_2m,relative_humidity_2m`;
  const weatherUrl2 = `https://api.open-meteo.com/v1/forecast?latitude=${lat2}&longitude=${lon2}&current=temperature_2m,relative_humidity_2m`;
  
  try {
    const [r1, r2] = await Promise.all([
      fetch(weatherUrl1).then(res => res.json()),
      fetch(weatherUrl2).then(res => res.json())
    ]);
    
    renderSplit("atmo-temp", `${Math.round(r1.current.temperature_2m)}°C`, `${Math.round(r2.current.temperature_2m)}°C`);
    renderSplit("atmo-humidity", `${Math.round(r1.current.relative_humidity_2m)}%`, `${Math.round(r2.current.relative_humidity_2m)}%`);
  } catch(e) {
    console.warn("Weather comparison fetch failed:", e.message);
  }

  if (window.drawGeopoliticalTrendsChart) {
    window.drawGeopoliticalTrendsChart(pName, sName);
  }
};

window.drawGeopoliticalTrendsChart = function(countryName, compareName = null) {
  const card = document.getElementById("geopolitical-trends-card");
  const canvas = document.getElementById("trends-line-chart");
  if (!card || !canvas) return;

  card.classList.remove("hidden");
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.parentElement.offsetWidth || 300;
  canvas.height = 80;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const getTimelinePoints = (name) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array.from({ length: 10 }, (_, idx) => {
      return (Math.sin(hash + idx) * 20 + 40) + (idx * 1.5); 
    });
  };

  const pts1 = getTimelinePoints(countryName);
  const pts2 = compareName ? getTimelinePoints(compareName) : null;

  const drawLine = (pts, color, name) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    const step = canvas.width / (pts.length - 1);
    pts.forEach((pt, idx) => {
      const x = idx * step;
      const y = canvas.height - 8 - (pt / 100) * (canvas.height - 16);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.moveTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = "bold 8px system-ui, sans-serif";
    ctx.fillText(name.toUpperCase(), 12, pts[0] < 50 ? canvas.height - 10 : 16);
  };

  drawLine(pts1, "#38bdf8", countryName);
  if (pts2) {
    drawLine(pts2, "#6366f1", compareName);
  }
};

window.changeMapLayer = function(val) {
  if (window.mapEngine && window.mapEngine.ready) {
    window.mapEngine.setMapDataLayer(val);
    if (window.showToast) window.showToast(`Map layer switched: ${val.toUpperCase()}`, "info");
  }
};

window.toggleWeatherRadar = async function(checked) {
  if (!window.mapEngine || !window.mapEngine.ready || !window.mapEngine.map) return;
  const map = window.mapEngine.map;

  if (!checked) {
    if (map.getLayer("rainviewer-radar")) map.removeLayer("rainviewer-radar");
    if (map.getSource("rainviewer")) map.removeSource("rainviewer");
    return;
  }

  if (window.showToast) window.showToast("Initializing satellite weather radar scan...", "info");

  try {
    const apiRes = await fetch("https://api.rainviewer.com/public/weather-maps.json");
    const maps = await apiRes.json();
    
    if (!maps.radar || !maps.radar.past || maps.radar.past.length === 0) {
      throw new Error("No recent radar frames detected.");
    }
    
    const latestFrame = maps.radar.past[maps.radar.past.length - 1];
    const radarPath = latestFrame.path; 
    
    if (map.getSource("rainviewer")) map.removeSource("rainviewer");
    map.addSource("rainviewer", {
      type: "raster",
      tiles: [`https://tilecache.rainviewer.com${radarPath}/256/{z}/{x}/{y}/2/1_1.png`],
      tileSize: 256
    });

    if (map.getLayer("rainviewer-radar")) map.removeLayer("rainviewer-radar");
    map.addLayer({
      id: "rainviewer-radar",
      type: "raster",
      source: "rainviewer",
      minzoom: 0,
      maxzoom: 22,
      paint: {
        "raster-opacity": 0.55,
        "raster-fade-duration": 300
      }
    });

    if (window.showToast) window.showToast("Radar uplink active. Satellite overlays merged.", "success");
  } catch(e) {
    console.error("RainViewer loading failed:", e);
    if (window.showToast) window.showToast("Radar Link Offline: " + e.message, "error");
    const checkbox = document.getElementById("toggle-weather-radar");
    if (checkbox) checkbox.checked = false;
  }
};

function startNewsAlertsStream() {
  setInterval(async () => {
    try {
      const res = await fetch("/api/news-alerts");
      if (!res.ok || res.status === 204) return;
      const alert = await res.json().catch(() => null);
      if (alert && alert.title && window.showToast) {
        window.showToast(alert.title, alert.type || "info");
        if (window.playTacticalSound) {
          window.playTacticalSound("success");
        }
      }
    } catch(e) {
      console.warn("Geopolitical alerts uplink silent:", e.message);
    }
  }, 90000);
}

setTimeout(startNewsAlertsStream, 15000);


function initSidebarResizer() {
  const resizer = document.getElementById("sidebar-resizer");
  const sidebar = document.getElementById("sidebar");
  if (!resizer || !sidebar) return;

  // Legacy saved widths from the old resizable layout break the fixed
  // floating panel — clear them and always use the CSS-defined width.
  localStorage.removeItem("newsatlas_sidebar_width");
  sidebar.style.width = "";

  let isDragging = false;
  let startX = 0;
  let startWidth = 0;

  resizer.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startWidth = sidebar.getBoundingClientRect().width;
    resizer.classList.add("dragging");
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const delta = startX - e.clientX; // dragging left increases sidebar width
    let newWidth = startWidth + delta;
    const minWidth = 320;
    const maxWidth = Math.min(850, window.innerWidth * 0.7);

    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;

    document.documentElement.style.setProperty("--sidebar-width", `${newWidth}px`);
    sidebar.style.width = `${newWidth}px`;

    if (window.mapEngine && window.mapEngine.map) {
      window.mapEngine.map.resize();
    }
  });

  window.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      resizer.classList.remove("dragging");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      const currentWidth = sidebar.getBoundingClientRect().width;
      localStorage.setItem("newsatlas_sidebar_width", currentWidth);
      if (window.mapEngine && window.mapEngine.map) {
        window.mapEngine.map.resize();
      }
    }
  });
}
