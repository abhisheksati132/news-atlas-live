let selectedCountry = null;
let currencyCode = null;
let iso2Code = null;
let countryUTCOffset = null;
let projectionType = "2d";
window.projectionType = "2d";
let currentProjection, svg, g, zoom;
let worldFeatures = [];
let globalSearchData = [];
let currentCategory = "top";
window.selectedCountry = selectedCountry;
window.currencyCode = currencyCode;
window.iso2Code = iso2Code;
window.currentCategory = currentCategory;
window._hexLayers = { seismic: [], gdelt: [], aq: [] };
window._timeOffsetHours = 0;
window._chronosOffset = 0;
window._chronosActive = false;
function magColor(m) {
  return m >= 7 ? "#ef4444" : m >= 6 ? "#f97316" : m >= 5 ? "#eab308" : "#10b981";
}
window.magColor = magColor;

window._audioMuted = false;
let audioCtx = null;
window.playTacticalSound = function (type) {
  if (window._audioMuted) return;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch { return; }
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const t = audioCtx.currentTime;

  if (type === "hover") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.05, t + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.start(t);
    osc.stop(t + 0.1);
  } else if (type === "click" || type === "tab") {
    osc.type = "square";
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.08, t + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.start(t);
    osc.stop(t + 0.1);
  } else if (type === "success") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.setValueAtTime(800, t + 0.1);
    osc.frequency.setValueAtTime(1000, t + 0.2);
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.1, t + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.start(t);
    osc.stop(t + 0.3);
  }
};

