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

    window.fetchWeather(20.5937, 78.9629);
    window.fetchNews();
    startStockTicker();
    window.initializeMarkets('Global');
}

function startStockTicker() {
    const tickerContent = document.getElementById('stock-ticker-content');
    const stocks = [
        { s: "S&P 500", p: 5203.45 }, { s: "NASDAQ", p: 16420.10 },
        { s: "DOW JONES", p: 39150.80 }, { s: "FTSE 100", p: 7950.30 },
        { s: "NIKKEI 225", p: 40100.20 }, { s: "BTC-USD", p: 68500.00 },
        { s: "ETH-USD", p: 3550.00 }, { s: "GOLD", p: 2320.10 },
        { s: "CRUDE OIL", p: 82.40 }, { s: "EUR/USD", p: 1.085 }
    ];
    function renderTicker() {
        let html = "";
        stocks.forEach(stock => {
            const change = (Math.random() * 2 - 1).toFixed(2);
            const color = change >= 0 ? "text-emerald-400" : "text-red-400";
            const arrow = change >= 0 ? "▲" : "▼";
            html += `<div class="ticker-item text-slate-300">${stock.s} <span class="text-white">${stock.p.toLocaleString()}</span> <span class="${color} ml-2">${arrow} ${Math.abs(change)}%</span></div>`;
        });
        tickerContent.innerHTML = html;
    }
    renderTicker();
    setInterval(() => {
        stocks.forEach(stock => { stock.p = parseFloat((stock.p + stock.p * (Math.random() * 0.002 - 0.001)).toFixed(2)); });
        renderTicker();
    }, 3000);
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
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(data => {
        worldFeatures = topojson.feature(data, data.objects.countries).features;
        const palette = ["#1d4ed8", "#2563eb", "#3b82f6", "#4f46e5", "#6366f1", "#0ea5e9", "#334155", "#475569", "#0f766e"];
        g.selectAll("path").data(worldFeatures).enter().append("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("fill", (d, i) => palette[i % palette.length])
            .on("mouseenter", function (e, d) {
                window.playTacticalSound('hover');
                const t = document.getElementById('map-tooltip');
                t.style.left = (e.pageX + 15) + 'px'; t.style.top = (e.pageY - 15) + 'px';
                t.classList.remove('hidden');
                document.getElementById('tooltip-text').innerText = d.properties.name;
            })
            .on("mousemove", function (e) {
                const t = document.getElementById('map-tooltip');
                t.style.left = (e.pageX + 15) + 'px'; t.style.top = (e.pageY - 15) + 'px';
            })
            .on("mouseleave", function () { document.getElementById('map-tooltip').classList.add('hidden'); })
            .on("click", function (event, d) { handleCountryClick(event, d); });
    });
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
    }
}

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

window.toggleSatellite = () => {
    window.playTacticalSound('click');
    const mapBox = document.getElementById('map-box-id');
    const btn = document.querySelector('button[title="Toggle Satellite Layer"]') || document.querySelector('button[title="Toggle Satellite"]');
    const svgEl = document.getElementById('world-map');
    let overlay = document.getElementById('satellite-overlay');
    if (overlay) {
        const isVisible = overlay.style.opacity !== '0';
        overlay.style.opacity = isVisible ? '0' : '1';
        mapBox.classList.toggle('satellite-mode', !isVisible);
        if (btn) { btn.classList.toggle('text-emerald-400', isVisible); btn.classList.toggle('bg-emerald-600/50', !isVisible); }
        return;
    }
    const gibsUrl = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=BlueMarble_NextGeneration&FORMAT=image/jpeg&TRANSPARENT=FALSE&WIDTH=2048&HEIGHT=1024&CRS=CRS:84&BBOX=-180,-90,180,90';
    overlay = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    overlay.id = 'satellite-overlay';
    overlay.setAttribute('href', gibsUrl);
    overlay.setAttribute('x', '-180'); overlay.setAttribute('y', '-90');
    overlay.setAttribute('width', '360'); overlay.setAttribute('height', '180');
    overlay.setAttribute('preserveAspectRatio', 'none');
    overlay.style.cssText = 'opacity:1;pointer-events:none;transition:opacity 0.6s ease;';
    if (svgEl && svgEl.querySelector('g')) svgEl.querySelector('g').insertBefore(overlay, svgEl.querySelector('g').firstChild);
    else if (svgEl) svgEl.insertBefore(overlay, svgEl.firstChild);
    mapBox.classList.add('satellite-mode');
    if (btn) { btn.classList.remove('text-emerald-400'); btn.classList.add('bg-emerald-600/50'); }
};

window.switchTab = (id) => {
    window.playTacticalSound('tab');
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const tabBtn = Array.from(document.querySelectorAll('.nav-tab')).find(btn => btn.innerText.toLowerCase().includes(id.toLowerCase()));
    if (tabBtn) tabBtn.classList.add('active');
    const targetContent = document.getElementById(`tab-${id}`);
    if (targetContent) targetContent.classList.add('active');
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
    document.getElementById('selected-country-name').innerText = "Global Surveillance";
    document.getElementById('ai-briefing-box').classList.add('hidden');
    const flagBox = document.getElementById('active-sector-display');
    if (flagBox) flagBox.classList.add('hidden');
    if (projectionType === '2d') svg.transition().duration(1200).call(zoom.transform, d3.zoomIdentity);
    window.fetchNews();
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