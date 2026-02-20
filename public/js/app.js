let selectedCountry = null;
let currencyCode = null;
let iso2Code = null;
let countryUTCOffset = null;
let projectionType = '2d';
let currentProjection, svg, g, zoom;
let worldFeatures = [];
let globalSearchData = [];
let currentCategory = 'top';
window.selectedCountry = selectedCountry;
window.currencyCode = currencyCode;
window.iso2Code = iso2Code;
window.currentCategory = currentCategory;
async function runBootSequence() {
    const logs = ["SYSTEM_INIT...", "CONNECTING_SAT_UPLINK...", "DECRYPTING_GLOBAL_FEED...", "HANDSHAKE_VERIFIED", "ACCESS_GRANTED"];
    const logEl = document.getElementById('boot-log');
    const bar = document.getElementById('boot-bar');
    for (let i = 0; i < logs.length; i++) {
        await new Promise(r => setTimeout(r, 400));
        const d = document.createElement('div');
        d.innerText = `> ${logs[i]}`;
        logEl.appendChild(d);
        bar.style.width = ((i + 1) / logs.length * 100) + '%';
    }
    await new Promise(r => setTimeout(r, 500));
    document.getElementById('boot-screen').style.opacity = '0';
    setTimeout(() => document.getElementById('boot-screen').remove(), 800);
}
async function initTerminal() {
    runBootSequence();
    const config = {
        apiKey: "AIzaSyBXg1tCOjaLp3mYWzLcS1BBny2LrcWlluE",
        authDomain: "news-atlas-live.firebaseapp.com",
        projectId: "news-atlas-live",
        storageBucket: "news-atlas-live.firebasestorage.app",
        messagingSenderId: "177473843770",
        appId: "1:177473843770:web:f9abb15747f79f28a9bb03"
    };
    try {
        const firebaseApp = window.firebaseCore.initializeApp(config);
        const auth = window.firebaseCore.getAuth(firebaseApp);
        const db = window.firebaseCore.getFirestore(firebaseApp);
        await window.firebaseCore.signInAnonymously(auth);
        window.firebaseCore.onAuthStateChanged(auth, (u) => {
            if (u) {
                const idEl = document.getElementById('neural-id');
                if (idEl && !u.isAnonymous && u.displayName) {
                    idEl.innerText = `ID: ${u.displayName.toUpperCase()}`;
                    idEl.classList.add('text-emerald-500');
                } else if (idEl && u.isAnonymous) {
                    idEl.innerText = `ID: ${u.uid.substring(0, 8).toUpperCase()}`;
                }
                try {
                    const userRef = window.firebaseCore.doc(db, "visitors", u.uid);
                    window.firebaseCore.setDoc(userRef, { last_login: window.firebaseCore.serverTimestamp(), device: navigator.userAgent }, { merge: true });
                } catch (e) { }
            }
        });
    } catch (e) {
        console.warn("Firebase Auth failed:", e);
        document.getElementById('neural-id').innerText = "LOCAL MODE (OFFLINE)";
    }
    try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,cca2,latlng,currencies,population,capital,capitalInfo');
        globalSearchData = await res.json();
        window.globalSearchData = globalSearchData;
    } catch (e) { }
    // No default weather on load — weather loads when a country/city is selected
    window.fetchNews();
    startStockTicker();
    window.initializeMarkets('Global');
}
async function startStockTicker() {
    const tickerContent = document.getElementById('stock-ticker-content');
    if (!tickerContent) return;

    function renderTicker(stocks) {
        let html = '';
        stocks.forEach(stock => {
            const up = stock.change >= 0;
            const color = up ? 'text-emerald-400' : 'text-red-400';
            const arrow = up ? '▲' : '▼';
            const priceStr = stock.price >= 1000
                ? stock.price.toLocaleString(undefined, { maximumFractionDigits: 2 })
                : stock.price.toFixed(stock.price < 10 ? 4 : 2);
            const dot = `<span style="color:rgba(255,255,255,.12);margin:0 .25rem">│</span>`;
            html += `<div class="ticker-item">${dot}<span class="text-slate-400">${stock.label}</span> <span class="text-white font-black">${priceStr}</span> <span class="${color} ml-1">${arrow} ${Math.abs(stock.change).toFixed(2)}%</span></div>`;
        });
        // Duplicate for seamless loop
        tickerContent.innerHTML = html + html;
    }

    async function fetchAndRender() {
        try {
            const res = await fetch('/api/markets?type=ticker');
            if (!res.ok) throw new Error();
            const data = await res.json();
            if (data.data && data.data.length > 0) {
                renderTicker(data.data);
                // Update the live dot to green once real data loads
                const dot = document.querySelector('.ticker-wrap')?.previousElementSibling?.querySelector('.bg-red-400');
                if (dot) { dot.classList.replace('bg-red-400', 'bg-emerald-400'); }
            }
        } catch (_) {
            // On failure, show placeholder dashes
            if (!tickerContent.innerHTML) {
                tickerContent.innerHTML = '<div class="ticker-item text-slate-500">FETCHING LIVE DATA...</div>';
            }
        }
    }

    // Initial fetch, then refresh every 60s (Yahoo Finance rate-limits aggressively)
    fetchAndRender();
    setInterval(fetchAndRender, 60000);
}

