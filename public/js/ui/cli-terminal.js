/**
 * cli-terminal.js — Draggable Floating AI Terminal
 * - Freely draggable anywhere on screen
 * - Compact (title bar only) by default, expands on click
 * - Backtick (`) to toggle open/close
 * - ↑↓ arrow keys for command history
 */

let _cliExpanded = false;
let _cliHistory = [];
let _cliHistoryIndex = -1;
let _dragging = false;
let _dragOffX = 0, _dragOffY = 0;

/* ── Drag logic ─────────────────────────────────────────── */
function initDrag() {
    const panel = document.getElementById("floating-cli");
    const handle = document.getElementById("floating-cli-handle");
    if (!panel || !handle) return;

    handle.addEventListener("mousedown", (e) => {
        // Don't start drag if clicking a button inside the handle
        if (e.target.closest("button")) return;
        _dragging = true;
        const rect = panel.getBoundingClientRect();
        _dragOffX = e.clientX - rect.left;
        _dragOffY = e.clientY - rect.top;
        // Pause transition so width doesn't fight drag
        panel.style.transition = "none";
        e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
        if (!_dragging) return;
        const x = e.clientX - _dragOffX;
        const y = e.clientY - _dragOffY;
        // Clamp within viewport
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
            // Persist position to localStorage
            localStorage.setItem("cli-pos", JSON.stringify({
                left: panel.style.left, top: panel.style.top
            }));
        }
    });

    // Restore saved position
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

/* ── Expand / collapse ─────────────────────────────────── */
window.toggleCLI = function () {
    _cliExpanded = !_cliExpanded;
    const panel = document.getElementById("floating-cli");
    const body = document.getElementById("floating-cli-body");
    const chev = document.getElementById("floating-cli-chevron");
    if (!panel || !body) return;

    if (_cliExpanded) {
        panel.classList.add("cli-expanded");        // widen to 420px
        body.style.display = "flex";
        body.style.flexDirection = "column";
        // Tiny reflow trick to trigger the CSS height transition
        requestAnimationFrame(() => { body.classList.add("cli-body-open"); });
        if (chev) chev.style.transform = "rotate(180deg)";
        setTimeout(() => document.getElementById("floating-cli-input")?.focus(), 200);
        if (window.playTacticalSound) window.playTacticalSound("click");
        // Show welcome message once
        const output = document.getElementById("floating-cli-output");
        if (output && !output.dataset.welcomed) {
            output.dataset.welcomed = "1";
            cliPrint([
                `<span class="cli-head">NEURAL COMMAND INTERFACE v2.0</span>`,
                `<span class="cli-dim">Type <span class="cli-key">help</span> for commands · Drag title bar to move · AI-powered</span>`,
                `<span class="cli-dim">───────────────────────────────────</span>`,
            ]);
        }
    } else {
        body.classList.remove("cli-body-open");
        panel.classList.remove("cli-expanded");     // shrink back to pill
        if (chev) chev.style.transform = "rotate(0deg)";
        setTimeout(() => { body.style.display = "none"; }, 260);
    }
};

/* ── Print output ───────────────────────────────────────── */
function cliPrint(lines) {
    const output = document.getElementById("floating-cli-output");
    if (!output) return;
    lines.forEach(html => {
        const row = document.createElement("div");
        row.className = "cli-line";
        row.innerHTML = html;
        output.appendChild(row);
    });
    output.scrollTop = output.scrollHeight;
}

/* ── Built-in commands ─────────────────────────────────── */
const CLI_BUILTINS = {
    help: () => [
        `<span class="cli-head">COMMANDS</span>`,
        `<span class="cli-key">help</span>              This help`,
        `<span class="cli-key">clear</span>             Clear output`,
        `<span class="cli-key">go [country]</span>      Jump to country`,
        `<span class="cli-key">analyze [country]</span> AI intel briefing`,
        `<span class="cli-key">tab [name]</span>        Switch sidebar tab`,
        `<span class="cli-key">2d / 3d</span>           Toggle projection`,
        `<span class="cli-key">quake</span>             Earthquake layer`,
        `<span class="cli-key">flights</span>           Aircraft layer`,
        `<span class="cli-key">conflict</span>          Conflict layer`,
        `<span class="cli-key">airquality</span>        Air quality layer`,
        `<span class="cli-key">reset</span>             Reset map view`,
        `<span class="cli-key">color gdp|pop|off</span> Choropleth overlay`,
        `<span class="cli-key">watchlist</span>         Show pinned`,
        `<span class="cli-key">time</span>              UTC time`,
        `<span class="cli-dim">─ or type any question for AI ─</span>`,
    ],
    clear: () => { document.getElementById("floating-cli-output").innerHTML = ""; return []; },
    time: () => [`<span class="cli-val">${new Date().toUTCString()}</span>`],
    watchlist: () => {
        const list = window.getWatchlist?.() || [];
        if (!list.length) return [`<span class="cli-dim">No pins yet. Click ⭐ on a country.</span>`];
        return [`<span class="cli-head">PINNED</span>`, ...list.map(c => `  <span class="cli-val">↪ ${c}</span>`)];
    },
    "2d": () => { if (window.projectionType !== "2d" && window.toggleProjection) window.toggleProjection(); return [`<span class="cli-ok">▶ 2D map</span>`]; },
    "3d": () => { if (window.projectionType !== "3d" && window.toggleProjection) window.toggleProjection(); return [`<span class="cli-ok">▶ 3D globe</span>`]; },
    reset: () => { window.resetToGlobalCenter?.(); return [`<span class="cli-ok">▶ Reset</span>`]; },
    quake: () => { window.toggleEarthquakeLayer?.(); return [`<span class="cli-ok">▶ Earthquake toggled</span>`]; },
    flights: () => { window.toggleAircraftLayer?.(); return [`<span class="cli-ok">▶ Aircraft toggled</span>`]; },
    conflict: () => { window.toggleGDELTLayer?.(); return [`<span class="cli-ok">▶ Conflict toggled</span>`]; },
    airquality: () => { window.toggleAirQuality?.(); return [`<span class="cli-ok">▶ Air quality toggled</span>`]; },
};

