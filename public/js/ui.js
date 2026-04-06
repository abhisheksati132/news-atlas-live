const TOAST_DURATION = 4000;
let toastQueue = [];
let toastEl = null;
let toastTimeout = null;

function ensureToastContainer() {
  if (toastEl) return toastEl;
  toastEl = document.getElementById("toast-container");
  if (toastEl) return toastEl;
  toastEl = document.createElement("div");
  toastEl.id = "toast-container";
  toastEl.setAttribute("aria-live", "polite");
  toastEl.className = "fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-2 pointer-events-none max-w-[90vw]";
  document.body.appendChild(toastEl);
  return toastEl;
}

function showNextToast() {
  if (toastQueue.length === 0) return;
  const container = ensureToastContainer();
  const { message, type } = toastQueue.shift();
  const div = document.createElement("div");
  
  // Premium professional toast styling
  const baseClass = "px-5 py-3 rounded-lg border shadow-lg pointer-events-auto transition-all duration-300 font-medium text-sm ";
  let typeClass = "bg-white border-gray-200 text-gray-800";
  
  if (type === "success") typeClass = "bg-white border-green-200 text-green-700";
  if (type === "error") typeClass = "bg-white border-red-200 text-red-700";
  if (type === "info") typeClass = "bg-white border-blue-200 text-slate-600";
  
  div.className = baseClass + typeClass;
  div.innerText = message;
  div.setAttribute("role", "status");
  container.appendChild(div);
  
  toastTimeout = setTimeout(() => {
    div.style.opacity = "0";
    div.style.transform = "translateY(10px)";
    setTimeout(() => div.remove(), 300);
    toastTimeout = null;
    showNextToast();
  }, TOAST_DURATION);
}

window.showToast = function (message, type = "info") {
  toastQueue.push({ message, type });
  if (!toastTimeout) showNextToast();
};

window.toggleAboutOverlay = function () {
  const el = document.getElementById('about-overlay');
  if (el) el.classList.toggle('hidden');
};

window.closeAboutOverlay = function () {
  const el = document.getElementById('about-overlay');
  if (el) el.classList.add('hidden');
};

let mapboxToken = null;
fetch('/api/config').then(r => r.json()).then(d => mapboxToken = d.mapboxToken);

// Initialize with major economies to ensure a populated initial view
const SUGGESTED_NODES = ["United States", "India", "China", "Germany", "United Kingdom", "France", "Japan", "Brazil", "Canada", "Singapore", "Australia", "United Arab Emirates"];

