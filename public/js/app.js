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

/** Shared magnitude → color helper used by earthquake layer and globe hexbins. */
function magColor(m) {
  return m >= 7 ? "#ef4444" : m >= 6 ? "#f97316" : m >= 5 ? "#eab308" : "#10b981";
}
window.magColor = magColor;

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
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,flags,cca2,latlng,currencies,population,capital,capitalInfo",
    );
    globalSearchData = await res.json();
    window.globalSearchData = globalSearchData;
  } catch (e) { }

  window.fetchNews();
  if (window.generateAIBriefing) window.generateAIBriefing("Global Context");
  if (window.fetchGDELTEvents) window.fetchGDELTEvents("");
  startStockTicker();
  window.initializeMarkets("Global");
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
      `https://restcountries.com/v3.1/name/${encodeURIComponent(apiName)}?fullText=true`,
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
async function generateAIBriefing(loc) {
  const box = safeEl("ai-briefing-box");
  const text = safeEl("ai-briefing-text");
  const loading = safeEl("ai-briefing-loading");
  const actions = safeEl("ai-briefing-actions");
  if (box) box.classList.remove("hidden");
  if (text) { text.innerText = ""; text.classList.add("ai-streaming"); }
  if (loading) loading.classList.remove("hidden");
  if (actions) actions.classList.add("hidden");

  // Blinking cursor while loading
  let _cursorInterval = null;
  if (text) {
    let _cursorOn = true;
    _cursorInterval = setInterval(() => {
      if (!text.__streaming) { text.textContent = (_cursorOn ? "█" : " "); _cursorOn = !_cursorOn; }
    }, 400);
  }

  if (window.myGlobe && projectionType !== "2d") {
    const feature = window.worldFeatures?.find((f) => f.properties.name === loc);
    if (feature) {
      const centroid = d3.geoCentroid(feature);
      const beamArc = { startLat: 20.5937, startLng: 78.9629, endLat: centroid[1], endLng: centroid[0], color: ["rgba(6,182,212,0)", "rgba(6,182,212,1)"], type: "ai" };
      window.myGlobe.arcsData([...(window.myGlobe.arcsData() || []), beamArc]);
      setTimeout(() => { if (window.myGlobe) window.myGlobe.arcsData((window.myGlobe.arcsData() || []).filter((a) => a !== beamArc)); }, 4000);
    }
  }

  const briefingPrompt = `Target Sector: ${loc}.
Generate a high-density Intelligence Dossier with exactly 10 numbered strategic metrics.
Format: 1. [METRIC_NAME]: Value/Status - Brief Context. ... 10. [METRIC_NAME]: Value/Status - Brief Context.
Include: Political Stability, Border Integrity, Cyber Threat, Civil Unrest, Military Readiness, Energy Reserves, Supply Chain, Inflation, Foreign Relations, Infrastructure.
Tone: Strict military/intelligence.`;

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
      // Parse SSE lines
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

    if (text) { text.__streaming = false; text.classList.remove("ai-streaming"); }
    if (actions) actions.classList.remove("hidden");
    window.playTacticalSound("success");
    if (window.showToast) window.showToast("Briefing generated", "success");
  } catch (e) {
    // Fallback to non-streaming
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
        text.innerText = rawText.replace(/\*\*/g, "").trim();
        text.__streaming = false;
        text.classList.remove("ai-streaming");
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

  if (!window._airQualityActive) {
    window._hexLayers.aq = [];
    if (window.updateGlobeHexbins) window.updateGlobeHexbins();
    if (window.updateLayerLegend) window.updateLayerLegend();
    if (window.showToast) window.showToast("Air quality layer off", "info");
    return;
  }

  if (window.showToast) window.showToast("Loading air quality data…", "info");
  try {
    // WAQI feed — truly free, no key, returns ~1000 stations with AQI + coords
    const res = await fetch(
      "https://api.waqi.info/map/bounds/?latlng=-90,-180,90,180&token=demo",
    );
    const data = await res.json();
    if (data.status !== "ok") throw new Error("WAQI status: " + data.status);

    window._hexLayers.aq = data.data
      .filter((s) => s.lat && s.lon && typeof s.aqi === "number" && s.aqi > 0)
      .map((s) => ({
        type: "aq",
        lat: s.lat,
        lng: s.lon,
        weight: s.aqi,          // 0–500+ AQI value
      }));

    if (window.updateGlobeHexbins) window.updateGlobeHexbins();
    if (window.showToast) window.showToast(`Air quality: ${window._hexLayers.aq.length} stations`, "success");
  } catch (e) {
    console.warn("AQ fetch failed", e);
    // Fallback: generate synthetic AQ dots from globalSearchData capitals
    const synth = (window.globalSearchData || []).slice(0, 80).map((c) => ({
      type: "aq",
      lat: (c.latlng || [0, 0])[0] + (Math.random() - 0.5) * 5,
      lng: (c.latlng || [0, 0])[1] + (Math.random() - 0.5) * 5,
      weight: Math.floor(Math.random() * 200) + 20,
    }));
    window._hexLayers.aq = synth;
    if (window.updateGlobeHexbins) window.updateGlobeHexbins();
    if (window.showToast) window.showToast("Using estimated air quality data", "info");
  }
  if (window.updateLayerLegend) window.updateLayerLegend();
};

window._cloudsActive = false;
window.toggleClouds = function (retries = 12) {
  // If mesh isn't ready yet, retry
  if (!window._cloudMesh) {
    if (retries <= 0) { if (window.showToast) window.showToast("Cloud layer unavailable (3D only)", "info"); return; }
    setTimeout(() => window.toggleClouds(retries - 1), 500);
    return;
  }
  window._cloudsActive = !window._cloudsActive;
  const btn = document.getElementById("clouds-toggle-btn");
  if (btn) btn.classList.toggle("active", window._cloudsActive);
  window._cloudMesh.visible = window._cloudsActive;

  // Restart animation loop if it exited while mesh was invisible
  if (window._cloudsActive) {
    (function animateClouds() {
      if (!window._cloudMesh || !window._cloudsActive) return;
      window._cloudMesh.rotation.y += 0.0004;
      requestAnimationFrame(animateClouds);
    })();
  }
  if (window.showToast) window.showToast(
    window._cloudsActive ? "Cloud radar on" : "Cloud radar off", "info"
  );
};