async function fetchAllData(name) {
    try {
        const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=true`);
        const data = await res.json();
        if (data && data[0]) {
            const c = data[0];
            iso2Code = c.cca2.toLowerCase();
            currencyCode = c.currencies ? Object.keys(c.currencies)[0] : null;
            window._isoAlpha3 = c.cca3 || '';
            window.iso2Code = iso2Code;
            window.currencyCode = currencyCode;
            document.getElementById('fact-pop').innerText = (c.population / 1000000).toFixed(1) + 'M';
            document.getElementById('fact-cap').innerText = c.capital ? c.capital[0] : 'N/A';
            document.getElementById('fact-region').innerText = c.region || '--';
            document.getElementById('fact-area').innerText = c.area.toLocaleString();
            document.getElementById('fact-code').innerText = c.idd.root + (c.idd.suffixes ? c.idd.suffixes[0] : '');
            document.getElementById('fact-demonym').innerText = c.demonyms?.eng?.m || '--';
            document.getElementById('fact-gini').innerText = c.gini ? Object.values(c.gini)[0] : 'N/A';
            document.getElementById('fact-drive').innerText = c.car ? c.car.side.toUpperCase() : '--';
            const flagEl = document.getElementById('sector-flag');
            const nameEl = document.getElementById('sector-name');
            const box = document.getElementById('active-sector-display');
            if (flagEl && nameEl && box) { flagEl.src = c.flags.svg; nameEl.innerText = c.name.common; box.classList.remove('hidden'); }
            countryUTCOffset = c.timezones ? c.timezones[0] : "UTC+00:00";
            let lat = 0, lon = 0;
            if (c.latlng && c.latlng.length === 2) { [lat, lon] = c.latlng; }
            else if (c.capitalInfo && c.capitalInfo.latlng && c.capitalInfo.latlng.length === 2) { [lat, lon] = c.capitalInfo.latlng; }
            // Store location label for weather tab (Feature 4)
            const capitalName = c.capital ? c.capital[0] : c.name.common;
            window._currentWeatherLocation = `${capitalName}, ${c.name.common}`;
            if (lat || lon) window.fetchWeather(lat, lon);
            document.getElementById('fact-pop-2').innerText = (c.population / 1000000).toFixed(1) + 'M';
            document.getElementById('fact-gini-2').innerText = c.gini ? Object.values(c.gini)[0] : 'N/A';
            document.getElementById('fact-demonym-2').innerText = c.demonyms?.eng?.m || '--';
            document.getElementById('fact-area-2').innerText = c.area.toLocaleString() + ' km²';
            window.fetchCurrency();
            window.fetchDetailedEconomics(c.name.common);
            window.fetchNews();
        }
    } catch (e) { console.error("Data Fetch Error", e); }
}
async function generateAIBriefing(loc) {
    const box = document.getElementById('ai-briefing-box');
    const text = document.getElementById('ai-briefing-text');
    if (box) box.classList.remove('hidden');
    if (text) text.innerText = "Initializing deep-scan protocols...";
    try {
        const res = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: `Target Sector: ${loc}.
                    Generate a high-density Intelligence Dossier with exactly 10 numbered strategic metrics.
                    Format: 1. [METRIC_NAME]: Value/Status - Brief Context. ... 10. [METRIC_NAME]: Value/Status - Brief Context.
                    Include: Political Stability, Border Integrity, Cyber Threat, Civil Unrest, Military Readiness, Energy Reserves, Supply Chain, Inflation, Foreign Relations, Infrastructure.
                    Tone: Strict military/intelligence.`
            })
        });
        const result = await res.json();
        if (text) {
            let rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Link stable. No intel found.";
            text.innerText = rawText.replace(/\*\*/g, "").trim();
        }
        window.playTacticalSound('success');
    } catch (e) { if (text) text.innerText = "Briefing handshake failed."; }
}
function initMap(type) {
    projectionType = type;
    const container = document.getElementById('map-container');
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    if (width < 50 || height < 50) { setTimeout(() => initMap(type), 300); return; }
    const mapContainer = d3.select("#map-container");
    mapContainer.select("svg").remove();
    svg = mapContainer.insert("svg", ":first-child")
        .attr("id", "world-map")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("class", "w-full h-full");
    g = svg.append("g");
    if (type === '2d') {
        currentProjection = d3.geoNaturalEarth1().scale(width / 9).translate([width / 2, height / 2]);
        document.getElementById('projection-label').innerText = "Orbital Interface: 2D Active";
    } else {
        currentProjection = d3.geoOrthographic().scale(height / 2.3).translate([width / 2, height / 2]).clipAngle(90);
        document.getElementById('projection-label').innerText = "Orbital Interface: 3D Globe";
    }
    const path = d3.geoPath().projection(currentProjection);
    if (type === '2d') {
        zoom = d3.zoom().scaleExtent([1, 15]).on("zoom", (e) => g.attr("transform", e.transform));
        svg.call(zoom);
    } else {
        svg.call(d3.drag().on("drag", (event) => {
            const rotate = currentProjection.rotate();
            const k = 75 / currentProjection.scale();
            currentProjection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
            g.selectAll("path").attr("d", path);
        }));
    }
    // Build DataFlows instance for arc animations (Enhancement 3)
    if (!window._dataFlows) {
        window._dataFlows = new DataFlows('world-map', currentProjection);
    }
    // Build HeatMap instance for overlay (Enhancement 4)
    if (!window._heatMap) window._heatMap = new HeatMap();

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(data => {
        worldFeatures = topojson.feature(data, data.objects.countries).features;
        window.worldFeatures = worldFeatures; // expose for heat overlay
        const palette = ["#1d4ed8", "#2563eb", "#3b82f6", "#4f46e5", "#6366f1", "#0ea5e9", "#334155", "#475569", "#0f766e"];
        g.selectAll("path").data(worldFeatures).enter().append("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("fill", (d, i) => palette[i % palette.length])
            .on("mouseenter", function (e, d) {
                window.playTacticalSound('hover');
                showRichTooltip(e, d);
            })
            .on("mousemove", function (e) {
                const t = document.getElementById('map-tooltip');
                t.style.left = (e.pageX + 15) + 'px';
                t.style.top = (e.pageY - 15) + 'px';
            })
            .on("mouseleave", function () { document.getElementById('map-tooltip').classList.add('hidden'); })
            .on("click", function (event, d) { handleCountryClick(event, d); });
    });
}

// Cache for tooltip data (Enhancement 1)
const _tooltipCache = {};
async function showRichTooltip(e, d) {
    const t = document.getElementById('map-tooltip');
    t.style.left = (e.pageX + 15) + 'px';
    t.style.top = (e.pageY - 15) + 'px';
    t.classList.remove('hidden');
    const name = d.properties.name;
    // Show name instantly, enrich async
    document.getElementById('tooltip-name').innerText = name;
    document.getElementById('tooltip-flag').src = '';
    document.getElementById('tooltip-flag').classList.add('hidden');
    document.getElementById('tooltip-capital').innerText = '...';
    document.getElementById('tooltip-pop').innerText = '...';
    if (_tooltipCache[name]) {
        const c = _tooltipCache[name];
        document.getElementById('tooltip-flag').src = c.flag;
        document.getElementById('tooltip-flag').classList.remove('hidden');
        document.getElementById('tooltip-capital').innerText = c.capital;
        document.getElementById('tooltip-pop').innerText = c.pop;
        return;
    }
    try {
        const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=true&fields=name,flags,capital,population`);
        const [c] = await res.json();
        const entry = {
            flag: c.flags?.svg || c.flags?.png || '',
            capital: c.capital?.[0] || '—',
            pop: c.population >= 1e6 ? (c.population / 1e6).toFixed(1) + 'M' : c.population?.toLocaleString() || '—'
        };
        _tooltipCache[name] = entry;
        // Only update if tooltip is still visible for the same country
        if (!t.classList.contains('hidden') && document.getElementById('tooltip-name').innerText === name) {
            document.getElementById('tooltip-flag').src = entry.flag;
            document.getElementById('tooltip-flag').classList.remove('hidden');
            document.getElementById('tooltip-capital').innerText = entry.capital;
            document.getElementById('tooltip-pop').innerText = entry.pop;
        }
    } catch (_) {
        document.getElementById('tooltip-capital').innerText = '—';
        document.getElementById('tooltip-pop').innerText = '—';
    }
}
async function handleCountryClick(event, d) {
    window.playTacticalSound('click');
    d3.selectAll(".country").classed("active", false);
    if (d && g) g.selectAll("path").filter(p => p.properties.name === d.properties.name).classed("active", true);
    selectedCountry = d;
    window.selectedCountry = d;
    window.switchTab('intel');
    document.getElementById('sidebar').scrollIntoView({ behavior: 'smooth' });
    if (d && d.properties) {
        document.getElementById('selected-country-name').innerText = d.properties.name;
        iso2Code = null;
        fetchAllData(d.properties.name);
        window.onCountrySelected(d.properties.name);
        if (projectionType === '2d') zoomToCountry(d);
        else rotateToCountry(d);
        generateAIBriefing(d.properties.name);
        window.fetchMarketIntel(d.properties.name, currencyCode);

        // Enhancement 2: Pulse ring at country centroid
        spawnPulseRings(d);

        // Enhancement 3: Flight arcs to major global hubs
        if (window._dataFlows) {
            const centroid = d3.geoCentroid(d);
            const hubs = [[-74.006, 40.7128], [-0.1276, 51.5074], [139.6917, 35.6895], [103.8198, 1.3521], [55.2708, 25.2048]];
            window._dataFlows.showFlows(centroid, hubs.filter(h => {
                const dx = h[0] - centroid[0], dy = h[1] - centroid[1];
                return Math.sqrt(dx * dx + dy * dy) > 10; // skip if hub is inside same country
            }));
        }
    }
}

