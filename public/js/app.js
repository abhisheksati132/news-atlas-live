let selectedCountry = null;
let currencyCode = null;
let iso2Code = null;
let countryUTCOffset = null;
let projectionType = "2d";
let currentProjection, svg, g, zoom;
let worldFeatures = [];
let globalSearchData = [];
let currentCategory = "top";
window.selectedCountry = selectedCountry;
window.currencyCode = currencyCode;
window.iso2Code = iso2Code;
window.currentCategory = currentCategory;
async function runBootSequence() {
  const logs = [
    "SYSTEM_INIT...",
    "CONNECTING_SAT_UPLINK...",
    "DECRYPTING_GLOBAL_FEED...",
    "HANDSHAKE_VERIFIED",
    "ACCESS_GRANTED",
  ];
  const logEl = document.getElementById("boot-log");
  const bar = document.getElementById("boot-bar");
  for (let i = 0; i < logs.length; i++) {
    await new Promise((r) => setTimeout(r, 400));
    const d = document.createElement("div");
    d.innerText = `> ${logs[i]}`;
    logEl.appendChild(d);
    bar.style.width = ((i + 1) / logs.length) * 100 + "%";
  }
  await new Promise((r) => setTimeout(r, 500));
  document.getElementById("boot-screen").style.opacity = "0";
  setTimeout(() => document.getElementById("boot-screen").remove(), 800);
}
async function initTerminal() {
  runBootSequence();
  const config = {
    apiKey: "AIzaSyBXg1tCOjaLp3mYWzLcS1BBny2LrcWlluE",
    authDomain: "news-atlas-live.firebaseapp.com",
    projectId: "news-atlas-live",
    storageBucket: "news-atlas-live.firebasestorage.app",
    messagingSenderId: "177473843770",
    appId: "1:177473843770:web:f9abb15747f79f28a9bb03",
  };
  try {
    const firebaseApp = window.firebaseCore.initializeApp(config);
    const auth = window.firebaseCore.getAuth(firebaseApp);
    const db = window.firebaseCore.getFirestore(firebaseApp);
    await window.firebaseCore.signInAnonymously(auth);
    window.firebaseCore.onAuthStateChanged(auth, (u) => {
      if (u) {
        const idEl = document.getElementById("neural-id");
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
        } catch (e) {}
      }
    });
  } catch (e) {
    console.warn("Firebase Auth failed:", e);
    document.getElementById("neural-id").innerText = "LOCAL MODE (OFFLINE)";
  }
  try {
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,flags,cca2,latlng,currencies,population,capital,capitalInfo",
    );
    globalSearchData = await res.json();
    window.globalSearchData = globalSearchData;
  } catch (e) {}

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
      const res = await fetch("/api/markets?type=ticker");
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        renderTicker(data.data);

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

  fetchAndRender();
  setInterval(fetchAndRender, 60000);
}