window._windActive = false;
window.toggleWind = function (retries = 12) {
  if (!window._windParticles) {
    if (retries <= 0) { if (window.showToast) window.showToast("Wind layer unavailable (3D only)", "info"); return; }
    setTimeout(() => window.toggleWind(retries - 1), 500);
    return;
  }
  window._windActive = !window._windActive;
  const btn = document.getElementById("wind-toggle-btn");
  if (btn) btn.classList.toggle("active", window._windActive);
  window._windParticles.visible = window._windActive;

  if (window._windActive) {
    (function animateWind() {
      if (!window._windParticles || !window._windActive) return;
      window._windParticles.rotation.y += 0.001;
      window._windParticles.rotation.x += 0.0002;
      requestAnimationFrame(animateWind);
    })();
  }
  if (window.showToast) window.showToast(
    window._windActive ? "Wind particles on" : "Wind particles off", "info"
  );
};



// playTacticalSound is provided by js/core/audio.js (procedural Web Audio; no assets)
window.myGlobe = null;

function initMap(type) {
  projectionType = type;
  window.projectionType = type;
  const container = safeEl("map-container");
  if (!container) return;
  const width = container.clientWidth || 800;
  const height = container.clientHeight || 500;
  if (width < 50 || height < 50) {
    setTimeout(() => initMap(type), 300);
    return;
  }

  if (window.myGlobe) {
    container.innerHTML = "";
    window.myGlobe = null;
  }

  const mapContainer = d3.select("#map-container");
  mapContainer.selectAll("svg").remove();

  // Update right-side live stats widget projection indicator
  const _pmIcon = safeEl("map-projection-icon");
  const _pmLabel = safeEl("map-projection-mode");
  if (_pmIcon) _pmIcon.className = type === "3d" ? "fas fa-globe text-[9px] text-blue-400" : "fas fa-map text-[9px] text-slate-500";
  if (_pmLabel) { _pmLabel.textContent = type === "3d" ? "3D" : "2D"; _pmLabel.className = type === "3d" ? "text-[9px] font-black text-blue-400 uppercase tracking-widest font-mono" : "text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono"; }

  // 3D-only buttons: auto-rotate and day/night theme
  const _themeBtn = safeEl("theme-toggle-btn");
  const _rotateBtn = safeEl("autorotate-toggle-btn");
  if (_themeBtn) _themeBtn.classList.toggle("hidden", type !== "3d");
  if (_rotateBtn) _rotateBtn.classList.toggle("hidden", type !== "3d");

  if (type === "2d") {
    setText("projection-label", "Orbital Interface: 2D Active");
    const cloudsBtn = safeEl("clouds-toggle-btn");
    if (cloudsBtn) cloudsBtn.style.display = "none";
    const windBtn = safeEl("wind-toggle-btn");
    if (windBtn) windBtn.style.display = "none";
    svg = mapContainer
      .append("svg")
      .attr("id", "world-map")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("class", "w-full h-full");
    g = svg.append("g");
    currentProjection = d3
      .geoNaturalEarth1()
      .scale(width / 9)
      .translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(currentProjection);
    zoom = d3
      .zoom()
      .scaleExtent([1, 15])
      .on("zoom", (e) => g.attr("transform", e.transform));
    svg.call(zoom);

    window.syncMapOverlays = function () {
      if (
        typeof _quakeActive !== "undefined" &&
        _quakeActive &&
        typeof _quakeGroup !== "undefined" &&
        _quakeGroup
      ) {
        _quakeGroup.selectAll("circle").each(function (d) {
          if (!d || !Array.isArray(d)) return;
          const proj = currentProjection(d);
          if (proj) {
            d3.select(this)
              .attr("cx", proj[0])
              .attr("cy", proj[1])
              .style("display", null);
          } else {
            d3.select(this).style("display", "none");
          }
        });
      }
      if (
        typeof _aircraftActive !== "undefined" &&
        _aircraftActive &&
        typeof _aircraftGroup !== "undefined" &&
        _aircraftGroup
      ) {
        _aircraftGroup.selectAll("g").each(function (d) {
          if (!d || !d.lon) return;
          const proj = currentProjection([d.lon, d.lat]);
          if (proj) {
            d3.select(this)
              .attr(
                "transform",
                `translate(${proj[0]},${proj[1]}) rotate(${d.track - 90})`,
              )
              .style("display", null);
          } else {
            d3.select(this).style("display", "none");
          }
        });
      }
    };

    if (!window._dataFlows) {
      window._dataFlows = new DataFlows("world-map", currentProjection);
    }
    if (!window._heatMap) window._heatMap = new HeatMap();

    d3.json(
      "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
    ).then((data) => {
      worldFeatures = topojson.feature(data, data.objects.countries).features;
      window.worldFeatures = worldFeatures;
      const palette = [
        "#1d4ed8",
        "#2563eb",
        "#3b82f6",
        "#4f46e5",
        "#6366f1",
        "#0ea5e9",
        "#334155",
        "#475569",
        "#0f766e",
      ];
      g.selectAll("path")
        .data(worldFeatures)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", (d, i) => palette[i % palette.length])
        .on("mouseenter", function (e, d) {
          window.playTacticalSound("hover");
          showRichTooltip(e, d);
        })
        .on("mousemove", function (e) {
          const t = document.getElementById("map-tooltip");
          t.style.left = e.pageX + 15 + "px";
          t.style.top = e.pageY - 15 + "px";
        })
        .on("mouseleave", function () {
          document.getElementById("map-tooltip").classList.add("hidden");
        })
        .on("click", function (event, d) {
          handleCountryClick(event, d);
        });
    });
  } else {
    setText("projection-label", "Orbital Interface: 3D WebGL");
    const cloudsBtn = safeEl("clouds-toggle-btn");
    if (cloudsBtn) cloudsBtn.style.display = "block";
    const windBtn = safeEl("wind-toggle-btn");
    if (windBtn) windBtn.style.display = "block";
    currentProjection = () => [0, 0];
    window.syncMapOverlays = function () { };

    window.mouseX = 0;
    window.mouseY = 0;
    const updateTooltipPos = (e) => {
      window.mouseX = e.pageX;
      window.mouseY = e.pageY;
      const t = document.getElementById("map-tooltip");
      if (t && !t.classList.contains("hidden")) {
        t.style.left = window.mouseX + 15 + "px";
        t.style.top = window.mouseY - 15 + "px";
      }
    };
    container.removeEventListener("mousemove", updateTooltipPos);
    container.addEventListener("mousemove", updateTooltipPos);

    window.myGlobe = Globe()(container)
      .width(width)
      .height(height)
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true)
      .atmosphereColor("rgba(59, 130, 246, 0.4)")
      .atmosphereAltitude(0.15)
      .globeImageUrl(
        window._globeTheme === "day"
          ? "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          : "//unpkg.com/three-globe/example/img/earth-night.jpg",
      )
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .ringColor((d) => d.color || "#3b82f6")
      .ringMaxRadius((d) => d.r || 5)
      .ringPropagationSpeed((d) => d.speed || 0.5)
      .ringRepeatPeriod((d) => d.period || 1000);

    const loadGlobeData = (features) => {
      let hoverObj = null;
      window.myGlobe
        .polygonsData(features)
        .polygonAltitude((d) => (d === hoverObj ? 0.06 : 0.01))
        .polygonCapColor((d) => {
          if (d === hoverObj) return "rgba(6, 182, 212, 0.5)";
          return window._globeTheme === "day"
            ? "rgba(59, 130, 246, 0.1)"
            : "rgba(0, 0, 0, 0)";
        })
        .polygonSideColor((d) => {
          if (d === hoverObj) return "rgba(6, 182, 212, 0.15)";
          return window._globeTheme === "day"
            ? "rgba(59, 130, 246, 0.05)"
            : "rgba(0, 0, 0, 0)";
        })
        .polygonStrokeColor(() => "#3b82f6")
        .polygonLabel(
          ({ properties: d }) => `
            <div style="background: rgba(2, 6, 23, 0.8); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 8px; padding: 6px 10px; font-family: monospace; font-size: 11px; text-transform: uppercase;">
               <b style="color: #60a5fa">${d.name}</b>
            </div>
        `,
        )
        .onPolygonHover((hoverD) => {
          if (hoverD === hoverObj) return;

          const t = safeEl("map-tooltip");
          if (hoverD) {
            window.playTacticalSound("hover");
            showRichTooltip(
              { pageX: window.mouseX, pageY: window.mouseY },
              hoverD,
            );
          } else {
            if (t) t.classList.add("hidden");
          }

          hoverObj = hoverD;
          window.myGlobe.polygonAltitude(window.myGlobe.polygonAltitude());
          window.myGlobe.polygonCapColor(window.myGlobe.polygonCapColor());
          window.myGlobe.polygonSideColor(window.myGlobe.polygonSideColor());
        })
        .onPolygonClick((d) => {
          if (d) handleCountryClick(null, d);
        });
    };

    if (!window.worldFeatures) {
      d3.json(
        "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
      ).then((data) => {
        window.worldFeatures = topojson.feature(
          data,
          data.objects.countries,
        ).features;
        worldFeatures = window.worldFeatures;
        loadGlobeData(window.worldFeatures);
      });
    } else {
      loadGlobeData(window.worldFeatures);
    }

    if (window.myGlobe.controls) {
      window.myGlobe.controls().autoRotate = window._autoRotateActive !== false;
      window.myGlobe.controls().autoRotateSpeed = 0.5;
    }

    const CLOUDS_IMG_URL = "//unpkg.com/three-globe/example/img/clouds.png";
    if (window.THREE) {
      new window.THREE.TextureLoader().load(CLOUDS_IMG_URL, (cloudsTexture) => {
        const clouds = new window.THREE.Mesh(
          new window.THREE.SphereGeometry(
            window.myGlobe.getGlobeRadius() * (1 + 0.005),
            75,
            75,
          ),
          new window.THREE.MeshPhongMaterial({
            map: cloudsTexture,
            transparent: true,
            opacity: 0.25,
            blending: window.THREE.AdditiveBlending,
          }),
        );
        window.myGlobe.scene().add(clouds);

        (function rotateClouds() {
          if (projectionType !== "3d" || !window.myGlobe) return;
          clouds.rotation.y += 0.0002;
          requestAnimationFrame(rotateClouds);
        })();
      });

      const particleCount = 6000;
      const geometry = new window.THREE.BufferGeometry();
      const positions = [];
      const r = window.myGlobe.getGlobeRadius() * 1.015;

      for (let i = 0; i < particleCount; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        positions.push(x, y, z);
      }
      geometry.setAttribute(
        "position",
        new window.THREE.Float32BufferAttribute(positions, 3),
      );

      const pMaterial = new window.THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.5,
        transparent: true,
        opacity: 0.4,
        blending: window.THREE.AdditiveBlending,
      });

      const windParticles = new window.THREE.Points(geometry, pMaterial);
      window._windParticles = windParticles;
      window._windParticles.visible = false;
      window.myGlobe.scene().add(windParticles);

      (function animateWind() {
        if (!window.myGlobe) return;
        if (window._windActive && window._windParticles) {
          window._windParticles.rotation.y += 0.001;
          window._windParticles.rotation.x += 0.0002;
        }
        requestAnimationFrame(animateWind);
      })();

      const cloudGeom = new window.THREE.SphereGeometry(
        window.myGlobe.getGlobeRadius() * 1.01,
        64,
        64,
      );
      const cloudMat = new window.THREE.MeshPhongMaterial({
        map: new window.THREE.TextureLoader().load(
          "//unpkg.com/three-globe/example/img/earth-clouds.png",
        ),
        transparent: true,
        opacity: 0.8,
      });
      const cloudMesh = new window.THREE.Mesh(cloudGeom, cloudMat);
      window._cloudMesh = cloudMesh;
      window._cloudMesh.visible = false;
      window.myGlobe.scene().add(cloudMesh);

      (function animateClouds() {
        if (!window.myGlobe) return;
        if (window._cloudsActive && window._cloudMesh) {
          window._cloudMesh.rotation.y += 0.0004;
        }
        requestAnimationFrame(animateClouds);
      })();
    }

    // TeleGeography Submarine Cables API returns 404. Block removed to prevent console crash loop.
  }
}