// Enhancement 2: Animated pulse rings on country click
function spawnPulseRings(d) {
    try {
        const centroidGeo = d3.geoCentroid(d);
        const proj = currentProjection(centroidGeo);
        if (!proj) return;
        const [cx, cy] = proj;
        const svgEl = d3.select('#world-map');
        const rings = [0, 300, 600];
        rings.forEach(delay => {
            svgEl.append('circle')
                .attr('cx', cx).attr('cy', cy)
                .attr('r', 4)
                .attr('fill', 'none')
                .attr('stroke', '#10b981')
                .attr('stroke-width', 2)
                .attr('opacity', 0.9)
                .attr('pointer-events', 'none')
                .transition().delay(delay).duration(1400)
                .attr('r', 60)
                .attr('opacity', 0)
                .attr('stroke-width', 0.5)
                .remove();
        });
    } catch (_) { }
}

// Enhancement 4: Heat overlay toggle
let _heatActive = false;
let _gdpNormalized = null;
window.toggleHeatOverlay = async function () {
    const btn = document.getElementById('heat-toggle-btn');
    const countries = d3.selectAll('.country');
    if (_heatActive) {
        _heatActive = false;
        if (window._heatMap) window._heatMap.remove(countries);
        if (btn) { btn.classList.remove('text-amber-400'); btn.classList.add('text-slate-400'); btn.title = 'GDP Heat Overlay: OFF'; }
        return;
    }
    _heatActive = true;
    if (btn) { btn.classList.add('text-amber-400'); btn.classList.remove('text-slate-400'); btn.title = 'GDP Heat Overlay: ON'; }

    if (!_gdpNormalized) {
        try {
            const res = await fetch('https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.CD?format=json&per_page=300&mrv=1');
            const [, items] = await res.json();
            // Build lookup by WB country name (lowercase) → value
            const raw = {};
            items.forEach(item => {
                if (item.country?.value && item.value) raw[item.country.value.toLowerCase()] = item.value;
            });
            // Map to topojson country names used in worldFeatures
            _gdpNormalized = {};
            if (window.worldFeatures) {
                window.worldFeatures.forEach(f => {
                    const topoName = f.properties.name;
                    const lc = topoName.toLowerCase();
                    // Direct match first
                    if (raw[lc]) { _gdpNormalized[topoName] = raw[lc]; return; }
                    // Try partial match (e.g. "united states of america" → "united states")
                    const key = Object.keys(raw).find(k => lc.includes(k) || k.includes(lc));
                    if (key) _gdpNormalized[topoName] = raw[key];
                });
            }
        } catch (_) { }
    }
    if (window._heatMap && _gdpNormalized) window._heatMap.apply(countries, _gdpNormalized, 'gdp');
};

