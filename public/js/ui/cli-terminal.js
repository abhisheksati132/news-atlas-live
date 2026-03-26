let _cliExpanded = false;
let _cliHistory = [];
let _cliHistoryIndex = -1;
let _dragging = false;
let _dragOffX = 0, _dragOffY = 0;

function initDrag() {
    const panel = document.getElementById("floating-cli");
    const handle = document.getElementById("floating-cli-handle");
    if (!panel || !handle) return;
    handle.addEventListener("mousedown", (e) => {
        if (e.target.closest("button")) return;
        _dragging = true;
        const rect = panel.getBoundingClientRect();
        _dragOffX = e.clientX - rect.left;
        _dragOffY = e.clientY - rect.top;
        panel.style.transition = "none";
        e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => {
        if (!_dragging) return;
        const x = e.clientX - _dragOffX;
        const y = e.clientY - _dragOffY;
        const maxX = window.innerWidth - panel.offsetWidth;
        const maxY = window.innerHeight - panel.offsetHeight;
        panel.style.left = Math.max(0, Math.min(x, maxX)) + "px";
        panel.style.top = Math.max(0, Math.min(y, maxY)) + "px";
        panel.style.bottom = "auto";
        panel.style.right = "auto";
    });
    document.addEventListener("mouseup", () => {
        if (_dragging) {
            _dragging = false;
            panel.style.transition = "";
            localStorage.setItem("cli-pos", JSON.stringify({
                left: panel.style.left, top: panel.style.top
            }));
        }
    });
    try {
        const saved = JSON.parse(localStorage.getItem("cli-pos") || "{}");
        if (saved.left && saved.top) {
            panel.style.left = saved.left;
            panel.style.top = saved.top;
            panel.style.bottom = "auto";
            panel.style.right = "auto";
        }
    } catch { }
}

window.openCLI = function () {
    const panel = document.getElementById("floating-cli");
    const body = document.getElementById("floating-cli-body");
    const chev = document.getElementById("floating-cli-chevron");
    if (!panel || !body) return;
    panel.classList.remove("cli-locked");
    _cliExpanded = true;
    panel.classList.add("cli-expanded");
    body.style.display = "flex";
    body.style.flexDirection = "column";
    requestAnimationFrame(() => { body.classList.add("cli-body-open"); });
    if (chev) chev.style.transform = "rotate(180deg)";
    setTimeout(() => document.getElementById("floating-cli-input")?.focus(), 200);
    if (window.playTacticalSound) window.playTacticalSound("success");
    const output = document.getElementById("floating-cli-output");
    if (output && !output.dataset.welcomed) {
        output.dataset.welcomed = "1";
        cliPrint([
            `<span class="cli-head">NEWSATLAS ASSISTANT</span>`,
            `<span class="cli-dim">Type <span class="cli-key">help</span> for available commands  ·  Drag the title bar to move  ·  AI-powered</span>`,
            `<span class="cli-dim"></span>`,
        ]);
    }
};

window.closeCLI = function (e) {
    if (e) e.stopPropagation();
    const panel = document.getElementById("floating-cli");
    const body = document.getElementById("floating-cli-body");
    const chev = document.getElementById("floating-cli-chevron");
    if (!panel || !body) return;
    _cliExpanded = false;
    body.classList.remove("cli-body-open");
    panel.classList.remove("cli-expanded");
    if (chev) chev.style.transform = "rotate(0deg)";
    if (window.playTacticalSound) window.playTacticalSound("click");
    setTimeout(() => {
        body.style.display = "none";
        panel.classList.add("cli-locked");
    }, 260);
};

window.toggleCLI = function () {
    const panel = document.getElementById("floating-cli");
    if (!panel) return;
    if (panel.classList.contains("cli-locked")) {
        window.openCLI();
    } else {
        _cliExpanded = !_cliExpanded;
        const body = document.getElementById("floating-cli-body");
        const chev = document.getElementById("floating-cli-chevron");
        if (_cliExpanded) {
            panel.classList.add("cli-expanded");
            body.style.display = "flex";
            body.style.flexDirection = "column";
            requestAnimationFrame(() => { body.classList.add("cli-body-open"); });
            if (chev) chev.style.transform = "rotate(180deg)";
            setTimeout(() => document.getElementById("floating-cli-input")?.focus(), 200);
        } else {
            body.classList.remove("cli-body-open");
            panel.classList.remove("cli-expanded");
            if (chev) chev.style.transform = "rotate(0deg)";
            setTimeout(() => { body.style.display = "none"; }, 260);
        }
    }
};

function cliPrint(lines) {
    const output = document.getElementById("floating-cli-output");
    if (!output) return;
    requestAnimationFrame(() => {
        const fragment = document.createDocumentFragment();
        lines.forEach(html => {
            const row = document.createElement("div");
            row.className = "cli-line";
            row.innerHTML = html;
            fragment.appendChild(row);
        });
        output.appendChild(fragment);
        output.scrollTop = output.scrollHeight;
    });
}

const CLI_BUILTINS = {
    help: () => [
        `<span class="cli-head">AVAILABLE COMMANDS</span>`,
        `<span class="cli-key">help</span>              Show this list`,
        `<span class="cli-key">clear</span>             Clear output`,
        `<span class="cli-key">go [country]</span>      Navigate to country`,
        `<span class="cli-key">analyze [country]</span> AI news summary`,
        `<span class="cli-key">tab [name]</span>        Switch sidebar tab`,
        `<span class="cli-key">2d / 3d</span>           Toggle map projection`,
        `<span class="cli-key">quake</span>             Toggle earthquake layer`,
        `<span class="cli-key">flights</span>           Toggle aircraft layer`,
        `<span class="cli-key">conflict</span>          Toggle conflict layer`,
        `<span class="cli-key">airquality</span>        Toggle air quality layer`,
        `<span class="cli-key">reset</span>             Reset map to world view`,
        `<span class="cli-key">color gdp|pop|off</span> Map color overlay`,
        `<span class="cli-key">watchlist</span>         Show saved countries`,
        `<span class="cli-key">time</span>              Show current UTC time`,
        `<span class="cli-dim">— or just type any question to ask AI —</span>`,
    ],
    clear: () => { document.getElementById("floating-cli-output").innerHTML = ""; return []; },
    time: () => [`<span class="cli-val">${new Date().toUTCString()}</span>`],
    watchlist: () => {
        const list = window.getWatchlist?.() || [];
        if (!list.length) return [`<span class="cli-dim">No saved countries yet. Click ★ on a country to pin it.</span>`];
        return [`<span class="cli-head">SAVED COUNTRIES</span>`, ...list.map(c => `  <span class="cli-val">★ ${c}</span>`)];
    },
    "2d": () => { if (window.projectionType !== "2d" && window.toggleProjection) window.toggleProjection(); return [`<span class="cli-ok">✓ Switched to 2D map</span>`]; },
    "3d": () => { if (window.projectionType !== "3d" && window.toggleProjection) window.toggleProjection(); return [`<span class="cli-ok">✓ Switched to 3D globe</span>`]; },
    reset: () => { window.resetToGlobalCenter?.(); return [`<span class="cli-ok">✓ Map reset to world view</span>`]; },
    quake: () => { window.toggleEarthquakeLayer?.(); return [`<span class="cli-ok">✓ Earthquake layer toggled</span>`]; },
    flights: () => { window.toggleAircraftLayer?.(); return [`<span class="cli-ok">✓ Aircraft layer toggled</span>`]; },
    conflict: () => { window.toggleGDELTLayer?.(); return [`<span class="cli-ok">✓ Conflict layer toggled</span>`]; },
    airquality: () => { window.toggleAirQuality?.(); return [`<span class="cli-ok">✓ Air quality layer toggled</span>`]; },
};

async function processCLICommand(raw) {
    if (!raw.trim()) return;
    const input = raw.trim();
    const country = window.selectedCountry?.properties?.name || window._currentCountryName || "Global";
    cliPrint([`<span class="cli-prompt">› <span class="cli-cmd">${escH(input)}</span></span>`]);
    _cliHistory.unshift(input);
    if (_cliHistory.length > 80) _cliHistory.pop();
    _cliHistoryIndex = -1;
    const parts = input.toLowerCase().split(/\s+/);
    const cmd = parts[0];
    const rawArgs = input.slice(cmd.length).trim();
    const args = rawArgs.toLowerCase();
    if (CLI_BUILTINS[cmd]) {
        const r = CLI_BUILTINS[cmd](rawArgs);
        if (r?.length) cliPrint(r);
        return;
    }
    if (cmd === "go" && rawArgs) {
        cliPrint([`<span class="cli-dim">→ Navigating to ${rawArgs}...</span>`]);
        if (window.handleCountryClickByName) window.handleCountryClickByName(rawArgs);
        else if (window.fetchAllData) window.fetchAllData(rawArgs);
        return;
    }
    if (cmd === "tab" && rawArgs) {
        const MAP = { intel: "intel", news: "news", market: "markets", markets: "markets", economy: "economic", economic: "economic", weather: "atmosphere", atmosphere: "atmosphere" };
        const t = MAP[args] || args;
        window.switchTab?.(t);
        cliPrint([`<span class="cli-ok">✓ Switched to ${t}</span>`]);
        return;
    }
    if (cmd === "color") {
        const MODE = { gdp: "gdp", pop: "population", population: "population", conflict: "conflict", off: null, clear: null };
        const m = args in MODE ? MODE[args] : null;
        window.setChoropleth?.(m);
        cliPrint([`<span class="cli-ok">✓ Map overlay: ${m || "cleared"}</span>`]);
        return;
    }
    if (cmd === "analyze") {
        const t = rawArgs || country;
        cliPrint([`<span class="cli-dim">→ Generating AI summary for ${t}...</span>`]);
        window.generateAIBriefing?.(t);
        window.switchTab?.("intel");
        cliPrint([`<span class="cli-ok">✓ Summary loading in AI tab</span>`]);
        return;
    }
    const thinkId = "clt-" + Date.now();
    cliPrint([`<span id="${thinkId}" class="cli-dim"><span class="cli-dot"></span><span class="cli-dot"></span><span class="cli-dot"></span> Thinking...</span>`]);
    const activeLayers = [];
    if (window._earthquakeActive) activeLayers.push("Earthquakes");
    if (window._aircraftActive) activeLayers.push("Live Flights");
    if (window._gdeltActive) activeLayers.push("Global Conflict");
    if (window._airQualityActive) activeLayers.push("Air Quality");
    if (window._cloudsActive) activeLayers.push("Cloud Cover");
    if (window._windActive) activeLayers.push("Wind Patterns");
    let contextStr = `You are an AI assistant for NewsAtlas, a real-time global news and data dashboard.`;
    contextStr += `\nCurrent focus: ${country === "Global" ? "the whole world" : country}.`;
    contextStr += `\nActive tab: ${window._currentTab || "news"}.`;
    if (window._choroplethMode) contextStr += `\nMap is showing: ${window._choroplethMode} data.`;
    if (activeLayers.length > 0) contextStr += `\nActive map layers: ${activeLayers.join(", ")}.`;
    contextStr += `\nAnswer in 2-4 sentences, clear and direct, no markdown. Respond to the user's question based on your knowledge and the provided context.`;
    try {
        const payload = {
            prompt: `${contextStr}\n\nUser: ${input}`,
            history: window._cliMsgHistory || []
        };
        const res = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
        if (!window._cliMsgHistory) window._cliMsgHistory = [];
        window._cliMsgHistory.push({ role: "user", content: input });
        window._cliMsgHistory.push({ role: "assistant", content: reply });
        if (window._cliMsgHistory.length > 6) window._cliMsgHistory = window._cliMsgHistory.slice(-6);
        document.getElementById(thinkId)?.remove();
        cliPrint([`<span class="cli-ai">AI →</span> <span class="cli-reply">${escH(reply.replace(/\*\*/g, "").trim())}</span>`]);
        window.playTacticalSound?.("success");
    } catch {
        const el = document.getElementById(thinkId);
        if (el) el.innerHTML = `<span class="cli-err">Connection failed. Please try again.</span>`;
    }
}

function escH(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

document.addEventListener("DOMContentLoaded", () => {
    initDrag();
    const inp = document.getElementById("floating-cli-input");
    if (!inp) return;
    inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const v = inp.value; inp.value = "";
            processCLICommand(v);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            _cliHistoryIndex = Math.min(_cliHistoryIndex + 1, _cliHistory.length - 1);
            inp.value = _cliHistory[_cliHistoryIndex] || "";
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            _cliHistoryIndex = Math.max(_cliHistoryIndex - 1, -1);
            inp.value = _cliHistoryIndex >= 0 ? _cliHistory[_cliHistoryIndex] : "";
        } else if (e.key === "Escape") {
            window.toggleCLI();
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("keydown", (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        if (e.key === "`") { e.preventDefault(); window.toggleCLI(); }
    });
});

window._cliPrint = cliPrint;