window.pushStateCountry = function (country, tab) {
    const params = new URLSearchParams(window.location.search);
    if (country) params.set("country", country);
    else params.delete("country");
    if (tab) params.set("tab", tab);
    else params.delete("tab");
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    history.pushState({ country, tab }, "", newUrl);
};
window.restoreFromURL = function () {
    const params = new URLSearchParams(window.location.search);
    const country = params.get("country");
    const tab = params.get("tab");
    if (tab && window.switchTab) window.switchTab(tab);
    if (country) {
        const tryRestore = (attempts) => {
            if (attempts <= 0) return;
            if (window.globalSearchData && window.globalSearchData.length > 0) {
                const match = window.globalSearchData.find(
                    (c) => c.name.common.toLowerCase() === country.toLowerCase()
                );
                if (match && window.handleCountryClickByName) {
                    window.handleCountryClickByName(country);
                }
            } else {
                setTimeout(() => tryRestore(attempts - 1), 800);
            }
        };
        setTimeout(() => tryRestore(8), 1200);
    }
};
const _origSwitchTab = window.switchTab;
if (_origSwitchTab) {
    window.switchTab = function (id) {
        _origSwitchTab(id);
        const params = new URLSearchParams(window.location.search);
        params.set("tab", id);
        history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    };
}
window.addEventListener("load", () => setTimeout(window.restoreFromURL, 500));
const WATCHLIST_KEY = "newsatlas_watchlist";
window.getWatchlist = function () {
    try { return JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || []; }
    catch { return []; }
};
window.toggleWatchlist = function (name) {
    if (!name) return;
    let list = window.getWatchlist();
    const idx = list.findIndex((c) => c.toLowerCase() === name.toLowerCase());
    if (idx >= 0) list.splice(idx, 1);
    else list.unshift(name);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
    window.updateWatchlistBtn(name);
    if (window.showToast) {
        window.showToast(idx >= 0 ? `Removed ${name} from watchlist` : `${name} added to watchlist ⭐`, "info");
    }
};
window.isWatchlisted = function (name) {
    return window.getWatchlist().some((c) => c.toLowerCase() === (name || "").toLowerCase());
};
window.updateWatchlistBtn = function (name) {
    const btn = document.getElementById("watchlist-star-btn");
    if (!btn) return;
    const active = window.isWatchlisted(name || window.selectedCountry);
    btn.innerHTML = active
        ? `<i class="fas fa-star text-amber-400 text-xs"></i>`
        : `<i class="fas fa-star text-slate-600 text-xs"></i>`;
    btn.title = active ? "Remove from watchlist" : "Add to watchlist";
};
document.addEventListener("DOMContentLoaded", () => {
    const sectorDisplay = document.getElementById("active-sector-display");
    if (sectorDisplay) {
        const btn = document.createElement("button");
        btn.id = "watchlist-star-btn";
        btn.className = "tactical-btn p-1 hover:text-amber-400 transition-colors";
        btn.title = "Add to watchlist";
        btn.innerHTML = `<i class="fas fa-star text-slate-600 text-xs"></i>`;
        btn.onclick = () => window.toggleWatchlist(window.selectedCountry);
        sectorDisplay.appendChild(btn);
    }
});
const _origToggleSearch = window.toggleSearch;
window.toggleSearch = function () {
    if (typeof _origToggleSearch === "function") _origToggleSearch();
    setTimeout(() => {
        const results = document.getElementById("search-results");
        const input = document.getElementById("country-search");
        if (!results || !input || input.value.trim()) return;
        const list = window.getWatchlist();
        if (!list.length) return;
        const existing = document.getElementById("watchlist-section");
        if (existing) existing.remove();
        const section = document.createElement("div");
        section.id = "watchlist-section";
        section.className = "px-4 pt-3";
        section.innerHTML = `
      <p class="text-[9px] font-black text-amber-400 uppercase tracking-widest font-mono mb-2 flex items-center gap-1.5">
        <i class="fas fa-star text-xs"></i> Pinned
      </p>
      <div class="space-y-1">
        ${list.slice(0, 5).map((c) => `
          <div class="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-white/4 transition-colors"
               onclick="window.toggleSearch(); setTimeout(()=>window.handleCountryClickByName&&window.handleCountryClickByName('${c}'),200)">
            <i class="fas fa-star text-amber-400 text-xs"></i>
            <span class="text-sm font-bold text-white">${c}</span>
          </div>`).join("")}
      </div>
      <div class="border-t border-white/6 mt-3 mb-1"></div>`;
        results.prepend(section);
    }, 80);
};
window._choroplethMode = null;
window._choroplethData = {};
window.setChoropleth = async function (mode) {
    window._choroplethMode = mode;
    const legend = document.getElementById("choropleth-legend");
    if (!mode) {
        if (window.svg) {
            window.svg.selectAll("path.country").attr("fill", null);
        }
        if (legend) legend.classList.add("hidden");
        if (window.showToast) window.showToast("Map color overlay cleared", "info");
        return;
    }
    if (window.showToast) window.showToast(`Loading ${mode} data...`, "info");
    let values = {};
    if (mode === "population") {
        (window.globalSearchData || []).forEach((c) => {
            if (c.population) values[c.name] = c.population;
        });
    } else if (mode === "gdp") {
        (window.globalSearchData || []).forEach((c) => {
            if (c.gdp) values[c.name] = c.gdp;
        });
        if (Object.keys(values).length === 0) {
            (window.globalSearchData || []).forEach((c) => {
                values[c.name] = (c.population || 1000000) * 15000;
            });
        }
    } else if (mode === "conflict") {
        if (window._hexLayers && window._hexLayers.gdelt) {
            window._hexLayers.gdelt.forEach((p) => {
                const key = "conflict_" + Math.round(p.lat) + "_" + Math.round(p.lng);
                values[key] = (values[key] || 0) + 1;
            });
        }
    } else if (mode === "risk") {
        (window.globalSearchData || []).forEach((c) => {
            if (window.calculateRiskScore) {
                values[c.name] = window.calculateRiskScore(c.name);
            }
        });
    }
    window._choroplethData = values;
    applyChoropleth(mode, values);
};
function applyChoropleth(mode, values) {
    if (!window.svg || !window.worldFeatures || !window.worldFeatures.length) {
        setTimeout(() => applyChoropleth(mode, values), 500);
        return;
    }
    const allVals = Object.values(values).filter(Boolean);
    if (!allVals.length) return;
    const minV = Math.min(...allVals);
    const maxV = Math.max(...allVals);
    const colorScale = (v) => {
        if (!v && mode !== "risk") return "rgba(30,41,59,0.6)";
        if (!v && mode === "risk") v = 50;
        if (mode === "risk") {
            const t = Math.min(1, Math.max(0, v / 100));
            if (t < 0.5) {
                const t2 = t * 2;
                const r = Math.round(16 + (245 - 16) * t2);
                const g = Math.round(185 + (158 - 185) * t2);
                const b = Math.round(129 + (11 - 129) * t2);
                return `rgba(${r},${g},${b},0.8)`;
            } else {
                const t2 = (t - 0.5) * 2;
                const r = Math.round(245 + (239 - 245) * t2);
                const g = Math.round(158 + (68 - 158) * t2);
                const b = Math.round(11 + (68 - 11) * t2);
                return `rgba(${r},${g},${b},0.8)`;
            }
        }
        const t = Math.min(1, Math.max(0, (v - minV) / (maxV - minV)));
        if (mode === "conflict") {
            const r = Math.round(239 * t + 30 * (1 - t));
            const g = Math.round(30 * (1 - t));
            const b = Math.round(30 * (1 - t));
            return `rgba(${r},${g},${b},${0.3 + t * 0.5})`;
        }
        const r = Math.round(59 + (16 - 59) * t);
        const g = Math.round(130 + (185 - 130) * t);
        const b = Math.round(246 + (129 - 246) * t);
        return `rgba(${r},${g},${b},${0.25 + t * 0.55})`;
    };
    window.svg.selectAll("path.country").attr("fill", (d) => {
        const name = d.properties?.name;
        const v = values[name];
        return colorScale(v);
    });
    let legend = document.getElementById("choropleth-legend");
    if (!legend) {
        legend = document.createElement("div");
        legend.id = "choropleth-legend";
        legend.className = "absolute bottom-14 left-4 px-3 py-2 rounded-xl z-10 flex items-center gap-2";
        legend.style.cssText = "background:rgba(2,6,23,0.8);border:1px solid rgba(59,130,246,0.2);backdrop-filter:blur(8px)";
        document.getElementById("map-container")?.appendChild(legend);
    }
    if (mode === "risk") {
        legend.innerHTML = `
        <span class="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">Geopolitical Risk</span>
        <span class="text-[8px] font-mono text-slate-600">Stable</span>
        <div class="w-16 h-2 rounded" style="background:linear-gradient(to right,#10b981,#f59e0b,#ef4444)"></div>
        <span class="text-[8px] font-mono text-slate-600">Critical</span>`;
    } else {
        const Label = { gdp: "GDP", population: "Population", conflict: "Conflict" }[mode] || mode;
        const low = mode === "conflict" ? "Low" : "$Low";
        const high = mode === "conflict" ? "High" : "$High";
        legend.innerHTML = `
        <span class="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">${Label}</span>
        <span class="text-[8px] font-mono text-slate-600">${low}</span>
        <div class="w-16 h-2 rounded" style="background:linear-gradient(to right,rgba(59,130,246,0.3),rgba(16,185,129,0.8))"></div>
        <span class="text-[8px] font-mono text-slate-600">${high}</span>`;
    }
    legend.classList.remove("hidden");
    if (window.showToast) window.showToast(`Map colored by ${mode === 'risk' ? 'Geopolitical Risk' : mode}`, "info");
}
window.animateNumber = function (el, targetStr, duration = 800) {
    if (!el) return;
    const isPercent = targetStr.includes("%");
    const hasDollar = targetStr.includes("$");
    const target = parseFloat(targetStr.replace(/[^0-9.-]/g, ""));
    if (isNaN(target)) { el.textContent = targetStr; return; }
    el.classList.add("animate-countup");
    const start = performance.now();
    const step = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        const formatted = target >= 1000
            ? val.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            : val.toFixed(target % 1 !== 0 ? 2 : 0);
        el.textContent = `${hasDollar ? "$" : ""}${formatted}${isPercent ? "%" : ""}`;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = targetStr;
    };
    requestAnimationFrame(step);
};
const _origFetchEconomics = window.fetchDetailedEconomics;
if (_origFetchEconomics) {
    window.fetchDetailedEconomics = async function (country) {
        await _origFetchEconomics(country);
        setTimeout(() => {
            ["eco-gdp", "eco-growth", "eco-inflation", "eco-unemployment", "eco-interest", "eco-debt", "eco-capita"].forEach((id) => {
                const el = document.getElementById(id);
                if (el && el.textContent && el.textContent !== "--") {
                    window.animateNumber(el, el.textContent, 900);
                }
            });
        }, 100);
    };
}
window.updateHeadlineTicker = function (articles) {
    const wrap = document.getElementById("headline-ticker-content");
    if (!wrap || !articles || !articles.length) return;
    const top = articles.slice(0, 8);
    const items = [...top, ...top].map((a) => {
        const sent = a.title?.toLowerCase().match(/\b(war|attack|crisis|conflict|crash)\b/) ? "text-red-400" :
            a.title?.toLowerCase().match(/\b(record|deal|growth|summit)\b/) ? "text-emerald-400" : "text-slate-400";
        return `<span class="headline-ticker-item ${sent}">
      <i class="fas fa-circle text-[4px] mr-2 text-slate-700"></i>
      ${a.title || ""}
    </span>`;
    }).join("");
    wrap.innerHTML = items;
    wrap.style.animation = "none";
    requestAnimationFrame(() => { wrap.style.animation = ""; });
};
window.handleCountryClickByName = function (name) {
    window.pushStateCountry(name, null);
    window.updateWatchlistBtn(name);
    if (window.fetchAllData) window.fetchAllData(name);
    if (window.generateAIBriefing) window.generateAIBriefing(name);
};
document.addEventListener("DOMContentLoaded", () => {
    const nameEl = document.getElementById("selected-country-name");
    if (nameEl) {
        const obs = new MutationObserver(() => {
            const country = nameEl.textContent?.trim();
            if (country && country !== "GLOBAL SURVEILLANCE") {
                window.pushStateCountry(country, null);
                window.updateWatchlistBtn(country);
            }
        });
        obs.observe(nameEl, { childList: true, subtree: true, characterData: true });
    }
});