function rotateToCountry(d) {
    const centroid = d3.geoCentroid(d);
    d3.transition().duration(1200).tween("rotate", () => {
        const r = d3.interpolate(currentProjection.rotate(), [-centroid[0], -centroid[1]]);
        return (t) => { currentProjection.rotate(r(t)); g.selectAll("path").attr("d", d3.geoPath().projection(currentProjection)); };
    });
}
function zoomToCountry(d) {
    const container = document.getElementById('map-container');
    const width = container.clientWidth, height = container.clientHeight;
    const projection = d3.geoNaturalEarth1().scale(width / 6.6).translate([width / 2, height / 1.95]);
    const bounds = d3.geoPath().projection(projection).bounds(d);
    const dx = bounds[1][0] - bounds[0][0], dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2, y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.max(1, Math.min(8, 0.8 / Math.max(dx / width, dy / height)));
    svg.transition().duration(1000).call(zoom.transform, d3.zoomIdentity.translate(width / 2 - scale * x, height / 2 - scale * y).scale(scale));
}

window.switchTab = (id) => {
    window.playTacticalSound('tab');
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const tabBtn = Array.from(document.querySelectorAll('.nav-tab')).find(btn => btn.innerText.toLowerCase().includes(id.toLowerCase()));
    if (tabBtn) tabBtn.classList.add('active');
    const targetContent = document.getElementById(`tab-${id}`);
    if (targetContent) targetContent.classList.add('active');

    // Trigger specific API updates on tab switch
    if (id === 'intel') {
        if (window.fetchGDELTEvents) window.fetchGDELTEvents(window.selectedCountry);
        if (window.fetchSeismicStatus) window.fetchSeismicStatus();
    } else if (id === 'markets') {
        if (window.displayCoinGeckoTrending) window.displayCoinGeckoTrending();
        if (window.displayCoinGeckoTop10) window.displayCoinGeckoTop10();
    } else if (id === 'economic' || id === 'economics') {
        if (window.fetchECBRates) window.fetchECBRates();
    }
};
window.toggleProjection = () => { window.playTacticalSound('tab'); initMap(projectionType === '2d' ? '3d' : '2d'); };
window.selectFromSearch = (name) => {
    const country = worldFeatures.find(f => f.properties.name.toLowerCase().includes(name.toLowerCase()));
    if (country) handleCountryClick(null, country);
    else fetchAllData(name);
    document.getElementById('search-overlay').classList.add('hidden');
};
window.zoomMap = (f) => {
    window.playTacticalSound('click');
    if (projectionType === '2d') svg.transition().duration(400).call(zoom.scaleBy, f);
    else { currentProjection.scale(currentProjection.scale() * f); g.selectAll("path").attr("d", d3.geoPath().projection(currentProjection)); }
};
window.resetToGlobalCenter = () => {
    selectedCountry = null; window.selectedCountry = null; countryUTCOffset = null;
    d3.selectAll(".country").classed("active", false);
    document.getElementById('selected-country-name').innerText = "GLOBAL SURVEILLANCE";
    document.getElementById('ai-briefing-box').classList.add('hidden');
    const flagBox = document.getElementById('active-sector-display');
    if (flagBox) flagBox.classList.add('hidden');
    if (projectionType === '2d') svg.transition().duration(1200).call(zoom.transform, d3.zoomIdentity);
    window.fetchNews();
    if (window.resetWeatherData) window.resetWeatherData();
};
window.goToIndiaHome = () => {
    const india = worldFeatures.find(f => f.properties.name === "India");
    if (india) handleCountryClick(null, india);
};
window.activateMapInteraction = () => {
    const overlay = document.getElementById('map-overlay-guard');
    if (overlay) { overlay.classList.add('active'); window.playTacticalSound('click'); }
};
window.deactivateMapInteraction = () => {
    const overlay = document.getElementById('map-overlay-guard');
    if (overlay) overlay.classList.remove('active');
};
function setupEventListeners() {
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.onmouseenter = () => window.playTacticalSound('hover');
        pill.onclick = () => {
            window.playTacticalSound('click');
            document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            window.currentCategory = pill.dataset.cat;
            window.fetchNews();
        };
    });
    const input = document.getElementById('country-search');
    input.oninput = (e) => {
        const query = e.target.value.toLowerCase().trim();
        const resContainer = document.getElementById('search-results');
        if (!query) { window.renderTrending(); return; }
        if (!globalSearchData || globalSearchData.length === 0) {
            resContainer.innerHTML = `<div class="p-6 text-center text-xs text-slate-500 font-bold uppercase tracking-widest animate-pulse">Initializing Search Index...</div>`;
            return;
        }
        const matched = globalSearchData.filter(c => c.name.common.toLowerCase().includes(query)).slice(0, 8);
        if (matched.length === 0) { resContainer.innerHTML = `<div class="p-6 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">Sector Not Found</div>`; return; }
        resContainer.innerHTML = matched.map(c => `
            <div class="p-4 hover:bg-blue-600/10 cursor-pointer flex items-center gap-4 border-b border-white/5 transition-all group" onclick="window.selectFromSearch('${c.name.common.replace(/'/g, "\\'")}')">
                <div class="w-8 h-5 rounded shadow-sm overflow-hidden relative border border-white/10 group-hover:border-blue-400/50">
                    <img src="${c.flags.svg}" class="w-full h-full object-cover">
                </div>
                <span class="font-bold text-white text-sm tracking-tight group-hover:text-blue-300 transition-colors">${c.name.common}</span>
                <i class="fas fa-chevron-right ml-auto text-[10px] text-slate-600 group-hover:text-blue-400"></i>
            </div>
        `).join('');
    };
    window.onkeydown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); window.toggleSearch(); }
        if (e.key === 'Escape') {
            document.getElementById('search-overlay').classList.add('hidden');
            document.getElementById('about-overlay').classList.add('hidden');
        }
    };
}
function updateSystemTime() {
    const now = new Date();
    document.getElementById('system-time').innerText = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (countryUTCOffset) {
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        let off = 0;
        const match = countryUTCOffset.match(/UTC([+-]\d+):?(\d+)?/);
        if (match) off = (parseInt(match[1]) * 60) + (match[2] ? parseInt(match[2]) : 0);
        const localDate = new Date(utc + (60000 * off));
        const localEl = document.getElementById('local-time');
        if (localEl) localEl.innerText = localDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const hr = localDate.getHours();
        document.body.classList.toggle('night-mode', hr < 6 || hr > 18);
        document.body.classList.toggle('day-mode', hr >= 6 && hr <= 18);
    }
}
window.activateVoice = () => {
    window.playTacticalSound('click');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Voice module offline (Browser not supported)"); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    const btn = document.querySelector('.fa-microphone');
    btn.classList.add('text-red-500', 'animate-pulse');
    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase().replace('.', '');
        btn.classList.remove('text-red-500', 'animate-pulse');
        if (command.includes("go to")) window.selectFromSearch(command.replace("go to ", "").trim());
        else if (command.includes("analyze")) window.switchTab('intel');
        else if (command.includes("news")) window.switchTab('news');
    };
    recognition.onerror = () => btn.classList.remove('text-red-500', 'animate-pulse');
};
window.personalizeSession = (user) => {
    const safeName = user.displayName || user.email.split('@')[0];
    const shortName = safeName.split(' ')[0];
    setTimeout(() => {
        const speech = new SpeechSynthesisUtterance(`Identity confirmed. Welcome back, Commander ${shortName}`);
        speech.pitch = 0.8; speech.rate = 0.9; speech.volume = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const googleVoice = voices.find(v => v.name.includes('Google US English'));
        if (googleVoice) speech.voice = googleVoice;
        window.speechSynthesis.speak(speech);
    }, 1000);
    const nameEl = document.querySelector('#about-overlay h2');
    const roleEl = document.querySelector('#about-overlay p.text-blue-400');
    const levelEl = document.querySelector('#about-overlay .text-emerald-500');
    if (nameEl) { nameEl.innerText = safeName.toUpperCase(); nameEl.classList.add('text-blue-200'); }
    if (roleEl) roleEl.innerText = "AUTHENTICATED FIELD OPERATOR";
    if (levelEl) levelEl.innerText = "CLEARANCE: OMEGA-LEVEL (VERIFIED)";
};
window.generateAIBriefing = generateAIBriefing;
initTerminal();
initMap('2d');
setupEventListeners();
setInterval(updateSystemTime, 1000);
document.addEventListener('click', function () {
    if (!window._ambienceStarted) { window._ambienceStarted = true; window.toggleAmbience(); }
}, { once: true });
window.addEventListener('resize', () => {
    const c = document.getElementById('map-container');
    if (c) { d3.select("#world-map").attr("viewBox", `0 0 ${c.clientWidth} ${c.clientHeight}`); initMap(projectionType); }
});