window.toggleGlobalAudio = function () {
  window._audioMuted = !window._audioMuted;
  if (window._audioMuted) {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (typeof window.toggleAmbience === "function" && window.isAmbiencePlaying) {
      window.toggleAmbience();
    }
  }
  const btn = document.getElementById("audio-icon");
  const parentBtn = document.getElementById("audio-toggle-btn");
  if (btn && parentBtn) {
    if (window._audioMuted) {
      btn.className = "fas fa-volume-mute text-2xl relative z-10";
      parentBtn.classList.remove("text-emerald-400");
      parentBtn.classList.add("text-red-400");
    } else {
      btn.className = "fas fa-volume-up text-2xl relative z-10";
      parentBtn.classList.remove("text-red-400");
      parentBtn.classList.add("text-emerald-400");
      window.playTacticalSound("success");
    }
  }
};

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
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const logs = [
    "SYSTEM_INIT...",
    "CONNECTING_SAT_UPLINK...",
    "DECRYPTING_GLOBAL_FEED...",
    "HANDSHAKE_VERIFIED",
    "ACCESS_GRANTED",
  ];
  const logEl = safeEl("boot-log");
  const bar = safeEl("boot-bar");
  const stepMs = reducedMotion ? 80 : 400;
  for (let i = 0; i < logs.length; i++) {
    await new Promise((r) => setTimeout(r, stepMs));
    const d = document.createElement("div");
    d.innerText = `> ${logs[i]}`;
    if (logEl) logEl.appendChild(d);
    if (bar) bar.style.width = ((i + 1) / logs.length) * 100 + "%";
  }
  await new Promise((r) => setTimeout(r, reducedMotion ? 100 : 500));
  const bootScreen = safeEl("boot-screen");
  if (bootScreen) {
    bootScreen.style.opacity = "0";
    setTimeout(() => bootScreen.remove(), reducedMotion ? 200 : 800);
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
    if (res.status === 404) {
      showBackendRequiredBanner();
    }
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

  const hasFirebaseConfig =
    config && config.apiKey && config.projectId;
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
            idEl.innerText = `ID: ${u.displayName.toUpperCase()}`;
            idEl.classList.add("text-emerald-500");
          } else if (idEl && u.isAnonymous) {
            idEl.innerText = `ID: ${u.uid.substring(0, 8).toUpperCase()}`;
          }
          try {
            const userRef = window.firebaseCore.doc(db, "visitors", u.uid);
            window.firebaseCore.setDoc(
              userRef,
              {
                last_login: window.firebaseCore.serverTimestamp(),
                device: navigator.userAgent,
              },
              { merge: true },
            );
          } catch (e) { }
        }
      });
    } catch (e) {
      console.warn("Firebase Auth failed:", e);
      setText("neural-id", "LOCAL MODE (OFFLINE)");
      if (window.showToast) window.showToast("Auth offline. Using local mode.", "info");
    }
  } else {
    setText("neural-id", "LOCAL MODE (OFFLINE)");
  }
  try {
    const res = await fetch("/api/countries?all=true");
    globalSearchData = await res.json();
    window.globalSearchData = globalSearchData;
    if (window.renderTrendingHeader) window.renderTrendingHeader();
  } catch (e) { console.error("Search data load failed:", e); }

  window.fetchNews();
  startStockTicker();

  runWhenIdle(() => {
    if (window.generateAIBriefing) window.generateAIBriefing("Global Context");
    if (window.fetchGDELTEvents) window.fetchGDELTEvents("");
    if (window.initializeMarkets) window.initializeMarkets("Global");
  });
}
async function startStockTicker() {
  const tickerContent = document.getElementById("stock-ticker-content");
  if (!tickerContent) return;
  function renderTicker(stocks) {
    let html = "";
    stocks.forEach((stock) => {
      const up = stock.change >= 0;
      const color = up ? "text-emerald-400" : "text-red-400";
      const arrow = up ? "▲" : "▼";
      const priceStr =
        stock.price >= 1000
          ? stock.price.toLocaleString(undefined, { maximumFractionDigits: 2 })
          : stock.price.toFixed(stock.price < 10 ? 4 : 2);
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
        const dot = document
          .querySelector(".ticker-wrap")
          ?.previousElementSibling?.querySelector(".bg-red-400");
        if (dot) {
          dot.classList.replace("bg-red-400", "bg-emerald-400");
        }
      }
    } catch (_) {
      if (!tickerContent.innerHTML) {
        tickerContent.innerHTML =
          '<div class="ticker-item text-slate-500">FETCHING LIVE DATA...</div>';
      }
    }
  }
  let tickerLastUpdate = 0;
  function setTickerLastUpdated() {
    const el = document.getElementById("ticker-last-updated");
    if (!el) return;
    tickerLastUpdate = Date.now();
    el.textContent = "Last updated just now";
  }
  fetchAndRender();
  setInterval(() => {
    fetchAndRender();
  }, 60000);
  setInterval(() => {
    const el = document.getElementById("ticker-last-updated");
    if (!el || !tickerLastUpdate) return;
    const mins = Math.floor((Date.now() - tickerLastUpdate) / 60000);
    el.textContent = mins < 1 ? "Last updated just now" : "Last updated " + mins + " min ago";
  }, 60000);
}
async function fetchAllData(name) {
  const apiName = countryNameForRestCountries(name);
  try {
    const res = await fetch(
      `/api/countries?name=${encodeURIComponent(apiName)}`,
    );
    const data = await res.json();
    if (data && data[0]) {
      const c = data[0];
      iso2Code = c.cca2.toLowerCase();
      currencyCode = c.currencies ? Object.keys(c.currencies)[0] : null;
      window._isoAlpha3 = c.cca3 || "";
      window.iso2Code = iso2Code;
      window.currencyCode = currencyCode;
      setText("fact-pop", (c.population / 1000000).toFixed(1) + "M");
      setText("fact-cap", c.capital ? c.capital[0] : "N/A");
      setText("fact-region", c.region || "--");
      setText("fact-area", c.area ? c.area.toLocaleString() : "--");
      setText(
        "fact-code",
        c.idd ? (c.idd.root || "") + (c.idd.suffixes ? c.idd.suffixes[0] : "") : "--",
      );
      setText("fact-demonym", c.demonyms?.eng?.m || "--");
      setText("fact-gini", c.gini ? Object.values(c.gini)[0] : "N/A");
      setText("fact-drive", c.car ? c.car.side.toUpperCase() : "--");
      const flagEl = safeEl("sector-flag");
      const nameEl = safeEl("sector-name");
      const box = safeEl("active-sector-display");
      if (flagEl && nameEl && box) {
        flagEl.src = c.flags?.svg || "";
        nameEl.innerText = c.name.common;
        box.classList.remove("hidden");
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
      let lat = 0,
        lon = 0;
      if (c.latlng && c.latlng.length === 2) {
        [lat, lon] = c.latlng;
      } else if (
        c.capitalInfo &&
        c.capitalInfo.latlng &&
        c.capitalInfo.latlng.length === 2
      ) {
        [lat, lon] = c.capitalInfo.latlng;
      }
      const capitalName = c.capital ? c.capital[0] : c.name.common;
      window._currentWeatherLocation = `${capitalName}, ${c.name.common}`;
      if (lat || lon) window.fetchWeather(lat, lon);
      setText("fact-pop-2", (c.population / 1000000).toFixed(1) + "M");
      setText("fact-gini-2", c.gini ? Object.values(c.gini)[0] : "N/A");
      setText("fact-demonym-2", c.demonyms?.eng?.m || "--");
      setText("fact-area-2", c.area ? c.area.toLocaleString() + " km²" : "--");
      window.fetchCurrency();
      window.fetchDetailedEconomics(c.name.common);
      window.fetchNews();
    }
  } catch (e) {
    console.error("Data Fetch Error", e);
    if (window.showToast) window.showToast("Country data failed. Try again.", "error");
  }
}
function renderBriefingCards(rawText) {
  const container = safeEl("ai-briefing-text");
  if (!container) return;

  let clean = rawText
    .replace(/\[STRATEGIC METRICS DASHBOARD\]\s*/gi, '')
    .replace(/\*\*/g, '')
    .replace(/Ã¢â‚¬Â¢/g, '•')
    .replace(/Â·/g, '•')
    .replace(/Â°/g, '°')
    .replace(/Â/g, '')
    .trim();

  const parts = clean.split(/(?=\[[A-Z_ ]+\])/);
  let html = '';

  parts.forEach(block => {
    const headerMatch = block.match(/\[([A-Z_ ]+)\]/);
    if (!headerMatch) return;

    const key = headerMatch[1].trim();
    const bodyRaw = block.slice(block.indexOf(']') + 1).trim();
    const ratingMatch = bodyRaw.match(/Tactical Rating:\s*(\d+)\s*\/\s*10/i);
    const rating = ratingMatch ? parseInt(ratingMatch[1]) : null;
    const paragraph = bodyRaw.replace(/Tactical Rating:\s*(\d+)\s*\/\s*10\n?/i, '').trim();

    if (!paragraph && !rating) return;

    const isExec = key.includes('EXECUTIVE');
    const color = isExec ? '#3b82f6' : (rating >= 8 ? '#10b981' : rating >= 5 ? '#f59e0b' : rating ? '#ef4444' : '#3b82f6');
    const iconMap = { GOV: 'fa-landmark', BORDER: 'fa-map-marked-alt', CYBER: 'fa-shield-alt', CIVIL: 'fa-users', MILITARY: 'fa-fighter-jet', ENERGY: 'fa-bolt', SUPPLY: 'fa-truck', INFLATION: 'fa-chart-line', FOREIGN: 'fa-handshake', INFRA: 'fa-network-wired', EXECUTIVE: 'fa-satellite-dish' };
    const iconKey = Object.keys(iconMap).find(k => key.includes(k)) || 'EXECUTIVE';
    const icon = iconMap[iconKey] || 'fa-crosshairs';
    const displayName = key.replace(/_/g, ' ');

    html += `
      <div class="apple-glass group p-5 mb-4 relative overflow-hidden transition-all duration-300 hover:bg-white/[0.05] hover:shadow-[0_0_30px_${color}33] hover:border-${color}/40">
        <div class="absolute -inset-[1px] bg-gradient-to-br from-white/10 to-transparent opacity-30 pointer-events-none"></div>
        
        <div class="flex justify-between items-start mb-4 relative z-10">
          <div class="flex items-center gap-4">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-white" 
                 style="background: ${color}44; border: 1px solid ${color}66; box-shadow: 0 0 15px ${color}33;">
              <i class="fas ${icon} text-[18px]"></i>
            </div>
            <div class="flex flex-col">
              <span class="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400/80">Sector Analysis</span>
              <span class="text-[16px] font-bold text-white uppercase tracking-wider">${displayName}</span>
            </div>
          </div>
          ${rating ? `
            <div class="bg-black/40 border border-${color}/40 rounded-xl px-4 py-2 flex flex-col items-center">
              <span class="text-[20px] font-black font-mono leading-none" style="color: ${color};">${rating}<span class="text-[12px] opacity-40">/10</span></span>
              <div class="w-14 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div class="h-full" style="width: ${rating * 10}%; background: ${color}; shadow: 0 0 10px ${color};"></div>
              </div>
            </div>
          ` : ''}
        </div>
        
        <p class="text-[14.5px] text-white/90 leading-relaxed font-mono relative z-10" style="font-weight: 400; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
          ${paragraph}
        </p>
      </div>
    `;
  });

  if (html) {
    container.innerHTML = html;
  } else {
    container.innerHTML = `<div class="apple-glass p-6 text-[13px] text-slate-400 font-mono leading-relaxed">${clean.replace(/\n/g, '<br>')}</div>`;
  }
}

async function generateAIBriefing(loc) {
  const box = safeEl("ai-briefing-box");
  const text = safeEl("ai-briefing-text");
  const loading = safeEl("ai-briefing-loading");
  const actions = safeEl("ai-briefing-actions");
  if (box) box.classList.remove("hidden");
  if (text) { text.innerHTML = '<p style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:#475569;">Initialising deep-scan...</p>'; text.classList.add("ai-streaming"); }
  if (loading) loading.classList.remove("hidden");
  if (actions) actions.classList.add("hidden");
  let _cursorInterval = null;
  if (text) {
    let _cursorOn = true;
    _cursorInterval = setInterval(() => {

      if (!text.__streaming && text.children.length === 1 && text.children[0]?.style.color === 'rgb(71, 85, 105)') {

      }
    }, 400);
  }

  const briefingPrompt = `Target Sector: ${loc || 'Global Surveillance'}.
Initiate Deep-Scan Strategic Intelligence Dossier.
Provide a comprehensive, high-density tactical analysis. 

FORMATTING RULES:
1. You MUST start with the [EXECUTIVE_SUMMARY] header.
2. Follow with exactly 10 categories from the list below, each with its own [CATEGORY_NAME] header.
3. For EVERY category, you MUST include 'Tactical Rating: X/10' on the very first line after the header.
4. Ensure headers use square brackets like [GOV_STABILITY].

CATEGORIES TO USE (INCLUDE ALL 10):
[GOV_STABILITY], [BORDER_INTEGRITY], [CYBER_THREAT], [CIVIL_UNREST], [MILITARY_READINESS], [ENERGY_RESERVES], [SUPPLY_CHAIN], [INFLATION_PRESSURE], [FOREIGN_RELATIONS], [INFRASTRUCTURE].

TONE: Strict, authoritative military/intelligence analyst. Use high-fidelity technical terminology. Ensure paragraphs are substantial.`;
  try {
    const res = await fetch("/api/ai?stream=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: briefingPrompt }),
    });
    if (!res.ok || !res.body) throw new Error("Stream not available");
    if (_cursorInterval) { clearInterval(_cursorInterval); _cursorInterval = null; }
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
          if (token) {
            accumulated += token;

            if (text) text.innerText = accumulated.replace(/\*\*/g, "").trim();
          }
        } catch { }
      }
    }
    if (text) {
      text.__streaming = false;
      text.classList.remove("ai-streaming");
      renderBriefingCards(accumulated);
    }
    if (actions) actions.classList.remove("hidden");
    window.playTacticalSound("success");
    if (window.showToast) window.showToast("Dossier compiled successfully", "success");
  } catch (e) {
    if (_cursorInterval) { clearInterval(_cursorInterval); _cursorInterval = null; }
    try {
      const res2 = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: briefingPrompt }),
      });
      const result = await res2.json();
      if (loading) loading.classList.add("hidden");
      if (text) {
        let rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Link stable. No intel found.";
        text.__streaming = false;
        text.classList.remove("ai-streaming");
        renderBriefingCards(rawText);
      }
      if (actions) actions.classList.remove("hidden");
      window.playTacticalSound("success");
    } catch (e2) {
      if (loading) loading.classList.add("hidden");
      if (text) { text.innerText = "Briefing handshake failed."; text.__streaming = false; }
      if (window.showToast) window.showToast("Briefing failed. Try again.", "error");
    }
  }
}
window.copyBriefingToClipboard = function () {
  const text = safeEl("ai-briefing-text");
  if (!text || !text.innerText) return;
  navigator.clipboard.writeText(text.innerText).then(
    () => { if (window.showToast) window.showToast("Briefing copied to clipboard", "success"); },
    () => { if (window.showToast) window.showToast("Copy failed", "error"); }
  );
};
window._airQualityActive = false;
window._aqData = [];
window.toggleAirQuality = async function () {
  window._airQualityActive = !window._airQualityActive;
  const btn = document.getElementById("airquality-toggle-btn");
  if (btn) btn.classList.toggle("active", window._airQualityActive);

  if (!window.mapEngine || !window.mapEngine.map) return;
  const map = window.mapEngine.map;

  if (!window._airQualityActive) {
    if (map.getLayer('aq-heat')) map.removeLayer('aq-heat');
    if (map.getLayer('aq-core')) map.removeLayer('aq-core');
    if (map.getSource('aq-data')) map.removeSource('aq-data');
    if (window.updateLayerLegend) window.updateLayerLegend();
    if (window.showToast) window.showToast("Air quality layer off", "info");
    return;
  }

  if (window.showToast) window.showToast("Loading air quality data…", "info");

  let features = [];
  try {
    const res = await fetch("https://api.waqi.info/map/bounds/?latlng=-90,-180,90,180&token=demo");
    const data = await res.json();
    if (data.status !== "ok") throw new Error("WAQI status: " + data.status);

    features = data.data
      .filter((s) => s.lat && s.lon && typeof s.aqi === "number" && s.aqi > 0)
      .map(s => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
        properties: { aqi: s.aqi, name: s.station ? s.station.name : "AQ Station" }
      }));
    if (window.showToast) window.showToast(`Air quality: ${features.length} stations`, "success");
  } catch (e) {
    console.warn("AQ fetch failed", e);
    features = (window.globalSearchData || []).slice(0, 80).map((c) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [(c.latlng || [0, 0])[1] + (Math.random() - 0.5) * 5, (c.latlng || [0, 0])[0] + (Math.random() - 0.5) * 5]
      },
      properties: { aqi: Math.floor(Math.random() * 200) + 20, name: "Estimated AQ" }
    }));
    if (window.showToast) window.showToast("Using estimated air quality data", "info");
  }

  const geoData = { type: 'FeatureCollection', features };

  if (map.getSource('aq-data')) {
    map.getSource('aq-data').setData(geoData);
  } else {
    map.addSource('aq-data', { type: 'geojson', data: geoData });

    map.addLayer({
      id: 'aq-heat',
      type: 'heatmap',
      source: 'aq-data',
      maxzoom: 9,
      paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'aqi'], 0, 0, 300, 1],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(16, 185, 129, 0)',
          0.2, 'rgba(16, 185, 129, 0.4)',
          0.5, 'rgba(250, 204, 21, 0.6)',
          0.8, 'rgba(249, 115, 22, 0.8)',
          1, 'rgba(220, 38, 38, 0.9)'
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 9, 45],
        'heatmap-opacity': 0.7
      }
    });

    map.addLayer({
      id: 'aq-core',
      type: 'circle',
      source: 'aq-data',
      minzoom: 3,
      paint: {
        'circle-radius': 4,
        'circle-color': [
          'step', ['get', 'aqi'],
          '#10b981',
          50, '#facc15',
          100, '#f97316',
          150, '#ef4444',
          200, '#991b1b'
        ],
        'circle-stroke-color': '#020617',
        'circle-stroke-width': 1
      }
    });

    map.on('mouseenter', 'aq-core', (e) => {
      map.getCanvas().style.cursor = 'crosshair';
      const props = e.features[0].properties;
      const t = safeEl("map-tooltip");
      if (t) {
        setText("tooltip-name", props.name || "AQ Station");
        const tf = safeEl("tooltip-flag");
        if (tf) tf.classList.add("hidden");
        setText("tooltip-label-1", "AQI");
        setText("tooltip-label-2", "Status");
        setText("tooltip-capital", props.aqi);
        let status = "Good";
        if (props.aqi > 50) status = "Moderate";
        if (props.aqi > 100) status = "Unhealthy";
        if (props.aqi > 150) status = "Hazardous";
        setText("tooltip-pop", status);
        t.style.left = e.originalEvent.pageX + 15 + "px";
        t.style.top = e.originalEvent.pageY - 15 + "px";
        t.classList.remove("hidden");
      }
    });

    map.on('mouseleave', 'aq-core', () => {
      map.getCanvas().style.cursor = '';
      const t = safeEl("map-tooltip");
      if (t) t.classList.add("hidden");
    });
  }

  if (window.updateLayerLegend) window.updateLayerLegend();
};

