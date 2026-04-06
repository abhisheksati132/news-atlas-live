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

// Initialize with major economies
const SUGGESTED_NODES = [
  "United States", "India", "China", "Germany", "United Kingdom", 
  "France", "Japan", "Brazil", "Canada", "South Korea", 
  "Italy", "Spain", "Australia", "Mexico", "Indonesia", 
  "Netherlands", "Saudi Arabia", "Turkey", "Singapore", "Russia",
  "Switzerland", "United Arab Emirates", "Sweden", "Belgium"
];

function renderTrending() {
  const resContainer = document.getElementById("search-results");
  const searchInput = document.getElementById("country-search");
  if (!resContainer || !searchInput) return;

  const query = searchInput.value.trim().toLowerCase();

  // Expanded fallback for robust initial view (24 nodes - fills 6 rows of 4 perfectly)
  const fallback = [
    { name: { common: "United States" }, region: "Americas", population: 331002651, flags: { svg: "https://flagcdn.com/us.svg" }, capital: ["Washington D.C."] },
    { name: { common: "India" }, region: "Asia", population: 1380004385, flags: { svg: "https://flagcdn.com/in.svg" }, capital: ["New Delhi"] },
    { name: { common: "China" }, region: "Asia", population: 1402112000, flags: { svg: "https://flagcdn.com/cn.svg" }, capital: ["Beijing"] },
    { name: { common: "Germany" }, region: "Europe", population: 83240525, flags: { svg: "https://flagcdn.com/de.svg" }, capital: ["Berlin"] },
    { name: { common: "Japan" }, region: "Asia", population: 125836021, flags: { svg: "https://flagcdn.com/jp.svg" }, capital: ["Tokyo"] },
    { name: { common: "United Kingdom" }, region: "Europe", population: 67215293, flags: { svg: "https://flagcdn.com/gb.svg" }, capital: ["London"] },
    { name: { common: "France" }, region: "Europe", population: 67391582, flags: { svg: "https://flagcdn.com/fr.svg" }, capital: ["Paris"] },
    { name: { common: "Brazil" }, region: "Americas", population: 212559417, flags: { svg: "https://flagcdn.com/br.svg" }, capital: ["Brasília"] },
    { name: { common: "Canada" }, region: "Americas", population: 38005238, flags: { svg: "https://flagcdn.com/ca.svg" }, capital: ["Ottawa"] },
    { name: { common: "South Korea" }, region: "Asia", population: 51780579, flags: { svg: "https://flagcdn.com/kr.svg" }, capital: ["Seoul"] },
    { name: { common: "Italy" }, region: "Europe", population: 59554023, flags: { svg: "https://flagcdn.com/it.svg" }, capital: ["Rome"] },
    { name: { common: "Spain" }, region: "Europe", population: 47351567, flags: { svg: "https://flagcdn.com/es.svg" }, capital: ["Madrid"] },
    { name: { common: "Australia" }, region: "Oceania", population: 25687041, flags: { svg: "https://flagcdn.com/au.svg" }, capital: ["Canberra"] },
    { name: { common: "Mexico" }, region: "Americas", population: 128932753, flags: { svg: "https://flagcdn.com/mx.svg" }, capital: ["Mexico City"] },
    { name: { common: "Indonesia" }, region: "Asia", population: 273523615, flags: { svg: "https://flagcdn.com/id.svg" }, capital: ["Jakarta"] },
    { name: { common: "Netherlands" }, region: "Europe", population: 17441139, flags: { svg: "https://flagcdn.com/nl.svg" }, capital: ["Amsterdam"] },
    { name: { common: "Saudi Arabia" }, region: "Asia", population: 34813871, flags: { svg: "https://flagcdn.com/sa.svg" }, capital: ["Riyadh"] },
    { name: { common: "Turkey" }, region: "Asia", population: 84339067, flags: { svg: "https://flagcdn.com/tr.svg" }, capital: ["Ankara"] },
    { name: { common: "Singapore" }, region: "Asia", population: 5850342, flags: { svg: "https://flagcdn.com/sg.svg" }, capital: ["Singapore"] },
    { name: { common: "Russia" }, region: "Europe", population: 144104080, flags: { svg: "https://flagcdn.com/ru.svg" }, capital: ["Moscow"] },
    { name: { common: "Switzerland" }, region: "Europe", population: 8636896, flags: { svg: "https://flagcdn.com/ch.svg" }, capital: ["Bern"] },
    { name: { common: "United Arab Emirates" }, region: "Asia", population: 9890400, flags: { svg: "https://flagcdn.com/ae.svg" }, capital: ["Abu Dhabi"] },
    { name: { common: "Sweden" }, region: "Europe", population: 10353442, flags: { svg: "https://flagcdn.com/se.svg" }, capital: ["Stockholm"] },
    { name: { common: "Belgium" }, region: "Europe", population: 11589623, flags: { svg: "https://flagcdn.com/be.svg" }, capital: ["Brussels"] }
  ];

  let sourceData = (window.globalSearchData && window.globalSearchData.length > 50) 
    ? window.globalSearchData 
    : fallback;

  let searchData = [];
  if (query) {
    searchData = sourceData.filter(c =>
      c.name.common.toLowerCase().includes(query) ||
      (c.name.official && c.name.official.toLowerCase().includes(query))
    ).slice(0, 24);
  } else {
    // Top 24 economies for a full symmetric load
    searchData = sourceData.filter(c => SUGGESTED_NODES.includes(c.name.common)).slice(0, 24);
    if (searchData.length < 24) searchData = sourceData.slice(0, 24);
  }

  let html = "";
  if (searchData.length > 0) {
    // Registry Matches Heading
    html = `<div style="grid-column:1/-1; margin-bottom:1rem; display:flex; align-items:center; gap:1rem;">
              <span style="font-size:10px; font-weight:800; color:var(--brand); text-transform:uppercase; letter-spacing:0.12em;">Intelligence Registry</span>
              <div style="flex:1; height:1px; background:var(--divider);"></div>
            </div>`;
            
    html += searchData.map(c => {
      const name = c.name.common;
      const pop = c.population >= 1000000000
        ? (c.population / 1000000000).toFixed(1) + "B"
        : (c.population / 1000000).toFixed(0) + "M";
      const capital = c.capital ? c.capital[0] : "—";
      const subregion = c.subregion || c.region || "Global";
      
      return `
        <div class="country-card" onclick="window.selectFromSearch('${name.replace(/'/g, "\\'")}')" style="padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; min-height:160px;">
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem;">
              <img src="${c.flags.svg}" alt="${name}" style="width:32px; height:20px; object-fit:cover; border-radius:3px; border:1px solid var(--border);">
              <div style="display:flex; align-items:center; gap:0.4rem;">
                <span style="width:5px; height:5px; border-radius:50%; background:var(--up); display:inline-block;"></span>
                <span style="font-size:9px; font-weight:700; color:var(--up); text-transform:uppercase;">Live</span>
              </div>
            </div>
            <h3 style="font-family:var(--font-serif); font-size:1.25rem; font-weight:700; color:var(--ink-900); margin-bottom:0.1rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${name}">${name}</h3>
            <p style="font-size:10px; font-weight:600; color:var(--text-faint); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:1rem;">${subregion}</p>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:flex-end; padding-top:1rem; border-top:1px solid var(--divider);">
            <div>
              <div style="font-size:9px; font-weight:700; color:var(--text-faint); text-transform:uppercase; margin-bottom:0.1rem;">Pop.</div>
              <div style="font-size:13px; font-weight:700; color:var(--ink-800);">${pop}</div>
            </div>
            <div style="text-align:right; max-width:60%;">
              <div style="font-size:9px; font-weight:700; color:var(--text-faint); text-transform:uppercase; margin-bottom:0.1rem;">Capital</div>
              <div style="font-size:13px; font-weight:700; color:var(--ink-800); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${capital}">${capital}</div>
            </div>
          </div>
        </div>`;
    }).join("");
  } else if (query) {
    html = `<div style="grid-column:1/-1; padding:4rem 0; text-align:center;">
              <div style="display:inline-flex; flex-direction:column; align-items:center; gap:1.5rem;">
                <div style="width:48px; height:48px; border-radius:50%; background:var(--surface-2); border:1px solid var(--border); display:flex; align-items:center; justify-content:center;">
                  <i class="fas fa-database" style="color:var(--text-faint); font-size:1.25rem;"></i>
                </div>
                <div>
                  <h3 style="font-family:var(--font-serif); font-size:1.25rem; font-weight:700; color:var(--ink-900); margin-bottom:0.5rem;">No Registry Match</h3>
                  <p style="font-size:13px; color:var(--text-muted); max-width:320px;">The intelligence database contains no direct entries for "${query}". Checking geographic coordinates...</p>
                </div>
              </div>
            </div>`;
  }

  resContainer.innerHTML = html;

  if (query.length > 2 && mapboxToken) {
    clearTimeout(window._searchDebounce);
    window._searchDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&types=place,region,locality&limit=8`);
        const json = await res.json();
        if (json.features && json.features.length > 0) {
          const geoHeader = `
            <div style="grid-column:1/-1; margin:2rem 0 1rem; display:flex; align-items:center; gap:1rem;">
              <span style="font-size:10px; font-weight:800; color:var(--text-faint); text-transform:uppercase; letter-spacing:0.12em;">Geographic Locations</span>
              <div style="flex:1; height:1px; background:var(--divider);"></div>
            </div>`;
            
          const geoHtml = json.features.map(f => {
            const types = f.place_type.join(" / ").toUpperCase();
            return `
            <div class="country-card" onclick="window.selectFromSearch('${f.place_name.replace(/'/g, "\\'")}')" style="padding:1.25rem; display:flex; flex-direction:column; gap:0.75rem;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <span style="font-size:9px; font-weight:800; color:var(--brand); text-transform:uppercase; letter-spacing:0.04em;">${types}</span>
                <i class="fas fa-map-marker-alt" style="font-size:10px; color:var(--text-faint);"></i>
              </div>
              <div>
                <h4 style="font-family:var(--font-serif); font-size:1.1rem; font-weight:700; color:var(--ink-900); margin-bottom:0.2rem;">${f.text}</h4>
                <p style="font-size:11px; color:var(--text-muted); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${f.place_name}</p>
              </div>
              <div style="margin-top:auto; padding-top:0.75rem; border-top:1px solid var(--divider); display:flex; align-items:center; justify-content:space-between;">
                <span style="font-size:9px; font-weight:600; color:var(--text-faint); letter-spacing:0.02em;">LAT: ${f.center[1].toFixed(2)} LON: ${f.center[0].toFixed(2)}</span>
              </div>
            </div>`;
          }).join("");
          
          if (query === searchInput.value.trim().toLowerCase()) {
            resContainer.innerHTML = html + geoHeader + geoHtml;
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