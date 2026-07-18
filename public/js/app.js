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
async function runBootSequence() {
  const savedTheme = localStorage.getItem('terminal-theme');
  if (savedTheme === 'light') document.body.classList.add('light-theme');

  const savedPerf = localStorage.getItem('terminal-low-fx');
  if (savedPerf === 'true') {
    document.body.classList.add('low-fx');
    const btn = document.getElementById('perf-toggle');
    if (btn) {
      btn.classList.add('text-sky-400');
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
  const hasFirebaseConfig = config && config.apiKey && config.projectId;
  if (hasFirebaseConfig && window.firebaseCore) {
    try {
      const firebaseApp = window.firebaseCore.initializeApp(config);
      const auth = window.firebaseCore.getAuth(firebaseApp);
      const db = window.firebaseCore.getFirestore(firebaseApp);
      window.authInstance = auth;
      window.dbInstance = db;

      let unsubscribeBookmarks = null;

      window.firebaseCore.onAuthStateChanged(auth, (u) => {
        window.currentUser = u;
        const loginBtn = document.getElementById("login-btn");
        const userInfo = document.getElementById("user-info");
        const userAvatar = document.getElementById("user-avatar");
        const userName = document.getElementById("user-name");
        const idEl = safeEl("neural-id");

        if (unsubscribeBookmarks) {
          unsubscribeBookmarks();
          unsubscribeBookmarks = null;
        }

        if (u) {
          if (loginBtn) loginBtn.classList.add("hidden");
          if (userInfo) userInfo.classList.remove("hidden");
          if (userAvatar) userAvatar.src = u.photoURL || "https://www.gravatar.com/avatar/?d=mp";
          if (userName) userName.innerText = u.displayName || u.email || "AUTHORIZED USER";

          if (idEl) {
            idEl.innerText = `SESSION: ${(u.displayName || u.email || u.uid).toUpperCase()}`;
            idEl.classList.add("text-emerald-500");
          }

          try {
            const userRef = window.firebaseCore.doc(db, "visitors", u.uid);
            window.firebaseCore.setDoc(userRef, { last_login: window.firebaseCore.serverTimestamp(), device: navigator.userAgent, email: u.email }, { merge: true });
          } catch (e) { }

          // Sync bookmarks in real-time
          const userDocRef = window.firebaseCore.doc(db, "users", u.uid);
          unsubscribeBookmarks = window.firebaseCore.onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              window.userBookmarks = docSnap.data().bookmarks || [];
            } else {
              window.userBookmarks = [];
            }
            window.renderPinnedSectors();
            window.updateNotesAndBookmarksUI();
          });

        } else {
          if (loginBtn) loginBtn.classList.remove("hidden");
          if (userInfo) userInfo.classList.add("hidden");
          if (idEl) {
            idEl.innerText = "GUEST SESSION";
            idEl.classList.remove("text-emerald-500");
          }
          window.userBookmarks = [];
          window.renderPinnedSectors();
          window.updateNotesAndBookmarksUI();
        }
      });
    } catch (e) {
      console.warn("Auth initialization failed:", e);
      setText("neural-id", "GUEST SESSION");
    }
  } else {
    setText("neural-id", "GUEST SESSION");
  }
  try {
    const res = await fetch("/data/countries.json");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    globalSearchData = await res.json();
    window.globalSearchData = globalSearchData;
    if (window.renderTrendingHeader) window.renderTrendingHeader();
    if (window.initAutocompleteSearch) window.initAutocompleteSearch();
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
    const res = await fetch(`/api/countries?name=${encodeURIComponent(countryName)}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    const c = Array.isArray(data) ? data[0] : data;
    if (c) {
      window._currentCountryName = c.name?.common || null;
      currencyCode = c.currencies ? Object.keys(c.currencies)[0] : "USD";
      iso2Code = c.cca2 || "";
      window._isoAlpha3 = c.cca3 || "";
      window.iso2Code = iso2Code;
      window.currencyCode = currencyCode;
      setText("fact-pop", formatPopulationM(c.population));
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
      setText("fact-pop-2", formatPopulationM(c.population));
      setText("fact-gini-2", c.gini ? Object.values(c.gini)[0] : "N/A");
      setText("fact-demonym-2", c.demonyms?.eng?.m || "--");
      setText("fact-area-2", c.area ? c.area.toLocaleString() + " km²" : "--");
      window.fetchNews(c.name.common);
      if (window.initializeMarkets) window.initializeMarkets(c.name.common);
      if (window.fetchDetailedEconomics) window.fetchDetailedEconomics(c.name.common);
      if (window.generateAIBriefing) window.generateAIBriefing(c.name.common);
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
  
  if (parts.length <= 1 && !clean.includes('[')) {
    container.innerHTML = `<div class="intel-summary-text pt-2">${escapeHtml(clean)}</div>`;
    return;
  }

  let html = '<div class="space-y-6 pt-2">';
  parts.forEach(block => {
    const headerMatch = block.match(/\[([A-Z_ ]+)\]/);
    if (!headerMatch) {
       if (block.trim()) html += `<p class="intel-summary-text px-1 mb-4">${escapeHtml(block.trim())}</p>`;
       return;
    }
    const key = headerMatch[1].trim();
    const displayName = key.replace(/_/g, ' ');
    const bodyRaw = block.slice(block.indexOf(']') + 1).trim().replace(/Rating:\s*\d+\s*\/\s*10\n?/gi, '').replace(/\*\*/g, '');
    if (!bodyRaw) return;
    html += `
      <div class="mb-6">
        <h4 class="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5">${escapeHtml(displayName)}</h4>
        <p class="intel-summary-text px-1">${escapeHtml(bodyRaw)}</p>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}
async function generateAIBriefing(loc) {
  const text = safeEl("ai-briefing-text");
  const loading = safeEl("ai-briefing-loading");
  const actions = safeEl("ai-briefing-actions");
  
  if (text) {
    text.innerHTML = `
      <div class="space-y-4 w-full mt-2">
        <div class="skeleton-pulse skeleton-text-block short"></div>
        <div class="skeleton-pulse skeleton-text-block"></div>
        <div class="skeleton-pulse skeleton-text-block" style="width: 80%;"></div>
      </div>
    `;
  }
  if (loading) loading.classList.remove("hidden");
  if (actions) actions.classList.add("hidden");

  const briefingPrompt = `Location: ${loc || 'Global Overview'}. Strategic Intel Report. Categories: [EXECUTIVE_SUMMARY], [POLITICAL_STABILITY], [TRADE_RELATIONS], [TECHNOLOGY], [ECONOMY], [SOCIAL_TRENDS], [ENERGY], [SUPPLY_CHAIN], [INFLATION], [INFRASTRUCTURE]. Format: [CATEGORY_NAME] followed by a 2-sentence tactical summary. No bullets.`;
  
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: briefingPrompt })
    });
    
    if (!res.ok) throw new Error("Intelligence Uplink Failed");
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || data.response || "No data received.";
    
    if (loading) loading.classList.add("hidden");
    if (actions) actions.classList.remove("hidden");
    
    renderBriefingCards(rawText);
  } catch (e) {
    if (loading) loading.classList.add("hidden");
    if (text) text.innerHTML = `<p class="text-red-400 text-xs py-4 uppercase font-bold text-center">Protocol Intercepted: ${e.message}</p>`;
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
    if (window.drawGeopoliticalTrendsChart) window.drawGeopoliticalTrendsChart(countryName);
  }
  if (window.updateNotesAndBookmarksUI) window.updateNotesAndBookmarksUI();
};
window.resetToGlobalCenter = () => {
  selectedCountry = null;
  window.selectedCountry = null;
  window._currentCountryName = null;
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
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem('terminal-theme', isLight ? 'light' : 'dark');
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
  const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' };
  const timeStr = now.toLocaleTimeString('en-US', options);
  setText("ist-time", `${timeStr} IST`);
}