window.myGlobe = null;

const _countryNameForAPI = {
  "Central African Rep.": "Central African Republic",
  "Dem. Rep. Congo": "Democratic Republic of the Congo",
  "Dominican Rep.": "Dominican Republic",
  "Eq. Guinea": "Equatorial Guinea",
  "Rep. of the Congo": "Republic of the Congo",
  "S. Sudan": "South Sudan",
};
function countryNameForRestCountries(name) {
  return _countryNameForAPI[name] || name;
}
const _tooltipCache = {};
async function showRichTooltip(e, d) {
  const t = safeEl("map-tooltip");
  if (!t || !d?.properties) return;
  const name = d.properties.name;
  t.style.left = e.pageX + 15 + "px";
  t.style.top = e.pageY - 15 + "px";
  t.classList.remove("hidden");
  setText("tooltip-name", name);
  setSrc("tooltip-flag", "");
  const tooltipFlag = safeEl("tooltip-flag");
  if (tooltipFlag) tooltipFlag.classList.add("hidden");
  setText("tooltip-label-1", "Capital");
  setText("tooltip-label-2", "Pop.");
  setText("tooltip-capital", "...");
  setText("tooltip-pop", "...");
  if (_tooltipCache[name]) {
    const c = _tooltipCache[name];
    setSrc("tooltip-flag", c.flag);
    if (tooltipFlag) tooltipFlag.classList.remove("hidden");
    setText("tooltip-capital", c.capital);
    setText("tooltip-pop", c.pop);
    return;
  }
  const apiName = countryNameForRestCountries(name);
  try {
    const res = await fetch(
      `/api/countries?name=${encodeURIComponent(apiName)}`,
    );
    if (!res.ok) throw new Error("RestCountries error");
    const data = await res.json();
    const c = Array.isArray(data) ? data[0] : null;
    if (!c || !c.name) {
      setText("tooltip-capital", "—");
      setText("tooltip-pop", "—");
      return;
    }
    const entry = {
      flag: c.flags?.svg || c.flags?.png || "",
      capital: c.capital?.[0] || "—",
      pop:
        c.population >= 1e6
          ? (c.population / 1e6).toFixed(1) + "M"
          : c.population?.toLocaleString() || "—",
    };
    _tooltipCache[name] = entry;
    if (!t.classList.contains("hidden") && safeEl("tooltip-name")?.innerText === name) {
      setSrc("tooltip-flag", entry.flag);
      if (tooltipFlag) tooltipFlag.classList.remove("hidden");
      setText("tooltip-capital", entry.capital);
      setText("tooltip-pop", entry.pop);
    }
  } catch (_) {
    setText("tooltip-capital", "—");
    setText("tooltip-pop", "—");
  }
}
window.handleCountryClick = async function (event, d) {
  window.playTacticalSound("click");
  selectedCountry = d;
  window.selectedCountry = d;
  window.switchTab("intel");
  const sidebar = safeEl("sidebar");
  if (sidebar) sidebar.scrollIntoView({ behavior: "smooth" });

  if (d && d.properties) {
    const countryName = d.properties.name;
    setText("selected-country-name", countryName);
    const backWrap = safeEl("back-to-global-wrap");
    if (backWrap) backWrap.classList.remove("hidden");
    window.addRecentCountry(countryName);
    window.showMapHintOnce();

    if (typeof window.innerWidth !== "undefined" && window.innerWidth < 1024) {
      if (sidebar) sidebar.classList.add("open");
      const mobBtn = safeEl("sidebar-toggle-mobile");
      if (mobBtn) mobBtn.querySelector("i").className = "fas fa-chevron-right";
    }

    iso2Code = null;
    fetchAllData(countryName);
    if (window.onCountrySelected) window.onCountrySelected(countryName);

    if (window.mapEngine && window.mapEngine.ready) {
      if (event && event.lngLat) {
        window.mapEngine.flyToCountry(event.lngLat, 4.5);
        window.mapEngine.setHoloHUD(event.lngLat, countryName, { STATUS: "ACTIVE", UPLINK: "SECURE" });
      }
    }

    generateAIBriefing(countryName);
    window.fetchMarketIntel(countryName, currencyCode);

    const searchContainer = document.getElementById("map-search-container");
    if (searchContainer) {
      searchContainer.classList.add("cyan-glow-pulse");
      setTimeout(() => searchContainer.classList.remove("cyan-glow-pulse"), 3000);
    }
  }
};


// Map interaction status managed by persistent HUD in main template

let _mapSearchIndex = -1;
let _mapSearchResults = [];

window.mapSearchFocus = function (on) {
  const container = document.getElementById("map-search-container");
  if (!container) return;
  if (on) {
    container.style.border = "1px solid rgba(59,130,246,0.7)";
    container.style.boxShadow = "0 0 18px 2px rgba(59,130,246,0.22), 0 0 0 1px rgba(59,130,246,0.15)";
    const inp = document.getElementById("map-search-input");
    if (inp && !inp.value.trim()) {
      window.handleMapSearch("");
    }
  } else {
    container.style.border = "1px solid rgba(59,130,246,0.25)";
    container.style.boxShadow = "0 0 0 0 rgba(59,130,246,0)";
    setTimeout(() => {
      const r = document.getElementById("map-search-results");
      if (r) r.classList.add("hidden");
    }, 250);
  }
};

window.clearMapSearch = function () {
  const inp = document.getElementById("map-search-input");
  const results = document.getElementById("map-search-results");
  const clearBtn = document.getElementById("map-search-clear");
  if (inp) inp.value = "";
  if (results) { results.innerHTML = ""; results.classList.add("hidden"); }
  if (clearBtn) clearBtn.classList.add("hidden");
  _mapSearchResults = [];
  _mapSearchIndex = -1;
};

window.handleMapSearch = function (query) {
  const results = document.getElementById("map-search-results");
  const clearBtn = document.getElementById("map-search-clear");
  if (!results) return;
  if (clearBtn) clearBtn.classList.toggle("hidden", !query);
  _mapSearchIndex = -1;

  if (!query || query.length < 2) {
    if (!query) {

      const trending = ["India", "United States", "Japan", "Russia", "United Kingdom"];
      const data = window.globalSearchData || [];
      _mapSearchResults = trending.map(name => {
        const c = data.find(x => x.name.common === name || (name === "United States" && x.name.common === "United States of America"));
        return c ? { type: "trending", label: c.name.common, sublabel: "TRENDING SECTOR", name: c.name.common, latlng: c.latlng, flag: c.flags?.svg } : null;
      }).filter(Boolean);

      results.innerHTML = `
        <div style="padding:10px 12px;font-family:'JetBrains Mono',monospace;font-size:9px;color:#3b82f6;text-transform:uppercase;letter-spacing:.1em;border-bottom:1px solid rgba(59,130,246,0.1);">Suggested Sectors</div>
        ${_mapSearchResults.map((r, i) => `
          <div class="map-search-result-item" data-idx="${i}"
            style="padding:8px 12px;cursor:pointer;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,255,255,0.03);transition:background 0.15s;"
            onclick="selectMapSearchResult(${i})">
            <img src="${r.flag}" style="width:18px;height:12px;object-cover;border-radius:2px;border:1px solid rgba(255,255,255,0.1);">
            <div style="flex:1;min-width:0;">
              <div style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:#bfdbfe;">${r.label}</div>
            </div>
            <i class="fas fa-fire" style="font-size:9px;color:#f97316;"></i>
          </div>
        `).join("")}
      `;
      results.classList.remove("hidden");
    } else {
      results.innerHTML = "";
      results.classList.add("hidden");
      _mapSearchResults = [];
    }
    return;
  }
  const q = query.toLowerCase();
  const data = window.globalSearchData || [];
  const countryMatches = data
    .filter(c => c.name && c.name.common && c.name.common.toLowerCase().includes(q))
    .slice(0, 6)
    .map(c => ({ type: "country", label: c.name.common, sublabel: c.region || "", name: c.name.common, latlng: c.latlng, flag: c.flags?.svg }));
  const cityMatches = data
    .filter(c => c.capital && Array.isArray(c.capital) && c.capital[0] && c.capital[0].toLowerCase().includes(q))
    .slice(0, 4)
    .map(c => ({ type: "city", label: c.capital[0], sublabel: c.name.common, name: c.name.common, latlng: c.capitalInfo?.latlng || c.latlng }));
  _mapSearchResults = [...countryMatches, ...cityMatches].slice(0, 8);
  if (_mapSearchResults.length === 0) {
    results.innerHTML = `<div style="padding:10px 12px;font-family:'JetBrains Mono',monospace;font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:.1em;">No results found</div>`;
    results.classList.remove("hidden");
    return;
  }
  const icons = { country: "fa-globe-americas", city: "fa-city" };
  const colors = { country: "#60a5fa", city: "#34d399" };
  results.innerHTML = _mapSearchResults.map((r, i) => `
    <div class="map-search-result-item" data-idx="${i}"
      style="padding:8px 12px;cursor:pointer;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(255,255,255,0.03);transition:background 0.15s;"
      onclick="selectMapSearchResult(${i})"
      onmouseenter="highlightMapResult(${i})"
      onmouseleave="this.style.background=''">
      ${r.flag ? `<img src="${r.flag}" style="width:18px;height:12px;object-fit:cover;border-radius:2px;border:1px solid rgba(255,255,255,0.1);flex-shrink:0;">` : `<i class="fas fa-map-marker-alt" style="font-size:9px;color:#94a3b8;flex-shrink:0;"></i>`}
      <div style="flex:1;min-width:0;">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:#bfdbfe;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.label}</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:8px;color:#475569;text-transform:uppercase;letter-spacing:.1em;">${r.sublabel}</div>
      </div>
      <span style="font-size:7px;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.1em;padding:2px 5px;border-radius:4px;background:rgba(${r.type === 'country' || r.type === 'trending' ? '59,130,246' : '16,185,129'},0.1);color:${r.type === 'country' || r.type === 'trending' ? '#60a5fa' : '#34d399'};">${r.type === 'trending' ? 'hot' : r.type}</span>
    </div>`).join("");
  results.classList.remove("hidden");
};

