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
let globalSearchData = [
  { name: { common: "United States" }, region: "Americas", subregion: "Northern America", population: 331000000, flags: { svg: "https://flagcdn.com/us.svg" }, capital: ["Washington D.C."], cca2: "US" },
  { name: { common: "India" }, region: "Asia", subregion: "Southern Asia", population: 1400000000, flags: { svg: "https://flagcdn.com/in.svg" }, capital: ["New Delhi"], cca2: "IN" },
  { name: { common: "China" }, region: "Asia", subregion: "Eastern Asia", population: 1400000000, flags: { svg: "https://flagcdn.com/cn.svg" }, capital: ["Beijing"], cca2: "CN" },
  { name: { common: "United Kingdom" }, region: "Europe", subregion: "Northern Europe", population: 67000000, flags: { svg: "https://flagcdn.com/gb.svg" }, capital: ["London"], cca2: "GB" },
  { name: { common: "France" }, region: "Europe", subregion: "Western Europe", population: 67000000, flags: { svg: "https://flagcdn.com/fr.svg" }, capital: ["Paris"], cca2: "FR" },
  { name: { common: "Japan" }, region: "Asia", subregion: "Eastern Asia", population: 125000000, flags: { svg: "https://flagcdn.com/jp.svg" }, capital: ["Tokyo"], cca2: "JP" },
  { name: { common: "Germany" }, region: "Europe", subregion: "Western Europe", population: 83000000, flags: { svg: "https://flagcdn.com/de.svg" }, capital: ["Berlin"], cca2: "DE" },
  { name: { common: "Brazil" }, region: "Americas", subregion: "South America", population: 214000000, flags: { svg: "https://flagcdn.com/br.svg" }, capital: ["Brasilia"], cca2: "BR" },
  { name: { common: "Canada" }, region: "Americas", subregion: "Northern America", population: 38000000, flags: { svg: "https://flagcdn.com/ca.svg" }, capital: ["Ottawa"], cca2: "CA" },
  { name: { common: "Singapore" }, region: "Asia", subregion: "South-Eastern Asia", population: 5700000, flags: { svg: "https://flagcdn.com/sg.svg" }, capital: ["Singapore"], cca2: "SG" },
  { name: { common: "Australia" }, region: "Oceania", subregion: "Australia and New Zealand", population: 26000000, flags: { svg: "https://flagcdn.com/au.svg" }, capital: ["Canberra"], cca2: "AU" },
  { name: { common: "South Korea" }, region: "Asia", subregion: "Eastern Asia", population: 51700000, flags: { svg: "https://flagcdn.com/kr.svg" }, capital: ["Seoul"], cca2: "KR" }
];
window.globalSearchData = globalSearchData;
let currentCategory = "top";

window.selectedCountry = selectedCountry;
window.currencyCode = currencyCode;
window.iso2Code = iso2Code;
window.currentCategory = currentCategory;

window.toggleHierarchyCollapse = (type) => {
    const content = document.getElementById(`${type}-collapse-content`);
    const icon = document.getElementById(`${type}-collapse-icon`);
    if (content) {
        content.classList.toggle('hidden');
    }
    if (icon) {
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
    }
};

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
        if (idEl) idEl.innerText = u ? `User ID: ${u.uid.substring(0, 8)}` : "Guest Mode";
      });
    } catch (e) {
      setText("neural-id", "Guest Mode");
    }
  } else { 
    setText("neural-id", "Guest Mode"); 
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
      if (window.updateAISummary) window.updateAISummary("Global Context");
      if (window.initializeMarkets) window.initializeMarkets("Global");
      if (window.fetchDetailedEconomics) window.fetchDetailedEconomics("Global");
      if (window.fetchWeather) {
        window._currentWeatherLocation = "New Delhi, India";
        window.fetchWeather(28.61, 77.23);
      }
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
      
      // Update Context HUD
      const ctxFlag = document.getElementById("ctx-flag");
      const ctxGlobe = document.getElementById("ctx-globe-icon");
      const ctxCountry = document.getElementById("ctx-country");
      const ctxLocation = document.getElementById("ctx-location");
      
      if (ctxFlag) {
        ctxFlag.src = c.flags?.svg || "";
        ctxFlag.classList.remove("hidden");
      }
      if (ctxGlobe) ctxGlobe.classList.add("hidden");
      if (ctxCountry) ctxCountry.innerText = cName.toUpperCase();
      if (ctxLocation) ctxLocation.innerText = "Country Profile";
      
      const opPath = document.getElementById("breadcrumb-operational-path");
      if (opPath) opPath.innerText = cName;

      window.fetchNews(cName);
      if (window.initializeMarkets) window.initializeMarkets(cName);
      if (window.updateAISummary) window.updateAISummary(cName);
      
      // Trigger Atmosphere (Weather) and Economics
      if (window.fetchDetailedEconomics) window.fetchDetailedEconomics(cName);
      if (window.fetchWeather && c.latlng) {
        window._currentWeatherLocation = cName;
        window.fetchWeather(c.latlng[0], c.latlng[1]);
      }
    }
  } catch (e) {
    console.warn("Data Sync Failure:", e);
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
    requestAnimationFrame(() => {
      targetContent.classList.add("active");
      if (id === 'search' && window.renderTrending) {
        window.renderTrending();
        setTimeout(() => document.getElementById("country-search")?.focus(), 100);
      }
      if (id === 'markets' && window.renderTVChart) {
        window.renderTVChart(window._currentCountryName || "Global");
      }
    });
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
    if (window.updateAISummary) window.updateAISummary(countryName);
  }
};