// ─── USGS EARTHQUAKE LAYER ──────────────────────────────────────────────────
let _quakeActive = false, _quakeGroup = null;
window.toggleEarthquakeLayer = async function () {
    _quakeActive = !_quakeActive;
    const btn = document.getElementById('quake-toggle-btn');
    const svg = d3.select('#world-map');
    if (!_quakeActive) {
        if (_quakeGroup) _quakeGroup.remove();
        _quakeGroup = null;
        if (btn) { btn.classList.remove('text-amber-400'); btn.title = 'Earthquake Layer: OFF'; }
        return;
    }
    if (btn) { btn.classList.add('text-amber-400'); btn.title = 'Earthquake Layer: ON'; }
    if (_quakeGroup) _quakeGroup.remove();
    _quakeGroup = svg.append('g').attr('id', 'quake-layer').attr('pointer-events', 'all');
    try {
        const res = await fetch('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4&limit=80&orderby=time');
        const data = await res.json();
        const features = data.features || [];
        const magColor = m => m >= 7 ? '#ef4444' : m >= 6 ? '#f97316' : m >= 5 ? '#eab308' : '#10b981';
        features.forEach(f => {
            const [lon, lat] = f.geometry.coordinates;
            const mag = f.properties.mag;
            const place = f.properties.place;
            const proj = currentProjection([lon, lat]);
            if (!proj) return;
            const [cx, cy] = proj;
            const r = Math.max(4, (mag - 3) * 3);
            // pulse ring
            for (let d = 0; d <= 600; d += 300) {
                _quakeGroup.append('circle')
                    .attr('cx', cx).attr('cy', cy).attr('r', r)
                    .attr('fill', 'none').attr('stroke', magColor(mag)).attr('stroke-width', 1.5)
                    .attr('opacity', 0.7).attr('pointer-events', 'none')
                    .transition().delay(d).duration(1800)
                    .attr('r', r + 18).attr('opacity', 0).attr('stroke-width', 0.3)
                    .on('end', function repeat() {
                        if (!_quakeActive) return;
                        d3.select(this).attr('r', r).attr('opacity', 0.7).attr('stroke-width', 1.5)
                            .transition().delay(d).duration(1800)
                            .attr('r', r + 18).attr('opacity', 0).on('end', repeat);
                    });
            }
            // dot
            _quakeGroup.append('circle')
                .attr('cx', cx).attr('cy', cy).attr('r', r)
                .attr('fill', magColor(mag)).attr('fill-opacity', 0.35)
                .attr('stroke', magColor(mag)).attr('stroke-width', 1.5)
                .style('cursor', 'pointer')
                .on('mouseover', function (event) {
                    const t = document.getElementById('map-tooltip');
                    if (t) {
                        document.getElementById('tooltip-name').innerText = `M${mag.toFixed(1)} — ${place}`;
                        document.getElementById('tooltip-flag').classList.add('hidden');
                        document.getElementById('tooltip-capital').innerText = `Depth: ${f.geometry.coordinates[2]?.toFixed(0) ?? '?'} km`;
                        document.getElementById('tooltip-pop').innerText = new Date(f.properties.time).toUTCString().slice(0, 22);
                        t.style.left = (event.pageX + 15) + 'px'; t.style.top = (event.pageY - 15) + 'px';
                        t.classList.remove('hidden');
                    }
                })
                .on('mouseleave', () => { const t = document.getElementById('map-tooltip'); if (t) t.classList.add('hidden'); });
        });
    } catch (e) { console.error('USGS fetch failed', e); }
};