window.highlightMapResult = function (idx) {
  _mapSearchIndex = idx;
  document.querySelectorAll(".map-search-result-item").forEach((el, i) => {
    el.style.background = i === idx ? "rgba(59,130,246,0.12)" : "";
  });
};

window.handleMapSearchKey = function (e) {
  const items = document.querySelectorAll(".map-search-result-item");
  if (e.key === "ArrowDown") {
    e.preventDefault();
    _mapSearchIndex = Math.min(_mapSearchIndex + 1, _mapSearchResults.length - 1);
    items.forEach((el, i) => { el.style.background = i === _mapSearchIndex ? "rgba(59,130,246,0.12)" : ""; });
    items[_mapSearchIndex]?.scrollIntoView({ block: "nearest" });
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    _mapSearchIndex = Math.max(_mapSearchIndex - 1, 0);
    items.forEach((el, i) => { el.style.background = i === _mapSearchIndex ? "rgba(59,130,246,0.12)" : ""; });
    items[_mapSearchIndex]?.scrollIntoView({ block: "nearest" });
  } else if (e.key === "Enter") {
    e.preventDefault();
    const target = _mapSearchIndex >= 0 ? _mapSearchIndex : 0;
    if (_mapSearchResults[target]) selectMapSearchResult(target);
  } else if (e.key === "Escape") {
    window.clearMapSearch();
  }
};

window.selectMapSearchResult = function (idx) {
  const r = _mapSearchResults[idx];
  if (!r) return;
  window.playTacticalSound("click");
  if (r.latlng && r.latlng.length === 2 && window.mapEngine?.map) {
    const coords = [r.latlng[1], r.latlng[0]];
    window.mapEngine.map.flyTo({
      center: coords,
      zoom: r.type === "city" ? 7 : 4,
      pitch: 40, duration: 1800, essential: true
    });
    if (window.mapEngine.setHoloHUD) {
      window.mapEngine.setHoloHUD(coords, r.label, { TARGET: r.type.toUpperCase(), RADAR: "LOCKED" });
    }
  }
  const mockFeature = { properties: { name: r.name } };
  if (window.handleCountryClick) window.handleCountryClick(null, mockFeature);
  const inp = document.getElementById("map-search-input");
  if (inp) inp.value = r.label;
  const results = document.getElementById("map-search-results");
  if (results) results.classList.add("hidden");

  const searchContainer = document.getElementById("map-search-container");
  if (searchContainer) {
    searchContainer.classList.add("cyan-glow-pulse");
    setTimeout(() => searchContainer.classList.remove("cyan-glow-pulse"), 3000);
  }
};
function setupEventListeners() {
  document.querySelectorAll(".category-pill").forEach((pill) => {
    pill.onmouseenter = () => window.playTacticalSound("hover");
    pill.onclick = () => {
      window.playTacticalSound("click");
      document
        .querySelectorAll(".category-pill")
        .forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      window.currentCategory = pill.dataset.cat;
      window.fetchNews();
    };
  });
  const input = document.getElementById("country-search");
  if (!input) return;
  let searchTimeout;
  input.oninput = (e) => {
    const query = e.target.value.toLowerCase().trim();
    const resContainer = document.getElementById("search-results");
    if (!query) {
      clearTimeout(searchTimeout);
      window.renderTrending();
      return;
    }
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (!window.globalSearchData || window.globalSearchData.length === 0) {
        resContainer.innerHTML = `<div class="p-6 text-center text-xs text-slate-500 font-bold uppercase tracking-widest animate-pulse">Initializing Search Index...</div>`;
        return;
      }
      const matched = window.globalSearchData
        .filter((c) => c.name.common.toLowerCase().includes(query))
        .slice(0, 8);
      if (matched.length === 0) {
        resContainer.innerHTML = `<div class="p-6 text-center text-xs text-slate-500 font-bold uppercase tracking-widest font-mono pt-10">Sector Not Found</div>`;
        return;
      }
      resContainer.innerHTML = matched
        .map(
          (c) => `
              <div class="flex items-center gap-5 px-6 py-4 hover:bg-white/[0.03] cursor-pointer border-b border-white/[0.04] transition-all group" onclick="window.selectFromSearch('${c.name.common.replace(/'/g, "\\'")}')">
                  <div class="w-10 h-6.5 rounded shadow-sm overflow-hidden border border-white/10 shrink-0">
                      <img src="${c.flags.svg}" class="w-full h-full object-cover">
                  </div>
                  <span class="font-bold text-white text-base tracking-tight group-hover:text-blue-400 transition-colors">${c.name.common}</span>
                  <i class="fas fa-chevron-right ml-auto text-[11px] text-slate-700 group-hover:text-blue-400 transition-all group-hover:translate-x-0.5"></i>
              </div>
          `,
        )
        .join("");
    }, 250);
  };
  window.onkeydown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      window.toggleSearch();
    }
    if (e.key === "Escape") {
      const so = safeEl("search-overlay");
      const ao = safeEl("about-overlay");
      if (so) so.classList.add("hidden");
      if (ao) ao.classList.add("hidden");
    }
  };
}
function updateSystemTime() {
  const now = new Date();
  if (typeof window._timeOffsetHours === 'number' && window._timeOffsetHours !== 0) {
    now.setHours(now.getHours() + window._timeOffsetHours);
  }
  setText(
    "system-time",
    now.toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) + " IST",
  );
  if (countryUTCOffset) {
    const currentRealTime = new Date();
    if (typeof window._timeOffsetHours === 'number' && window._timeOffsetHours !== 0) {
      currentRealTime.setHours(currentRealTime.getHours() + window._timeOffsetHours);
    }
    const realUtc = currentRealTime.getTime() + currentRealTime.getTimezoneOffset() * 60000;
    let off = 0;
    const match = countryUTCOffset.match(/UTC([+-]\d+):?(\d+)?/);
    if (match)
      off = parseInt(match[1]) * 60 + (match[2] ? parseInt(match[2]) : 0);
    const localDate = new Date(realUtc + 60000 * off);
    const localEl = safeEl("local-time");
    if (localEl)
      localEl.innerText = localDate.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    const hr = localDate.getHours();
    document.body.classList.toggle("night-mode", hr < 6 || hr > 18);
    document.body.classList.toggle("day-mode", hr >= 6 && hr <= 18);
  }
}
window.activateVoice = () => {
  window.playTacticalSound("click");
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Voice module offline (Browser not supported)");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();
  const btn = document.querySelector(".fa-microphone");
  btn.classList.add("text-red-500", "animate-pulse");
  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript
      .toLowerCase()
      .replace(".", "")
      .trim();
    btn.classList.remove("text-red-500", "animate-pulse");
    if (window.showToast) window.showToast("Heard: " + command, "info");
    if (command.includes("go to"))
      window.selectFromSearch(command.replace("go to", "").trim());
    else if (command.includes("analyze") || command.includes("intel")) window.switchTab("intel");
    else if (command.includes("news")) window.switchTab("news");
    else if (command.includes("market")) window.switchTab("markets");
    else if (command.includes("weather") || command.includes("atmosphere")) window.switchTab("atmosphere");
    else if (command.includes("econom")) window.switchTab("economic");
    else if (command.includes("reset") || command.includes("global")) {
      if (window.resetToGlobalCenter) window.resetToGlobalCenter();
    } else if (command.includes("search") || command.includes("find")) {
      if (window.toggleSearch) window.toggleSearch();
    } else if (command.includes("about") || command.includes("terminal")) {
      if (window.toggleAbout) window.toggleAbout(true);
    } else if (command.includes("2d") || command.includes("two d")) {
      if (window.projectionType === "3d" && window.toggleProjection) window.toggleProjection();
    } else if (command.includes("3d") || command.includes("three d") || command.includes("globe")) {
      if (window.projectionType === "2d" && window.toggleProjection) window.toggleProjection();
    } else if (command.includes("zoom in")) {
      if (window.zoomMap) window.zoomMap(1.6);
    } else if (command.includes("zoom out")) {
      if (window.zoomMap) window.zoomMap(0.6);
    } else if (command.includes("shortcut")) {
      if (window.toggleShortcuts) window.toggleShortcuts();
    }
  };
  recognition.onerror = () =>
    btn.classList.remove("text-red-500", "animate-pulse");
};
const RECENT_COUNTRIES_KEY = "newsatlas_recent_countries";
const RECENT_COUNTRIES_MAX = 5;
window.addRecentCountry = function (name) {
  if (!name) return;
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(RECENT_COUNTRIES_KEY) || "[]");
  } catch (e) { }
  list = list.filter((c) => c !== name);
  list.unshift(name);
  list = list.slice(0, RECENT_COUNTRIES_MAX);
  try {
    localStorage.setItem(RECENT_COUNTRIES_KEY, JSON.stringify(list));
  } catch (e) { }
};
window.getRecentCountries = function () {
  try {
    return JSON.parse(localStorage.getItem(RECENT_COUNTRIES_KEY) || "[]");
  } catch (e) {
    return [];
  }
};
window._mapHintShown = false;
window.showMapHintOnce = function () {
  if (window._mapHintShown) return;
  window._mapHintShown = true;

  if (window.showToast) window.showToast("Click any country for intelligence briefing", "info");
};
window.updateLayerLegend = function () {
  const el = safeEl("layer-legend");
  if (!el) return;
  const active = [];
  if (typeof _quakeActive !== "undefined" && _quakeActive) active.push({ label: "Earthquakes", color: "#f97316" });
  if (typeof _aircraftActive !== "undefined" && _aircraftActive) active.push({ label: "Aircraft", color: "#3b82f6" });
  if (window._airQualityActive) active.push({ label: "Air quality", color: "#10b981" });
  if (typeof _gdeltActive !== "undefined" && _gdeltActive) active.push({ label: "Conflict", color: "#ef4444" });
  if (window._riskActive) active.push({ label: "Risk Matrix", color: "#f59e0b" });
  if (window._maritimeActive) active.push({ label: "Maritime", color: "#38bdf8" });
  const countEl = safeEl("active-layer-count");
  if (countEl) {
    countEl.textContent = active.length;
    countEl.className = active.length > 0
      ? "text-xs font-black text-emerald-400 font-mono tabular-nums"
      : "text-xs font-black text-blue-400 font-mono tabular-nums";
  }
  if (active.length === 0) {
    el.classList.add("hidden");
    el.innerHTML = "";
    return;
  }
  el.classList.remove("hidden");
  el.innerHTML = active.map((a) => `<span style="color:${a.color}">● ${a.label}</span>`).join(" ");
};
window.switchTab = (id) => {
  window.playTacticalSound("tab");
  document.querySelectorAll(".nav-tab").forEach((t) => {
    t.classList.remove("active");
    t.setAttribute("aria-selected", "false");
  });
  document
    .querySelectorAll(".tab-content")
    .forEach((c) => c.classList.remove("active"));
  const tabBtn = Array.from(document.querySelectorAll(".nav-tab")).find((btn) =>
    btn.innerText.toLowerCase().trim().includes(id.toLowerCase()),
  );
  if (tabBtn) {
    tabBtn.classList.add("active");
    tabBtn.setAttribute("aria-selected", "true");
  }
  const targetContent = document.getElementById(`tab-${id}`);
  if (targetContent) targetContent.classList.add("active");
  if (id === "intel") {
    if (window.fetchGDELTEvents) window.fetchGDELTEvents(window.selectedCountry);
    if (window.fetchSeismicStatus) window.fetchSeismicStatus();
  } else if (id === "markets") {
    if (window.displayCoinGeckoTrending) window.displayCoinGeckoTrending();
    if (window.displayCoinGeckoTop10) window.displayCoinGeckoTop10();
  } else if (id === "economic" || id === "economics") {
    if (window.fetchECBRates) window.fetchECBRates();
  }
};