window.switchTab = (id) => {
  if (typeof window.playTacticalSound === "function") window.playTacticalSound("tab");
  const tabs = document.querySelectorAll(".nav-tab");
  const contents = document.querySelectorAll(".tab-content");

  let targetTab = document.getElementById(`tab-btn-${id}`) || 
                  Array.from(tabs).find(t => t.id === id || t.getAttribute("data-target") === id);

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

  if (id === "map") {
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
  contents.forEach((c) => c.classList.remove("active"));

  targetTab.classList.add("active");
  targetTab.setAttribute("aria-selected", "true");

  const targetContentId = targetTab.getAttribute("aria-controls") || 
                          targetTab.getAttribute("data-target") || 
                          (targetTab.id ? targetTab.id.replace('tab-btn-', '').replace('btn-', '') : null);
  
  if (targetContentId && id !== "map") {
    window._currentTab = targetContentId;
    const targetContent = document.getElementById(targetContentId);
    if (targetContent) {
      targetContent.classList.add("active");
    }

    const countryName = window.selectedCountry?.properties?.name || window._currentCountryName || "";
    if (targetContentId === "tab-intel" && window.fetchGDELTEvents) {
      window.fetchGDELTEvents(countryName);
    }
    if (targetContentId === "tab-economic" && window.fetchECBRates) {
      window.fetchECBRates();
    }
    if (targetContentId === "tab-markets" && window.initializeMarkets) {
      window.initializeMarkets(countryName || "Global");
    }
    window.dispatchEvent(new Event("resize"));
  }

  syncMobileBottomNav(id);
};

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
// Intelligence Link - WebSocket connection
function initIntelligenceLink() {
  if (typeof io === 'undefined') {
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
    if (window.currentTab === "tab-news") window.fetchNews(window._currentCountryName);
  });

  socket.on("disconnect", () => {
    console.log("%c[LINK] Intelligence Uplink Lost", "color: #ef4444; font-weight: bold;");
    const idEl = document.getElementById("neural-id");
    if (idEl) idEl.classList.remove("socket-active");
  });
}