// ─── OPENSKY LIVE AIRCRAFT LAYER ─────────────────────────────────────────────
let _aircraftActive = false, _aircraftGroup = null, _aircraftInterval = null;
async function renderAircraft() {
    const svg = d3.select('#world-map');
    if (_aircraftGroup) _aircraftGroup.remove();
    _aircraftGroup = svg.append('g').attr('id', 'aircraft-layer').attr('pointer-events', 'all');
    try {
        // Use anonymous OpenSky endpoint — returns sample of all transponders
        const res = await fetch('https://opensky-network.org/api/states/all?lamin=-60&lomin=-180&lamax=80&lomax=180');
        const data = await res.json();
        const states = (data.states || []).filter(s => s[5] && s[6]); // need lon, lat
        // Render max 400 to avoid overload
        states.slice(0, 400).forEach(s => {
            const lon = s[5], lat = s[6], track = s[10] || 0, callsign = (s[1] || '').trim();
            const proj = currentProjection([lon, lat]);
            if (!proj) return;
            const [cx, cy] = proj;
            const g = _aircraftGroup.append('g')
                .attr('transform', `translate(${cx},${cy}) rotate(${track - 90})`)
                .style('cursor', 'pointer');
            g.append('text')
                .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
                .attr('font-size', '7px').attr('fill', '#60a5fa').attr('opacity', 0.8)
                .text('✈');
            g.on('mouseover', function (event) {
                const t = document.getElementById('map-tooltip');
                if (t) {
                    document.getElementById('tooltip-name').innerText = callsign || 'UNKNOWN';
                    document.getElementById('tooltip-flag').classList.add('hidden');
                    document.getElementById('tooltip-capital').innerText = `Alt: ${s[13] ? (s[13] / 304.8).toFixed(0) + ' ft' : '?'}`;
                    document.getElementById('tooltip-pop').innerText = `Speed: ${s[9] ? (s[9] * 1.944).toFixed(0) + ' kts' : '?'}`;
                    t.style.left = (event.pageX + 15) + 'px'; t.style.top = (event.pageY - 15) + 'px';
                    t.classList.remove('hidden');
                }
            }).on('mouseleave', () => { const t = document.getElementById('map-tooltip'); if (t) t.classList.add('hidden'); });
        });
    } catch (e) { console.warn('OpenSky fetch failed (rate limit or offline)', e); }
}
window.toggleAircraftLayer = function () {
    _aircraftActive = !_aircraftActive;
    const btn = document.getElementById('aircraft-toggle-btn');
    if (!_aircraftActive) {
        if (_aircraftGroup) _aircraftGroup.remove();
        _aircraftGroup = null;
        clearInterval(_aircraftInterval); _aircraftInterval = null;
        if (btn) { btn.classList.remove('text-blue-400'); btn.title = 'Live Aircraft: OFF'; }
        return;
    }
    if (btn) { btn.classList.add('text-blue-400'); btn.title = 'Live Aircraft: ON (30s refresh)'; }
    renderAircraft();
    _aircraftInterval = setInterval(() => { if (_aircraftActive) renderAircraft(); }, 30000);
};