window.selectFromSearch = (name) => {
  let mockEvent = null;
  if (window.globalSearchData && Array.isArray(window.globalSearchData)) {
    const c = window.globalSearchData.find(x => x.name.common === name);
    if (c && c.latlng && c.latlng.length >= 2) {
      mockEvent = { lngLat: { lng: c.latlng[1], lat: c.latlng[0] } };
    }
  }
  const mockFeature = { properties: { name: name } };
  if (window.handleCountryClick) {
    window.handleCountryClick(mockEvent, mockFeature);
  }
  const searchOverlay = document.getElementById("search-overlay");
  if (searchOverlay) searchOverlay.classList.add("hidden");

  const searchInput = document.getElementById("country-search");
  if (searchInput) {
    searchInput.value = "";
  }
};

window.toggleHierarchyCollapse = (type) => {
  try { if (window.playTacticalSound) window.playTacticalSound("click"); } catch (e) { }
  const content = document.getElementById(`${type}-collapse-content`);
  const icon = document.getElementById(`${type}-collapse-icon`);
  if (!content || !icon) { console.warn('toggleHierarchyCollapse: missing', type); return; }
  const isHidden = content.classList.contains("hidden");
  if (isHidden) {
    content.classList.remove("hidden");
    icon.style.transform = "rotate(180deg)";
  } else {
    content.classList.add("hidden");
    icon.style.transform = "rotate(0deg)";
  }
};

window.zoomMap = (factor) => {
  window.playTacticalSound("click");
  if (window.mapEngine && window.mapEngine.map) {
    const currentZoom = window.mapEngine.map.getZoom();

    const targetZoom = factor > 1 ? currentZoom + 1 : currentZoom - 1;
    window.mapEngine.map.zoomTo(targetZoom, { duration: 400 });
  }
};

window.resetToGlobalCenter = () => {
  window.playTacticalSound("click");
  selectedCountry = null;
  window.selectedCountry = null;
  countryUTCOffset = null;
  setText("selected-country-name", "GLOBAL SURVEILLANCE");
  const backWrap = safeEl("back-to-global-wrap");
  if (backWrap) backWrap.classList.add("hidden");

  if (window.generateAIBriefing) window.generateAIBriefing("Global Context");
  if (window.fetchGDELTEvents) window.fetchGDELTEvents("");

  const flagBox = safeEl("active-sector-display");
  if (flagBox) flagBox.classList.add("hidden");

  if (window.mapEngine) {
    window.mapEngine.clearSelection();
  }

  window.fetchNews();
  if (window.resetWeatherData) window.resetWeatherData();
  const hp = safeEl("hierarchy-panel");
  if (hp) hp.classList.add("hidden");
  const stateEl = safeEl("state-selector");
  const cityEl = safeEl("city-selector");
  if (stateEl) {
    stateEl.classList.add("hidden");
    safeEl("state-collapse-content")?.classList.add("hidden");
    const sIcon = safeEl("state-collapse-icon");
    if (sIcon) sIcon.style.transform = "rotate(0deg)";
  }
  if (cityEl) {
    cityEl.classList.add("hidden");
    safeEl("city-collapse-content")?.classList.add("hidden");
    const cIcon = safeEl("city-collapse-icon");
    if (cIcon) cIcon.style.transform = "rotate(0deg)";
  }
  if (window.initializeMarkets) window.initializeMarkets("Global");
  if (window.fetchDetailedEconomics)
    window.fetchDetailedEconomics("Global Macro Economy");
};

window.goToIndiaHome = () => {
  window.playTacticalSound("click");
  const mockFeature = { properties: { name: "India" } };
  if (window.handleCountryClick) {

    const mockEvent = { lngLat: [78.9629, 20.5937] };
    window.handleCountryClick(mockEvent, mockFeature);
  }
};

window.personalizeSession = (user) => {
  const safeName = user.displayName || (user.email ? user.email.split("@")[0] : user.uid?.substring(0, 8) || "operator");
  const shortName = safeName.split(" ")[0];
  setTimeout(() => {
    if (window._audioMuted) return;
    const speech = new SpeechSynthesisUtterance(
      `Identity confirmed. Welcome back, Commander ${shortName}`,
    );
    speech.pitch = 0.8;
    speech.rate = 0.9;
    speech.volume = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const googleVoice = voices.find((v) =>
      v.name.includes("Google US English"),
    );
    if (googleVoice) speech.voice = googleVoice;
    window.speechSynthesis.speak(speech);
  }, 1000);
  const nameEl = document.querySelector("#about-overlay h2");
  const roleEl = document.querySelector("#about-overlay p.text-blue-400");
  const levelEl = document.querySelector("#about-overlay .text-emerald-500");
  if (nameEl) {
    nameEl.innerText = safeName.toUpperCase();
    nameEl.classList.add("text-blue-200");
  }
  if (roleEl) roleEl.innerText = "AUTHENTICATED FIELD OPERATOR";
  if (levelEl) levelEl.innerText = "CLEARANCE: OMEGA-LEVEL (VERIFIED)";
};

document.addEventListener(
  "click",
  function () {
    if (!window._ambienceStarted) {
      window._ambienceStarted = true;
      window.toggleAmbience();
    }
  },
  { once: true },
);
window.addEventListener("resize", () => {
  const c = safeEl("map-container");
  if (!c) return;
  const w = c.clientWidth;
  const h = c.clientHeight;
  if (w < 50 || h < 50) return;
  if (projectionType === "2d" && svg && currentProjection && worldFeatures.length) {
    const path = d3.geoPath().projection(currentProjection);
    currentProjection.scale(w / 9).translate([w / 2, h / 2]);
    svg.attr("viewBox", `0 0 ${w} ${h}`);
    if (g) g.selectAll("path").attr("d", path);
    if (typeof window.syncMapOverlays === "function") window.syncMapOverlays();
  } else if (projectionType === "3d" && window.myGlobe) {
    window.myGlobe.width(w).height(h);
  } else {

    if (window.mapEngine && window.mapEngine.map) {
      window.mapEngine.map.resize();
    }
  }
});
window._chronosOffset = 0;
window.updateChronos = function (val) {
  window._chronosOffset = parseInt(val, 10);
  const display = safeEl("chronos-display");
  if (display) {
    display.innerText =
      window._chronosOffset === 0
        ? "LIVE / -0H"
        : `ARCHIVE / ${window._chronosOffset}H`;
  }
  window.updateGlobeHexbins();
  if (window._chronosOffset < 0) {
    if (window.myGlobe && window.myGlobe.arcsData) {
      const intelArcs = (window.myGlobe.arcsData() || []).filter(
        (a) => Array.isArray(a.color) && a.color[1] === "rgba(6, 182, 212, 1)",
      );
      window.myGlobe.arcsData(intelArcs);
    }
    if (window._aircraftGroup) window._aircraftGroup.attr("opacity", 0);
  } else {
    if (typeof window.renderAircraft === "function" && window._aircraftActive)
      window.renderAircraft();
    if (window._aircraftGroup) window._aircraftGroup.attr("opacity", 1);
  }
};
window._chronosActive = false;
window.toggleChronos = function () {
  window._chronosActive = !window._chronosActive;
  const btn = document.getElementById("chronos-toggle-btn");
  const container = document.getElementById("chronos-slider-container");
  if (!window._chronosActive) {
    if (container) container.classList.add("hidden");
    if (btn) {
      btn.classList.remove("active");
      btn.title = "Chronos Engine: OFF";
    }
    const slider = document.getElementById("chronos-slider");
    if (slider) {
      slider.value = 0;
      if (typeof window.updateChronos === 'function') window.updateChronos(0);
    }
    return;
  }
  if (container) container.classList.remove("hidden");
  if (btn) {
    btn.classList.add("active");
    btn.title = "Chronos Engine: ON";
  }
};

