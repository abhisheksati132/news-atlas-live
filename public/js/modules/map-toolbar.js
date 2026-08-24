/**
 * Map toolbar controller — owns every control in the left rail.
 * All state lives here; buttons are wired by id (mtb-*).
 */

let terrainOn = false;
let tilted = false;
let radarOn = false;
let currentStyleName = null;

function engine() {
  const e = window.mapEngine;
  return e && e.map && e.ready ? e : null;
}

function setActive(id, on) {
  const btn = document.getElementById(id);
  if (btn) btn.classList.toggle("active", !!on);
}

function toast(msg, type) {
  if (window.showToast) window.showToast(msg, type || "info");
}

/* ------------------------------ basemap styles ------------------------------ */
function styleList() {
  const e = engine();
  if (e && e.hasToken) {
    return [
      { name: "Dark", url: "mapbox://styles/mapbox/dark-v11" },
      { name: "Light", url: "mapbox://styles/mapbox/light-v11" },
      { name: "Streets", url: "mapbox://styles/mapbox/streets-v12" },
      { name: "Satellite", url: "mapbox://styles/mapbox/satellite-streets-v12" },
      { name: "Outdoors", url: "mapbox://styles/mapbox/outdoors-v12" }
    ];
  }
  return [
    { name: "Dark", url: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" },
    { name: "Light", url: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" },
    { name: "Voyager", url: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json" }
  ];
}

function buildStyleMenu() {
  const menu = document.getElementById("mtb-style-menu");
  if (!menu) return;
  menu.innerHTML = "";
  styleList().forEach((s) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "mtb-menu-item" + (currentStyleName === s.name ? " active" : "");
    item.innerHTML = `<span class="mtb-check">${currentStyleName === s.name ? '<i class="fas fa-check"></i>' : ""}</span>${s.name}`;
    item.addEventListener("click", () => {
      const e = engine();
      if (!e) return;
      try {
        e.setStyle(s.url);
        currentStyleName = s.name;
        toast(`Basemap: ${s.name}`, "success");
      } catch (err) {
        toast("Could not switch basemap", "error");
      }
      closeMenus();
      buildStyleMenu();
    });
    menu.appendChild(item);
  });
}

/* ------------------------------ data layers ------------------------------ */
const DATA_LAYERS = [
  { id: "default", name: "Standard" },
  { id: "gdp", name: "GDP size" },
  { id: "growth", name: "GDP growth" }
];
let currentDataLayer = "default";

function buildLayersMenu() {
  const menu = document.getElementById("mtb-layers-menu");
  if (!menu) return;
  menu.innerHTML = "";
  DATA_LAYERS.forEach((l) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "mtb-menu-item" + (currentDataLayer === l.id ? " active" : "");
    item.innerHTML = `<span class="mtb-check">${currentDataLayer === l.id ? '<i class="fas fa-check"></i>' : ""}</span>${l.name}`;
    item.addEventListener("click", () => {
      currentDataLayer = l.id;
      if (window.changeMapLayer) window.changeMapLayer(l.id);
      buildLayersMenu();
      closeMenus();
    });
    menu.appendChild(item);
  });
}

/* ------------------------------ menus ------------------------------ */
function closeMenus() {
  document.querySelectorAll(".mtb-menu-wrap.open").forEach((w) => w.classList.remove("open"));
}

function bindMenu(btnId, wrapId, buildFn) {
  const btn = document.getElementById(btnId);
  const wrap = document.getElementById(wrapId);
  if (!btn || !wrap) return;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = wrap.classList.contains("open");
    closeMenus();
    if (!isOpen) {
      buildFn();
      wrap.classList.add("open");
    }
  });
}