function renderTrending() {
  const resContainer = document.getElementById("search-results");
  const searchInput = document.getElementById("country-search");
  if (!resContainer || !searchInput) return;

  const query = searchInput.value.trim().toLowerCase();
  let searchData = [];
  
  const sourceData = (window.globalSearchData && window.globalSearchData.length > 0) 
    ? window.globalSearchData 
    : [{ name: { common: "United States" }, region: "Americas", population: 331000000, flags: { svg: "https://flagcdn.com/us.svg" }, capital: ["Washington D.C."] },
       { name: { common: "India" }, region: "Asia", population: 1400000000, flags: { svg: "https://flagcdn.com/in.svg" }, capital: ["New Delhi"] },
       { name: { common: "China" }, region: "Asia", population: 1400000000, flags: { svg: "https://flagcdn.com/cn.svg" }, capital: ["Beijing"] },
       { name: { common: "United Kingdom" }, region: "Europe", population: 67000000, flags: { svg: "https://flagcdn.com/gb.svg" }, capital: ["London"] }];

  if (query) {
    searchData = sourceData.filter(c =>
      c.name.common.toLowerCase().includes(query) ||
      (c.name.official && c.name.official.toLowerCase().includes(query))
    ).slice(0, 15);
  } else {
    searchData = sourceData.filter(c => SUGGESTED_NODES.includes(c.name.common)).slice(0, 12);
  }

  let html = "";
  if (searchData.length > 0) {
    html = searchData.map(c => {
      const name = c.name.common;
      const region = c.region || "Global";
      const pop = c.population >= 1000000000
        ? (c.population / 1000000000).toFixed(2) + "B"
        : (c.population / 1000000).toFixed(1) + "M";
      const capital = c.capital ? c.capital[0] : "—";
      const subregion = c.subregion || region;
      return `
        <div class="country-card" onclick="window.selectFromSearch('${name.replace(/'/g, "\\'")}')">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.25rem;">
            <div style="width:44px;height:30px;border-radius:4px;overflow:hidden;border:1px solid var(--border);flex-shrink:0;box-shadow:var(--shadow-xs);">
              <img src="${c.flags.svg}" alt="${name} flag" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <div style="display:flex;align-items:center;gap:0.4rem;">
              <span style="width:6px;height:6px;border-radius:50%;background:var(--up);display:inline-block;"></span>
              <span style="font-size:10px;font-weight:600;color:var(--up);text-transform:uppercase;letter-spacing:0.06em;">Live</span>
            </div>
          </div>
          <div style="margin-bottom:1.25rem;">
            <h3 style="font-family:var(--font-serif);font-size:1.2rem;font-weight:700;color:var(--ink-900);line-height:1.2;margin-bottom:0.25rem;">${name}</h3>
            <p style="font-size:11px;font-weight:500;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.1em;">${subregion}</p>
          </div>
          <div style="display:flex;gap:2rem;padding-top:1rem;border-top:1px solid var(--divider);">
            <div>
              <div style="font-size:10px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.3rem;">Population</div>
              <div style="font-size:1rem;font-weight:700;color:var(--ink-800);font-variant-numeric:tabular-nums;">${pop}</div>
            </div>
            <div>
              <div style="font-size:10px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.3rem;">Capital</div>
              <div style="font-size:1rem;font-weight:700;color:var(--ink-800);">${capital}</div>
            </div>
          </div>
        </div>`;
    }).join("");
  } else if (query) {
    html = `<div class="col-span-full py-24 text-center">
              <div class="inline-flex flex-col items-center gap-6">
                <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                  <i class="fas fa-search text-2xl text-blue-200"></i>
                </div>
                <div class="flex flex-col gap-2">
                  <h3 class="text-lg font-bold text-gray-900">No Registry Match</h3>
                  <p class="text-gray-500 text-sm max-w-xs">Our intelligence network found no entries matching "${query}". Check the spelling or enter a country name.</p>
                </div>
              </div>
            </div>`;
  }

  resContainer.innerHTML = html;

  if (query.length > 2 && mapboxToken) {
    clearTimeout(window._searchDebounce);
    window._searchDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&types=place,region,locality&limit=6`);
        const json = await res.json();
        if (json.features && json.features.length > 0) {
          const registryHtml = json.features.map(f => {
            const types = f.place_type.join(" / ").toUpperCase();
            return `
            <div class="group relative bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col gap-3" 
                 onclick="window.selectFromSearch('${f.place_name.replace(/'/g, "\\'")}')">
              <div class="flex items-center gap-2">
                <span class="text-[9px] text-blue-600 font-bold uppercase tracking-wider">${types}</span>
              </div>
              <div>
                 <span class="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">${f.text}</span>
                 <p class="text-xs text-gray-700 font-medium leading-relaxed line-clamp-2">${f.place_name}</p>
              </div>
              <div class="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                 <span class="text-[10px] text-gray-600 font-medium">Location: ${f.center[1].toFixed(2)}, ${f.center[0].toFixed(2)}</span>
                 <i class="fas fa-map-marker-alt text-xs text-gray-200"></i>
              </div>
            </div>`;
          }).join("");
          if (query === searchInput.value.trim().toLowerCase()) {
            resContainer.innerHTML = html + registryHtml;
          }
        }
      } catch (e) { console.warn("Geocoding search failed"); }
    }, 400);
  }
}

window.toggleSearch = () => window.switchTab('search');

window.selectFromSearch = (name) => {
  const parts = name.split(",");
  const countryQuery = (parts.length > 2 ? parts[parts.length - 1] : parts[0]).trim();
  const locationLabel = (parts.length > 1 ? parts[0] : "Location").trim();

  if (window.handleCountryClickByName) {
    window.handleCountryClickByName(countryQuery);
  }
  if (window.switchTab) {
    window.switchTab('summary');
  }

  const ctxLocation = document.getElementById("ctx-location");
  if (ctxLocation) ctxLocation.innerText = locationLabel;

  if (window.onCountrySelected) {
    window.onCountrySelected(name);
  }

  if (window.mapEngine && window.mapEngine.map) {
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(name)}.json?access_token=${mapboxToken}&limit=1`)
      .then(r => r.json())
      .then(data => {
        if (data.features && data.features[0]) {
          const [lng, lat] = data.features[0].center;
          window.mapEngine.map.flyTo({ center: [lng, lat], zoom: 6, duration: 2000 });
        }
      }).catch(e => console.warn("Selection geocoding failed"));
  }
};

window.renderTrending = renderTrending;

document.addEventListener("DOMContentLoaded", () => {
  const searchInp = document.getElementById("country-search");
  if (searchInp) {
    searchInp.addEventListener("input", () => window.renderTrending());
    searchInp.addEventListener("keydown", (e) => {
      if (e.key === "Escape") window.toggleSearch();
    });
  }
});