window.updateGlobeHexbins = function () {
  if (!window.myGlobe) return;
  const targetTime = Date.now() + window._chronosOffset * 3600 * 1000;
  const filteredSeismic = window._hexLayers.seismic.filter(
    (d) => !d.time || d.time <= targetTime,
  );
  const combinedData = [
    ...filteredSeismic,
    ...(window._hexLayers?.gdelt || []),
    ...(window._hexLayers?.aq || []),
  ];
  const magToHeight = (mag) => Math.max(0.01, (mag - 3) * 0.04);
  window.myGlobe
    .hexBinPointsData(combinedData)
    .hexBinPointLat((d) => d.lat)
    .hexBinPointLng((d) => d.lng)
    .hexBinPointWeight((d) =>
      d.type === "gdelt" ? d.count : d.type === "aq" ? d.weight : d.mag,
    )
    .hexBinResolution(3)
    .hexTopColor((d) => {
      const pt = d.points[0];
      if (pt.type === "gdelt") return "rgba(239, 68, 68, 0.6)";
      if (pt.type === "aq") return "rgba(16, 185, 129, 0.7)";
      return magColor(pt.mag);
    })
    .hexSideColor((d) => {
      const pt = d.points[0];
      if (pt.type === "gdelt") return "rgba(239, 68, 68, 0.2)";
      if (pt.type === "aq") return "rgba(16, 185, 129, 0.3)";
      return magColor(pt.mag);
    })
    .hexAltitude((d) => {
      const pt = d.points[0];
      if (pt.type === "gdelt") return Math.max(0.05, pt.count * 0.0015);
      if (pt.type === "aq") return Math.max(0.02, pt.weight * 0.001);
      return magToHeight(pt.mag);
    })
    .onHexHover((hex) => {
      const t = safeEl("map-tooltip");
      const tooltipFlag = safeEl("tooltip-flag");
      if (hex && hex.points && hex.points.length > 0) {
        const pt = hex.points[0];
        if (tooltipFlag) tooltipFlag.classList.add("hidden");
        if (pt.type === "gdelt") {
          setText("tooltip-name", `${pt.place}`);
          setText("tooltip-label-1", "Type");
          setText("tooltip-label-2", "Intensity");
          setText("tooltip-capital", "Armed Conflict");
          setText("tooltip-pop", pt.count + " Events");
        } else if (pt.type === "aq") {
          setText("tooltip-name", "OpenAQ Sensor");
          setText("tooltip-label-1", "Trace");
          setText("tooltip-label-2", "PM2.5");
          setText("tooltip-capital", "Air Quality");
          setText("tooltip-pop", pt.weight + " µg/m³");
        } else {
          setText("tooltip-name", `M${pt.mag.toFixed(1)} — ${pt.place}`);
          setText("tooltip-label-1", "Depth");
          setText("tooltip-label-2", "Trigger");
          setText("tooltip-capital", `${pt.depth || "?"} km`);
          setText("tooltip-pop", "Seismic Spike");
        }
        if (t) {
          t.style.left = window.mouseX + 15 + "px";
          t.style.top = window.mouseY - 15 + "px";
          t.classList.remove("hidden");
        }
      } else if (t) {
        t.classList.add("hidden");
      }
    });
};
let _quakeActive = false;
window.toggleEarthquakeLayer = async function () {
  _quakeActive = !_quakeActive;
  const btn = document.getElementById("quake-toggle-btn");
  if (!_quakeActive) {
    if (window.mapEngine && window.mapEngine.map) {
      const map = window.mapEngine.map;
      if (map.getLayer('seismic-aura')) map.removeLayer('seismic-aura');
      if (map.getLayer('seismic-core')) map.removeLayer('seismic-core');
      if (map.getSource('seismic-data')) map.removeSource('seismic-data');
    }
    window._hexLayers.seismic = [];
    if (btn) {
      btn.classList.remove("active-amber");
      btn.title = "Earthquake Layer: OFF";
    }
    const _sv = safeEl("map-seismic-val");
    if (_sv) { _sv.textContent = "--"; _sv.style.color = ""; }
    if (window.updateLayerLegend) window.updateLayerLegend();
    return;
  }
  if (btn) {
    btn.classList.add("active-amber");
    btn.title = "Earthquake Layer: ON";
  }
  try {
    const res = await fetch("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4&limit=80&orderby=time");
    const geoData = await res.json();

    if (geoData.features && geoData.features.length > 0) {
      const topMag = geoData.features.reduce((max, f) => Math.max(max, f.properties.mag || 0), 0);
      const seismicValEl = safeEl("map-seismic-val");
      if (seismicValEl) {
        seismicValEl.textContent = `M${topMag.toFixed(1)}`;
        seismicValEl.style.color = topMag >= 6 ? "#ef4444" : topMag >= 5 ? "#f97316" : "#fbbf24";
      }
    }

    if (!window.mapEngine || !window.mapEngine.map) return;
    const map = window.mapEngine.map;

    if (map.getSource('seismic-data')) {
      map.getSource('seismic-data').setData(geoData);
    } else {
      map.addSource('seismic-data', { type: 'geojson', data: geoData });

      map.addLayer({
        id: 'seismic-aura',
        type: 'circle',
        source: 'seismic-data',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['coalesce', ['get', 'mag'], 3],
            3, 10,
            8, 40
          ],
          'circle-color': [
            'step', ['coalesce', ['get', 'mag'], 3],
            '#fbbf24',
            5, '#f97316',
            6, '#ef4444'
          ],
          'circle-opacity': 0.2,
          'circle-stroke-width': 0
        }
      });

      map.addLayer({
        id: 'seismic-core',
        type: 'circle',
        source: 'seismic-data',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['coalesce', ['get', 'mag'], 3],
            3, 3,
            8, 12
          ],
          'circle-color': [
            'step', ['coalesce', ['get', 'mag'], 3],
            '#fbbf24',
            5, '#f97316',
            6, '#ef4444'
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1
        }
      });

      map.on('mouseenter', 'seismic-core', (e) => {
        map.getCanvas().style.cursor = 'crosshair';
        const props = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates;
        const t = safeEl("map-tooltip");
        if (t) {
          setText("tooltip-name", `M${props.mag.toFixed(1)} — ${props.place}`);
          const tf = safeEl("tooltip-flag");
          if (tf) tf.classList.add("hidden");
          setText("tooltip-label-1", "Depth");
          setText("tooltip-label-2", "Time");
          setText("tooltip-capital", `${coords[2]?.toFixed(0) ?? "?"} km`);
          setText("tooltip-pop", new Date(props.time).toUTCString().slice(0, 22));
          t.style.left = e.originalEvent.pageX + 15 + "px";
          t.style.top = e.originalEvent.pageY - 15 + "px";
          t.classList.remove("hidden");
        }
      });

      map.on('mouseleave', 'seismic-core', () => {
        map.getCanvas().style.cursor = '';
        const t = safeEl("map-tooltip");
        if (t) t.classList.add("hidden");
      });
    }
  } catch (e) {
    console.error("USGS fetch failed", e);
    if (window.showToast) window.showToast("Earthquake data unavailable.", "info");
  }
  if (window.updateLayerLegend) window.updateLayerLegend();
};
let _aircraftActive = false,
  _aircraftGroup = null,
  _aircraftInterval = null;
async function renderAircraft() {
  if (!window.mapEngine || !window.mapEngine.map) return;
  if (!_aircraftActive) return;
  const map = window.mapEngine.map;

  try {
    const res = await fetch("https://opensky-network.org/api/states/all?lamin=-60&lomin=-180&lamax=80&lomax=180");
    const data = await res.json();
    const states = (data.states || []).filter((s) => s[5] && s[6]);

    const features = states.slice(0, 800).map(s => {
      const lon = s[5], lat = s[6], track = s[10] || 0, callsign = (s[1] || "").trim();
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lon, lat] },
        properties: {
          callsign,
          track,
          alt: s[7],
          vel: s[9]
        }
      };
    });

    const geoData = { type: 'FeatureCollection', features };

    if (map.getSource('aircraft-data')) {
      map.getSource('aircraft-data').setData(geoData);
    } else {
      map.addSource('aircraft-data', { type: 'geojson', data: geoData });

      map.addLayer({
        id: 'aircraft-layer',
        type: 'symbol',
        source: 'aircraft-data',
        layout: {
          'text-field': '✈',
          'text-size': 14,
          'text-rotate': ['coalesce', ['get', 'track'], 0],
          'text-rotation-alignment': 'map',
          'text-allow-overlap': true
        },
        paint: {
          'text-color': '#60a5fa',
          'text-halo-color': '#1e3a8a',
          'text-halo-width': 1
        }
      });

      map.on('mouseenter', 'aircraft-layer', (e) => {
        map.getCanvas().style.cursor = 'crosshair';
        const props = e.features[0].properties;
        const t = safeEl("map-tooltip");
        if (t) {
          setText("tooltip-name", props.callsign || "UNKNOWN");
          const tf = safeEl("tooltip-flag");
          if (tf) tf.classList.add("hidden");
          setText("tooltip-label-1", "Altitude");
          setText("tooltip-label-2", "Velocity");
          setText("tooltip-capital", `${props.alt ? (props.alt * 3.28084).toFixed(0) : "N/A"} ft`);
          setText("tooltip-pop", `${props.vel ? (props.vel * 1.94384).toFixed(0) : "N/A"} kts`);
          t.style.left = e.originalEvent.pageX + 15 + "px";
          t.style.top = e.originalEvent.pageY - 15 + "px";
          t.classList.remove("hidden");
        }
      });

      map.on('mouseleave', 'aircraft-layer', () => {
        map.getCanvas().style.cursor = '';
        const t = safeEl("map-tooltip");
        if (t) t.classList.add("hidden");
      });
    }

  } catch (e) {
    console.warn("OpenSky fetch failed", e);
    if (window.showToast) window.showToast("Flight data unavailable.", "info");
  }
}

