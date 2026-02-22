function getWeatherMeta(code, isDay = 1) {
  const timeClass = isDay ? "text-amber-400" : "text-blue-300";
  const codes = {
    0: {
      text: "Clear Sky",
      icon: isDay ? "fa-sun" : "fa-moon",
      color: timeClass,
    },
    1: {
      text: "Mainly Clear",
      icon: isDay ? "fa-cloud-sun" : "fa-cloud-moon",
      color: "text-blue-200",
    },
    2: { text: "Partly Cloudy", icon: "fa-cloud", color: "text-slate-300" },
    3: { text: "Overcast", icon: "fa-cloud", color: "text-slate-400" },
    45: { text: "Fog", icon: "fa-smog", color: "text-slate-400" },
    48: {
      text: "Depositing Rime Fog",
      icon: "fa-smog",
      color: "text-slate-400",
    },
    51: {
      text: "Light Drizzle",
      icon: "fa-cloud-rain",
      color: "text-blue-400",
    },
    53: {
      text: "Moderate Drizzle",
      icon: "fa-cloud-rain",
      color: "text-blue-400",
    },
    55: {
      text: "Dense Drizzle",
      icon: "fa-cloud-showers-heavy",
      color: "text-blue-400",
    },
    61: { text: "Slight Rain", icon: "fa-cloud-rain", color: "text-blue-500" },
    63: {
      text: "Moderate Rain",
      icon: "fa-cloud-showers-heavy",
      color: "text-blue-500",
    },
    65: {
      text: "Heavy Rain",
      icon: "fa-cloud-showers-water",
      color: "text-blue-600",
    },
    71: { text: "Slight Snow", icon: "fa-snowflake", color: "text-white" },
    73: { text: "Moderate Snow", icon: "fa-snowflake", color: "text-white" },
    75: { text: "Heavy Snow", icon: "fa-snowflake", color: "text-white" },
    95: { text: "Thunderstorm", icon: "fa-bolt", color: "text-yellow-400" },
    96: {
      text: "Thunderstorm/Hail",
      icon: "fa-poo-storm",
      color: "text-yellow-400",
    },
  };
  return (
    codes[code] || {
      text: "Unknown",
      icon: "fa-meteor",
      color: "text-slate-500",
    }
  );
}
function getMoonPhase() {
  const date = new Date();
  let year = date.getFullYear(),
    month = date.getMonth() + 1;
  const day = date.getDate();
  if (month < 3) {
    year--;
    month += 12;
  }
  ++month;
  const c = 365.25 * year,
    e = 30.6 * month;
  let jd = c + e + day - 694039.09;
  jd /= 29.5305882;
  let b = parseInt(jd);
  jd -= b;
  b = Math.round(jd * 8);
  if (b >= 8) b = 0;
  const phases = [
    { t: "New Moon", i: "fa-circle" },
    { t: "Waxing Crescent", i: "fa-moon" },
    { t: "First Quarter", i: "fa-adjust" },
    { t: "Waxing Gibbous", i: "fa-moon" },
    { t: "Full Moon", i: "fa-circle text-white" },
    { t: "Waning Gibbous", i: "fa-moon" },
    { t: "Last Quarter", i: "fa-adjust" },
    { t: "Waning Crescent", i: "fa-moon" },
  ];
  return phases[b];
}
async function fetchWeather(lat, lon) {
  if (isNaN(lat) || isNaN(lon)) {
    console.error("Invalid coordinates passed to weather module.");
    return;
  }
  try {
    const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
    const data = await res.json();
    const locationLabel = document.getElementById("atmo-location-label");
    if (locationLabel && window._currentWeatherLocation) {
      locationLabel.innerHTML = `<i class="fas fa-map-marker-alt mr-1 text-blue-400"></i>${window._currentWeatherLocation}`;
      locationLabel.classList.remove("hidden");
    }
    if (data.current) {
      const curr = data.current;
      const meta = getWeatherMeta(curr.weather_code, curr.is_day);
      const atmoTemp = document.getElementById("atmo-temp");
      if (atmoTemp) atmoTemp.innerText = `${Math.round(curr.temperature_2m)}°`;
      const atmoCondition = document.getElementById("atmo-condition");
      if (atmoCondition) atmoCondition.innerText = meta.text;
      const iconEl = document.getElementById("atmo-main-icon");
      if (iconEl)
        iconEl.className = `fas ${meta.icon} text-9xl ${meta.color} opacity-80`;
      const atmoFeels = document.getElementById("atmo-feels");
      if (atmoFeels)
        atmoFeels.innerText = `${Math.round(curr.apparent_temperature)}°`;
      const atmoWindSpeed = document.getElementById("atmo-wind-speed");
      if (atmoWindSpeed)
        atmoWindSpeed.innerText = Math.round(curr.wind_speed_10m);
      const atmoWindArrow = document.getElementById("atmo-wind-arrow");
      if (atmoWindArrow)
        atmoWindArrow.style.transform = `rotate(${curr.wind_direction_10m}deg)`;
      const atmoHumidity = document.getElementById("atmo-humidity");
      if (atmoHumidity)
        atmoHumidity.innerText = `${curr.relative_humidity_2m}%`;
      const atmoPressure = document.getElementById("atmo-pressure");
      if (atmoPressure)
        atmoPressure.innerText = Math.round(
          curr.pressure_msl || curr.surface_pressure,
        );
      const atmoGusts = document.getElementById("atmo-gusts");
      if (atmoGusts)
        atmoGusts.innerText = curr.wind_gusts_10m !== undefined ? Math.round(curr.wind_gusts_10m) : "--";

      const atmoCloudCover = document.getElementById("atmo-cloud-cover");
      if (atmoCloudCover)
        atmoCloudCover.innerText = curr.cloud_cover !== undefined ? curr.cloud_cover : "--";

      const atmoDew = document.getElementById("atmo-dew");
      if (atmoDew)
        atmoDew.innerText = curr.dew_point_2m !== undefined ? `${Math.round(curr.dew_point_2m)}°` : "--°";

      let estimatedCeiling = 8.0;
      const code = curr.weather_code;
      if (code === 0 || code === 1) estimatedCeiling = 12.0;
      else if (code === 2) estimatedCeiling = 4.5;
      else if (code === 3) estimatedCeiling = 1.8;
      else if (code >= 45 && code <= 48) estimatedCeiling = 0.2;
      else if (code >= 51 && code <= 67) estimatedCeiling = 1.2;
      else if (code >= 71) estimatedCeiling = 0.9;
      else if (code >= 95) estimatedCeiling = 1.0;
      estimatedCeiling += Math.random() * 0.4 - 0.2;
      const atmoCloudBase = document.getElementById("atmo-cloud-base");
      if (atmoCloudBase) atmoCloudBase.innerText = estimatedCeiling.toFixed(1);

      const atmoAqi = document.getElementById("atmo-aqi");
      if (atmoAqi) {
        if (curr.aqi !== undefined) {
          atmoAqi.innerText = curr.aqi;
          // Color code AQI
          atmoAqi.className = `text-2xl font-black leading-none ${curr.aqi <= 20 ? 'text-emerald-400' :
            curr.aqi <= 50 ? 'text-yellow-400' :
              curr.aqi <= 100 ? 'text-orange-400' : 'text-red-500'
            }`;
        } else {
          atmoAqi.innerText = "--";
          atmoAqi.className = "text-2xl font-black text-white leading-none";
        }
      }
    }
    if (data.daily) {
      const todayHigh = data.daily.temperature_2m_max[0];
      const todayLow = data.daily.temperature_2m_min[0];
      const atmoHl = document.getElementById("atmo-hl");
      if (atmoHl) atmoHl.innerText = `${Math.round(todayLow)}° / ${Math.round(todayHigh)}°`;
      const sunrise = new Date(data.daily.sunrise[0]).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const sunset = new Date(data.daily.sunset[0]).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const atmoSunrise = document.getElementById("atmo-sunrise");
      if (atmoSunrise) atmoSunrise.innerText = sunrise;
      const atmoSunset = document.getElementById("atmo-sunset");
      if (atmoSunset) atmoSunset.innerText = sunset;
      const uvMax = data.daily.uv_index_max[0];
      const uvPercent = Math.min((uvMax / 11) * 100, 100);
      const atmoUvVal = document.getElementById("atmo-uv-val");
      if (atmoUvVal) atmoUvVal.innerText = uvMax;
      const atmoUvBar = document.getElementById("atmo-uv-bar");
      if (atmoUvBar) atmoUvBar.style.width = `${uvPercent}%`;
      let uvText = "Low";
      if (uvMax > 2) uvText = "Moderate";
      if (uvMax > 5) uvText = "High";
      if (uvMax > 7) uvText = "Very High";
      if (uvMax > 10) uvText = "Extreme";
      const atmoUvText = document.getElementById("atmo-uv-text");
      if (atmoUvText) atmoUvText.innerText = uvText;
    }
    if (data.hourly) {
      const hourlyContainer = document.getElementById("atmo-hourly-container");
      if (hourlyContainer) {
        hourlyContainer.innerHTML = "";
        const currentHour = new Date().getHours();
        try {
          for (let i = currentHour; i < currentHour + 24; i++) {
            if (!data.hourly.time[i]) break;
            const timeStr = new Date(data.hourly.time[i])
              .toLocaleTimeString([], { hour: "numeric", hour12: true })
              .replace(" ", "");
            const hTemp = Math.round(data.hourly.temperature_2m[i]);
            const hCode = data.hourly.weather_code[i];
            const hMeta = getWeatherMeta(
              hCode,
              i % 24 > 6 && i % 24 < 18 ? 1 : 0,
            );
            const hRain = data.hourly.precipitation_probability
              ? data.hourly.precipitation_probability[i]
              : 0;
            const hDiv = document.createElement("div");
            hDiv.className =
              "flex flex-col items-center gap-2 min-w-[3.5rem] p-2 rounded-xl hover:bg-white/5 transition-colors cursor-default border border-transparent hover:border-white/5";
            hDiv.innerHTML = `
                            <span class="text-sm text-slate-400 font-bold tracking-tight">${i === currentHour ? "Now" : timeStr}</span>
                            <i class="fas ${hMeta.icon} text-lg ${hMeta.color}"></i>
                            <span class="text-sm font-bold text-white">${hTemp}°</span>
                            ${hRain > 20 ? `<span class="text-[11px] text-blue-400 font-bold">${hRain}%</span>` : ""}
                        `;
            hourlyContainer.appendChild(hDiv);
          }
        } catch (err) { }
      }
      const visKm = data.hourly.visibility
        ? data.hourly.visibility[new Date().getHours()] / 1000
        : 10;
      const atmoVisibility = document.getElementById("atmo-visibility");
      if (atmoVisibility) atmoVisibility.innerText = visKm.toFixed(1);
    }
    const moon = getMoonPhase();
    const atmoMoonText = document.getElementById("atmo-moon-text");
    const atmoMoonIcon = document.getElementById("atmo-moon-icon");
    if (atmoMoonText) atmoMoonText.innerText = moon.t;
    if (atmoMoonIcon) atmoMoonIcon.className = `fas ${moon.i} text-2xl text-indigo-300`;
    const precipTotal =
      data.daily && data.daily.precipitation_sum
        ? data.daily.precipitation_sum[0]
        : 0;
    const atmoPrecipTotal = document.getElementById("atmo-precip-total");
    if (atmoPrecipTotal) atmoPrecipTotal.innerText = precipTotal.toFixed(1);
    const dailyContainer = document.getElementById("atmo-daily-container");
    if (dailyContainer && data.daily) {
      dailyContainer.innerHTML = "";
      for (let i = 1; i < 7; i++) {
        if (!data.daily.time[i]) break;
        const dateObj = new Date(data.daily.time[i]);
        const dayName = dateObj.toLocaleDateString("en-US", {
          weekday: "long",
        });
        const dMax = Math.round(data.daily.temperature_2m_max[i]);
        const dMin = Math.round(data.daily.temperature_2m_min[i]);
        const dMeta = getWeatherMeta(data.daily.weather_code[i], 1);
        const dPrecipSum = data.daily.precipitation_sum
          ? data.daily.precipitation_sum[i]
          : 0;
        const dRow = document.createElement("div");
        dRow.className =
          "px-6 py-3 flex items-center justify-between hover:bg-white/5 transition-colors group";
        dRow.innerHTML = `
                    <span class="text-sm text-slate-300 font-bold w-24">${dayName}</span>
                    <div class="flex items-center gap-3 w-32">
                        <i class="fas ${dMeta.icon} ${dMeta.color} w-6 text-center text-lg"></i>
                        <span class="text-xs text-slate-500 font-bold uppercase tracking-wider group-hover:text-blue-400 transition-colors">${dMeta.text}</span>
                    </div>
                    <div class="flex items-center gap-4 text-right flex-1 justify-end">
                        ${dPrecipSum > 0 ? `<div class="flex items-center gap-1 text-[11px] text-blue-400 font-bold"><i class="fas fa-umbrella"></i> ${Math.round(dPrecipSum)}mm</div>` : ""}
                        <div class="font-mono text-sm font-bold text-white"><span class="text-slate-500">${dMin}°</span> / ${dMax}°</div>
                    </div>
                `;
        dailyContainer.appendChild(dRow);
      }
    }
    window.playTacticalSound("success");
    try {
      const weatherSummary = {
        temp: data.current ? Math.round(data.current.temperature_2m) : "--",
        feels_like: data.current
          ? Math.round(data.current.apparent_temperature)
          : "--",
        condition: data.current
          ? getWeatherMeta(data.current.weather_code, data.current.is_day).text
          : "--",
        humidity: data.current ? data.current.relative_humidity_2m : "--",
        wind_speed: data.current
          ? Math.round(data.current.wind_speed_10m)
          : "--",
        uv_index: data.daily ? data.daily.uv_index_max[0] : 0,
        visibility:
          data.hourly && data.hourly.visibility
            ? (data.hourly.visibility[new Date().getHours()] / 1000).toFixed(1)
            : "--",
        forecast: data.daily
          ? data.daily.time.slice(1, 8).map((t, i) => ({
            date: new Date(t).toLocaleDateString("en-US", {
              weekday: "short",
            }),
            temp: Math.round(data.daily.temperature_2m_max[i + 1]),
            condition: getWeatherMeta(data.daily.weather_code[i + 1], 1).text,
          }))
          : [],
      };
      generateWeatherAnalysis(
        weatherSummary,
        window.selectedCountry
          ? window.selectedCountry.properties.name
          : "this location",
      );
    } catch (err) { }
  } catch (e) {
    console.error("Atmosphere Error:", e);
  }
}
async function generateWeatherAnalysis(weatherData, cityName) {
  const el = document.getElementById("weather-ai-analysis");
  if (!el) return;
  el.innerHTML =
    '<span class="animate-pulse text-slate-500">Analyzing atmospheric conditions...</span>';
  try {
    const forecastStr = (weatherData.forecast || [])
      .map((d) => `${d.date}: ${d.temp}°C, ${d.condition}`)
      .join("\n");
    const prompt = `Provide a tactical weather assessment for ${cityName}:
  Current: ${weatherData.temp}°C (feels like ${weatherData.feels_like}°C), ${weatherData.condition}
  Humidity: ${weatherData.humidity}%, Wind: ${weatherData.wind_speed} km/h, UV: ${weatherData.uv_index}, Visibility: ${weatherData.visibility} km
  7-Day: ${forecastStr}
  In 150 words cover: Overall assessment, travel advisories, health warnings (UV/air), outdoor impact, recommended actions.`;
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    el.innerText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Weather analysis unavailable.";
  } catch (e) {
    el.innerText = "Weather analysis link failed.";
  }
  generateWeatherAlerts(weatherData);
}
function generateWeatherAlerts(weatherData) {
  const alerts = [];
  if (weatherData.temp > 35)
    alerts.push({
      type: "danger",
      icon: "🔥",
      title: "Extreme Heat Warning",
      description: `Temperature ${weatherData.temp}°C. Stay hydrated and avoid prolonged sun exposure.`,
    });
  if (weatherData.uv_index >= 8)
    alerts.push({
      type: "warning",
      icon: "☀️",
      title: "High UV Index",
      description: `UV Index ${weatherData.uv_index}. Wear sunscreen and protective clothing.`,
    });
  if (weatherData.wind_speed > 50)
    alerts.push({
      type: "warning",
      icon: "💨",
      title: "Strong Wind Advisory",
      description: `Wind speed ${weatherData.wind_speed} km/h. Secure loose objects.`,
    });
  if (alerts.length > 0) displayWeatherAlerts(alerts);
}
function displayWeatherAlerts(alerts) {
  const container = document.getElementById("weather-alerts");
  if (!container) return;
  container.innerHTML = "";
  container.classList.remove("hidden");
  const colors = {
    danger: "border-red-500/30 bg-red-500/10",
    warning: "border-amber-500/30 bg-amber-500/10",
  };
  alerts.forEach((alert) => {
    const el = document.createElement("div");
    el.className = `dossier-card p-3 border-l-4 ${colors[alert.type] || colors.warning}`;
    el.innerHTML = `
            <div class="flex items-start gap-3">
              <span class="text-2xl">${alert.icon}</span>
              <div class="flex-1">
                <div class="font-bold text-white text-sm mb-1">${alert.title}</div>
                <div class="text-xs text-slate-300">${alert.description}</div>
              </div>
            </div>
        `;
    container.appendChild(el);
  });
}
window.fetchWeather = fetchWeather;
window.generateWeatherAnalysis = generateWeatherAnalysis;
window.resetWeatherData = () => {
  const ids = [
    "atmo-temp",
    "atmo-condition",
    "atmo-feels",
    "atmo-wind-speed",
    "atmo-humidity",
    "atmo-pressure",
    "atmo-cloud-base",
    "atmo-hl",
    "atmo-sunrise",
    "atmo-sunset",
    "atmo-uv-val",
    "atmo-uv-text",
    "atmo-aqi",
    "atmo-gusts",
    "atmo-cloud-cover",
    "atmo-dew"
  ];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerText = "--";
  });
  const iconEl = document.getElementById("atmo-main-icon");
  if (iconEl)
    iconEl.className = "fas fa-meteor text-9xl text-slate-500 opacity-20";
  if (document.getElementById("atmo-wind-arrow"))
    document.getElementById("atmo-wind-arrow").style.transform = "rotate(0deg)";
  if (document.getElementById("atmo-uv-bar"))
    document.getElementById("atmo-uv-bar").style.width = "0%";
  const hourlyContainer = document.getElementById("atmo-hourly-container");
  if (hourlyContainer)
    hourlyContainer.innerHTML =
      '<div class="text-xs text-slate-600 font-mono p-4 text-center">AWAITING SECTOR UPLINK...</div>';
};
window.searchAtmosphereCity = async () => {
  const inputEl = document.getElementById("atmo-city-search");
  if (!inputEl) return;
  const q = inputEl.value.trim();
  if (!q) return;
  const btn = inputEl.nextElementSibling;
  const originalBtnText = btn.innerText;
  btn.innerText = "WAIT..";
  btn.disabled = true;
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&format=json`,
    );
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const topHit = data.results[0];
      window._currentWeatherLocation =
        `${topHit.name}, ${topHit.country || topHit.admin1 || ""}`.replace(
          /,\s*$/,
          "",
        );
      await window.fetchWeather(topHit.latitude, topHit.longitude);
      inputEl.value = "";
    } else {
      inputEl.value = "";
      inputEl.placeholder = "Sector undetected...";
      setTimeout(() => (inputEl.placeholder = "Enter target city..."), 2000);
    }
  } catch (e) {
    console.error("Meteorological Geocoding Failed:", e);
  }
  btn.innerText = originalBtnText;
  btn.disabled = false;
};