// Command Palette Engine
function initCommandPalette() {
  const overlay = document.getElementById("cmd-palette-overlay");
  const input = document.getElementById("cmd-palette-input");
  const list = document.getElementById("cmd-palette-list");
  if (!overlay || !input || !list) return;

  const commands = [
    { id: "intel", title: "View Intel Dashboard", icon: "fa-satellite", action: () => window.switchTab("intel") },
    { id: "news", title: "Global News Feed", icon: "fa-newspaper", action: () => window.switchTab("news") },
    { id: "markets", title: "Financial Markets", icon: "fa-chart-line", action: () => window.switchTab("markets") },
    { id: "theme", title: "Toggle Terminal Theme", icon: "fa-adjust", action: () => window.toggleTheme() },
    { id: "refresh", title: "Refresh Intelligence", icon: "fa-sync", action: () => window.generateAIBriefing(window._currentCountryName || "Global") },
    { id: "global", title: "Reset to Global Overview", icon: "fa-globe", action: () => window.resetToGlobalCenter() }
  ];

  function search(q) {
    const query = q.toLowerCase();
    const results = commands.filter(c => c.title.toLowerCase().includes(query));
    
    // Also search countries
    if (window.globalSearchData) {
      const countries = window.globalSearchData
        .filter(c => c.name.common.toLowerCase().includes(query))
        .slice(0, 5)
        .map(c => ({
          title: `Navigate to ${c.name.common}`,
          icon: "fa-map-marker-alt",
          action: () => window.handleCountryClick(null, { properties: { name: c.name.common, iso_a2: c.cca2 } })
        }));
      results.push(...countries);
    }

    render(results);
  }

  function render(results) {
    list.innerHTML = results.map((c, i) => `
      <div class="cmd-item flex items-center justify-between px-4 py-3 hover:bg-blue-600/10 cursor-pointer group" data-idx="${i}">
        <div class="flex items-center gap-3">
          <i class="fas ${c.icon} text-slate-500 group-hover:text-blue-400 text-xs"></i>
          <span class="text-sm font-bold text-slate-300 group-hover:text-white">${c.title}</span>
        </div>
        <kbd class="text-[9px] text-slate-600 group-hover:text-blue-400">ENTER</kbd>
      </div>
    `).join("");

    const items = list.querySelectorAll(".cmd-item");
    items.forEach((item, idx) => {
      item.addEventListener("click", () => {
        results[idx].action();
        close();
      });
    });
  }

  function open() {
    overlay.style.display = "flex";
    input.value = "";
    input.focus();
    search("");
  }

  function close() {
    overlay.style.display = "none";
  }

  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      open();
    }
    if (e.key === "Escape") close();
  });

  input.addEventListener("input", (e) => search(e.target.value));
}

