import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken, GoogleAuthProvider, linkWithPopup, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, collection, onSnapshot, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- EXPOSE FIREBASE TO WINDOW (Fixed Missing Function) ---
window.firebaseCore = { 
    initializeApp, getAuth, onAuthStateChanged, signInAnonymously, 
    signInWithCustomToken, getFirestore, doc, collection, 
    onSnapshot, setDoc, deleteDoc, serverTimestamp,
    GoogleAuthProvider, linkWithPopup, signInWithPopup // <--- THIS WAS MISSING
};

// --- SMART LOGIN FUNCTION ---
window.upgradeToGoogle = async () => {
    const btn = document.querySelector('button[title="Verify Identity"]');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin text-2xl text-yellow-500"></i>';
    
    const auth = window.firebaseCore.getAuth();
    const provider = new window.firebaseCore.GoogleAuthProvider();

    try {
        if (auth.currentUser) {
            // 1. Try to LINK (Upgrade Guest -> Google)
            await window.firebaseCore.linkWithPopup(auth.currentUser, provider);
        }
    } catch (error) {
        // 2. If already linked, Force SIGN IN instead
        if (error.code === 'auth/credential-already-in-use') {
            console.log("Account exists. Switching to existing user...");
            
            // SECURITY FIX: Alert user before retry to prevent Popup Blocker
            alert("Account already exists. Click OK to switch accounts.");
            
            try {
                await window.firebaseCore.signInWithPopup(auth, provider);
            } catch (signInError) {
                console.error("Force Login Failed:", signInError);
                btn.innerHTML = originalContent;
                alert("Login Failed: " + signInError.message);
                return;
            }
        } else {
            console.error("Link Error:", error);
            btn.innerHTML = originalContent;
            alert("Error: " + error.message);
            return;
        }
    }

    // 3. SUCCESS UI UPDATE
    const user = auth.currentUser;
    if (user) {
        const idEl = document.getElementById('neural-id');
        if (idEl) {
            idEl.innerText = `ID: ${user.displayName.toUpperCase()}`;
            idEl.classList.remove('text-slate-500');
            idEl.classList.add('text-emerald-400', 'drop-shadow-glow');
        }

        if (user.photoURL) {
            btn.innerHTML = `<img src="${user.photoURL}" class="w-8 h-8 rounded-full border-2 border-emerald-500 shadow-[0_0_10px_#10b981]">`;
        } else {
            btn.innerHTML = `<i class="fas fa-user-check text-2xl text-emerald-500"></i>`;
        }

        window.playTacticalSound('success');
        if (window.showToast) {
            window.showToast(`WELCOME COMMANDER ${user.displayName.split(' ')[0].toUpperCase()}`, 'success');
        } else {
            alert(`ACCESS GRANTED: Welcome, Commander ${user.displayName}`);
        }
    }
};

const apiKey = ""; 
const appId = typeof __app_id !== 'undefined' ? __app_id : 'news-atlas-v7';

// --- GLOBAL VARIABLES ---
let auth, db, user, selectedCountry;
let currentCategory = 'top';
let worldFeatures = [];
let countryUTCOffset, iso2Code, currencyCode, projectionType = '2d', currentProjection, svg, g, zoom;
let globalSearchData = [];
let aboutStatsInterval;
let audioCtx;
let ambienceOscillators = [];
let ambienceGain = null;
let isAmbiencePlaying = false;

function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

window.toggleAmbience = () => {
    initAudio();
    if (isAmbiencePlaying) {
        ambienceOscillators.forEach(osc => osc.stop());
        ambienceOscillators = [];
        isAmbiencePlaying = false;
        if(document.getElementById('ambience-text')) {
            document.getElementById('ambience-text').innerText = "OFF";
            document.getElementById('ambience-text').classList.remove('text-blue-400');
        }
    } else {
        ambienceGain = audioCtx.createGain();
        ambienceGain.gain.value = 0.05; 
        ambienceGain.connect(audioCtx.destination);
        const freqs = [55, 110, 112, 54]; 
        freqs.forEach(f => {
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, audioCtx.currentTime);
            osc.connect(ambienceGain);
            osc.start();
            ambienceOscillators.push(osc);
        });
        isAmbiencePlaying = true;
        if(document.getElementById('ambience-text')) {
            document.getElementById('ambience-text').innerText = "ON";
            document.getElementById('ambience-text').classList.add('text-blue-400');
        }
    }
};

window.playTacticalSound = (type) => {
    initAudio();
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        if (type === 'tab') {
            osc.frequency.setValueAtTime(440, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
            osc.start(); osc.stop(audioCtx.currentTime + 0.1);
        } else if (type === 'click') {
            osc.frequency.setValueAtTime(880, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
            osc.start(); osc.stop(audioCtx.currentTime + 0.05);
        } else if (type === 'hover') {
            osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.006, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);
            osc.start(); osc.stop(audioCtx.currentTime + 0.02);
        } else if (type === 'success') {
            osc.frequency.setValueAtTime(500, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1100, audioCtx.currentTime + 0.25);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            osc.start(); osc.stop(audioCtx.currentTime + 0.3);
        }
    } catch(e) {}
}