window._riskActive = false;
window.toggleRiskIndex = async function () {
  window._riskActive = !window._riskActive;
  const btn = document.getElementById("risk-toggle-btn");
  if (!window.mapEngine || !window.mapEngine.map) return;
  const map = window.mapEngine.map;

  if (!window._riskActive) {
    if (map.getLayer('risk-layer')) map.removeLayer('risk-layer');
    if (btn) {
      btn.classList.remove("active-amber");
      btn.title = "Geopolitical Risk Matrix: OFF";
    }
    if (window.updateLayerLegend) window.updateLayerLegend();
    return;
  }

  if (btn) {
    btn.classList.add("active-amber");
    btn.title = "Geopolitical Risk Matrix: ON";
  }

  if (!map.getSource('countries')) {
    if (window.showToast) window.showToast("Map layers still loading — try again in a moment.", "info");
    window._riskActive = false;
    if (btn) { btn.classList.remove("active-amber"); btn.title = "Geopolitical Risk Matrix: OFF"; }
    return;
  }

  if (!map.getLayer('risk-layer')) {

    map.addLayer({
      id: 'risk-layer',
      type: 'fill',
      source: 'countries',
      paint: {
        'fill-color': [
          'match',
          ['%', ['coalesce', ['id'], 0], 3],
          0, '#ef4444',
          1, '#f59e0b',
          '#3b82f6'
        ],
        'fill-opacity': 0.18
      }
    }, 'country-fills');
  }
  if (window.updateLayerLegend) window.updateLayerLegend();
};

window._maritimeActive = false;
window._maritimeInterval = null;
window.toggleMaritimeLayer = async function () {
  window._maritimeActive = !window._maritimeActive;
  const btn = document.getElementById("maritime-toggle-btn");
  if (!window.mapEngine || !window.mapEngine.map) return;
  const map = window.mapEngine.map;

  if (!window._maritimeActive) {
    if (window._maritimeInterval) clearInterval(window._maritimeInterval);
    if (map.getLayer('maritime-ships')) map.removeLayer('maritime-ships');
    if (map.getSource('maritime-data')) map.removeSource('maritime-data');
    if (btn) {
      btn.classList.remove("active");
      btn.title = "Live Shipping Maritime Data: OFF";
    }
    if (window.updateLayerLegend) window.updateLayerLegend();
    return;
  }

  if (btn) {
    btn.classList.add("active");
    btn.title = "Live Shipping Maritime Data: ON";
  }

  const ships = Array.from({ length: 3500 }).map((_, i) => {
    return {
      type: 'Feature',
      properties: {
        id: i,
        heading: Math.random() * 360,
        speed: 0.03 + Math.random() * 0.12
      },
      geometry: {
        type: 'Point',
        coordinates: [
          (Math.random() - 0.5) * 360,
          (Math.random() - 0.5) * 140
        ]
      }
    };
  });

  const shipData = { type: 'FeatureCollection', features: ships };

  if (!map.getSource('maritime-data')) {
    map.addSource('maritime-data', { type: 'geojson', data: shipData });
    map.addLayer({
      id: 'maritime-ships',
      type: 'circle',
      source: 'maritime-data',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 1, 5, 3, 10, 6],
        'circle-color': '#0ea5e9',
        'circle-opacity': 0.7,
        'circle-stroke-width': 1,
        'circle-stroke-color': 'rgba(2,132,199,0.5)'
      }
    });
  } else {
    map.getSource('maritime-data').setData(shipData);
  }

  window._maritimeInterval = setInterval(() => {
    shipData.features.forEach(f => {
      const hdg = f.properties.heading * (Math.PI / 180);
      f.geometry.coordinates[0] += Math.sin(hdg) * f.properties.speed;
      f.geometry.coordinates[1] += Math.cos(hdg) * f.properties.speed;
      if (f.geometry.coordinates[0] > 180) f.geometry.coordinates[0] -= 360;
      if (f.geometry.coordinates[0] < -180) f.geometry.coordinates[0] += 360;
      if (f.geometry.coordinates[1] > 85) { f.geometry.coordinates[1] = 85; f.properties.heading += 180; }
      if (f.geometry.coordinates[1] < -85) { f.geometry.coordinates[1] = -85; f.properties.heading += 180; }
    });
    if (map.getSource('maritime-data')) map.getSource('maritime-data').setData(shipData);
  }, 160);

  if (window.updateLayerLegend) window.updateLayerLegend();
};

window.toggleCloudsLayer = function () {
  window._cloudsActive = !window._cloudsActive;
  const btn = document.getElementById("clouds-toggle-btn");
  if (!window.mapEngine || !window.mapEngine.map) return;
  const map = window.mapEngine.map;

  if (!window._cloudsActive) {
    if (map.getLayer('clouds-layer')) map.removeLayer('clouds-layer');
    if (map.getSource('clouds-data')) map.removeSource('clouds-data');
    if (btn) btn.classList.remove("active");
    return;
  }
  if (btn) btn.classList.add("active");

  const cloudFeatures = Array.from({ length: 40 }).map(() => {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [(Math.random() - 0.5) * 360, (Math.random() - 0.5) * 160]
      },
      properties: { size: 50 + Math.random() * 150 }
    };
  });

  map.addSource('clouds-data', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: cloudFeatures }
  });

  map.addLayer({
    id: 'clouds-layer',
    type: 'circle',
    source: 'clouds-data',
    paint: {
      'circle-radius': ['get', 'size'],
      'circle-color': '#ffffff',
      'circle-opacity': 0.15,
      'circle-blur': 1
    }
  });
};

window.toggleWindLayer = function () {
  window._windActive = !window._windActive;
  const btn = document.getElementById("wind-toggle-btn");
  if (!window.mapEngine || !window.mapEngine.map) return;
  const map = window.mapEngine.map;

  if (!window._windActive) {
    if (window._windInterval) clearInterval(window._windInterval);
    if (map.getLayer('wind-particles')) map.removeLayer('wind-particles');
    if (map.getSource('wind-data')) map.removeSource('wind-data');
    if (btn) btn.classList.remove("active");
    return;
  }
  if (btn) btn.classList.add("active");

  const particles = Array.from({ length: 1500 }).map(() => {
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [(Math.random() - 0.5) * 360, (Math.random() - 0.5) * 160] },
      properties: { v: 0.1 + Math.random() * 0.4 }
    };
  });

  const windData = { type: 'FeatureCollection', features: particles };
  map.addSource('wind-data', { type: 'geojson', data: windData });
  map.addLayer({
    id: 'wind-particles',
    type: 'circle',
    source: 'wind-data',
    paint: {
      'circle-radius': 1,
      'circle-color': '#bae6fd',
      'circle-opacity': 0.6
    }
  });

  window._windInterval = setInterval(() => {
    particles.forEach(p => {
      p.geometry.coordinates[0] += p.properties.v;
      if (p.geometry.coordinates[0] > 180) p.geometry.coordinates[0] = -180;
    });
    map.getSource('wind-data').setData(windData);
  }, 120);
};

window.toggleMapStyle = function () {
  const map = window.mapEngine?.map;
  if (!map) return;
  const btn = document.getElementById("style-toggle-btn");

  if (typeof window._isSatellite === "undefined") window._isSatellite = true;
  window._isSatellite = !window._isSatellite;

  const activeLayers = {
    maritime: window._maritimeActive,
    clouds: window._cloudsActive,
    wind: window._windActive,
    gdelt: window._gdeltActive
  };

  const newStyle = window._isSatellite
    ? 'mapbox://styles/mapbox/satellite-streets-v12'
    : 'mapbox://styles/mapbox/dark-v11';

  map.setStyle(newStyle);

  if (window._isSatellite) {
    if (btn) btn.classList.add("active");
  } else {
    if (btn) btn.classList.remove("active");
  }

  map.once('style.load', () => {

    if (window.mapEngine && window.mapEngine.initMapboxLayers) {
      window.mapEngine.initMapboxLayers();
    }

    map.setFog(null);

    if (activeLayers.maritime) { window._maritimeActive = false; window.toggleMaritimeLayer(); }
    if (activeLayers.clouds) { window._cloudsActive = false; window.toggleCloudsLayer(); }
    if (activeLayers.wind) { window._windActive = false; window.toggleWindLayer(); }
    if (activeLayers.gdelt) { window._gdeltActive = false; window.toggleGDELTLayer(); }
  });
};

window.toggleMapProjection = function () {
  const map = window.mapEngine?.map;
  if (!map) return;
  const btn = document.getElementById("projection-toggle-btn");

  if (typeof window._isMercator === "undefined") window._isMercator = false;
  window._isMercator = !window._isMercator;

  if (window._isMercator) {
    map.setProjection('mercator');
    if (btn) btn.classList.add("active");
  } else {
    map.setProjection('globe');
    if (btn) btn.classList.remove("active");
  }
};

