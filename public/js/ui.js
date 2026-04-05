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
  div.className =
    "toast-item px-4 py-3 rounded-sm border font-bold tracking-widest shadow-md pointer-events-auto animate-toast-in " +
    (type === "success"
      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
      : type === "error"
        ? "bg-red-500/15 border-red-500/40 text-red-300"
        : type === "info"
          ? "bg-blue-500/15 border-blue-500/40 text-blue-300"
          : "bg-slate-700/90 border-white/20 text-slate-200");
  div.innerText = message;
  div.setAttribute("role", "status");
  container.appendChild(div);
  toastTimeout = setTimeout(() => {
    div.classList.add("animate-toast-out");
    setTimeout(() => div.remove(), 300);
    toastTimeout = null;
    showNextToast();
  }, TOAST_DURATION);
}
window.showToast = function (message, type = "info") {
  toastQueue.push({ message, type });
  if (!toastTimeout) showNextToast();
};

let mapboxToken = null;
fetch('/api/config').then(r => r.json()).then(d => mapboxToken = d.mapboxToken);

function renderTrending() {
  const resContainer = document.getElementById("search-results");
  const searchInput = document.getElementById("country-search");
  if (!resContainer || !searchInput) return;
  
  const query = searchInput.value.trim().toLowerCase();
  
  if (query && window.globalSearchData) {
    const countries = window.globalSearchData.filter(c => 
      c.name.common.toLowerCase().includes(query) || 
      (c.name.official && c.name.official.toLowerCase().includes(query))
    ).slice(0, 8);
    
    let html = `<div style="padding: 1.25rem 1.5rem 0.75rem; font-size: 11px; font-weight: 900; color: #475569; text-transform: uppercase; letter-spacing: 0.15em; font-family: 'JetBrains Mono', monospace;">Nations Found</div>`;
    
    if (countries.length > 0) {
        html += countries.map(c => {
            const name = c.name.common;
            return `<div class="flex items-center gap-6 px-8 py-5 hover:bg-white/[0.04] cursor-pointer transition-all border-b border-white/[0.03] group" onclick="window.selectFromSearch('${name.replace(/'/g, "\\'")}')">
              <div class="w-8 h-5 border border-white/10 shrink-0"><img src="${c.flags.svg}" class="w-full h-full object-cover"></div>
              <span class="text-[15px] font-bold text-white uppercase tracking-wider group-hover:text-slate-300 transition-colors" style="font-family: 'Plus Jakarta Sans', sans-serif;">${name}</span>
              <span class="text-[9px] font-bold text-slate-700 ml-auto tracking-[0.2em] font-mono group-hover:text-white transition-all">TERMINAL_SELECT</span>
            </div>`;
        }).join("");
    } else {
        html = `<div class="px-6 py-4 text-slate-500 text-[11px] uppercase font-bold">Searching Global Registry...</div>`;
    }

    resContainer.innerHTML = html;

    // Background scan for cities/states
    if (query.length > 2 && mapboxToken) {
        clearTimeout(window._searchDebounce);
        window._searchDebounce = setTimeout(async () => {
            try {
                const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&types=place,region,locality&limit=5`);
                const json = await res.json();
                if (json.features && json.features.length > 0) {
                    const registryHtml = `<div style="padding: 1.25rem 2rem 0.75rem; font-size: 11px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 0.15em; font-family: 'JetBrains Mono', monospace;">Registry Matches</div>` + 
                    json.features.map(f => `
                        <div class="flex items-center gap-6 px-8 py-5 hover:bg-white/[0.04] cursor-pointer transition-all border-b border-white/[0.03] group" onclick="window.selectFromSearch('${f.place_name.replace(/'/g, "\\'")}')">
                          <div class="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white transition-colors shrink-0"></div>
                          <div class="flex flex-col">
                            <span class="text-[13px] font-bold text-white uppercase tracking-wider group-hover:text-slate-300 transition-colors" style="font-family: 'JetBrains Mono', monospace;">${f.text}</span>
                            <span class="text-[10px] text-slate-600 font-mono mt-1">${f.place_name}</span>
                          </div>
                        </div>`).join("");
                    resContainer.innerHTML = html + registryHtml;
                }
            } catch (e) { console.warn("Geocoding sync failed"); }
        }, 500);
    }
    return;
  }

  if (!window.globalSearchData || window.globalSearchData.length === 0) {
    resContainer.innerHTML = `
      <div class="col-span-full p-8 text-center">
        <div class="inline-flex items-center gap-3 px-5 py-3 rounded-sm" style="background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.3)">
          <div class="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
          <span class="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            RETRIEVING DATA...
          </span>
        </div>
      </div>`;
    return;
  }
  const recent = (typeof window.getRecentCountries === "function" && window.getRecentCountries()) || [];
  const headerStyle = `padding: 1.25rem 1.5rem 0.75rem; font-size: 11px; font-weight: 900; color: #475569; text-transform: uppercase; letter-spacing: 0.15em; font-family: 'JetBrains Mono', monospace;`;
  let recentHtml = "";
  if (recent.length > 0) {
    recentHtml = `<div style="${headerStyle}">Recent Operations</div>` +
      recent.map((name) => {
        const c = window.globalSearchData.find((curr) => curr.name.common === name);
        if (!c) return "";
        return `<div class="flex items-center gap-5 px-6 py-4 hover:bg-white/[0.03] cursor-pointer transition-all group" onclick="window.selectFromSearch('${name.replace(/'/g, "\\'")}')">
          <div class="w-10 h-6.5 rounded shadow-sm overflow-hidden border border-white/10 shrink-0"><img src="${c.flags.svg}" class="w-full h-full object-cover"></div>
          <span class="font-bold text-white text-base tracking-tight group-hover:text-blue-400 transition-colors">${name}</span>
          <i class="fas fa-chevron-right ml-auto text-[11px] text-slate-700 group-hover:text-blue-400 transition-all group-hover:translate-x-0.5"></i>
        </div>`;
      }).join("") +
      `<div style="${headerStyle} margin-top: 0.5rem;">High Traffic Sectors</div>`;
  } else {
    recentHtml = `<div style="${headerStyle}">High Traffic Sectors</div>`;
  }
  const trending = ["India", "United States", "United Kingdom", "Japan", "Germany", "France", "Russia", "China"];
  resContainer.innerHTML = recentHtml + trending.map((name) => {
    const c = window.globalSearchData.find((curr) =>
      curr.name.common === name ||
      (name === "United States" && curr.name.common === "United States of America") ||
      (name === "Russia" && curr.name.common.includes("Russian")),
    );
    if (!c) return "";
    return `<div class="flex items-center gap-5 px-6 py-4 hover:bg-white/[0.03] cursor-pointer transition-all group" onclick="window.selectFromSearch('${name}')">
      <div class="w-10 h-6.5 rounded shadow-sm overflow-hidden border border-white/10 shrink-0"><img src="${c.flags.svg}" class="w-full h-full object-cover"></div>
      <span class="font-bold text-white text-base tracking-tight group-hover:text-blue-400 transition-colors">${name}</span>
      <i class="fas fa-chevron-right ml-auto text-[11px] text-slate-700 group-hover:text-blue-400 transition-all group-hover:translate-x-0.5"></i>
    </div>`;
  }).join("");
}
window.toggleSearch = () => {
  window.playTacticalSound?.("click");
  const overlay = document.getElementById("search-overlay");
  if (!overlay) return;
  const isHidden = overlay.classList.contains("hidden");
  if (isHidden) {
    overlay.classList.remove("hidden");
    overlay.style.display = 'flex';
    document.getElementById("country-search")?.focus();
    renderTrending();
  } else {
    overlay.classList.add("hidden");
    overlay.style.display = '';
  }
};
window.selectFromSearch = (name) => {
    window.toggleSearch();
    if (window.handleCountryClickByName) {
        window.handleCountryClickByName(name);
    }
    if (window.onCountrySelected) {
        window.onCountrySelected(name);
    }
    // Deep geocoding link for cities/states
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
      localStorage.setItem("cli-pos", JSON.stringify({ left: panel.style.left, top: panel.style.top }));
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
      `<span class="cli-dim">Type <span class="cli-key">help</span> for available commands  ·  AI-powered</span>`,
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
  setTimeout(() => { body.style.display = "none"; panel.classList.add("cli-locked"); }, 260);
};
window.toggleCLI = function () {
  const panel = document.getElementById("floating-cli");
  if (!panel) return;
  if (panel.classList.contains("cli-locked")) { window.openCLI(); return; }
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
function escH(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
const CLI_BUILTINS = {
  help: () => [
    `<span class="cli-head">AVAILABLE COMMANDS</span>`,
    `<span class="cli-key">help</span>              Show this list`,
    `<span class="cli-key">clear</span>             Clear output`,
    `<span class="cli-key">go [country]</span>      Navigate to country`,
    `<span class="cli-key">analyze [country]</span> AI news summary`,
    `<span class="cli-key">tab [name]</span>        Switch sidebar tab`,
    `<span class="cli-key">reset</span>             Reset map to world view`,
    `<span class="cli-key">time</span>              Show current UTC time`,
    `<span class="cli-dim">— or just type any question to ask AI —</span>`,
  ],
  clear: () => { document.getElementById("floating-cli-output").innerHTML = ""; return []; },
  time: () => [`<span class="cli-val">${new Date().toUTCString()}</span>`],
  reset: () => { window.resetToGlobalCenter?.(); return [`<span class="cli-ok">✓ Map reset to world view</span>`]; },
};
async function processCLICommand(raw) {
  if (!raw.trim()) return;
  const input = raw.trim();
  const country = window.selectedCountry?.properties?.name || "Global";
  cliPrint([`<span class="cli-prompt">› <span class="cli-cmd">${escH(input)}</span></span>`]);
  _cliHistory.unshift(input);
  if (_cliHistory.length > 80) _cliHistory.pop();
  _cliHistoryIndex = -1;
  const parts = input.toLowerCase().split(/\s+/);
  const cmd = parts[0];
  const rawArgs = input.slice(cmd.length).trim();
  if (CLI_BUILTINS[cmd]) {
    const r = CLI_BUILTINS[cmd](rawArgs);
    if (r?.length) cliPrint(r);
    return;
  }
  if (cmd === "go" && rawArgs) {
    cliPrint([`<span class="cli-dim">→ Navigating to ${rawArgs}...</span>`]);
    if (window.fetchAllData) window.fetchAllData(rawArgs);
    return;
  }
  if (cmd === "tab" && rawArgs) {
    const MAP = { intel: "intel", news: "news", market: "markets", markets: "markets", economy: "economic", economic: "economic", weather: "atmosphere", atmosphere: "atmosphere" };
    const t = MAP[rawArgs.toLowerCase()] || rawArgs;
    window.switchTab?.(t);
    cliPrint([`<span class="cli-ok">✓ Switched to ${t}</span>`]);
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
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: `You are an AI assistant for NewsAtlas. Current focus: ${country}. Answer in 2-4 sentences, clear and direct, no markdown.\n\nUser: ${input}` })
    });
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
    document.getElementById(thinkId)?.remove();
    cliPrint([`<span class="cli-ai">AI →</span> <span class="cli-reply">${escH(reply.replace(/\*\*/g, "").trim())}</span>`]);
  } catch {
    const el = document.getElementById(thinkId);
    if (el) el.innerHTML = `<span class="cli-err">Connection failed. Please try again.</span>`;
  }
}
window._cliPrint = cliPrint;
document.addEventListener("DOMContentLoaded", () => {
  initDrag();
  const inp = document.getElementById("floating-cli-input");
  if (inp) {
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); const v = inp.value; inp.value = ""; processCLICommand(v); }
      else if (e.key === "ArrowUp") { e.preventDefault(); _cliHistoryIndex = Math.min(_cliHistoryIndex + 1, _cliHistory.length - 1); inp.value = _cliHistory[_cliHistoryIndex] || ""; }
      else if (e.key === "ArrowDown") { e.preventDefault(); _cliHistoryIndex = Math.max(_cliHistoryIndex - 1, -1); inp.value = _cliHistoryIndex >= 0 ? _cliHistory[_cliHistoryIndex] : ""; }
      else if (e.key === "Escape") { window.toggleCLI(); }
    });
  }
  const searchInp = document.getElementById("country-search");
  if (searchInp) {
    searchInp.addEventListener("input", () => window.renderTrending());
    searchInp.addEventListener("keydown", (e) => {
        if (e.key === "Escape") window.toggleSearch();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === "`") { e.preventDefault(); window.toggleCLI(); }
  });
});