window.resetToGlobalCenter = () => {
  window.selectedCountry = null;
  window.iso2Code = null;
  setText("selected-country-name", "Worldwide");
  
  // Reset Context HUD
  const ctxFlag = document.getElementById("ctx-flag");
  const ctxGlobe = document.getElementById("ctx-globe-icon");
  const ctxCountry = document.getElementById("ctx-country");
  const ctxLocation = document.getElementById("ctx-location");
  
  if (ctxFlag) ctxFlag.classList.add("hidden");
  if (ctxGlobe) ctxGlobe.classList.remove("hidden");
  if (ctxCountry) ctxCountry.innerText = "GLOBAL VIEW";
  if (ctxLocation) ctxLocation.innerText = "SELECT A LOCATION";

  window.backToOrbital();

  // Resize map after sidebar collapses, then fly to global center
  setTimeout(() => {
    if (window.mapEngine && window.mapEngine.map) {
      window.mapEngine.map.resize();
      window.mapEngine.clearSelection();
      window.mapEngine.map.flyTo({ center: [15, 0], zoom: 1.6, duration: 2000, pitch: 0, bearing: 0 });
    }
  }, 50);

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
      if (tabId === 'economic' && window.fetchDetailedEconomics) window.fetchDetailedEconomics(city.name);
      if (tabId === 'atmosphere' && window.fetchWeather) window.fetchWeather(city.latitude, city.longitude);
    }
  } catch (e) {}
};

window.updateAISummary = async (country) => {
    const textEl = document.getElementById("ai-summary-text");
    const loadingEl = document.getElementById("ai-summary-loading");
    if (loadingEl) loadingEl.classList.remove("hidden");
    if (textEl) textEl.style.opacity = "0.4";

    try {
        const prompt = `Provide a professional news summary for ${country}.
        Return ONLY a JSON object with these keys: 
        {
          "summary": "General overview of the country.",
          "political": "Current government and political situation.",
          "trade": "Trade, imports, and exports.",
          "infra": "Infrastructure and public utilities.",
          "social": "Society and public sentiment.",
          "mil": "Security and safety outlook.",
          "tech": "Technology and innovation landscape.",
          "health": "Healthcare and public health status.",
          "finance": "Financial markets and fiscal status.",
          "eco": "Environment and climate issues.",
          "prod": "Industrial and business performance.",
          "edu": "Education and skills development.",
          "log": "Logistics, transport, and supply chains.",
          "energy": "Energy resources, production, and security.",
          "agri": "Agriculture, farming, and food security.",
          "demo": "Demographics, population trends, and labor.",
          "media": "Media freedom and information environment.",
          "tourism": "Travel industry and visitation trends.",
          "justice": "Rule of law and legal indicators.",
          "sports": "Cultural athletic influence.",
          "space": "Space exploration and aerospace status.",
          "rights": "Civil liberties and human rights status.",
          "innovation": "Research, IP, and emerging tech.",
          "sentiment": "Overall public optimism and sentiment.",
          "digital": "E-commerce, digital transformation, and internet economy."
        }
        Use a professional, objective news reporting tone. No markdown. No preambles.`;

        const res = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });
        const data = await res.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || data.response || "{}";
        const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
        let summaryData = {};
        try {
            summaryData = JSON.parse(clean);
        } catch (e) {
            console.error("Failed to parse Summary JSON:", clean);
        }

        const map = {
            "intel-lead": summaryData.summary || summaryData.lead,
            "intel-pol": summaryData.political || summaryData.governance,
            "intel-trade": summaryData.trade || summaryData.economics,
            "intel-infra": summaryData.infra || summaryData.infrastructure,
            "intel-social": summaryData.social || summaryData.society,
            "intel-mil": summaryData.mil || summaryData.security || summaryData.safety,
            "intel-tech": summaryData.tech || summaryData.technology,
            "intel-health": summaryData.health || summaryData.medical,
            "intel-finance": summaryData.finance || summaryData.fiscal,
            "intel-eco": summaryData.eco || summaryData.environment,
            "intel-prod": summaryData.prod || summaryData.business,
            "intel-edu": summaryData.edu || summaryData.education,
            "intel-log": summaryData.log || summaryData.logistics,
            "intel-energy": summaryData.energy || summaryData.resources,
            "intel-agri": summaryData.agri || summaryData.agriculture,
            "intel-demo": summaryData.demo || summaryData.demographics,
            "intel-media": summaryData.media,
            "intel-tourism": summaryData.tourism,
            "intel-justice": summaryData.justice,
            "intel-sports": summaryData.sports,
            "intel-space": summaryData.space,
            "intel-rights": summaryData.rights,
            "intel-innovation": summaryData.innovation,
            "intel-sentiment": summaryData.sentiment,
            "intel-digital": summaryData.digital || summaryData.digital_economy
        };

        Object.keys(map).forEach(id => {
            if (map[id]) setText(id, map[id]);
        });

    } catch (e) {
        console.error("AI Update failed:", e);
    } finally {
        if (loadingEl) loadingEl.classList.add("hidden");
        if (textEl) textEl.style.opacity = "1";
    }
};

window.mapEngine = new MapboxEngine('map-container');
window.mapEngine.init(); // interactions enabled inside style.load callback in mapbox-engine.js

initDashboard();
setupEventListeners();

window.initializeMarkets = (loc) => {
    if (window.displayPreciousMetals) window.displayPreciousMetals();
    if (window.displayCountryIndices) window.displayCountryIndices(loc);
    if (window.displayForex) window.displayForex();
    if (window.displayCommodities) window.displayCommodities();
};