async function fetchAllData(name) {
  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=true`,
    );
    const data = await res.json();
    if (data && data[0]) {
      const c = data[0];
      iso2Code = c.cca2.toLowerCase();
      currencyCode = c.currencies ? Object.keys(c.currencies)[0] : null;
      window._isoAlpha3 = c.cca3 || "";
      window.iso2Code = iso2Code;
      window.currencyCode = currencyCode;
      document.getElementById("fact-pop").innerText =
        (c.population / 1000000).toFixed(1) + "M";
      document.getElementById("fact-cap").innerText = c.capital
        ? c.capital[0]
        : "N/A";
      document.getElementById("fact-region").innerText = c.region || "--";
      document.getElementById("fact-area").innerText = c.area.toLocaleString();
      document.getElementById("fact-code").innerText =
        c.idd.root + (c.idd.suffixes ? c.idd.suffixes[0] : "");
      document.getElementById("fact-demonym").innerText =
        c.demonyms?.eng?.m || "--";
      document.getElementById("fact-gini").innerText = c.gini
        ? Object.values(c.gini)[0]
        : "N/A";
      document.getElementById("fact-drive").innerText = c.car
        ? c.car.side.toUpperCase()
        : "--";
      const flagEl = document.getElementById("sector-flag");
      const nameEl = document.getElementById("sector-name");
      const box = document.getElementById("active-sector-display");
      if (flagEl && nameEl && box) {
        flagEl.src = c.flags.svg;
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
      document.getElementById("fact-pop-2").innerText =
        (c.population / 1000000).toFixed(1) + "M";
      document.getElementById("fact-gini-2").innerText = c.gini
        ? Object.values(c.gini)[0]
        : "N/A";
      document.getElementById("fact-demonym-2").innerText =
        c.demonyms?.eng?.m || "--";
      document.getElementById("fact-area-2").innerText =
        c.area.toLocaleString() + " km²";
      window.fetchCurrency();
      window.fetchDetailedEconomics(c.name.common);
      window.fetchNews();
    }
  } catch (e) {
    console.error("Data Fetch Error", e);
  }
}
async function generateAIBriefing(loc) {
  const box = document.getElementById("ai-briefing-box");
  const text = document.getElementById("ai-briefing-text");
  if (box) box.classList.remove("hidden");
  if (text) text.innerText = "Initializing deep-scan protocols...";

  if (window.myGlobe && projectionType !== "2d") {
    const feature = window.worldFeatures?.find(
      (f) => f.properties.name === loc,
    );
    if (feature) {
      const centroid = d3.geoCentroid(feature);
      const beamArc = {
        startLat: 20.5937,
        startLng: 78.9629,
        endLat: centroid[1],
        endLng: centroid[0],
        color: ["rgba(6, 182, 212, 0)", "rgba(6, 182, 212, 1)"],
        type: "ai",
      };
      window.myGlobe.arcsData([...(window.myGlobe.arcsData() || []), beamArc]);
      setTimeout(() => {
        if (window.myGlobe) {
          window.myGlobe.arcsData(
            (window.myGlobe.arcsData() || []).filter((a) => a !== beamArc),
          );
        }
      }, 4000);
    }
  }
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Target Sector: ${loc}.
                    Generate a high-density Intelligence Dossier with exactly 10 numbered strategic metrics.
                    Format: 1. [METRIC_NAME]: Value/Status - Brief Context. ... 10. [METRIC_NAME]: Value/Status - Brief Context.
                    Include: Political Stability, Border Integrity, Cyber Threat, Civil Unrest, Military Readiness, Energy Reserves, Supply Chain, Inflation, Foreign Relations, Infrastructure.
                    Tone: Strict military/intelligence.`,
      }),
    });
    const result = await res.json();
    if (text) {
      let rawText =
        result.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Link stable. No intel found.";
      text.innerText = rawText.replace(/\*\*/g, "").trim();
    }
    window.playTacticalSound("success");
  } catch (e) {
    if (text) text.innerText = "Briefing handshake failed.";
  }
}
// --- AIR QUALITY ENGINE (OPENAQ) ---
window._airQualityActive = false;
window._aqData = [];

window.toggleAirQuality = async function () {
  window._airQualityActive = !window._airQualityActive;
  const btn = document.getElementById("airquality-toggle-btn");
  if (btn) btn.classList.toggle("active", window._airQualityActive);

  if (!window._airQualityActive) {
    if (window.myGlobe) {
      window.myGlobe
        .hexBinPointWeight("weight")
        .hexBinPointColor(() => "rgba(239, 68, 68, 0.6)")
        .hexBinPointsData(window._gdeltData || []);
    }
    return;
  }

  try {
    const res = await fetch(
      "https://api.openaq.org/v2/latest?limit=100&parameter=pm25",
    );
    const data = await res.json();
    window._aqData = (data.results || [])
      .filter((r) => r.coordinates)
      .map((r) => ({
        lat: r.coordinates.latitude,
        lng: r.coordinates.longitude,
        weight: r.measurements[0].value,
      }));

    if (window.myGlobe) {
      window.myGlobe
        .hexBinPointWeight("weight")
        .hexBinPointColor(() => "rgba(16, 185, 129, 0.7)")
        .hexBinPointsData(window._aqData);
    }
  } catch (e) {
    console.warn("OpenAQ fetch failed", e);
  }
};