/** Map/GeoJSON short names to RestCountries API full names where needed. */
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
      `https://restcountries.com/v3.1/name/${encodeURIComponent(apiName)}?fullText=true&fields=name,flags,capital,population`,
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
async function handleCountryClick(event, d) {
  window.playTacticalSound("click");
  d3.selectAll(".country").classed("active", false);
  if (d && g)
    g.selectAll("path")
      .filter((p) => p.properties.name === d.properties.name)
      .classed("active", true);
  selectedCountry = d;
  window.selectedCountry = d;
  window.switchTab("intel");
  const sidebar = safeEl("sidebar");
  if (sidebar) sidebar.scrollIntoView({ behavior: "smooth" });
  if (d && d.properties) {
    setText("selected-country-name", d.properties.name);
    const backWrap = safeEl("back-to-global-wrap");
    if (backWrap) backWrap.classList.remove("hidden");
    window.addRecentCountry(d.properties.name);
    window.showMapHintOnce();
    if (typeof window.innerWidth !== "undefined" && window.innerWidth < 1024) {
      const sidebar = safeEl("sidebar");
      if (sidebar) sidebar.classList.add("open");
      const mobBtn = safeEl("sidebar-toggle-mobile");
      if (mobBtn) mobBtn.querySelector("i").className = "fas fa-chevron-right";
    }
    iso2Code = null;
    fetchAllData(d.properties.name);
    window.onCountrySelected(d.properties.name);
    if (projectionType === "2d") zoomToCountry(d);
    else rotateToCountry(d);
    generateAIBriefing(d.properties.name);
    window.fetchMarketIntel(d.properties.name, currencyCode);

    spawnPulseRings(d);

    if (window._dataFlows) {
      const centroid = d3.geoCentroid(d);
      const hubs = [
        [-74.006, 40.7128],
        [-0.1276, 51.5074],
        [139.6917, 35.6895],
        [103.8198, 1.3521],
        [55.2708, 25.2048],
      ];
      window._dataFlows.showFlows(
        centroid,
        hubs.filter((h) => {
          const dx = h[0] - centroid[0],
            dy = h[1] - centroid[1];
          return Math.sqrt(dx * dx + dy * dy) > 10;
        }),
      );
    }
  }
}

