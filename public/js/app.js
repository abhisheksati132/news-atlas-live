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
  
  const hasFirebaseConfig = config && config.apiKey && config.projectId;
  if (hasFirebaseConfig && window.firebaseCore) {
    try {
      const firebaseApp = window.firebaseCore.initializeApp(config);
      const auth = window.firebaseCore.getAuth(firebaseApp);
      window.firebaseCore.signInAnonymously(auth);
      window.firebaseCore.onAuthStateChanged(auth, (u) => {
        const idEl = safeEl("neural-id");
        if (idEl) idEl.innerText = u ? `SESSION: ${u.uid.substring(0, 8).toUpperCase()}` : "GUEST SESSION";
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
      window.globalSearchData = await res.json();
      if (window.renderTrendingHeader) window.renderTrendingHeader();
    }
  } catch (e) {}

  try {
    if (window.fetchNews) window.fetchNews();
    startStockTicker();
  } catch (e) {}

  runWhenIdle(() => {
    try {
      if (window.generateAIBriefing) window.generateAIBriefing("Global Context");
      if (window.initializeMarkets) window.initializeMarkets("Global");
      if (window.fetchSeismicStatus) window.fetchSeismicStatus();
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
      
      const cName = c.name?.common || countryName;
      window.fetchNews(cName);
      if (window.initializeMarkets) window.initializeMarkets(cName);
      if (window.generateAIBriefing) window.generateAIBriefing(cName);
      
      // Trigger Atmosphere (Weather) and Economics
      if (window.fetchDetailedEconomics) window.fetchDetailedEconomics(cName);
      if (window.fetchWeather && c.latlng) {
        window._currentWeatherLocation = cName;
        window.fetchWeather(c.latlng[0], c.latlng[1]);
      }
    }
  } catch (e) {
    console.error("Critical Telemetry Synchronization Failure:", e);
  }
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
  document.querySelectorAll(".nav-sector-link").forEach(link => {
    if (link.innerText.trim().toLowerCase() === 'globe') link.classList.add("active");
    else link.classList.remove("active");
  });
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
    window.mapEngine.map.flyTo({ center: [15, 0], zoom: 1.6, duration: 2000 });
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

window.generateAIBriefing = async (country) => {
    const textEl = document.getElementById("ai-briefing-text");
    const loadingEl = document.getElementById("ai-briefing-loading");
    if (loadingEl) loadingEl.classList.remove("hidden");
    if (textEl) textEl.style.opacity = "0.4";

    try {
        const prompt = `Analyze the current geopolitical and strategic situation of ${country}. 
        Return ONLY a JSON object with 12 analysis factors. 
        For each factor, write exactly 2-3 highly detailed, professional sentences.
        Expect these exact keys in the JSON:
        {
          "summary": "Executive summary",
          "political": "Political stability/regime",
          "trade": "Trade/economics",
          "infra": "Infrastructure/energy",
          "social": "Societal sentiment/cohesion",
          "mil": "Military/defense posture",
          "tech": "Technology/cyber sovereignty",
          "health": "Sanitary/health baseline",
          "finance": "Financial integrity/fiscal",
          "eco": "Ecological status/climate",
          "prod": "Industrial productivity/labor",
          "edu": "Educational/human capital",
          "log": "Logistics/supply chain fluidity"
        }
        Be professional, data-centric, and extremely concise. No markdown formatting.`;

        const res = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });
        const data = await res.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || data.response || "{}";
        const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
        let intel = {};
        try {
            intel = JSON.parse(clean);
        } catch (e) {
            console.error("Failed to parse Intel JSON:", clean);
        }

        const map = {
            "intel-lead": intel.summary || intel.executive_summary || intel.lead,
            "intel-pol": intel.political || intel.political_stability || intel.stability,
            "intel-trade": intel.trade || intel.trade_relations || intel.economics,
            "intel-infra": intel.infra || intel.infrastructure || intel.energy,
            "intel-social": intel.social || intel.societal_sentiment || intel.sentiment || intel.cohesion,
            "intel-mil": intel.mil || intel.military || intel.defense || intel.military_posture,
            "intel-tech": intel.tech || intel.technology || intel.cyber || intel.tech_sovereignty,
            "intel-health": intel.health || intel.sanitary || intel.medical,
            "intel-finance": intel.finance || intel.fiscal || intel.transparency,
            "intel-eco": intel.eco || intel.environment || intel.climate || intel.ecological,
            "intel-prod": intel.prod || intel.productivity || intel.industrial,
            "intel-edu": intel.edu || intel.education || intel.human_capital,
            "intel-log": intel.log || intel.logistics || intel.supply_chain
        };

        Object.keys(map).forEach(id => {
            if (map[id]) setText(id, map[id]);
        });

    } catch (e) {
        console.error("AI Briefing failed:", e);
    } finally {
        if (loadingEl) loadingEl.classList.add("hidden");
        if (textEl) textEl.style.opacity = "1";
    }
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