window.mapEngine = new MapboxEngine('map-container');
window.mapEngine.init();
initTerminal();
setupEventListeners();
initMobileBottomNav();
initIntelligenceLink();
initCommandPalette();
setInterval(updateSystemTime, 1000);
window.toggleShortcuts = () => {
    window.showToast("Shortcuts: Esc=Close, Ctrl+K=Search, ?=Help", "info");
};
window.onCountrySelected = () => {};
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
window.fetchMarketIntel = () => {};
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

window.loginWithGoogle = async function() {
  if (!window.authInstance) {
    if (window.showToast) window.showToast("Auth services offline.", "error");
    return;
  }
  try {
    const provider = new window.firebaseCore.GoogleAuthProvider();
    await window.firebaseCore.signInWithPopup(window.authInstance, provider);
    if (window.showToast) window.showToast("Google authorization successful.", "success");
  } catch (e) {
    console.error("Google login failed:", e);
    if (window.showToast) window.showToast("Sign in aborted or failed.", "error");
  }
};

window.logout = async function() {
  if (!window.authInstance) return;
  try {
    await window.firebaseCore.signOut(window.authInstance);
    if (window.showToast) window.showToast("Logged out successfully.", "info");
    const menu = document.getElementById("user-dropdown-menu");
    if (menu) menu.classList.add("hidden");
  } catch (e) {
    console.error("Sign out failed:", e);
  }
};

window.toggleUserMenu = function() {
  const menu = document.getElementById("user-dropdown-menu");
  if (menu) {
    menu.classList.toggle("hidden");
  }
};

document.addEventListener("click", (e) => {
  const menu = document.getElementById("user-dropdown-menu");
  const userInfo = document.getElementById("user-info");
  if (menu && userInfo && !userInfo.contains(e.target)) {
    menu.classList.add("hidden");
  }
});

let notesSaveTimeout = null;
window.onNotesInput = function() {
  const notesInput = document.getElementById("classified-notes-input");
  const saveStatus = document.getElementById("notes-save-status");
  if (!notesInput || !window.currentUser || !window.selectedCountry) return;

  const countryName = window.selectedCountry.properties.name;
  const content = notesInput.value;

  if (saveStatus) saveStatus.innerText = "Saving...";

  clearTimeout(notesSaveTimeout);
  notesSaveTimeout = setTimeout(async () => {
    try {
      const docRef = window.firebaseCore.doc(window.dbInstance, "users", window.currentUser.uid, "notes", countryName);
      await window.firebaseCore.setDoc(docRef, {
        content: content,
        updatedAt: window.firebaseCore.serverTimestamp()
      }, { merge: true });
      if (saveStatus) saveStatus.innerText = "Autosaved";
    } catch (e) {
      console.error("Notes autosave failed:", e);
      if (saveStatus) saveStatus.innerText = "Sync Error";
    }
  }, 800);
};