// --- CLOUD RADAR ENGINE ---
window._cloudsActive = false;
window.toggleClouds = function () {
  window._cloudsActive = !window._cloudsActive;
  const btn = document.getElementById("clouds-toggle-btn");
  if (btn) btn.classList.toggle("active", window._cloudsActive);

  if (window._cloudMesh) {
    window._cloudMesh.visible = window._cloudsActive;
  }
};

// --- GLOBAL WIND PARTICLES ---
window._windActive = false;
window.toggleWind = function () {
  window._windActive = !window._windActive;
  const btn = document.getElementById("wind-toggle-btn");
  if (btn) btn.classList.toggle("active", window._windActive);

  if (window._windParticles) {
    window._windParticles.visible = window._windActive;
  }
};

window.playTacticalSound = function (type) {
  const audio = new Audio(`/audio/${type}.mp3`);
  audio.volume = 0.1;
  audio.play();
};
window.myGlobe = null;

function initMap(type) {
  projectionType = type;
  const container = document.getElementById("map-container");
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

  if (type === "2d") {
    document.getElementById("projection-label").innerText =
      "Orbital Interface: 2D Active";
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
    document.getElementById("projection-label").innerText =
      "Orbital Interface: 3D WebGL";
    currentProjection = () => [0, 0];
    window.syncMapOverlays = function () {};

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
          if (hoverD === hoverObj) return; // Prevent infinite re-render loop locking the main thread

          const t = document.getElementById("map-tooltip");
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
          // Trigger reactivity natively without re-injecting the massive polygon array
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

    // --- PHASE 5: MULTI-LAYER TOPOGRAPHY & RADAR ---
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

      // --- PHASE 11: GLOBAL WIND PARTICLES ---
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
        if (projectionType !== "3d" || !window.myGlobe) return;
        window._windParticles.rotation.y += 0.001;
        window._windParticles.rotation.x += 0.0002;
        requestAnimationFrame(animateWind);
      })();

      // --- PHASE 5: CLOUD RADAR LAYER ---
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
        if (projectionType !== "3d" || !window.myGlobe || !window._cloudMesh)
          return;
        window._cloudMesh.rotation.y += 0.0004;
        requestAnimationFrame(animateClouds);
      })();
    }

    // Embed Submarine Cable Topology
    fetch(
      "https://raw.githubusercontent.com/telegeography/www.submarinecablemap.com/master/web/public/api/v3/cable/cable-geo.json",
    )
      .then((res) => res.json())
      .then((cableGeo) => {
        if (projectionType !== "3d") return;
        const cablePaths = [];
        cableGeo.features.forEach((feature) => {
          if (feature.geometry && feature.geometry.type === "LineString") {
            cablePaths.push({ coords: feature.geometry.coordinates });
          } else if (
            feature.geometry &&
            feature.geometry.type === "MultiLineString"
          ) {
            feature.geometry.coordinates.forEach((line) =>
              cablePaths.push({ coords: line }),
            );
          }
        });
        if (window.myGlobe.pathsData) {
          window.myGlobe
            .pathsData(cablePaths)
            .pathPoints("coords")
            .pathPointLat((p) => p[1])
            .pathPointLng((p) => p[0])
            .pathColor(() => "rgba(6, 182, 212, 0.35)")
            .pathDashLength(0.1)
            .pathDashGap(0.008)
            .pathDashAnimateTime(12000)
            .pathStroke(1.5);
        }
      })
      .catch((err) => console.warn("Topology cable layer fetch failed", err));
  }
}