/* ── Command processor ──────────────────────────────────── */
async function processCLICommand(raw) {
    if (!raw.trim()) return;
    const input = raw.trim();
    const country = window.selectedCountry?.properties?.name || window._currentCountryName || "Global";

    cliPrint([`<span class="cli-prompt">❯ <span class="cli-cmd">${escH(input)}</span></span>`]);
    _cliHistory.unshift(input);
    if (_cliHistory.length > 80) _cliHistory.pop();
    _cliHistoryIndex = -1;

    const parts = input.toLowerCase().split(/\s+/);
    const cmd = parts[0];
    const rawArgs = input.slice(cmd.length).trim();
    const args = rawArgs.toLowerCase();

    // Built-ins
    if (CLI_BUILTINS[cmd]) {
        const r = CLI_BUILTINS[cmd](rawArgs);
        if (r?.length) cliPrint(r);
        return;
    }

    // go
    if (cmd === "go" && rawArgs) {
        cliPrint([`<span class="cli-dim">▶ Navigating to ${rawArgs}…</span>`]);
        if (window.handleCountryClickByName) window.handleCountryClickByName(rawArgs);
        else if (window.fetchAllData) window.fetchAllData(rawArgs);
        return;
    }

    // tab
    if (cmd === "tab" && rawArgs) {
        const MAP = { intel: "intel", news: "news", market: "markets", markets: "markets", economy: "economic", economic: "economic", weather: "atmosphere", atmosphere: "atmosphere" };
        const t = MAP[args] || args;
        window.switchTab?.(t);
        cliPrint([`<span class="cli-ok">▶ Switched to ${t}</span>`]);
        return;
    }

    // color
    if (cmd === "color") {
        const MODE = { gdp: "gdp", pop: "population", population: "population", conflict: "conflict", off: null, clear: null };
        const m = args in MODE ? MODE[args] : null;
        window.setChoropleth?.(m);
        cliPrint([`<span class="cli-ok">▶ Map: ${m || "cleared"}</span>`]);
        return;
    }

    // analyze
    if (cmd === "analyze") {
        const t = rawArgs || country;
        cliPrint([`<span class="cli-dim">▶ Generating intel for ${t}…</span>`]);
        window.generateAIBriefing?.(t);
        window.switchTab?.("intel");
        cliPrint([`<span class="cli-ok">▶ Streaming in Intel tab</span>`]);
        return;
    }

    // AI fallback
    const thinkId = "clt-" + Date.now();
    cliPrint([`<span id="${thinkId}" class="cli-dim"><span class="cli-dot"></span><span class="cli-dot"></span><span class="cli-dot"></span> AI thinking…</span>`]);
    const ctx = `You are the NewsAtlas intelligence terminal AI. Operator viewing: ${country}. Answer in 2-4 sentences, authoritative tone, no markdown.`;
    try {
        const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: `${ctx}\n\nQuery: ${input}` }) });
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
        document.getElementById(thinkId)?.remove();
        cliPrint([`<span class="cli-ai">AI ›</span> <span class="cli-reply">${escH(reply.replace(/\*\*/g, "").trim())}</span>`]);
        window.playTacticalSound?.("success");
    } catch {
        const el = document.getElementById(thinkId);
        if (el) el.innerHTML = `<span class="cli-err">⚠ AI uplink failed.</span>`;
    }
}

function escH(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

/* ── Input wiring ───────────────────────────────────────── */
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

/* ── Global backtick toggle ─────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("keydown", (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        if (e.key === "`") { e.preventDefault(); window.toggleCLI(); }
    });
});

window._cliPrint = cliPrint;