window.togglePinCountry = async function() {
  if (!window.currentUser) {
    if (window.showToast) window.showToast("Please sign in to pin sectors.", "warning");
    return;
  }
  if (!window.selectedCountry || !window.selectedCountry.properties) return;

  const countryName = window.selectedCountry.properties.name;
  if (!window.userBookmarks) window.userBookmarks = [];

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
  }

  try {
    const docRef = window.firebaseCore.doc(window.dbInstance, "users", window.currentUser.uid);
    await window.firebaseCore.setDoc(docRef, {
      bookmarks: window.userBookmarks,
      updatedAt: window.firebaseCore.serverTimestamp()
    }, { merge: true });
    
    if (window.showToast) {
      window.showToast(isPinned ? `Sector ${countryName} pinned.` : `Sector ${countryName} unpinned.`, "success");
    }
  } catch (e) {
    console.error("Failed to save bookmark:", e);
    if (window.showToast) window.showToast("Sync bookmark failed.", "error");
  }
};

window.renderPinnedSectors = function() {
  const card = document.getElementById("pinned-sectors-card");
  const list = document.getElementById("pinned-sectors-list");
  if (!card || !list) return;

  if (!window.currentUser || !window.userBookmarks || window.userBookmarks.length === 0) {
    card.classList.add("hidden");
    list.innerHTML = "";
    return;
  }

  card.classList.remove("hidden");
  list.innerHTML = window.userBookmarks.map(country => {
    const safeName = country.replace(/'/g, "\\'");
    return `
      <button type="button" onclick="window.handleCountryClick(null, {properties:{name:'${safeName}'}})" 
        class="px-2.5 py-1.5 text-[9px] bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 font-bold tracking-widest uppercase rounded-lg border border-yellow-500/20 transition-all font-mono flex items-center gap-1.5">
        <i class="fas fa-map-marker-alt text-[8px]"></i> ${country}
      </button>
    `;
  }).join("");
};

window.updateNotesAndBookmarksUI = async function() {
  const noteCard = document.getElementById("classified-notes-card");
  const pinBtn = document.getElementById("sector-pin-btn");
  const notesInput = document.getElementById("classified-notes-input");
  const authPrompt = document.getElementById("notes-auth-prompt");
  const saveStatus = document.getElementById("notes-save-status");

  const compareBtn = document.getElementById("sector-compare-btn");

  if (!window.selectedCountry || !window.selectedCountry.properties) {
    if (noteCard) noteCard.classList.add("hidden");
    if (pinBtn) pinBtn.classList.add("hidden");
    if (compareBtn) compareBtn.classList.add("hidden");
    if (notesInput) notesInput.value = "";
    return;
  }

  const countryName = window.selectedCountry.properties.name;

  if (noteCard) noteCard.classList.remove("hidden");
  if (pinBtn) pinBtn.classList.remove("hidden");
  if (compareBtn) compareBtn.classList.remove("hidden");

  if (pinBtn) {
    const isPinned = window.userBookmarks && window.userBookmarks.includes(countryName);
    pinBtn.innerHTML = isPinned ? '<i class="fas fa-star text-[10px] text-yellow-400"></i>' : '<i class="far fa-star text-[10px]"></i>';
    pinBtn.title = isPinned ? "Unpin Sector" : "Pin Sector";
  }

  if (window.currentUser) {
    if (authPrompt) authPrompt.classList.add("hidden");
    if (notesInput) notesInput.disabled = false;
    
    if (saveStatus) saveStatus.innerText = "Synchronizing...";
    try {
      const docRef = window.firebaseCore.doc(window.dbInstance, "users", window.currentUser.uid, "notes", countryName);
      const docSnap = await window.firebaseCore.getDoc(docRef);
      if (docSnap.exists()) {
        notesInput.value = docSnap.data().content || "";
      } else {
        notesInput.value = "";
      }
      if (saveStatus) saveStatus.innerText = "Autosaved";
    } catch (e) {
      console.warn("Failed to load notes:", e.message);
      if (saveStatus) saveStatus.innerText = "Sync Failed";
    }
  } else {
    if (authPrompt) authPrompt.classList.remove("hidden");
    if (notesInput) {
      notesInput.disabled = true;
      notesInput.value = "";
    }
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
            item.classList.add("bg-white/5", "text-white");
          } else {
            item.classList.remove("bg-white/5", "text-white");
          }
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + currentResults.length) % currentResults.length;
        items.forEach((item, idx) => {
          if (idx === activeIndex) {
            item.classList.add("bg-white/5", "text-white");
          } else {
            item.classList.remove("bg-white/5", "text-white");
          }
        });
      } else if (e.key === "Enter") {
        if (activeIndex > -1 && currentResults[activeIndex]) {
          e.preventDefault();
          selectResult(currentResults[activeIndex]);
        } else if (currentResults.length > 0) {
          e.preventDefault();
          selectResult(currentResults[0]);
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
  
  const getDynamicEstimate = (name) => {
    if (window.getDynamicEconomicEstimate) return window.getDynamicEconomicEstimate(name);
    return { gdp_billions: "150", gdp_growth_percent: 1.5, gdp_per_capita: 5000, inflation_rate: 3.5, unemployment_rate: 6.5, interest_rate: 4.5, debt_to_gdp: 50, major_exports: ["Raw Goods"] };
  };

  const pEco = getDynamicEstimate(pName);
  const sEco = getDynamicEstimate(sName);
  
  const renderSplit = (elId, v1, v2) => {
    const el = document.getElementById(elId);
    if (el) el.innerText = `${v1} | ${v2}`;
  };
  
  renderSplit("eco-gdp", `$${pEco.gdp_billions}B`, `$${sEco.gdp_billions}B`);
  renderSplit("eco-growth", `${pEco.gdp_growth_percent > 0 ? "+" : ""}${pEco.gdp_growth_percent}%`, `${sEco.gdp_growth_percent > 0 ? "+" : ""}${sEco.gdp_growth_percent}%`);
  renderSplit("eco-capita", `$${pEco.gdp_per_capita.toLocaleString()}`, `$${sEco.gdp_per_capita.toLocaleString()}`);
  renderSplit("eco-inflation", `${pEco.inflation_rate}%`, `${sEco.inflation_rate}%`);
  renderSplit("eco-unemployment", `${pEco.unemployment_rate}%`, `${sEco.unemployment_rate}%`);
  renderSplit("eco-interest", `${pEco.interest_rate}%`, `${sEco.interest_rate}%`);
  renderSplit("eco-debt", `${pEco.debt_to_gdp}%`, `${sEco.debt_to_gdp}%`);
  
  const ticker = document.getElementById("eco-market-ticker");
  if (ticker) ticker.innerText = `COMPARING: ${pName.toUpperCase()} VS ${sName.toUpperCase()}`;
  
  const exportsEl = document.getElementById("eco-exports");
  if (exportsEl) {
    const pTags = pEco.major_exports.slice(0,2).map(item => `
      <div class="apple-glass px-2.5 py-1.5 border border-blue-500/10 flex items-center gap-1.5 rounded-full">
         <span class="text-[8px] text-slate-500 font-black uppercase">${pName.substring(0,3)}:</span>
         <span class="text-[8px] text-white font-black uppercase">${item}</span>
      </div>
    `);
    const sTags = sEco.major_exports.slice(0,2).map(item => `
      <div class="apple-glass px-2.5 py-1.5 border border-indigo-500/10 flex items-center gap-1.5 rounded-full">
         <span class="text-[8px] text-slate-500 font-black uppercase">${sName.substring(0,3)}:</span>
         <span class="text-[8px] text-white font-black uppercase">${item}</span>
      </div>
    `);
    exportsEl.innerHTML = [...pTags, ...sTags].join("");
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
      if (!res.ok) return;
      const alert = await res.json();
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