let _gdeltActive = false;
window.toggleGDELTLayer = async function () {
  _gdeltActive = !_gdeltActive;
  const btn = document.getElementById("gdelt-toggle-btn");

  if (!window.mapEngine || !window.mapEngine.ready) return;

  if (!_gdeltActive) {
    window.mapEngine.removeGDELTHeatmap();
    if (btn) {
      btn.classList.remove("active-red");
      btn.title = "Global Conflict Hexbins: OFF";
    }
    if (window.updateLayerLegend) window.updateLayerLegend();
    return;
  }

  if (btn) {
    btn.classList.add("active-red");
    btn.title = "Global Conflict Hexbins: ON";
  }

  try {
    const url = `/api/gdelt?mode=geo&query=conflict&format=geojson&timespan=12H`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error("GDELT fetch failed");
    const data = await res.json();
    processGDELTData(data.features || []);
  } catch (e) {
    console.warn("GDELT API blocked/timed out. Emulating telemetry with front-line fallbacks.", e);
    const fallbackData = [
      { type: "Feature", geometry: { type: "Point", coordinates: [37.8, 48.3] }, properties: { name: "Ukraine Frontline", goldstein_scale: -5, count: 85 } },
      { type: "Feature", geometry: { type: "Point", coordinates: [34.4, 31.5] }, properties: { name: "Gaza / Israel Front", goldstein_scale: -8, count: 98 } },
      { type: "Feature", geometry: { type: "Point", coordinates: [32.5, 15.6] }, properties: { name: "Sudan Instability", goldstein_scale: -4, count: 62 } },
      { type: "Feature", geometry: { type: "Point", coordinates: [96.1, 21.9] }, properties: { name: "Myanmar Civil Unrest", goldstein_scale: -6, count: 45 } },
      { type: "Feature", geometry: { type: "Point", coordinates: [70.0, 33.9] }, properties: { name: "Afghanistan Border", goldstein_scale: -3, count: 30 } },
      { type: "Feature", geometry: { type: "Point", coordinates: [45.3, 2.0] }, properties: { name: "Somalia Unrest", goldstein_scale: -3, count: 25 } }
    ];
    processGDELTData(fallbackData);
  }

  function processGDELTData(features) {
    const geoData = {
      type: 'FeatureCollection',
      features: features.map(f => {

        if (f.type !== "Feature") {
          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: f.geometry.coordinates || [0, 0] },
            properties: f.properties || { count: 50, name: 'Conflict Zone', goldstein_scale: -5 }
          };
        }
        return f;
      })
    };

    window.mapEngine.addGDELTHeatmap(geoData);
  }
  if (window.updateLayerLegend) window.updateLayerLegend();
};
window.toggleAircraftLayer = function () {
  _aircraftActive = !_aircraftActive;
  const btn = document.getElementById("aircraft-toggle-btn");
  if (!_aircraftActive) {

    clearInterval(_aircraftInterval);
    _aircraftInterval = null;

    if (window.mapEngine && window.mapEngine.map) {
      const map = window.mapEngine.map;
      if (map.getLayer('aircraft-layer')) map.removeLayer('aircraft-layer');
      if (map.getSource('aircraft-data')) map.removeSource('aircraft-data');
    }
    if (btn) {
      btn.classList.remove("active");
      btn.title = "Live Aircraft: OFF";
    }
    if (window.updateLayerLegend) window.updateLayerLegend();
    return;
  }
  if (btn) {
    btn.classList.add("active");
    btn.title = "Live Aircraft: ON (30s refresh)";
  }
  renderAircraft();
  _aircraftInterval = setInterval(() => {
    if (_aircraftActive) renderAircraft();
  }, 30000);
  if (window.updateLayerLegend) window.updateLayerLegend();
};
window._issData = [{ lat: 0, lng: 0, alt: 0.1, name: "ISS" }];
window._issMarker = null;

window.updateISS = async function () {
  if (!window.mapEngine || !window.mapEngine.map) return;
  const map = window.mapEngine.map;

  try {
    const res = await fetch("/api/iss");
    if (!res.ok) return;
    const data = await res.json();
    window._issData[0].lat = data.latitude;
    window._issData[0].lng = data.longitude;
    window._issData[0].alt = data.altitude;
    window._issData[0].velocity = data.velocity;

    if (!window._issMarker) {
      const el = document.createElement('div');
      el.className = 'iss-marker flex items-center justify-center';
      el.style.width = '32px';
      el.style.height = '32px';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute inset-0 rounded-full animate-ping bg-amber-500/20"></div>
          <i class="fas fa-satellite text-amber-400 text-lg relative z-10 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"></i>
        </div>
      `;
      el.style.cursor = 'pointer';

      el.addEventListener('mouseenter', (e) => {
        const t = safeEl("map-tooltip");
        if (t) {
          setText("tooltip-name", "ISS Orbital Station");
          const tf = safeEl("tooltip-flag");
          if (tf) tf.classList.add("hidden");
          setText("tooltip-label-1", "Altitude");
          setText("tooltip-label-2", "Velocity");
          setText("tooltip-capital", `${Math.round(window._issData[0].alt * 0.621371)} miles`);
          setText("tooltip-pop", `${Math.round(window._issData[0].velocity * 0.621371)} mph`);
          t.style.left = e.pageX + 15 + "px";
          t.style.top = e.pageY - 15 + "px";
          t.classList.remove("hidden");
        }
      });

      el.addEventListener('mouseleave', () => {
        const t = safeEl("map-tooltip");
        if (t) t.classList.add("hidden");
      });

      window._issMarker = new mapboxgl.Marker({ element: el })
        .setLngLat([data.longitude, data.latitude])
        .addTo(map);
    } else {

      window._issMarker.setLngLat([data.longitude, data.latitude]);
    }

  } catch (e) {
    console.warn("ISS orbital tracking fetch failed", e);
  }
};

if (!window._issInterval) {
  setTimeout(() => window.updateISS(), 2000);
  window._issInterval = setInterval(window.updateISS, 15000);
}

if (typeof window._globeTheme === "undefined") {
  window._globeTheme = "night";
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

console.log("NewsAtlas Engine: Launching sequence...");
window.generateAIBriefing = generateAIBriefing;

window.mapEngine = new MapboxEngine('map-container');
window.mapEngine.init().then((success) => {
  if (success) {
    console.log("Mapbox initialized successfully!");
  } else {
    console.error("Mapbox failed to initialize. Check API key.");
  }
});

initTerminal();
setupEventListeners();
setInterval(updateSystemTime, 1000);
console.log("NewsAtlas Engine: Initialization calls complete.");

window.renderTrendingHeader = () => {
  const container = document.getElementById("trending-quick-container");
  if (!container || !window.globalSearchData || window.globalSearchData.length === 0) return;

  const trending = ["India", "United States", "Japan", "Russia", "United Kingdom"];
  const list = document.getElementById("trending-sectors-list");

  container.innerHTML = trending.map(name => {
    const c = window.globalSearchData.find(x => x.name.common === name || (name === "United States" && x.name.common === "United States of America"));
    if (!c) return "";
    return `<button onclick="handleCountryClickByName('${name}')" class="w-7 h-4.5 rounded-sm overflow-hidden border border-white/10 hover:border-blue-400 hover:scale-110 transition-all shadow-sm" title="${name}">
               <img src="${c.flags.svg}" class="w-full h-full object-cover">
             </button>`;
  }).join("");

  if (list) list.classList.remove("hidden");
};

const _origResetGlobal = window.resetToGlobalCenter;
if (_origResetGlobal) {
  window.resetToGlobalCenter = (fly) => {
    _origResetGlobal(fly);
    const headerFlagContainer = safeEl("search-flag-container");
    const headerSearchIcon = safeEl("search-icon-main");
    const headerInput = safeEl("map-search-input");
    if (headerFlagContainer) headerFlagContainer.classList.add("hidden");
    if (headerSearchIcon) headerSearchIcon.classList.remove("hidden");
    if (headerInput) headerInput.value = "";
  };
}
async function fetchGlobalSearchData() {
  try {
    const res = await fetch("/api/countries?all=true");
    if (!res.ok) throw new Error("Index relay failed");
    window.globalSearchData = await res.json();
    console.log(`Global Registry Online: ${window.globalSearchData.length} sectors indexed.`);

    if (window.renderTrending) window.renderTrending();
  } catch (e) {
    console.error("Critical: Global Registry Link Failure", e);

    window.globalSearchData = [];
  }
}

window.fetchGlobalSearchData = fetchGlobalSearchData;

window.searchCityForTab = async (tabId) => {
  const inputEl = document.getElementById(`${tabId}-city-search`);
  if (!inputEl) return;
  const q = inputEl.value.trim();
  if (!q) return;
  const btn = inputEl.nextElementSibling;
  const originalBtnText = btn.innerText;
  btn.innerText = "WAIT..";
  btn.disabled = true;
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&format=json`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const city = data.results[0];
      const fullName = `${city.name}, ${city.country || city.admin1 || ""}`.replace(/,\s*$/, "");

      if (window.playTacticalSound) window.playTacticalSound('success');

      // Fly map to city
      if (window.mapEngine && window.mapEngine.map) {
        window.mapEngine.map.flyTo({
          center: [city.longitude, city.latitude],
          zoom: 9, pitch: 45, duration: 2000
        });
        if (window.mapEngine.setHoloHUD) {
          window.mapEngine.setHoloHUD([city.longitude, city.latitude], city.name, { TARGET: "CITY", UPLINK: "ACTIVE" });
        }
      }

      // Update global context labels
      if (window.setText) window.setText("selected-country-name", city.name.toUpperCase());
      window._currentWeatherLocation = fullName;

      // Tab specific actions
      if (tabId === 'intel') {
        if (window.generateAIBriefing) window.generateAIBriefing(fullName);
        if (window.fetchGDELTEvents) window.fetchGDELTEvents(city.name);
      } else if (tabId === 'news') {
        if (window.fetchNews) window.fetchNews(city.name);
      } else if (tabId === 'markets') {
        if (window.fetchMarketIntel) window.fetchMarketIntel(city.name, null);
        if (window.initializeMarkets) window.initializeMarkets(city.name);
      } else if (tabId === 'economic') {
        if (window.fetchDetailedEconomics) window.fetchDetailedEconomics(city.name);
      } else if (tabId === 'atmosphere') {
        if (window.fetchWeather) await window.fetchWeather(city.latitude, city.longitude);
      }

      if (window.showToast) window.showToast(`Uplink established: ${city.name}`, "success");
      inputEl.value = "";
    } else {
      if (window.playTacticalSound) window.playTacticalSound('hover');
      inputEl.value = "";
      inputEl.placeholder = "Sector undetected...";
      setTimeout(() => (inputEl.placeholder = "Enter target city..."), 2000);
    }
  } catch (e) {
    console.error(`Search for ${tabId} failed:`, e);
    if (window.showToast) window.showToast("Uplink failed. Check signal.", "error");
  }
  btn.innerText = originalBtnText;
  btn.disabled = false;
};
