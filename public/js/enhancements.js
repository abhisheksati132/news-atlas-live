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
                if (match && window.handleCountryClick) {
                    window.handleCountryClick(null, { properties: { name: match.name.common, iso_a2: match.cca2 } });
                }
            } else {
                setTimeout(() => tryRestore(attempts - 1), 500);
            }
        };
        setTimeout(() => tryRestore(8), 800);
    } else {
        const tryDefault = (attempts) => {
            if (attempts <= 0) return;
            if (window.globalSearchData && window.globalSearchData.length > 0) {
                if (window.handleCountryClickByName) {
                    window.handleCountryClickByName("United States");
                }
            } else {
                setTimeout(() => tryDefault(attempts - 1), 500);
            }
        };
        setTimeout(() => tryDefault(8), 1200);
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

window.addEventListener("load", () => setTimeout(window.restoreFromURL, 300));

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
                if (el && el.textContent && el.textContent !== "--" && !el.textContent.includes("|")) {
                    window.animateNumber(el, el.textContent, 800);
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
    if (window.globalSearchData) {
        const match = window.globalSearchData.find(
            (c) => c.name.common.toLowerCase() === name.toLowerCase()
        );
        if (match && window.handleCountryClick) {
            window.handleCountryClick(null, { properties: { name: match.name.common, iso_a2: match.cca2 } });
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const nameEl = document.getElementById("selected-country-name");
    if (nameEl) {
        const obs = new MutationObserver(() => {
            const country = nameEl.textContent?.trim();
            if (country && country !== "Worldwide") {
                window.pushStateCountry(country, null);
            }
        });
        obs.observe(nameEl, { childList: true, subtree: true, characterData: true });
    }
});