const COMMANDS = [
  { id: "tab-intel", label: "Intel Dashboard", desc: "View global situational awareness and AI briefings", icon: "fa-brain", shortcut: "1", run: () => window.switchTab("intel") },
  { id: "tab-news", label: "News Feed", desc: "Live global news and signal intelligence", icon: "fa-newspaper", shortcut: "2", run: () => window.switchTab("news") },
  { id: "tab-markets", label: "Markets Terminal", desc: "Real-time financial data", icon: "fa-chart-line", shortcut: "3", run: () => window.switchTab("markets") },
  { id: "tab-eco", label: "Economic Analysis", desc: "Macro-economic indicators", icon: "fa-coins", shortcut: "4", run: () => window.switchTab("economic") },
  { id: "tab-atmo", label: "Weather", desc: "Weather and environmental data", icon: "fa-cloud-sun", shortcut: "5", run: () => window.switchTab("atmosphere") },
  { id: "search", label: "Search Nations", desc: "Search for a country", icon: "fa-search", shortcut: "/", run: () => window.toggleSearch() },
  { id: "reset", label: "Global View", desc: "Reset map to world view", icon: "fa-expand", shortcut: "R", run: () => window.resetToGlobalCenter?.() },
  { id: "about", label: "About NewsAtlas", desc: "About this dashboard", icon: "fa-info-circle", run: () => window.toggleAboutOverlay?.() },
  { id: "download", label: "Export Intel Dossier", desc: "Download intelligence report", icon: "fa-file-download", run: () => window.downloadDossier?.() },
];
let _paletteOpen = false;
let _paletteSelected = 0;
let _paletteFiltered = [...COMMANDS];
function fuzzyMatch(haystack, needle) {
  if (!needle) return true;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  if (h.includes(n)) return true;
  let hi = 0;
  for (let ni = 0; ni < n.length; ni++) {
    while (hi < h.length && h[hi] !== n[ni]) hi++;
    if (hi >= h.length) return false;
    hi++;
  }
  return true;
}
function openCommandPalette() {
  _paletteOpen = true;
  _paletteFiltered = [...COMMANDS];
  _paletteSelected = 0;
  const overlay = document.getElementById("cmd-palette-overlay");
  const input = document.getElementById("cmd-palette-input");
  if (overlay) { overlay.classList.remove("hidden"); }
  if (input) { input.value = ""; input.focus(); }
  renderPaletteItems();
}
function closeCommandPalette() {
  _paletteOpen = false;
  const overlay = document.getElementById("cmd-palette-overlay");
  if (overlay) overlay.classList.add("hidden");
}
function renderPaletteItems() {
  const list = document.getElementById("cmd-palette-list");
  if (!list) return;
  if (!_paletteFiltered.length) {
    list.innerHTML = `<div class="px-4 py-6 text-center text-[11px] text-slate-600 font-mono uppercase tracking-widest">No commands found</div>`;
    return;
  }
  list.innerHTML = _paletteFiltered.map((cmd, i) => `
    <div class="cmd-palette-item flex items-center gap-6 px-6 py-4 cursor-pointer transition-all border-l ${i === _paletteSelected ? "bg-white/[0.05] border-white" : "border-transparent hover:bg-white/[0.03]"} "
      onclick="window._executePaletteCmd(${i})" onmouseenter="window._paletteHover(${i})">
      <div class="w-6 h-6 flex items-center justify-center shrink-0 ${i === _paletteSelected ? "text-white" : "text-slate-600"}">
        <i class="fas ${cmd.icon} text-sm"></i>
      </div>
      <div class="flex flex-col flex-1 min-w-0">
        <span class="text-[14px] font-bold text-white uppercase tracking-wider" style="font-family: 'JetBrains Mono', monospace;">${cmd.label}</span>
        ${cmd.desc ? `<span class="text-[10px] text-slate-500 font-bold mt-1 truncate tracking-widest uppercase font-mono">${cmd.desc}</span>` : ""}
      </div>
      ${cmd.shortcut ? `<kbd class="text-[10px] font-mono text-slate-600 px-2 py-0.5 rounded border border-white/5 uppercase">${cmd.shortcut}</kbd>` : ""}
    </div>
  `).join("");
}
window._paletteHover = (i) => { _paletteSelected = i; renderPaletteItems(); };
window._executePaletteCmd = (i) => { const cmd = _paletteFiltered[i]; if (!cmd) return; closeCommandPalette(); setTimeout(() => cmd.run(), 80); };
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); _paletteOpen ? closeCommandPalette() : openCommandPalette(); return; }
  if (!_paletteOpen) return;
  if (e.key === "Escape") { closeCommandPalette(); return; }
  if (e.key === "ArrowDown") { e.preventDefault(); _paletteSelected = Math.min(_paletteSelected + 1, _paletteFiltered.length - 1); renderPaletteItems(); return; }
  if (e.key === "ArrowUp") { e.preventDefault(); _paletteSelected = Math.max(_paletteSelected - 1, 0); renderPaletteItems(); return; }
  if (e.key === "Enter") { e.preventDefault(); window._executePaletteCmd(_paletteSelected); return; }
});
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("cmd-palette-input");
  if (input) {
    input.addEventListener("input", (e) => {
      const q = e.target.value.trim();
      _paletteFiltered = COMMANDS.filter(cmd => fuzzyMatch(cmd.label, q) || (cmd.desc && fuzzyMatch(cmd.desc, q)));
      _paletteSelected = 0;
      renderPaletteItems();
    });
  }
});
window.openCommandPalette = openCommandPalette;
window.closeCommandPalette = closeCommandPalette;