const _tooltipCache = {};
async function showRichTooltip(e, d) {
  const t = document.getElementById("map-tooltip");
  t.style.left = e.pageX + 15 + "px";
  t.style.top = e.pageY - 15 + "px";
  t.classList.remove("hidden");
  const name = d.properties.name;

  document.getElementById("tooltip-name").innerText = name;
  document.getElementById("tooltip-flag").src = "";
  document.getElementById("tooltip-flag").classList.add("hidden");
  document.getElementById("tooltip-label-1").innerText = "Capital";
  document.getElementById("tooltip-label-2").innerText = "Pop.";
  document.getElementById("tooltip-capital").innerText = "...";
  document.getElementById("tooltip-pop").innerText = "...";
  if (_tooltipCache[name]) {
    const c = _tooltipCache[name];
    document.getElementById("tooltip-flag").src = c.flag;
    document.getElementById("tooltip-flag").classList.remove("hidden");
    document.getElementById("tooltip-capital").innerText = c.capital;
    document.getElementById("tooltip-pop").innerText = c.pop;
    return;
  }
  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=true&fields=name,flags,capital,population`,
    );
    const [c] = await res.json();
    const entry = {
      flag: c.flags?.svg || c.flags?.png || "",
      capital: c.capital?.[0] || "—",
      pop:
        c.population >= 1e6
          ? (c.population / 1e6).toFixed(1) + "M"
          : c.population?.toLocaleString() || "—",
    };
    _tooltipCache[name] = entry;

    if (
      !t.classList.contains("hidden") &&
      document.getElementById("tooltip-name").innerText === name
    ) {
      document.getElementById("tooltip-flag").src = entry.flag;
      document.getElementById("tooltip-flag").classList.remove("hidden");
      document.getElementById("tooltip-capital").innerText = entry.capital;
      document.getElementById("tooltip-pop").innerText = entry.pop;
    }
  } catch (_) {
    document.getElementById("tooltip-capital").innerText = "—";
    document.getElementById("tooltip-pop").innerText = "—";
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
  document.getElementById("sidebar").scrollIntoView({ behavior: "smooth" });
  if (d && d.properties) {
    document.getElementById("selected-country-name").innerText =
      d.properties.name;
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
  } catch (_) {}
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
  document
    .querySelectorAll(".nav-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((c) => c.classList.remove("active"));
  const tabBtn = Array.from(document.querySelectorAll(".nav-tab")).find((btn) =>
    btn.innerText.toLowerCase().includes(id.toLowerCase()),
  );
  if (tabBtn) tabBtn.classList.add("active");
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
  document.getElementById("search-overlay").classList.add("hidden");
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
  document.getElementById("selected-country-name").innerText =
    "GLOBAL SURVEILLANCE";
  if (window.generateAIBriefing) window.generateAIBriefing("Global Context");
  if (window.fetchGDELTEvents) window.fetchGDELTEvents("");
  const flagBox = document.getElementById("active-sector-display");
  if (flagBox) flagBox.classList.add("hidden");
  if (projectionType === "2d") {
    if (svg && zoom)
      svg.transition().duration(1200).call(zoom.transform, d3.zoomIdentity);
  } else if (window.myGlobe) {
    window.myGlobe.pointOfView({ lat: 0, lng: 0, altitude: 2.3 }, 1200);
  }
  window.fetchNews();
  if (window.resetWeatherData) window.resetWeatherData();

  const hp = document.getElementById("hierarchy-panel");
  if (hp) hp.classList.add("hidden");
  const stateEl = document.getElementById("state-selector");
  if (stateEl) stateEl.classList.add("hidden");
  const cityEl = document.getElementById("city-selector");
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
    // Wait for display block to apply before transitioning opacity
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
      document.getElementById("search-overlay").classList.add("hidden");
      document.getElementById("about-overlay").classList.add("hidden");
    }
  };
}
function updateSystemTime() {
  const now = new Date();
  document.getElementById("system-time").innerText = now.toLocaleTimeString(
    "en-US",
    { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" },
  );
  if (countryUTCOffset) {
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    let off = 0;
    const match = countryUTCOffset.match(/UTC([+-]\d+):?(\d+)?/);
    if (match)
      off = parseInt(match[1]) * 60 + (match[2] ? parseInt(match[2]) : 0);
    const localDate = new Date(utc + 60000 * off);
    const localEl = document.getElementById("local-time");
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
      .replace(".", "");
    btn.classList.remove("text-red-500", "animate-pulse");
    if (command.includes("go to"))
      window.selectFromSearch(command.replace("go to ", "").trim());
    else if (command.includes("analyze")) window.switchTab("intel");
    else if (command.includes("news")) window.switchTab("news");
  };
  recognition.onerror = () =>
    btn.classList.remove("text-red-500", "animate-pulse");
};
window.personalizeSession = (user) => {
  const safeName = user.displayName || user.email.split("@")[0];
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
  const c = document.getElementById("map-container");
  if (c) {
    d3.select("#world-map").attr(
      "viewBox",
      `0 0 ${c.clientWidth} ${c.clientHeight}`,
    );
    initMap(projectionType);
  }
});

window._chronosOffset = 0;
window.updateChronos = function (val) {
  window._chronosOffset = parseInt(val, 10);
  const display = document.getElementById("chronos-display");
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
    // Automatically reset the timeline to LIVE when closed
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

  const combinedData = [...filteredSeismic, ...window._hexLayers.gdelt];
  const magColor = (m) =>
    m >= 7 ? "#ef4444" : m >= 6 ? "#f97316" : m >= 5 ? "#eab308" : "#10b981";
  const magToHeight = (mag) => Math.max(0.01, (mag - 3) * 0.04);

  window.myGlobe
    .hexBinPointsData(combinedData)
    .hexBinPointLat((d) => d.lat)
    .hexBinPointLng((d) => d.lng)
    .hexBinPointWeight((d) => (d.type === "gdelt" ? d.count : d.mag))
    .hexBinResolution(3)
    .hexTopColor((d) =>
      d.points[0].type === "gdelt" ? "#ef4444" : magColor(d.points[0].mag),
    )
    .hexSideColor((d) =>
      d.points[0].type === "gdelt" ? "#991b1b" : magColor(d.points[0].mag),
    )
    .hexAltitude((d) =>
      d.points[0].type === "gdelt"
        ? Math.max(0.05, d.points[0].count * 0.0015)
        : magToHeight(d.points[0].mag),
    )
    .onHexHover((hex) => {
      const t = document.getElementById("map-tooltip");
      if (hex && hex.points && hex.points.length > 0) {
        const pt = hex.points[0];
        document.getElementById("tooltip-flag").classList.add("hidden");
        if (pt.type === "gdelt") {
          document.getElementById("tooltip-name").innerText = `${pt.place}`;
          document.getElementById("tooltip-label-1").innerText = "Type";
          document.getElementById("tooltip-label-2").innerText = "Intensity";
          document.getElementById("tooltip-capital").innerText =
            "Armed Conflict";
          document.getElementById("tooltip-pop").innerText =
            pt.count + " Events";
        } else {
          document.getElementById("tooltip-name").innerText =
            `M${pt.mag.toFixed(1)} — ${pt.place}`;
          document.getElementById("tooltip-label-1").innerText = "Depth";
          document.getElementById("tooltip-label-2").innerText = "Trigger";
          document.getElementById("tooltip-capital").innerText =
            `${pt.depth || "?"} km`;
          document.getElementById("tooltip-pop").innerText = "Seismic Spike";
        }
        t.style.left = window.mouseX + 15 + "px";
        t.style.top = window.mouseY - 15 + "px";
        t.classList.remove("hidden");
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
    const magColor = (m) =>
      m >= 7 ? "#ef4444" : m >= 6 ? "#f97316" : m >= 5 ? "#eab308" : "#10b981";

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
          const t = document.getElementById("map-tooltip");
          if (t) {
            document.getElementById("tooltip-name").innerText =
              `M${mag.toFixed(1)} — ${place}`;
            document.getElementById("tooltip-flag").classList.add("hidden");
            document.getElementById("tooltip-label-1").innerText = "Depth";
            document.getElementById("tooltip-label-2").innerText = "Time";
            document.getElementById("tooltip-capital").innerText =
              `${f.geometry.coordinates[2]?.toFixed(0) ?? "?"} km`;
            document.getElementById("tooltip-pop").innerText = new Date(
              f.properties.time,
            )
              .toUTCString()
              .slice(0, 22);
            t.style.left = event.pageX + 15 + "px";
            t.style.top = event.pageY - 15 + "px";
            t.classList.remove("hidden");
          }
        })
        .on("mouseleave", () => {
          const t = document.getElementById("map-tooltip");
          if (t) t.classList.add("hidden");
        });
    });
  } catch (e) {
    console.error("USGS fetch failed", e);
  }
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
          const t = document.getElementById("map-tooltip");
          if (t) {
            const data = d3.select(this).datum();
            document.getElementById("tooltip-name").innerText =
              callsign || "UNKNOWN";
            document.getElementById("tooltip-flag").classList.add("hidden");
            document.getElementById("tooltip-label-1").innerText = "Altitude";
            document.getElementById("tooltip-label-2").innerText = "Velocity";
            document.getElementById("tooltip-capital").innerText =
              `${data.alt ? (data.alt * 3.28084).toFixed(0) : "N/A"} ft`;
            document.getElementById("tooltip-pop").innerText =
              `${data.vel ? (data.vel * 1.94384).toFixed(0) : "N/A"} kts`;
            t.style.left = event.pageX + 15 + "px";
            t.style.top = event.pageY - 15 + "px";
            t.classList.remove("hidden");
          }
        })
        .on("mouseleave", () => {
          const t = document.getElementById("map-tooltip");
          if (t) t.classList.add("hidden");
        });
    });
  } catch (e) {
    console.warn("OpenSky fetch failed", e);
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
            const t = document.getElementById("map-tooltip");
            if (t) {
              document.getElementById("tooltip-name").innerText =
                f.properties.name || "Conflict Zone";
              document.getElementById("tooltip-flag").classList.add("hidden");
              document.getElementById("tooltip-label-1").innerText = "Type";
              document.getElementById("tooltip-label-2").innerText =
                "Intensity";
              document.getElementById("tooltip-capital").innerText =
                "Armed Conflict";
              document.getElementById("tooltip-pop").innerText =
                (f.properties.count || 50) + " Events";
              t.style.left = event.pageX + 15 + "px";
              t.style.top = event.pageY - 15 + "px";
              t.classList.remove("hidden");
            }
          })
          .on("mouseleave", () => {
            const t = document.getElementById("map-tooltip");
            if (t) t.classList.add("hidden");
          });
      });
    }
  }
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
};

// --- ISS ORBITAL TRACKING ENGINE ---
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
    // Scale ISS altitude: earth radius is ~6371km, ISS is ~400km (400/6371 = ~0.06)
    window._issData[0].alt = data.altitude / 6371 + 0.1;
    window._issData[0].velocity = data.velocity;

    // Attach custom 3D mesh processing the first cycle
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

    // Inject the array reference back in to trigger WebGL recalculation
    window.myGlobe.objectsData(window._issData);

    // Merge radar pings with ISS ping
    window.myGlobe.ringsData([...window._radarPings, ...window._issData]);
  } catch (e) {
    console.warn("ISS orbital tracking fetch failed", e);
  }
};

if (!window._issInterval) {
  setTimeout(() => window.updateISS(), 2000);
  window._issInterval = setInterval(window.updateISS, 3000);
}

// --- CYBER WARFARE STREAM ENGINE ---
window._cyberDataCenters = [
  { lat: 38.8951, lng: -77.0364 }, // Washington
  { lat: 55.7558, lng: 37.6173 }, // Moscow
  { lat: 39.9042, lng: 116.4074 }, // Beijing
  { lat: 51.5074, lng: -0.1278 }, // London
  { lat: 35.6762, lng: 139.6503 }, // Tokyo
  { lat: -33.8688, lng: 151.2093 }, // Sydney
  { lat: 50.1109, lng: 8.6821 }, // Frankfurt
  { lat: 1.3521, lng: 103.8198 }, // Singapore
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

// --- GLOBE THEME TOGGLE ---
if (typeof window._globeTheme === "undefined") {
  window._globeTheme = "night";
}

// --- CLOUD ROTATION & VIEW TOGGLES ---
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

// --- CLICK-TO-INTERACT MAP PROTECTION ---
window.activateMapInteraction = function () {
  const overlay = document.getElementById("map-interaction-overlay");
  if (overlay) {
    overlay.style.pointerEvents = "none";
    overlay.style.opacity = "0";
  }
};

// Listen for clicks outside the map container to re-enable interaction protection
document.addEventListener("click", (e) => {
  const mapContainer = document.getElementById("map-container");
  const overlay = document.getElementById("map-interaction-overlay");

  if (mapContainer && overlay && overlay.style.pointerEvents === "none") {
    // If the click was NOT inside the map container or its children
    if (!mapContainer.contains(e.target)) {
      overlay.style.pointerEvents = "auto";
      overlay.style.opacity = "1";
    }
  }
});