/* ------------------------------ actions ------------------------------ */
function bindActions() {
  const on = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
  };

  on("mtb-zoom-in", () => engine()?.map.zoomIn({ duration: 300 }));
  on("mtb-zoom-out", () => engine()?.map.zoomOut({ duration: 300 }));

  on("mtb-compass", () => {
    const e = engine();
    if (e) e.map.easeTo({ bearing: 0, duration: 600 });
  });

  on("mtb-tilt", () => {
    const e = engine();
    if (!e) return;
    tilted = !tilted;
    e.map.easeTo({ pitch: tilted ? 45 : 0, duration: 700 });
    setActive("mtb-tilt", tilted);
  });

  on("mtb-projection", () => {
    const e = engine();
    if (!e) return;
    const next = e.getProjection() === "globe" ? "mercator" : "globe";
    e.setProjection(next);
    setActive("mtb-projection", next === "mercator");
    toast(next === "globe" ? "Globe view" : "Flat map view");
  });

  on("mtb-terrain", () => {
    const e = engine();
    if (!e) return;
    terrainOn = !terrainOn;
    try {
      if (terrainOn) e._addTerrain();
      else e.map.setTerrain(null);
      setActive("mtb-terrain", terrainOn);
      toast(terrainOn ? "3D terrain on" : "3D terrain off");
    } catch (err) {
      terrainOn = false;
      setActive("mtb-terrain", false);
      toast("Terrain unavailable for this basemap", "error");
    }
  });

  on("mtb-buildings", () => {
    const e = engine();
    if (!e) return;
    const result = e.toggleBuildings();
    if (result === null) {
      toast("3D buildings need a Mapbox basemap", "error");
      return;
    }
    setActive("mtb-buildings", result === true);
  });

  on("mtb-terminator", () => {
    const e = engine();
    if (!e) return;
    const isActive = e.toggleNightLayer();
    setActive("mtb-terminator", isActive);
    toast(isActive ? "Day/night shadow on" : "Day/night shadow off");
  });

  on("mtb-radar", async () => {
    radarOn = !radarOn;
    const checkbox = document.getElementById("toggle-weather-radar");
    if (checkbox) checkbox.checked = radarOn;
    setActive("mtb-radar", radarOn);
    if (window.toggleWeatherRadar) {
      await window.toggleWeatherRadar(radarOn);
      // toggleWeatherRadar unchecks on failure — sync with reality
      radarOn = checkbox ? checkbox.checked : radarOn;
      setActive("mtb-radar", radarOn);
    }
  });

  on("mtb-rotate", () => {
    const e = engine();
    if (!e) return;
    const isRotating = e.toggleAutoRotate();
    setActive("mtb-rotate", isRotating);
    toast(isRotating ? "Auto-rotate on" : "Auto-rotate off");
  });

  on("mtb-locate", () => {
    const e = engine();
    if (!e || !navigator.geolocation) {
      toast("Location unavailable", "error");
      return;
    }
    toast("Locating…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        e.map.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 11,
          pitch: 40,
          duration: 2600
        });
        if (e.setHoloHUD) {
          e.setHoloHUD([pos.coords.longitude, pos.coords.latitude], "You", { ACCURACY: `±${Math.round(pos.coords.accuracy)}m` });
        }
        toast("Location found", "success");
      },
      () => toast("Location permission denied", "error"),
      { timeout: 8000 }
    );
  });

  on("mtb-screenshot", () => {
    const e = engine();
    if (!e) return;
    try {
      e.map.once("render", () => {
        try {
          const url = e.map.getCanvas().toDataURL("image/png");
          const a = document.createElement("a");
          a.href = url;
          a.download = `newsatlas-map-${new Date().toISOString().slice(0, 10)}.png`;
          a.click();
          toast("Map image saved", "success");
        } catch (err) {
          toast("Could not capture map", "error");
        }
      });
      e.map.triggerRepaint();
    } catch (err) {
      toast("Could not capture map", "error");
    }
  });

  on("mtb-fullscreen", () => {
    const container = document.getElementById("map-box-id") || document.getElementById("map-container");
    if (!document.fullscreenElement) {
      container?.requestFullscreen?.().catch(() => toast("Fullscreen blocked", "error"));
    } else {
      document.exitFullscreen();
    }
  });

  on("mtb-reset", () => {
    tilted = false;
    setActive("mtb-tilt", false);
    if (window.resetToGlobalCenter) window.resetToGlobalCenter();
  });

  document.addEventListener("fullscreenchange", () => {
    setActive("mtb-fullscreen", !!document.fullscreenElement);
    setTimeout(() => engine()?.map.resize(), 150);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".mtb-menu-wrap")) closeMenus();
  });
}

/* ------------------------------ state sync ------------------------------ */
function syncAfterStyleChange() {
  const e = engine();
  if (!e) return;
  // Terrain/buildings are dropped on style change — reflect reality
  terrainOn = false;
  setActive("mtb-terrain", false);
  const buildingsOn = e.map.getLayer && e.map.getLayer("3d-buildings");
  setActive("mtb-buildings", !!buildingsOn);
}

export function initMapToolbar() {
  if (document.getElementById("map-toolbar").dataset.initialized) return;
  document.getElementById("map-toolbar").dataset.initialized = "true";

  // Accessibility: expose every title as an accessible name
  document.querySelectorAll("#map-toolbar .mtb-btn").forEach((btn) => {
    if (btn.title && !btn.getAttribute("aria-label")) btn.setAttribute("aria-label", btn.title);
  });

  const e = engine();

  // Feature availability
  if (e && e.hasToken) {
    const terrainBtn = document.getElementById("mtb-terrain");
    const buildingsBtn = document.getElementById("mtb-buildings");
    if (terrainBtn) terrainBtn.hidden = false;
    if (buildingsBtn) buildingsBtn.hidden = false;
  }

  bindMenu("mtb-style-btn", "mtb-style-wrap", buildStyleMenu);
  bindMenu("mtb-layers-btn", "mtb-layers-wrap", buildLayersMenu);
  bindActions();
  buildStyleMenu();
  buildLayersMenu();

  // Keep toggles honest across basemap changes
  const check = () => {
    const eng = engine();
    if (eng && eng.map) {
      eng.map.on("style.load", syncAfterStyleChange);
    }
  };
  check();
}

window.initMapToolbar = initMapToolbar;
