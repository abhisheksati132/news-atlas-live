let currentView = { level: "country", country: null, state: null, city: null };
async function onCountrySelected(countryName) {
  currentView = {
    level: "country",
    country: countryName,
    state: null,
    city: null,
  };
  const panel = document.getElementById("hierarchy-panel");
  const stateWrapper = document.getElementById("breadcrumb-state-wrapper");
  const cityWrapper = document.getElementById("breadcrumb-city-wrapper");
  const citySelector = document.getElementById("city-selector");
  const stateList = document.getElementById("state-list");
  if (stateWrapper) stateWrapper.classList.add("hidden");
  if (cityWrapper) cityWrapper.classList.add("hidden");
  if (citySelector) citySelector.classList.add("hidden");
  if (panel) panel.classList.remove("hidden");
  if (stateList)
    stateList.innerHTML =
      '<div class="text-slate-500 text-xs col-span-3 py-2">Loading regions...</div>';
  const bc = document.getElementById("breadcrumb-country");
  if (bc) bc.innerText = countryName;
  const stateSelector = document.getElementById("state-selector");
  const stateCollapseContent = document.getElementById("state-collapse-content");
  const stateCollapseIcon = document.getElementById("state-collapse-icon");
  if (stateSelector) stateSelector.classList.remove("hidden");
  const cityCollapseContent = document.getElementById("city-collapse-content");
  const cityCollapseIcon = document.getElementById("city-collapse-icon");
  if (cityCollapseContent) cityCollapseContent.classList.add("hidden");
  if (cityCollapseIcon) cityCollapseIcon.style.transform = "rotate(0deg)";
  if (window.fetchGDELTEvents) window.fetchGDELTEvents(countryName);
  try {
    const res = await fetch(
      `/api/geo?country=${encodeURIComponent(countryName)}&level=states`,
    );
    const data = await res.json();
    if (!data.states || data.states.length === 0) {
      if (stateList)
        stateList.innerHTML =
          '<div class="text-slate-500 text-xs col-span-3">No regional data available.</div>';
      return;
    }
    if (stateList) {
      stateList.innerHTML = "";
      data.states.forEach((state) => {
        const btn = document.createElement("button");
        btn.className = "text-left py-4 px-2 border-b border-white/5 hover:bg-white/[0.03] transition-all group flex justify-between items-center";
        btn.innerHTML = `
          <span class="text-[11px] font-bold text-white uppercase tracking-widest group-hover:text-slate-300 transition-colors" style="font-family: 'JetBrains Mono', monospace">${state.name}</span>
          <span class="text-[9px] font-bold text-slate-600 uppercase tracking-widest font-mono">${state.code || ""}</span>
        `;
        btn.onclick = () => selectState(countryName, state.name);
        stateList.appendChild(btn);
      });
    }
  } catch (e) {
    if (stateList)
      stateList.innerHTML =
        '<div class="text-red-500 text-xs col-span-3">Failed to load regions.</div>';
  }
}
async function selectState(countryName, stateName) {
  currentView = {
    level: "state",
    country: countryName,
    state: stateName,
    city: null,
  };
  const bsEl = document.getElementById("breadcrumb-state");
  const bsWrap = document.getElementById("breadcrumb-state-wrapper");
  const bcWrap = document.getElementById("breadcrumb-city-wrapper");
  const cityList = document.getElementById("city-list");
  const citySelector = document.getElementById("city-selector");
  if (bsEl) bsEl.innerText = stateName;
  if (bsWrap) bsWrap.classList.remove("hidden");
  if (bcWrap) bcWrap.classList.add("hidden");
  if (citySelector) citySelector.classList.remove("hidden");
  const cityCollapseContent2 = document.getElementById("city-collapse-content");
  const cityCollapseIcon2 = document.getElementById("city-collapse-icon");
  if (cityCollapseContent2) cityCollapseContent2.classList.remove("hidden");
  if (cityCollapseIcon2) cityCollapseIcon2.style.transform = "rotate(180deg)";
  if (cityList)
    cityList.innerHTML =
      '<div class="text-slate-500 text-xs col-span-3 py-2">Loading cities...</div>';
  try {
    const res = await fetch(
      `/api/geo?country=${encodeURIComponent(countryName)}&state=${encodeURIComponent(stateName)}&level=cities`,
    );
    const data = await res.json();

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(stateName + ", " + countryName)}&count=1&language=en&format=json`,
      );
      const geoData = await geoRes.json();
      if (geoData.results && geoData.results[0] && window.mapEngine?.map) {
        window.mapEngine.map.flyTo({
          center: [geoData.results[0].longitude, geoData.results[0].latitude],
          zoom: 6,
          pitch: 50,
          duration: 2500
        });
      }
    } catch (ee) { }

    if (!data.cities || data.cities.length === 0) {
      if (cityList)
        cityList.innerHTML =
          '<div class="text-slate-500 text-xs col-span-3">No city data available.</div>';
      return;
    }
    if (cityList) {
      cityList.innerHTML = "";
      data.cities.forEach((cityName) => {
        const btn = document.createElement("button");
        btn.className = "text-left py-4 px-2 border-b border-white/5 hover:bg-white/[0.03] transition-all group";
        btn.innerHTML = `<span class="text-[11px] font-bold text-white uppercase tracking-widest group-hover:text-slate-300 transition-colors" style="font-family: 'JetBrains Mono', monospace">${cityName}</span>`;
        btn.onclick = () => selectCity(countryName, stateName, cityName);
        cityList.appendChild(btn);
      });
    }
  } catch (e) {
    if (cityList)
      cityList.innerHTML =
        '<div class="text-red-500 text-xs col-span-3">Failed to load cities.</div>';
  }
}
async function selectCity(countryName, stateName, cityName) {
  currentView = {
    level: "city",
    country: countryName,
    state: stateName,
    city: cityName,
  };
  const bcEl = document.getElementById("breadcrumb-city");
  const bcWrap = document.getElementById("breadcrumb-city-wrapper");
  if (bcEl) bcEl.innerText = cityName;
  if (bcWrap) bcWrap.classList.remove("hidden");
  const nameEl = document.getElementById("selected-country-name");
  if (nameEl) nameEl.innerText = cityName;
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`,
    );
    const geoData = await geoRes.json();
    if (geoData.results && geoData.results[0]) {
      const { latitude, longitude } = geoData.results[0];
      window._currentWeatherLocation = `${cityName}, ${countryName}`;
      if (window.fetchWeather) window.fetchWeather(latitude, longitude);
      if (window.mapEngine && window.mapEngine.map) {
        window.mapEngine.map.flyTo({
          center: [longitude, latitude],
          zoom: 10,
          pitch: 60,
          essential: true,
          duration: 2500
        });
      }
    }
  } catch (e) {
    console.error("City geocoding failed:", e);
  }
  if (window.generateAIBriefing)
    window.generateAIBriefing(cityName + ", " + stateName + ", " + countryName);
}
window.onCountrySelected = onCountrySelected;
window.selectState = selectState;
window.selectCity = selectCity;
window.resetToCountry = () => {
  if (currentView.country) onCountrySelected(currentView.country);
};
window.resetToState = () => {
  if (currentView.country && currentView.state)
    selectState(currentView.country, currentView.state);
};
window.filterStateList = (query) => {
  const q = query.toLowerCase().trim();
  document.querySelectorAll("#state-list button").forEach((btn) => {
    const name =
      btn.querySelector(".font-bold")?.textContent?.toLowerCase() || "";
    btn.style.display = !q || name.includes(q) ? "" : "none";
  });
};
window.filterCityList = (query) => {
  const q = query.toLowerCase().trim();
  document.querySelectorAll("#city-list button").forEach((btn) => {
    const name =
      btn.querySelector(".font-bold")?.textContent?.toLowerCase() || "";
    btn.style.display = !q || name.includes(q) ? "" : "none";
  });
};