window.downloadDossier = () => {
    window.playTacticalSound('success');
    const cName = selectedCountry ? selectedCountry.properties.name : "GLOBAL_CONTEXT";
    const date = new Date().toISOString().split('T')[0];
    const intelText = document.getElementById('ai-briefing-text') ? document.getElementById('ai-briefing-text').innerText : "No Intel Loaded";
    const content = `
████████████████████████████████████████████████████████████
CLASSIFIED INTELLIGENCE DOSSIER
SECTOR: ${cName.toUpperCase()}
DATE: ${date}
GENERATED BY: NEWSATLAS TERMINAL v9.7
████████████████████████████████████████████████████████████

[TACTICAL BRIEFING]
${intelText}

[ECONOMIC TELEMETRY]
Population: ${document.getElementById('fact-pop').innerText}
Currency: ${document.getElementById('fact-currency').innerText}
Capital: ${document.getElementById('fact-cap').innerText}

[MARKET DATA]
Gold: ${document.getElementById('price-gold').innerText}
Silver: ${document.getElementById('price-silver').innerText}

[ATMOSPHERIC CONDITIONS]
Temp: ${document.getElementById('atmo-temp').innerText}
Wind: ${document.getElementById('atmo-wind-speed').innerText} KM/H

-- END OF TRANSMISSION --
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `INTEL_${cName.toUpperCase()}_${date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

function initTrafficCanvas() {
    const canvas = document.getElementById('traffic-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;
    let offset = 0;
    function draw() {
        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        for (let x = 0; x < w; x++) {
            const y = h/2 + Math.sin((x + offset) * 0.05) * 20 * Math.sin(x * 0.01);
            ctx.lineTo(x, y);
        }
        ctx.stroke();
        offset += 2;
        requestAnimationFrame(draw);
    }
    draw();
}

const cliInput = document.getElementById('cli-input');
const cliOutput = document.getElementById('cli-output');
if (cliInput) {
    cliInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const query = cliInput.value.trim();
            if (!query) return;
            window.playTacticalSound('click');
            appendLog(`> ${query}`, 'text-white');
            cliInput.value = '';
            const countryName = selectedCountry ? selectedCountry.properties.name : "Global Context";
            appendLog(`> Processing query for sector: [${countryName.toUpperCase()}]...`, 'text-blue-400 animate-pulse');
            try {
                const res = await fetch('/api/ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        prompt: `Context: The user is looking at a dashboard for ${countryName}. 
                        User Query: "${query}". 
                        Task: Answer as a tactical AI computer (concise, data-driven, no fluff). 
                        Limit response to 2 sentences.` 
                    })
                });
                const data = await res.json();
                const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "DATA CORRUPTION. RETRY.";
                appendLog(`> ${answer}`, 'text-emerald-400');
                window.playTacticalSound('success');
            } catch (err) {
                appendLog(`> ERROR: UPLINK FAILED.`, 'text-red-500');
            }
        }
    });
}

function appendLog(text, colorClass) {
    const div = document.createElement('div');
    div.className = `log-entry ${colorClass} leading-relaxed`;
    div.innerText = text;
    cliOutput.appendChild(div);
    cliOutput.scrollTop = cliOutput.scrollHeight;
}

function startAboutStats() {
    const bioText = "Engineering high-fidelity command terminals that synchronize high-frequency global data with real-time geospatial telemetry.";
    const bioEl = document.getElementById('bio-text');
    bioEl.innerText = "";
    let i = 0;
    const type = setInterval(() => {
        if(i < bioText.length) { bioEl.innerText += bioText.charAt(i); i++; } 
        else clearInterval(type);
    }, 30);
    if(aboutStatsInterval) clearInterval(aboutStatsInterval);
    let sec = 0;
    const uptimeEl = document.getElementById('uptime-counter');
    aboutStatsInterval = setInterval(() => {
        const cpu = Math.floor(Math.random() * 40) + 10;
        const mem = (Math.random() * 4 + 4).toFixed(1);
        document.getElementById('cpu-bar').style.width = cpu + '%';
        document.getElementById('cpu-val').innerText = cpu + '%';
        document.getElementById('mem-bar').style.width = (mem/16*100) + '%';
        document.getElementById('mem-val').innerText = mem + 'GB';
        document.getElementById('net-down').innerText = (Math.random() * 50 + 10).toFixed(1);
        document.getElementById('net-up').innerText = (Math.random() * 20 + 2).toFixed(1);
        sec++;
        const h = Math.floor(sec / 3600).toString().padStart(2, '0');
        const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        if(uptimeEl) uptimeEl.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

async function runBootSequence() {
    const logs = ["SYSTEM_INIT...", "CONNECTING_SAT_UPLINK...", "DECRYPTING_GLOBAL_FEED...", "HANDSHAKE_VERIFIED", "ACCESS_GRANTED"];
    const logEl = document.getElementById('boot-log');
    const bar = document.getElementById('boot-bar');
    for(let i=0; i<logs.length; i++) {
        await new Promise(r => setTimeout(r, 400));
        const d = document.createElement('div');
        d.innerText = `> ${logs[i]}`;
        logEl.appendChild(d);
        bar.style.width = ((i+1)/logs.length*100) + '%';
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
        auth = window.firebaseCore.getAuth(firebaseApp);
        db = window.firebaseCore.getFirestore(firebaseApp);
        
        await window.firebaseCore.signInAnonymously(auth);
        
        window.firebaseCore.onAuthStateChanged(auth, (u) => {
            user = u;
            if (u) {
                const idEl = document.getElementById('neural-id');
                if(idEl) {
                    idEl.innerText = `ID: ${u.uid.substring(0, 8).toUpperCase()}`;
                    idEl.classList.add('text-emerald-500');
                }
                try {
                    const userRef = window.firebaseCore.doc(db, "visitors", u.uid);
                    window.firebaseCore.setDoc(userRef, {
                        last_login: window.firebaseCore.serverTimestamp(),
                        device: navigator.userAgent
                    }, { merge: true });
                } catch(e) { console.log("DB Write failed (Test Mode rules might be off)"); }
            }
        });
    } catch (e) {
        console.warn("Firebase Auth failed:", e);
        document.getElementById('neural-id').innerText = "LOCAL MODE (OFFLINE)";
    }
    try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,cca2,latlng,currencies,population,capital,capitalInfo');
        globalSearchData = await res.json();
    } catch(e) {}
    fetchWeather(20.5937, 78.9629);
    fetchNews();
    startStockTicker(); 
}

window.toggleAbout = (show) => {
    window.playTacticalSound(show ? 'success' : 'click');
    const overlay = document.getElementById('about-overlay');
    overlay.classList.toggle('hidden', !show);
    if(show) {
        initTrafficCanvas();
        startAboutStats();
    } else {
        if(aboutStatsInterval) clearInterval(aboutStatsInterval);
    }
};

window.toggleSearch = () => {
    window.playTacticalSound('click');
    const overlay = document.getElementById('search-overlay');
    overlay.classList.toggle('hidden');
    if (!overlay.classList.contains('hidden')) {
        document.getElementById('country-search').focus();
        renderTrending(); 
    }
};

window.toggleSatellite = () => {
    window.playTacticalSound('click');
    const mapBox = document.getElementById('map-box-id');
    mapBox.classList.toggle('satellite-mode');
    const btn = document.querySelector('button[title="Toggle Satellite Layer"]');
    if(mapBox.classList.contains('satellite-mode')) {
        btn.classList.remove('text-emerald-400');
        btn.classList.add('text-white', 'bg-emerald-600/50');
    } else {
        btn.classList.add('text-emerald-400');
        btn.classList.remove('text-white', 'bg-emerald-600/50');
    }
};

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
            html += `
                <div class="ticker-item text-slate-300">
                    ${stock.s} <span class="text-white">${stock.p.toLocaleString()}</span> 
                    <span class="${color} ml-2">${arrow} ${Math.abs(change)}%</span>
                </div>
            `;
        });
        tickerContent.innerHTML = html;
    }
    renderTicker();

    setInterval(() => {
        stocks.forEach(stock => {
            const fluctuation = stock.p * (Math.random() * 0.002 - 0.001); 
            stock.p = parseFloat((stock.p + fluctuation).toFixed(2));
        });
        renderTicker();
    }, 3000);
}

function renderTrending() {
    const resContainer = document.getElementById('search-results');
    if (!globalSearchData || globalSearchData.length === 0) {
        resContainer.innerHTML = `
            <div class="p-8 text-center flex flex-col items-center gap-3 animate-pulse">
                <i class="fas fa-satellite-dish text-blue-500 text-xl"></i>
                <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Downloading Global Index...</span>
            </div>`;
        return;
    }
    const trending = ["India", "United States", "United Kingdom", "Japan", "Germany", "France", "Russia", "China"];
    resContainer.innerHTML = '<div class="p-4 text-[10px] font-black text-slate-600 uppercase tracking-widest sticky top-0 bg-[#020617]/95 backdrop-blur z-10 border-b border-white/5">High Traffic Sectors</div>' + 
        trending.map(name => {
            const c = globalSearchData.find(curr => 
                curr.name.common === name || 
                (name === "United States" && curr.name.common === "United States of America") ||
                (name === "Russia" && curr.name.common.includes("Russian"))
            );
            if (!c) return ''; 
            return `
            <div class="p-4 hover:bg-blue-600/10 cursor-pointer flex items-center gap-4 border-b border-white/5 transition-all group" onclick="window.selectFromSearch('${name}')">
                <div class="w-8 h-5 rounded shadow-sm overflow-hidden relative border border-white/10 group-hover:border-blue-400/50">
                    <img src="${c.flags.svg}" class="w-full h-full object-cover">
                </div>
                <span class="font-bold text-white text-sm tracking-tight group-hover:text-blue-300 transition-colors">${name}</span>
                <i class="fas fa-chevron-right ml-auto text-[10px] text-slate-600 group-hover:text-blue-400"></i>
            </div>`;
        }).join('');
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
                prompt: `
                    Target Sector: ${loc}. 
                    Generate a high-density Intelligence Dossier with exactly 10 numbered strategic metrics.
                    Format:
                    1. [METRIC_NAME]: Value/Status - Brief Context.
                    ...
                    10. [METRIC_NAME]: Value/Status - Brief Context.
                    Include metrics like Political Stability, Border Integrity, Cyber Threat, Civil Unrest, Military Readiness, Energy Reserves, Supply Chain, Inflation, Foreign Relations, and Infrastructure.
                    Tone: Strict military/intelligence.
                ` 
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
async function fetchDetailedEconomics(country) {
    document.getElementById('eco-gdp').innerText = "--";
    document.getElementById('eco-growth').innerText = "--%";
    document.getElementById('eco-inflation').innerText = "--%";
    document.getElementById('eco-unemployment').innerText = "--%";
    document.getElementById('eco-exports').innerHTML = '<div class="h-4 bg-white/10 rounded w-3/4 animate-pulse"></div>';
    
    try {
        const prompt = `
            Analyze the economy of ${country}. 
            Return ONLY a valid JSON object with these keys (use 'N/A' if unknown, estimate if necessary based on 2024/2025 data):
            {
                "gdp_billions": "number only",
                "gdp_growth_percent": "number only",
                "gdp_per_capita": "number only",
                "inflation_rate": "number only",
                "unemployment_rate": "number only",
                "interest_rate": "number only",
                "debt_to_gdp": "number only",
                "major_exports": ["item1", "item2", "item3"],
                "market_summary": "1 short sentence on current market status"
            }
            Do not add markdown formatting. Just the raw JSON string.
        `;

        const res = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });
        
        const data = await res.json();
        if (!data.candidates) throw new Error("AI Busy");
        
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const eco = JSON.parse(text);

        if(eco.gdp_billions) document.getElementById('eco-gdp').innerText = eco.gdp_billions;
        if(eco.gdp_growth_percent) document.getElementById('eco-growth').innerText = (eco.gdp_growth_percent > 0 ? '+' : '') + eco.gdp_growth_percent + '%';
        if(eco.gdp_per_capita) document.getElementById('eco-capita').innerText = '$' + eco.gdp_per_capita;
        
        if(eco.inflation_rate) document.getElementById('eco-inflation').innerText = eco.inflation_rate + '%';
        if(eco.unemployment_rate) document.getElementById('eco-unemployment').innerText = eco.unemployment_rate + '%';
        if(eco.interest_rate) document.getElementById('eco-interest').innerText = eco.interest_rate + '%';
        if(eco.debt_to_gdp) document.getElementById('eco-debt').innerText = eco.debt_to_gdp + '%';

        if(eco.major_exports && Array.isArray(eco.major_exports)) {
            document.getElementById('eco-exports').innerHTML = eco.major_exports.map(item => 
                `<div class="flex items-center gap-2"><div class="w-1.5 h-1.5 bg-blue-500 rounded-full"></div><span class="text-sm text-slate-300 font-bold uppercase">${item}</span></div>`
            ).join('');
        }

        if(eco.market_summary) {
            const ticker = document.getElementById('eco-market-ticker');
            ticker.innerText = eco.market_summary.toUpperCase();
        }

        window.playTacticalSound('success');

    } catch(e) {
        console.error("Eco Intel Error", e);
        document.getElementById('eco-market-ticker').innerText = "ECONOMIC DATALINK SEVERED. RETRYING...";
    }
}
async function fetchMarketIntel(country, currency) {
    const textEl = document.getElementById('market-brief-text');
    const goldEl = document.getElementById('price-gold');
    const silverEl = document.getElementById('price-silver');
    if(textEl) textEl.innerHTML = '<span class="animate-pulse text-slate-500">Scanning global exchanges...</span>';
    if(goldEl) goldEl.innerText = "--";
    if(silverEl) silverEl.innerText = "--";
    try {
        const prompt = `Analyze current financial markets for ${country} and global context.
        Return a detailed intel report in this EXACT format:
        [GLOBAL INDICES]
        • Index: Value (Change%) - Context
        • Index: Value (Change%) - Context
        [COMMODITIES & FOREX]
        • GOLD_PRICE: 2345.67 (Example)
        • SILVER_PRICE: 28.90 (Example)
        • Asset: Price (Context)
        [STRATEGIC ANALYSIS]
        3-4 detailed sentences on market sentiment, sector performance, and risk factors.`;
        
        const res = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });
        const result = await res.json();
        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Market data unavailable.";
        if(textEl) textEl.innerText = responseText;
        
        const goldMatch = responseText.match(/GOLD_PRICE:\s*([\d,.]+)/i);
        const silverMatch = responseText.match(/SILVER_PRICE:\s*([\d,.]+)/i);
        
        if(goldEl && goldMatch) goldEl.innerText = goldMatch[1];
        if(silverEl && silverMatch) silverEl.innerText = silverMatch[1];
        
        window.playTacticalSound('success');
    } catch (e) {
        if(textEl) textEl.innerText = "Financial uplink failed.";
    }
}
window.activateMapInteraction = () => {
    const overlay = document.getElementById('map-overlay-guard');
    if(overlay) {
        overlay.classList.add('active');
        window.playTacticalSound('click');
    }
};

window.deactivateMapInteraction = () => {
    const overlay = document.getElementById('map-overlay-guard');
    if(overlay) {
        overlay.classList.remove('active');
    }
};
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
        const drag = d3.drag()
            .on("drag", (event) => {
                const rotate = currentProjection.rotate();
                const k = 75 / currentProjection.scale();
                currentProjection.rotate([
                    rotate[0] + event.dx * k,
                    rotate[1] - event.dy * k
                ]);
                g.selectAll("path").attr("d", path);
            });
        svg.call(drag);
    }
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(data => {
        worldFeatures = topojson.feature(data, data.objects.countries).features;
        const palette = [
            "#1d4ed8", "#2563eb", "#3b82f6", 
            "#4f46e5", "#6366f1", "#0ea5e9", 
            "#334155", "#475569", "#0f766e"  
        ];
        g.selectAll("path").data(worldFeatures).enter().append("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("fill", (d, i) => palette[i % palette.length]) 
            .on("mouseenter", function(e, d) { 
                window.playTacticalSound('hover');
                const t = document.getElementById('map-tooltip');
                t.style.left = (e.pageX + 15) + 'px';
                t.style.top = (e.pageY - 15) + 'px';
                t.classList.remove('hidden');
                document.getElementById('tooltip-text').innerText = d.properties.name;
            })
            .on("mousemove", function(e) {
                const t = document.getElementById('map-tooltip');
                t.style.left = (e.pageX + 15) + 'px';
                t.style.top = (e.pageY - 15) + 'px';
            })
            .on("mouseleave", function() { 
                document.getElementById('map-tooltip').classList.add('hidden');
            })
            .on("click", function(event, d) {
                handleCountryClick(event, d);
            });
    });
}
async function handleCountryClick(event, d) {
    window.playTacticalSound('click');
    d3.selectAll(".country").classed("active", false);
    if (d && g) {
        g.selectAll("path").filter(p => p.properties.name === d.properties.name).classed("active", true);
    }
    selectedCountry = d;
    window.switchTab('intel'); 
    
    document.getElementById('sidebar').scrollIntoView({ behavior: 'smooth' });

    if (d && d.properties) {
        document.getElementById('selected-country-name').innerText = d.properties.name;
        iso2Code = null; 
        fetchAllData(d.properties.name);
        if (projectionType === '2d') {
            zoomToCountry(d); 
        } else {
            rotateToCountry(d);
        }
        generateAIBriefing(d.properties.name);
        fetchMarketIntel(d.properties.name, currencyCode);
    }
}
function rotateToCountry(d) {
    const centroid = d3.geoCentroid(d);
    d3.transition()
        .duration(1200)
        .tween("rotate", () => {
            const r = d3.interpolate(currentProjection.rotate(), [-centroid[0], -centroid[1]]);
            return (t) => { 
                currentProjection.rotate(r(t)); 
                g.selectAll("path").attr("d", d3.geoPath().projection(currentProjection)); 
            };
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
async function fetchNews() {
    const container = document.getElementById('articles-container');
    const loading = document.getElementById('news-loading');
    if (loading) loading.classList.remove('hidden'); 
    if (container) container.innerHTML = '';
    try {
        let url = `/api/news?category=${currentCategory}&country=${iso2Code || ''}&q=${selectedCountry ? encodeURIComponent(selectedCountry.properties.name) : ''}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('News fetch failed');
        const data = await res.json();
        
        if(data.totalResults) document.getElementById('news-count').innerText = data.totalResults;

        if (data.results && data.results.length > 0) {
            data.results.forEach((art, i) => {
                const card = document.createElement('div');
                const sents = ['signal-blue', 'signal-emerald', 'signal-red'];
                const sent = sents[i % 3];
                const img = art.image_url ? `<div class="h-32 w-full mb-3 rounded bg-cover bg-center border border-white/10" style="background-image: url('${art.image_url}')"></div>` : '';
                card.className = `dossier-card shadow-md mb-4 ${sent}`;
                card.onmouseenter = () => window.playTacticalSound('hover');
                card.innerHTML = `
                    <div class="flex justify-between items-center mb-4">
                        <div class="text-[10px] font-black text-white/70 uppercase tracking-widest bg-white/5 px-2.5 py-0.5 rounded-lg truncate max-w-[100px]">${art.source_id || 'UPLINK'}</div>
                        <button class="text-slate-400 hover:text-white transition-all tactical-btn"><i class="fas fa-link text-[13px]"></i></button>
                    </div>
                    ${img} <h3 class="font-bold text-[16px] text-white leading-tight mb-3 cursor-pointer hover:text-blue-300 transition-colors pr-4" onclick="window.open('${art.link}', '_blank')">${art.title}</h3>
                `;
                container.appendChild(card);
            });
        } else { if (container) container.innerHTML = `<div class="col-span-full p-10 text-center text-[12px] text-slate-500 font-black italic uppercase tracking-widest">Zero news fragments in sector.</div>`; }
    } catch (e) {
         if (container) container.innerHTML = `<div class="col-span-full p-10 text-center text-[12px] text-red-500 font-black italic uppercase tracking-widest">Uplink Error. Retrying...</div>`;
    } finally { if (loading) loading.classList.add('hidden'); }
}
window.setCategory = (el, cat) => {
    window.playTacticalSound('click');
    document.querySelectorAll('.intel-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    currentCategory = cat;
    fetchNews();
};
async function fetchAllData(name) {
    try {
        const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=true`);
        const data = await res.json();
        if (data && data[0]) {
            const c = data[0];
            iso2Code = c.cca2.toLowerCase(); currencyCode = c.currencies ? Object.keys(c.currencies)[0] : null;
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
            if(flagEl && nameEl && box){
                flagEl.src = c.flags.svg;
                nameEl.innerText = c.name.common;
                box.classList.remove('hidden');
            }
            countryUTCOffset = c.timezones ? c.timezones[0] : "UTC+00:00";
            
            let lat = 0, lon = 0;
            if(c.latlng && c.latlng.length === 2) {
                [lat, lon] = c.latlng;
            } else if (c.capitalInfo && c.capitalInfo.latlng && c.capitalInfo.latlng.length === 2) {
                [lat, lon] = c.capitalInfo.latlng;
            }

            if (lat || lon) {
                fetchWeather(lat, lon);
            }
            
            document.getElementById('fact-pop-2').innerText = (c.population / 1000000).toFixed(1) + 'M';
            document.getElementById('fact-gini-2').innerText = c.gini ? Object.values(c.gini)[0] : 'N/A';
            document.getElementById('fact-demonym-2').innerText = c.demonyms?.eng?.m || '--';
            document.getElementById('fact-area-2').innerText = c.area.toLocaleString() + ' km²';

            fetchCurrency(); 
            fetchDetailedEconomics(c.name.common); 
            fetchNews();
        }
    } catch (e) { console.error("Data Fetch Error", e); }
}
async function fetchCurrency() {
    const el = document.getElementById('fact-currency');
    const elCode = document.getElementById('eco-currency-code');
    const elRate = document.getElementById('eco-rate');
    
    if (!currencyCode || currencyCode === 'USD') { 
        if (el) el.innerText = "1.00 USD";
        if (elCode) elCode.innerText = "USD"; 
        if (elRate) elRate.innerText = "1.00";  
        return; 
    }
    if(elCode) elCode.innerText = currencyCode;
    if(elRate) elRate.innerText = "Scanning...";

    try {
        const res = await fetch(`https://open.er-api.com/v6/latest/USD`);
        const data = await res.json();
        if (data && data.rates && data.rates[currencyCode]) {
            const rate = data.rates[currencyCode];
            if (el) el.innerText = `${rate.toFixed(2)} ${currencyCode}`;
            if (elRate) elRate.innerText = rate.toFixed(2);
        } else {
            if (el) el.innerText = "Data Unavailable";
            if (elRate) elRate.innerText = "---";
        }
    } catch (e) { 
        console.error("Currency Error:", e);
        if (el) el.innerText = "Offline"; 
        if (elRate) elRate.innerText = "ERR"; 
    }
}
function getWeatherMeta(code, isDay = 1) {
    const timeClass = isDay ? 'text-amber-400' : 'text-blue-300';
    const codes = {
        0: { text: "Clear Sky", icon: isDay ? "fa-sun" : "fa-moon", color: timeClass },
        1: { text: "Mainly Clear", icon: isDay ? "fa-cloud-sun" : "fa-cloud-moon", color: "text-blue-200" },
        2: { text: "Partly Cloudy", icon: "fa-cloud", color: "text-slate-300" },
        3: { text: "Overcast", icon: "fa-cloud", color: "text-slate-400" },
        45: { text: "Fog", icon: "fa-smog", color: "text-slate-400" },
        48: { text: "Depositing Rime Fog", icon: "fa-smog", color: "text-slate-400" },
        51: { text: "Light Drizzle", icon: "fa-cloud-rain", color: "text-blue-400" },
        53: { text: "Moderate Drizzle", icon: "fa-cloud-rain", color: "text-blue-400" },
        55: { text: "Dense Drizzle", icon: "fa-cloud-showers-heavy", color: "text-blue-400" },
        61: { text: "Slight Rain", icon: "fa-cloud-rain", color: "text-blue-500" },
        63: { text: "Moderate Rain", icon: "fa-cloud-showers-heavy", color: "text-blue-500" },
        65: { text: "Heavy Rain", icon: "fa-cloud-showers-water", color: "text-blue-600" },
        71: { text: "Slight Snow", icon: "fa-snowflake", color: "text-white" },
        73: { text: "Moderate Snow", icon: "fa-snowflake", color: "text-white" },
        75: { text: "Heavy Snow", icon: "fa-snowflake", color: "text-white" },
        95: { text: "Thunderstorm", icon: "fa-bolt", color: "text-yellow-400" },
        96: { text: "Thunderstorm/Hail", icon: "fa-poo-storm", color: "text-yellow-400" }
    };
    return codes[code] || { text: "Unknown", icon: "fa-meteor", color: "text-slate-500" };
}
function getMoonPhase() {
    const date = new Date();
    let year = date.getFullYear(); 
    let month = date.getMonth() + 1; 
    const day = date.getDate();
    let c = 0, e = 0, jd = 0, b = 0;
    
    if (month < 3) { year--; month += 12; } 
    
    ++month;
    c = 365.25 * year;
    e = 30.6 * month;
    jd = c + e + day - 694039.09; 
    jd /= 29.5305882; 
    b = parseInt(jd); 
    jd -= b; 
    b = Math.round(jd * 8); 
    if (b >= 8 ) b = 0; 
    const phases = [
        {t: "New Moon", i: "fa-circle"},
        {t: "Waxing Crescent", i: "fa-moon"},
        {t: "First Quarter", i: "fa-adjust"},
        {t: "Waxing Gibbous", i: "fa-moon"}, 
        {t: "Full Moon", i: "fa-circle text-white"},
        {t: "Waning Gibbous", i: "fa-moon"},
        {t: "Last Quarter", i: "fa-adjust"},
        {t: "Waning Crescent", i: "fa-moon"}
    ];
    return phases[b];
}
async function fetchWeather(lat, lon) {
    if (isNaN(lat) || isNaN(lon)) {
        console.error("Invalid coordinates passed to weather module.");
        return;
    }

    const url = `/api/weather?lat=${lat}&lon=${lon}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
        const data = await res.json();

        if (data.current) {
            const curr = data.current;
            const meta = getWeatherMeta(curr.weather_code, curr.is_day);
            
            document.getElementById('atmo-temp').innerText = `${Math.round(curr.temperature_2m)}°`;
            document.getElementById('atmo-condition').innerText = meta.text; 
            
            const iconEl = document.getElementById('atmo-main-icon');
            if(iconEl) iconEl.className = `fas ${meta.icon} text-9xl ${meta.color} opacity-80`;
            
            if(document.getElementById('atmo-feels')) 
                document.getElementById('atmo-feels').innerText = `${Math.round(curr.apparent_temperature)}°`;
            
            if(document.getElementById('atmo-wind-speed'))
                document.getElementById('atmo-wind-speed').innerText = Math.round(curr.wind_speed_10m);
            
            if(document.getElementById('atmo-wind-arrow'))
                document.getElementById('atmo-wind-arrow').style.transform = `rotate(${curr.wind_direction_10m}deg)`;
            
            if(document.getElementById('atmo-humidity'))
                document.getElementById('atmo-humidity').innerText = `${curr.relative_humidity_2m}%`;
            
            if(document.getElementById('atmo-pressure'))
                document.getElementById('atmo-pressure').innerText = Math.round(curr.pressure_msl || curr.surface_pressure);

            let estimatedCeiling = 8.0; 
            const code = curr.weather_code;
            
            if (code === 0 || code === 1) estimatedCeiling = 12.0; 
            else if (code === 2) estimatedCeiling = 4.5; 
            else if (code === 3) estimatedCeiling = 1.8; 
            else if (code >= 45 && code <= 48) estimatedCeiling = 0.2; 
            else if (code >= 51 && code <= 67) estimatedCeiling = 1.2; 
            else if (code >= 71) estimatedCeiling = 0.9; 
            else if (code >= 95) estimatedCeiling = 1.0; 

            estimatedCeiling += (Math.random() * 0.4 - 0.2); 
            
            if(document.getElementById('atmo-cloud-base'))
                document.getElementById('atmo-cloud-base').innerText = estimatedCeiling.toFixed(1);
        }

        if (data.daily) {
            const todayHigh = data.daily.temperature_2m_max[0];
            const todayLow = data.daily.temperature_2m_min[0];
            document.getElementById('atmo-hl').innerText = `${Math.round(todayLow)}° / ${Math.round(todayHigh)}°`;

            const sunrise = new Date(data.daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            const sunset = new Date(data.daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            document.getElementById('atmo-sunrise').innerText = sunrise;
            document.getElementById('atmo-sunset').innerText = sunset;

            const uvMax = data.daily.uv_index_max[0];
            const uvPercent = Math.min((uvMax / 11) * 100, 100);
            document.getElementById('atmo-uv-val').innerText = uvMax;
            document.getElementById('atmo-uv-bar').style.width = `${uvPercent}%`;
            
            let uvText = "Low";
            if (uvMax > 2) uvText = "Moderate";
            if (uvMax > 5) uvText = "High";
            if (uvMax > 7) uvText = "Very High";
            if (uvMax > 10) uvText = "Extreme";
            document.getElementById('atmo-uv-text').innerText = uvText;
        }

        if (data.hourly) {
            const hourlyContainer = document.getElementById('atmo-hourly-container');
            if (hourlyContainer) {
                hourlyContainer.innerHTML = '';
                const currentHour = new Date().getHours();
                try {
                    for (let i = currentHour; i < currentHour + 24; i++) {
                        if (!data.hourly.time[i]) break;
                        const timeStr = new Date(data.hourly.time[i]).toLocaleTimeString([], { hour: 'numeric', hour12: true }).replace(' ', '');
                        const hTemp = Math.round(data.hourly.temperature_2m[i]);
                        const hCode = data.hourly.weather_code[i];
                        const hIsDay = (i % 24) > 6 && (i % 24) < 18 ? 1 : 0;
                        const hMeta = getWeatherMeta(hCode, hIsDay);
                        const hRain = data.hourly.precipitation_probability ? data.hourly.precipitation_probability[i] : 0;

                        const hDiv = document.createElement('div');
                        hDiv.className = "flex flex-col items-center gap-2 min-w-[3.5rem] p-2 rounded-xl hover:bg-white/5 transition-colors cursor-default border border-transparent hover:border-white/5";
                        hDiv.innerHTML = `
                            <span class="text-[10px] text-slate-400 font-bold tracking-tight">${i === currentHour ? 'Now' : timeStr}</span>
                            <i class="fas ${hMeta.icon} text-lg ${hMeta.color}"></i>
                            <span class="text-[12px] font-bold text-white">${hTemp}°</span>
                            ${hRain > 20 ? `<span class="text-[9px] text-blue-400 font-bold">${hRain}%</span>` : ''}
                        `;
                        hourlyContainer.appendChild(hDiv);
                    }
                } catch(err) { console.log("Hourly data incomplete"); }
            }
            
            const visKm = data.hourly.visibility ? data.hourly.visibility[new Date().getHours()] / 1000 : 10;
            if(document.getElementById('atmo-visibility'))
                document.getElementById('atmo-visibility').innerText = visKm.toFixed(1);
        }

        const moon = getMoonPhase();
        if(document.getElementById('atmo-moon-text')) {
            document.getElementById('atmo-moon-text').innerText = moon.t;
            document.getElementById('atmo-moon-icon').className = `fas ${moon.i} text-2xl text-indigo-300`;
        }
        
        const precipTotal = data.daily && data.daily.precipitation_sum ? data.daily.precipitation_sum[0] : 0;
        document.getElementById('atmo-precip-total').innerText = precipTotal.toFixed(1);

        const dailyContainer = document.getElementById('atmo-daily-container');
        if (dailyContainer && data.daily) {
            dailyContainer.innerHTML = '';
            for (let i = 1; i < 7; i++) {
                if (!data.daily.time[i]) break;
                const dateObj = new Date(data.daily.time[i]);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                const dMax = Math.round(data.daily.temperature_2m_max[i]);
                const dMin = Math.round(data.daily.temperature_2m_min[i]);
                const dCode = data.daily.weather_code[i];
                const dMeta = getWeatherMeta(dCode, 1);
                const dPrecipSum = data.daily.precipitation_sum ? data.daily.precipitation_sum[i] : 0;

                const dRow = document.createElement('div');
                dRow.className = "px-6 py-3 flex items-center justify-between hover:bg-white/5 transition-colors group";
                dRow.innerHTML = `
                    <span class="text-[12px] text-slate-300 font-bold w-24">${dayName}</span>
                    <div class="flex items-center gap-3 w-32">
                        <i class="fas ${dMeta.icon} ${dMeta.color} w-6 text-center"></i>
                        <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider group-hover:text-blue-400 transition-colors">${dMeta.text}</span>
                    </div>
                    <div class="flex items-center gap-4 text-right flex-1 justify-end">
                        ${dPrecipSum > 0 ? `<div class="flex items-center gap-1 text-[10px] text-blue-400 font-bold"><i class="fas fa-umbrella"></i> ${Math.round(dPrecipSum)}mm</div>` : ''}
                        <div class="font-mono text-xs font-bold text-white">
                            <span class="text-slate-500">${dMin}°</span> / ${dMax}°
                        </div>
                    </div>
                `;
                dailyContainer.appendChild(dRow);
            }
        }
        
        window.playTacticalSound('success');

    } catch (e) {
        console.error("Atmosphere Error:", e);
    }
}
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
    if(country) handleCountryClick(null, country);
    else fetchAllData(name);
    document.getElementById('search-overlay').classList.add('hidden');
};
window.zoomMap = (f) => {
    window.playTacticalSound('click');
    if (projectionType === '2d') svg.transition().duration(400).call(zoom.scaleBy, f);
    else { currentProjection.scale(currentProjection.scale() * f); g.selectAll("path").attr("d", d3.geoPath().projection(currentProjection)); }
};
window.resetToGlobalCenter = () => {
    selectedCountry = null; countryUTCOffset = null;
    d3.selectAll(".country").classed("active", false);
    document.getElementById('selected-country-name').innerText = "Global Surveillance";
    document.getElementById('ai-briefing-box').classList.add('hidden');
    const flagBox = document.getElementById('active-sector-display');
    if(flagBox) flagBox.classList.add('hidden');
    if (projectionType === '2d') svg.transition().duration(1200).call(zoom.transform, d3.zoomIdentity);
    fetchNews();
};
window.goToIndiaHome = () => { 
    const india = worldFeatures.find(f => f.properties.name === "India"); 
    if (india) handleCountryClick(null, india); 
};
function setupEventListeners() {
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.onmouseenter = () => window.playTacticalSound('hover');
        pill.onclick = () => {
            window.playTacticalSound('click');
            document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentCategory = pill.dataset.cat;
            fetchNews();
        };
    });
    const input = document.getElementById('country-search');
    input.oninput = (e) => {
        const query = e.target.value.toLowerCase().trim();
        const resContainer = document.getElementById('search-results');
        if (!query) { 
            renderTrending(); 
            return; 
        }
        if (!globalSearchData || globalSearchData.length === 0) {
            resContainer.innerHTML = `<div class="p-6 text-center text-xs text-slate-500 font-bold uppercase tracking-widest animate-pulse">Initializing Search Index...</div>`;
            return;
        }
        const matched = globalSearchData.filter(c => c.name.common.toLowerCase().includes(query)).slice(0, 8);
        if (matched.length === 0) {
            resContainer.innerHTML = `<div class="p-6 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">Sector Not Found</div>`;
            return;
        }
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
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); toggleSearch(); }
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
        let off = 0; const match = countryUTCOffset.match(/UTC([+-]\d+):?(\d+)?/);
        if (match) off = (parseInt(match[1]) * 60) + (match[2] ? parseInt(match[2]) : 0);
        const localDate = new Date(utc + (60000 * off));
        const localEl = document.getElementById('local-time');
        if (localEl) localEl.innerText = localDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const hr = localDate.getHours();
        const isNight = hr < 6 || hr > 18;
        document.body.classList.toggle('night-mode', isNight);
        document.body.classList.toggle('day-mode', !isNight);
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
        console.log("Voice Command:", command);
        btn.classList.remove('text-red-500', 'animate-pulse');
        if (command.includes("go to")) {
            const country = command.replace("go to ", "").trim();
            window.selectFromSearch(country);
            appendLog(`> VOICE COMMAND: VECTORING TO [${country.toUpperCase()}]`, 'text-red-400');
        } else if (command.includes("analyze")) {
            window.switchTab('intel');
            appendLog(`> VOICE COMMAND: INITIATING ANALYSIS`, 'text-red-400');
        } else if (command.includes("news")) {
            window.switchTab('news');
        }
    };
    recognition.onerror = () => {
        btn.classList.remove('text-red-500', 'animate-pulse');
    };
};
initTerminal();
initMap('2d');
setupEventListeners();
setInterval(updateSystemTime, 1000);
document.addEventListener('click', function() {
    if (!isAmbiencePlaying) {
        toggleAmbience();
    }
}, { once: true });
window.addEventListener('resize', () => {
    const c = document.getElementById('map-container');
    if(c) { 
        d3.select("#world-map").attr("viewBox", `0 0 ${c.clientWidth} ${c.clientHeight}`);
        initMap(projectionType); 
    }
});