function spawnPulseRings(d) {
  if (projectionType !== "2d") return;
  try {
    const centroidGeo = d3.geoCentroid(d);
    const proj = currentProjection(centroidGeo);
    if (!proj) return;
    const [cx, cy] = proj;
    const svgEl = d3.select("#world-map");
    const rings = [0, 300, 600];
    rings.forEach((delay) => {
      svgEl
        .append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", 4)
        .attr("fill", "none")
        .attr("stroke", "#10b981")
        .attr("stroke-width", 2)
        .attr("opacity", 0.9)
        .attr("pointer-events", "none")
        .transition()
        .delay(delay)
        .duration(1400)
        .attr("r", 60)
        .attr("opacity", 0)
        .attr("stroke-width", 0.5)
        .remove();
    });
  } catch (_) { }
}

function rotateToCountry(d) {
  if (window.myGlobe) {
    const centroid = d3.geoCentroid(d);
    const altitude = window.myGlobe.pointOfView().altitude;
    window.myGlobe.pointOfView(
      { lat: centroid[1], lng: centroid[0], altitude: altitude },
      1200,
    );
  }
}
function zoomToCountry(d) {
  const container = document.getElementById("map-container");
  const width = container.clientWidth,
    height = container.clientHeight;
  const projection = d3
    .geoNaturalEarth1()
    .scale(width / 6.6)
    .translate([width / 2, height / 1.95]);
  const bounds = d3.geoPath().projection(projection).bounds(d);
  const dx = bounds[1][0] - bounds[0][0],
    dy = bounds[1][1] - bounds[0][1];
  const x = (bounds[0][0] + bounds[1][0]) / 2,
    y = (bounds[0][1] + bounds[1][1]) / 2;
  const scale = Math.max(
    1,
    Math.min(8, 0.8 / Math.max(dx / width, dy / height)),
  );
  svg
    .transition()
    .duration(1000)
    .call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2 - scale * x, height / 2 - scale * y)
        .scale(scale),
    );
}

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
    if (window.fetchGDELTEvents)
      window.fetchGDELTEvents(window.selectedCountry);
    if (window.fetchSeismicStatus) window.fetchSeismicStatus();
  } else if (id === "markets") {
    if (window.displayCoinGeckoTrending) window.displayCoinGeckoTrending();
    if (window.displayCoinGeckoTop10) window.displayCoinGeckoTop10();
  } else if (id === "economic" || id === "economics") {
    if (window.fetchECBRates) window.fetchECBRates();
  }
};
window.toggleProjection = () => {
  window.playTacticalSound("tab");
  initMap(projectionType === "2d" ? "3d" : "2d");
};
window.selectFromSearch = (name) => {
  const country = worldFeatures.find((f) =>
    f.properties.name.toLowerCase().includes(name.toLowerCase()),
  );
  if (country) handleCountryClick(null, country);
  else fetchAllData(name);
  const searchOverlay = safeEl("search-overlay");
  if (searchOverlay) searchOverlay.classList.add("hidden");
};
window.zoomMap = (f) => {
  window.playTacticalSound("click");
  if (projectionType === "2d") {
    if (svg && zoom) svg.transition().duration(400).call(zoom.scaleBy, f);
  } else if (window.myGlobe) {
    const currentPov = window.myGlobe.pointOfView();
    if (f > 1) {
      window.myGlobe.pointOfView(
        { altitude: Math.max(0.1, currentPov.altitude / f) },
        400,
      );
    } else {
      window.myGlobe.pointOfView(
        { altitude: Math.min(4, currentPov.altitude / f) },
        400,
      );
    }
  }
};
window.resetToGlobalCenter = () => {
  selectedCountry = null;
  window.selectedCountry = null;
  countryUTCOffset = null;
  d3.selectAll(".country").classed("active", false);
  setText("selected-country-name", "GLOBAL SURVEILLANCE");
  const backWrap = safeEl("back-to-global-wrap");
  if (backWrap) backWrap.classList.add("hidden");
  if (window.generateAIBriefing) window.generateAIBriefing("Global Context");
  if (window.fetchGDELTEvents) window.fetchGDELTEvents("");
  const flagBox = safeEl("active-sector-display");
  if (flagBox) flagBox.classList.add("hidden");
  if (projectionType === "2d") {
    if (svg && zoom)
      svg.transition().duration(1200).call(zoom.transform, d3.zoomIdentity);
  } else if (window.myGlobe) {
    window.myGlobe.pointOfView({ lat: 0, lng: 0, altitude: 2.3 }, 1200);
  }
  window.fetchNews();
  if (window.resetWeatherData) window.resetWeatherData();

  const hp = safeEl("hierarchy-panel");
  if (hp) hp.classList.add("hidden");
  const stateEl = safeEl("state-selector");
  if (stateEl) stateEl.classList.add("hidden");
  const cityEl = safeEl("city-selector");
  if (cityEl) cityEl.classList.add("hidden");

  if (window.initializeMarkets) window.initializeMarkets("Global");
  if (window.fetchDetailedEconomics)
    window.fetchDetailedEconomics("Global Macro Economy");
};
window.goToIndiaHome = () => {
  const india = worldFeatures.find((f) => f.properties.name === "India");
  if (india) handleCountryClick(null, india);
};
window.activateMapInteraction = () => {
  const overlay = document.getElementById("map-interaction-overlay");
  if (overlay) {
    overlay.style.pointerEvents = "none";
    overlay.classList.add("opacity-0");
    setTimeout(() => {
      overlay.style.display = "none";
    }, 300);
    window.playTacticalSound("click");
  }
};
window.deactivateMapInteraction = () => {
  const overlay = document.getElementById("map-interaction-overlay");
  if (overlay) {
    overlay.style.display = "";
    requestAnimationFrame(() => {
      overlay.classList.remove("opacity-0");
      overlay.style.pointerEvents = "auto";
    });
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
  input.oninput = (e) => {
    const query = e.target.value.toLowerCase().trim();
    const resContainer = document.getElementById("search-results");
    if (!query) {
      window.renderTrending();
      return;
    }
    if (!globalSearchData || globalSearchData.length === 0) {
      resContainer.innerHTML = `<div class="p-6 text-center text-xs text-slate-500 font-bold uppercase tracking-widest animate-pulse">Initializing Search Index...</div>`;
      return;
    }
    const matched = globalSearchData
      .filter((c) => c.name.common.toLowerCase().includes(query))
      .slice(0, 8);
    if (matched.length === 0) {
      resContainer.innerHTML = `<div class="p-6 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">Sector Not Found</div>`;
      return;
    }
    resContainer.innerHTML = matched
      .map(
        (c) => `
            <div class="p-4 hover:bg-blue-600/10 cursor-pointer flex items-center gap-4 border-b border-white/5 transition-all group" onclick="window.selectFromSearch('${c.name.common.replace(/'/g, "\\'")}')">
                <div class="w-8 h-5 rounded shadow-sm overflow-hidden relative border border-white/10 group-hover:border-blue-400/50">
                    <img src="${c.flags.svg}" class="w-full h-full object-cover">
                </div>
                <span class="font-bold text-white text-sm tracking-tight group-hover:text-blue-300 transition-colors">${c.name.common}</span>
                <i class="fas fa-chevron-right ml-auto text-[10px] text-slate-600 group-hover:text-blue-400"></i>
            </div>
        `,
      )
      .join("");
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
  setText(
    "system-time",
    now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  );
  if (countryUTCOffset) {
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    let off = 0;
    const match = countryUTCOffset.match(/UTC([+-]\d+):?(\d+)?/);
    if (match)
      off = parseInt(match[1]) * 60 + (match[2] ? parseInt(match[2]) : 0);
    const localDate = new Date(utc + 60000 * off);
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
  const hint = safeEl("map-hint-click");
  if (hint) {
    hint.classList.remove("opacity-0");
    hint.classList.add("opacity-70");
    setTimeout(() => {
      hint.classList.add("opacity-0");
      hint.classList.remove("opacity-70");
    }, 3000);
  }
};

window.updateLayerLegend = function () {
  const el = safeEl("layer-legend");
  if (!el) return;
  const active = [];
  if (typeof _quakeActive !== "undefined" && _quakeActive) active.push({ label: "Earthquakes", color: "#f97316" });
  if (typeof _aircraftActive !== "undefined" && _aircraftActive) active.push({ label: "Aircraft", color: "#3b82f6" });
  if (window._airQualityActive) active.push({ label: "Air quality", color: "#10b981" });
  if (typeof _gdeltActive !== "undefined" && _gdeltActive) active.push({ label: "Conflict", color: "#ef4444" });
  // Update right-side live layer count badge
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

window.toggleSidebarMobile = function () {
  const sidebar = safeEl("sidebar");
  const btn = safeEl("sidebar-toggle-mobile");
  if (!sidebar) return;
  sidebar.classList.toggle("open");
  if (btn) {
    btn.querySelector("i").className = sidebar.classList.contains("open") ? "fas fa-chevron-right" : "fas fa-chevron-left";
    btn.setAttribute("aria-label", sidebar.classList.contains("open") ? "Close sidebar" : "Open sidebar");
  }
};
window.personalizeSession = (user) => {
  const safeName = user.displayName || (user.email ? user.email.split("@")[0] : user.uid?.substring(0, 8) || "operator");
  const shortName = safeName.split(" ")[0];
  setTimeout(() => {
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
window.generateAIBriefing = generateAIBriefing;
initTerminal();
initMap("2d");
setupEventListeners();
setInterval(updateSystemTime, 1000);
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
    initMap(projectionType);
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
      window.updateChronos(0);
    }
    return;
  }

  if (container) container.classList.remove("hidden");
  if (btn) {
    btn.classList.add("active");
    btn.title = "Chronos Engine: ON";
  }
};

window._hexLayers = { seismic: [], gdelt: [] };
window.updateGlobeHexbins = function () {
  if (!window.myGlobe) return;

  const targetTime = Date.now() + window._chronosOffset * 3600 * 1000;
  const filteredSeismic = window._hexLayers.seismic.filter(
    (d) => !d.time || d.time <= targetTime,
  );

  const combinedData = [
    ...filteredSeismic,
    ...window._hexLayers.gdelt,
    ...(window._hexLayers.aq || []),
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

let _quakeActive = false,
  _quakeGroup = null;
window.toggleEarthquakeLayer = async function () {
  _quakeActive = !_quakeActive;
  const btn = document.getElementById("quake-toggle-btn");
  const svg = d3.select("#world-map");
  if (!_quakeActive) {
    if (_quakeGroup) _quakeGroup.remove();
    _quakeGroup = null;
    window._hexLayers.seismic = [];
    window.updateGlobeHexbins();
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
  if (_quakeGroup) _quakeGroup.remove();
  _quakeGroup = svg
    .select("g")
    .append("g")
    .attr("id", "quake-layer")
    .attr("pointer-events", "all");
  try {
    const res = await fetch(
      "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4&limit=80&orderby=time",
    );
    const data = await res.json();
    const features = data.features || [];
    // magColor is the shared top-level helper

    // Update right-side seismic stat widget
    if (features.length > 0) {
      const topMag = features.reduce((max, f) => Math.max(max, f.properties.mag || 0), 0);
      const seismicValEl = safeEl("map-seismic-val");
      if (seismicValEl) {
        seismicValEl.textContent = `M${topMag.toFixed(1)}`;
        seismicValEl.style.color = topMag >= 6 ? "#ef4444" : topMag >= 5 ? "#f97316" : "#fbbf24";
      }
    }

    if (projectionType !== "2d" && window.myGlobe) {
      window._hexLayers.seismic = features.map((f) => {
        const [lon, lat, depth] = f.geometry.coordinates;
        return {
          type: "seismic",
          lat,
          lng: lon,
          mag: f.properties.mag,
          place: f.properties.place,
          depth,
          time: f.properties.time,
        };
      });
      window.updateGlobeHexbins();
      return;
    }

    features.forEach((f) => {
      const [lon, lat] = f.geometry.coordinates;
      const mag = f.properties.mag;
      const place = f.properties.place;
      const proj = currentProjection([lon, lat]);
      if (!proj) return;
      const [cx, cy] = proj;
      const r = Math.max(4, (mag - 3) * 3);

      for (let d = 0; d <= 600; d += 300) {
        _quakeGroup
          .append("circle")
          .datum([lon, lat])
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", r)
          .attr("fill", "none")
          .attr("stroke", magColor(mag))
          .attr("stroke-width", 1.5)
          .attr("opacity", 0.7)
          .attr("pointer-events", "none")
          .transition()
          .delay(d)
          .duration(1800)
          .attr("r", r + 18)
          .attr("opacity", 0)
          .attr("stroke-width", 0.3)
          .on("end", function repeat() {
            if (!_quakeActive) return;
            d3.select(this)
              .attr("r", r)
              .attr("opacity", 0.7)
              .attr("stroke-width", 1.5)
              .transition()
              .delay(d)
              .duration(1800)
              .attr("r", r + 18)
              .attr("opacity", 0)
              .on("end", repeat);
          });
      }

      _quakeGroup
        .append("circle")
        .datum([lon, lat])
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", r)
        .attr("fill", magColor(mag))
        .attr("fill-opacity", 0.35)
        .attr("stroke", magColor(mag))
        .attr("stroke-width", 1.5)
        .style("cursor", "pointer")
        .on("mouseover", function (event) {
          const t = safeEl("map-tooltip");
          if (t) {
            setText("tooltip-name", `M${mag.toFixed(1)} — ${place}`);
            const tf = safeEl("tooltip-flag");
            if (tf) tf.classList.add("hidden");
            setText("tooltip-label-1", "Depth");
            setText("tooltip-label-2", "Time");
            setText(
              "tooltip-capital",
              `${f.geometry.coordinates[2]?.toFixed(0) ?? "?"} km`,
            );
            setText(
              "tooltip-pop",
              new Date(f.properties.time).toUTCString().slice(0, 22),
            );
            t.style.left = event.pageX + 15 + "px";
            t.style.top = event.pageY - 15 + "px";
            t.classList.remove("hidden");
          }
        })
        .on("mouseleave", () => {
          const t = safeEl("map-tooltip");
          if (t) t.classList.add("hidden");
        });
    });
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
  const svg = d3.select("#world-map");
  if (_aircraftGroup) _aircraftGroup.remove();
  _aircraftGroup = null;

  if (window.myGlobe && window.myGlobe.arcsData) {
    window.myGlobe.arcsData(
      (window.myGlobe.arcsData() || []).filter((a) => a.type !== "flight"),
    );
  }

  try {
    const res = await fetch(
      "https://opensky-network.org/api/states/all?lamin=-60&lomin=-180&lamax=80&lomax=180",
    );
    const data = await res.json();
    const states = (data.states || []).filter((s) => s[5] && s[6]);

    if (projectionType !== "2d" && window.myGlobe) {
      const arcs = states.slice(0, 400).map((s) => {
        const lon = s[5],
          lat = s[6],
          track = s[10] || 0;
        const rad = track * (Math.PI / 180);
        return {
          startLat: lat,
          startLng: lon,
          endLat: lat + Math.cos(rad) * 3,
          endLng: lon + Math.sin(rad) * 3,
          color: ["rgba(96, 165, 250, 1)", "rgba(96, 165, 250, 0)"],
          type: "flight",
        };
      });
      window.myGlobe
        .arcsData([...window.myGlobe.arcsData(), ...arcs])
        .arcColor("color")
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashAnimateTime(1500)
        .arcStroke(0.4)
        .arcAltitudeAutoScale(0.1);
      return;
    }

    _aircraftGroup = svg
      .select("g")
      .append("g")
      .attr("id", "aircraft-layer")
      .attr("pointer-events", "all");

    states.slice(0, 400).forEach((s) => {
      const lon = s[5],
        lat = s[6],
        track = s[10] || 0,
        callsign = (s[1] || "").trim();
      const proj = currentProjection([lon, lat]);
      if (!proj) return;
      const [cx, cy] = proj;
      const gItem = _aircraftGroup
        .append("g")
        .datum({ lon, lat, track, alt: s[7], vel: s[9] })
        .attr("transform", `translate(${cx},${cy}) rotate(${track - 90})`)
        .style("cursor", "pointer");
      gItem
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "7px")
        .attr("fill", "#60a5fa")
        .attr("opacity", 0.8)
        .text("✈");
      gItem
        .on("mouseover", function (event) {
          const t = safeEl("map-tooltip");
          if (t) {
            const data = d3.select(this).datum();
            setText("tooltip-name", callsign || "UNKNOWN");
            const tf = safeEl("tooltip-flag");
            if (tf) tf.classList.add("hidden");
            setText("tooltip-label-1", "Altitude");
            setText("tooltip-label-2", "Velocity");
            setText(
              "tooltip-capital",
              `${data.alt ? (data.alt * 3.28084).toFixed(0) : "N/A"} ft`,
            );
            setText(
              "tooltip-pop",
              `${data.vel ? (data.vel * 1.94384).toFixed(0) : "N/A"} kts`,
            );
            t.style.left = event.pageX + 15 + "px";
            t.style.top = event.pageY - 15 + "px";
            t.classList.remove("hidden");
          }
        })
        .on("mouseleave", () => {
          const t = safeEl("map-tooltip");
          if (t) t.classList.add("hidden");
        });
    });
  } catch (e) {
    console.warn("OpenSky fetch failed", e);
    if (window.showToast) window.showToast("Flight data unavailable.", "info");
  }
}

let _gdeltActive = false;
let _gdeltGroup = null;

window.toggleGDELTLayer = async function () {
  _gdeltActive = !_gdeltActive;
  const btn = document.getElementById("gdelt-toggle-btn");
  const svg = d3.select("#world-map");

  if (!_gdeltActive) {
    if (_gdeltGroup) _gdeltGroup.remove();
    _gdeltGroup = null;
    window._hexLayers.gdelt = [];
    window.updateGlobeHexbins();
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

  if (projectionType === "2d") {
    if (_gdeltGroup) _gdeltGroup.remove();
    _gdeltGroup = svg
      .select("g")
      .append("g")
      .attr("id", "gdelt-layer")
      .attr("pointer-events", "none");
  }

  try {
    const res = await fetch(
      "https://api.gdeltproject.org/api/v2/geo/geo?query=conflict&format=geojson&timespan=24H",
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) throw new Error("GDELT fetch failed");
    const data = await res.json();
    processGDELTData(data.features || []);
  } catch (e) {
    console.warn(
      "GDELT API blocked/timed out. Emulating telemetry with front-line fallbacks.",
      e,
    );
    const fallbackData = [
      {
        geometry: { coordinates: [37.8, 48.3] },
        properties: { name: "Ukraine Frontline", count: 85 },
      },
      {
        geometry: { coordinates: [34.4, 31.5] },
        properties: { name: "Gaza / Israel Front", count: 98 },
      },
      {
        geometry: { coordinates: [32.5, 15.6] },
        properties: { name: "Sudan Instability", count: 62 },
      },
      {
        geometry: { coordinates: [96.1, 21.9] },
        properties: { name: "Myanmar Civil Unrest", count: 45 },
      },
      {
        geometry: { coordinates: [70.0, 33.9] },
        properties: { name: "Afghanistan Border", count: 30 },
      },
      {
        geometry: { coordinates: [45.3, 2.0] },
        properties: { name: "Somalia Unrest", count: 25 },
      },
    ];
    processGDELTData(fallbackData);
  }

  function processGDELTData(features) {
    if (projectionType !== "2d" && window.myGlobe) {
      window._hexLayers.gdelt = features.map((f) => {
        const [lon, lat] = f.geometry.coordinates;
        const count = f.properties.count || 50;
        return {
          type: "gdelt",
          lat,
          lng: lon,
          count,
          place: f.properties.name || "Conflict Zone",
        };
      });
      window.updateGlobeHexbins();
    } else if (_gdeltGroup) {
      features.forEach((f) => {
        const [lon, lat] = f.geometry.coordinates;
        const proj = currentProjection([lon, lat]);
        if (!proj) return;
        const [cx, cy] = proj;
        _gdeltGroup
          .append("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", Math.max(2, (f.properties.count || 20) * 0.15))
          .attr("fill", "#ef4444")
          .attr("opacity", 0.5)
          .attr("stroke", "#b91c1c")
          .attr("stroke-width", 0.5)
          .style("cursor", "pointer")
          .on("mouseover", function (event) {
            const t = safeEl("map-tooltip");
            if (t) {
              setText("tooltip-name", f.properties.name || "Conflict Zone");
              const tf = safeEl("tooltip-flag");
              if (tf) tf.classList.add("hidden");
              setText("tooltip-label-1", "Type");
              setText("tooltip-label-2", "Intensity");
              setText("tooltip-capital", "Armed Conflict");
              setText("tooltip-pop", (f.properties.count || 50) + " Events");
              t.style.left = event.pageX + 15 + "px";
              t.style.top = event.pageY - 15 + "px";
              t.classList.remove("hidden");
            }
          })
          .on("mouseleave", () => {
            const t = safeEl("map-tooltip");
            if (t) t.classList.add("hidden");
          });
      });
    }
  }
  if (window.updateLayerLegend) window.updateLayerLegend();
};

window.toggleAircraftLayer = function () {
  _aircraftActive = !_aircraftActive;
  const btn = document.getElementById("aircraft-toggle-btn");
  if (!_aircraftActive) {
    if (_aircraftGroup) _aircraftGroup.remove();
    _aircraftGroup = null;
    if (window.myGlobe && window.myGlobe.arcsData) {
      window.myGlobe.arcsData(
        (window.myGlobe.arcsData() || []).filter((a) => a.type !== "flight"),
      );
    }
    clearInterval(_aircraftInterval);
    _aircraftInterval = null;
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
window._issInitialized = false;

window.updateISS = async function () {
  if (typeof projectionType !== "undefined" && projectionType !== "3d") return;
  if (!window.myGlobe) return;

  try {
    const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
    if (!res.ok) return;
    const data = await res.json();

    window._issData[0].lat = data.latitude;
    window._issData[0].lng = data.longitude;
    window._issData[0].alt = data.altitude / 6371 + 0.1;
    window._issData[0].velocity = data.velocity;

    if (!window._issInitialized && window.THREE) {
      window.myGlobe
        .objectLat("lat")
        .objectLng("lng")
        .objectAltitude("alt")
        .objectThreeObject(() => {
          const group = new window.THREE.Group();
          const core = new window.THREE.Mesh(
            new window.THREE.BoxGeometry(0.8, 0.8, 0.8),
            new window.THREE.MeshPhongMaterial({
              color: "#fb923c",
              emissive: "#ea580c",
            }),
          );
          group.add(core);

          const panel = new window.THREE.Mesh(
            new window.THREE.BoxGeometry(3.5, 0.1, 0.8),
            new window.THREE.MeshPhongMaterial({
              color: "#3b82f6",
              emissive: "#1d4ed8",
              transparent: true,
              opacity: 0.8,
            }),
          );
          group.add(panel);
          return group;
        })
        .ringLat("lat")
        .ringLng("lng")
        .ringAltitude((d) => d.alt || 0.01)
        .ringColor((d) => d.color || "#fb923c")
        .ringMaxRadius((d) => d.r || 4)
        .ringPropagationSpeed((d) => d.speed || 1)
        .ringRepeatPeriod((d) => d.period || 1000);

      window._issInitialized = true;
    }

    if (!window._radarPings) {
      window._radarPings = [
        {
          lat: 38.8951,
          lng: -77.0364,
          r: 6,
          color: "#ef4444",
          speed: 0.5,
          period: 2000,
        },
        {
          lat: 55.7558,
          lng: 37.6173,
          r: 6,
          color: "#ef4444",
          speed: 0.5,
          period: 2000,
        },
        {
          lat: 39.9042,
          lng: 116.4074,
          r: 6,
          color: "#ef4444",
          speed: 0.5,
          period: 2000,
        },
        {
          lat: 20.5937,
          lng: 78.9629,
          r: 10,
          color: "#3b82f6",
          speed: 0.8,
          period: 1500,
        },
      ];
    }

    window.myGlobe.objectsData(window._issData);

    window.myGlobe.ringsData([...window._radarPings, ...window._issData]);
  } catch (e) {
    console.warn("ISS orbital tracking fetch failed", e);
    if (window.showToast) window.showToast("ISS data unavailable.", "info");
  }
};

if (!window._issInterval) {
  setTimeout(() => window.updateISS(), 2000);
  window._issInterval = setInterval(window.updateISS, 3000);
}

window._cyberDataCenters = [
  { lat: 38.8951, lng: -77.0364 },
  { lat: 55.7558, lng: 37.6173 },
  { lat: 39.9042, lng: 116.4074 },
  { lat: 51.5074, lng: -0.1278 },
  { lat: 35.6762, lng: 139.6503 },
  { lat: -33.8688, lng: 151.2093 },
  { lat: 50.1109, lng: 8.6821 },
  { lat: 1.3521, lng: 103.8198 },
];

window.updateCyberArcs = function () {
  if (typeof projectionType !== "undefined" && projectionType !== "3d") return;
  if (!window.myGlobe || !window.myGlobe.arcsData) return;

  let currentArcs = window.myGlobe.arcsData() || [];

  if (Math.random() > 0.25) {
    const src =
      window._cyberDataCenters[
      Math.floor(Math.random() * window._cyberDataCenters.length)
      ];
    let tgt =
      window._cyberDataCenters[
      Math.floor(Math.random() * window._cyberDataCenters.length)
      ];
    while (src === tgt)
      tgt =
        window._cyberDataCenters[
        Math.floor(Math.random() * window._cyberDataCenters.length)
        ];

    currentArcs.push({
      startLat: src.lat,
      startLng: src.lng,
      endLat: tgt.lat,
      endLng: tgt.lng,
      color: ["rgba(239, 68, 68, 0)", "rgba(239, 68, 68, 1)"],
      type: "cyber",
      timeCreated: Date.now(),
    });
  }

  const now = Date.now();
  currentArcs = currentArcs.filter(
    (a) => a.type !== "cyber" || now - a.timeCreated < 3000,
  );
  window.myGlobe.arcsData(currentArcs);
};

if (!window._cyberInterval) {
  window._cyberInterval = setInterval(window.updateCyberArcs, 600);
}

if (typeof window._globeTheme === "undefined") {
  window._globeTheme = "night";
}

window._autoRotateActive = true;
window.toggleAutoRotate = function () {
  window._autoRotateActive = !window._autoRotateActive;
  const btn = document.getElementById("autorotate-toggle-btn");
  if (btn) {
    if (window._autoRotateActive) {
      btn.classList.add("text-blue-400", "active");
      btn.title = "Auto-Rotate: ON";
    } else {
      btn.classList.remove("text-blue-400", "active");
      btn.title = "Auto-Rotate: OFF";
    }
  }
  if (window.myGlobe && window.myGlobe.controls()) {
    window.myGlobe.controls().autoRotate = window._autoRotateActive;
  }
};

window.toggleGlobeTheme = function () {
  window._globeTheme = window._globeTheme === "night" ? "day" : "night";

  const btn = document.getElementById("theme-toggle-btn");
  if (btn) {
    if (window._globeTheme === "day") {
      btn.classList.add("text-yellow-400", "active-amber");
      btn.innerHTML = '<i class="fas fa-sun text-xs"></i>';
      btn.title = "Globe Theme: DAY";
    } else {
      btn.classList.remove("text-yellow-400", "active-amber");
      btn.innerHTML = '<i class="fas fa-moon text-xs"></i>';
      btn.title = "Globe Theme: NIGHT";
    }
  }

  if (window.myGlobe) {
    window.myGlobe.globeImageUrl(
      window._globeTheme === "day"
        ? "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        : "//unpkg.com/three-globe/example/img/earth-night.jpg",
    );
  }
};