// ─── OPENAQ AIR QUALITY LAYER ────────────────────────────────────────────────
let _aqActive = false, _aqGroup = null;
window.toggleAQLayer = async function () {
    _aqActive = !_aqActive;
    const btn = document.getElementById('aq-toggle-btn');
    const svg = d3.select('#world-map');
    if (!_aqActive) {
        if (_aqGroup) _aqGroup.remove();
        _aqGroup = null;
        if (btn) { btn.classList.remove('text-emerald-400'); btn.title = 'Air Quality Layer: OFF'; }
        // Restore original country fill
        d3.selectAll('#world-map path.country').transition().duration(600).attr('fill', '#0f172a');
        return;
    }
    if (btn) { btn.classList.add('text-emerald-400'); btn.title = 'Air Quality Layer: ON'; }
    try {
        // Fetch latest PM2.5 readings aggregated by country
        const res = await fetch('https://api.openaq.org/v2/averages?parameter=pm25&spatial=country&temporal=day&limit=120&date_from=' + new Date(Date.now() - 86400000).toISOString().slice(0, 10));
        const data = await res.json();
        const aqByCountry = {};
        (data.results || []).forEach(r => { if (r.country && r.average) aqByCountry[r.country] = r.average; });
        // Color scale: green (0) → yellow (50) → red (150+)
        const aqColor = d3.scaleLinear()
            .domain([0, 25, 75, 150])
            .range(['#10b981', '#eab308', '#ef4444', '#7c3aed'])
            .clamp(true);
        // Map country ISO2 to the countries
        if (window.worldFeatures) {
            const countryPaths = d3.selectAll('#world-map path.country');
            countryPaths.transition().duration(1000).attr('fill', function () {
                const name = d3.select(this).datum()?.properties?.name;
                if (!name) return '#0f172a';
                // Try to match by country name → ISO2 via a small lookup
                const iso2 = Object.keys(aqByCountry).find(k => name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase().slice(0, 4)));
                const val = iso2 ? aqByCountry[iso2] : null;
                return val ? aqColor(val) : '#1e293b';
            });
        }
        // Add legend
        if (_aqGroup) _aqGroup.remove();
        _aqGroup = svg.append('g').attr('transform', 'translate(12,50)');
        const legendData = [{ c: '#10b981', l: 'Good (<25 μg)' }, { c: '#eab308', l: 'Moderate (<75)' }, { c: '#ef4444', l: 'Unhealthy (75+)' }, { c: '#7c3aed', l: 'Hazardous (150+)' }];
        legendData.forEach((d, i) => {
            _aqGroup.append('rect').attr('x', 0).attr('y', i * 16).attr('width', 10).attr('height', 10).attr('fill', d.c).attr('rx', 2);
            _aqGroup.append('text').attr('x', 14).attr('y', i * 16 + 9).text(d.l)
                .attr('fill', '#94a3b8').attr('font-size', '8px').attr('font-family', 'JetBrains Mono, monospace');
        });
        _aqGroup.append('text').attr('x', 0).attr('y', -4).text('PM2.5 AQI · OpenAQ')
            .attr('fill', '#10b981').attr('font-size', '7px').attr('font-family', 'JetBrains Mono, monospace').attr('font-weight', 'bold');
    } catch (e) { console.error('OpenAQ fetch failed', e); }
};

