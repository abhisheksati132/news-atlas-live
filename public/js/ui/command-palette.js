const COMMANDS = [
    
    { id: "tab-intel", label: "Intel Dashboard", desc: "View global situational awareness and AI briefings", icon: "fa-brain", shortcut: "1", run: () => window.switchTab("intel") },
    { id: "tab-news", label: "News Feed", desc: "Live global news fragments and signal intelligence", icon: "fa-newspaper", shortcut: "2", run: () => window.switchTab("news") },
    { id: "tab-markets", label: "Markets Terminal", desc: "Real-time exchange data and financial telemetry", icon: "fa-chart-line", shortcut: "3", run: () => window.switchTab("markets") },
    { id: "tab-eco", label: "Economic Analysis", desc: "Macro-economic indicators and global GDP tracking", icon: "fa-coins", shortcut: "4", run: () => window.switchTab("economic") },
    { id: "tab-atmo", label: "Atmosphere Node", desc: "Aeronautical weather and environmental telemetry", icon: "fa-cloud-sun", shortcut: "5", run: () => window.switchTab("atmosphere") },

    
    { id: "search", label: "Search Nations", desc: "Focus neural search on country sectors", icon: "fa-search", shortcut: "/", run: () => window.toggleSearch() },
    {
        id: "city-search", label: "City Scan", desc: "Search and fly to a specific city/target", icon: "fa-city", shortcut: "S", run: () => {
            const activeTab = document.querySelector('.tab-content.active');
            const searchInput = activeTab ? activeTab.querySelector('input[id$="-city-search"]') : null;
            if (searchInput) searchInput.focus();
            else window.toggleSearch();
        }
    },

    
    { id: "reset", label: "Global View", desc: "Reset neural camera to planetary overview", icon: "fa-expand", shortcut: "R", run: () => window.resetToGlobalCenter && window.resetToGlobalCenter() },
    { id: "fly-india", label: "India HQ Base", desc: "Deploy camera to primary India orbital station", icon: "fa-home", shortcut: "Ctrl+I", run: () => window.goToIndiaHome && window.goToIndiaHome() },
    { id: "map-style-sat", label: "Satellite Mode", desc: "Switch to high-resolution orbital imagery", icon: "fa-satellite", run: () => { if (window.mapEngine && window.mapEngine.map) window.mapEngine.map.setStyle('mapbox://styles/mapbox/satellite-streets-v12'); } },
    { id: "map-style-dark", label: "Tactical Dark Mode", desc: "Switch to low-latency dark vector map", icon: "fa-moon", run: () => { if (window.mapEngine && window.mapEngine.map) window.mapEngine.map.setStyle('mapbox://styles/mapbox/dark-v11'); } },
    { id: "map-style-streets", label: "Operational Streets", desc: "Switch to standard terrestrial street map", icon: "fa-road", run: () => { if (window.mapEngine && window.mapEngine.map) window.mapEngine.map.setStyle('mapbox://styles/mapbox/streets-v12'); } },

    
    { id: "quake", label: "Seismic Layer", desc: "Toggle real-time earthquake telemetry", icon: "fa-radiation", run: () => window.toggleEarthquakeLayer && window.toggleEarthquakeLayer() },
    { id: "aircraft", label: "Air Traffic Layer", desc: "Toggle live transponder data for aircraft", icon: "fa-plane", run: () => window.toggleAircraftLayer && window.toggleAircraftLayer() },
    { id: "gdelt", label: "Conflict Matrix", desc: "Toggle GDELT global instability heatmaps", icon: "fa-crosshairs", run: () => window.toggleGDELTLayer && window.toggleGDELTLayer() },
    { id: "airq", label: "Air Quality Node", desc: "Toggle global atmospheric particulate density", icon: "fa-leaf", run: () => window.toggleAirQuality && window.toggleAirQuality() },

    
    { id: "audio", label: "Toggle Audio FX", desc: "Sync/Desync tactical audio feedback systems", icon: "fa-volume-up", run: () => window.toggleGlobalAudio && window.toggleGlobalAudio() },
    { id: "voice", label: "Voice Command Mode", desc: "Initialize neural voice recognition uplink", icon: "fa-microphone", shortcut: "V", run: () => window.activateVoice && window.activateVoice() },
    { id: "cli", label: "Neural CLI Terminal", desc: "Open advanced command-line interface", icon: "fa-terminal", shortcut: "`", run: () => window.toggleCLI && window.toggleCLI() },
    {
        id: "history-clear", label: "Clear Session Data", desc: "Wipe AI chat history and tactical cache", icon: "fa-trash-alt", run: () => {
            localStorage.clear();
            window.showToast("Local memory purged. Refreshing...", "info");
            setTimeout(() => location.reload(), 1500);
        }
    },
    { id: "about", label: "System Information", desc: "About NewsAtlas architecture and sensors", icon: "fa-info-circle", run: () => window.toggleAbout && window.toggleAbout(true) },
    { id: "download", label: "Export Intel Dossier", desc: "Generate secure PDF intelligence report", icon: "fa-file-download", run: () => window.downloadDossier && window.downloadDossier() },
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
    if (overlay) overlay.classList.remove("hidden");
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
    <div
      class="cmd-palette-item flex items-center gap-4 px-4 py-3 cursor-pointer transition-all border-l-2 ${i === _paletteSelected ? "bg-blue-500/15 border-blue-400" : "border-transparent hover:bg-white/4"}"
      onclick="window._executePaletteCmd(${i})"
      onmouseenter="window._paletteHover(${i})"
    >
      <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${i === _paletteSelected ? "bg-blue-400 text-[#020617]" : "bg-white/5 text-blue-400"}">
        <i class="fas ${cmd.icon} text-sm"></i>
      </div>
      <div class="flex flex-col flex-1 min-w-0">
        <span class="text-[13px] font-bold text-white leading-none">${cmd.label}</span>
        ${cmd.desc ? `<span class="text-[10px] text-slate-500 font-medium mt-1 truncate tracking-tight uppercase">${cmd.desc}</span>` : ""}
      </div>
      ${cmd.shortcut ? `<kbd class="text-[9px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-white/6 border border-white/10 uppercase">${cmd.shortcut}</kbd>` : ""}
    </div>
  `).join("");
}
window._paletteHover = (i) => { _paletteSelected = i; renderPaletteItems(); };
window._executePaletteCmd = (i) => {
    const cmd = _paletteFiltered[i];
    if (!cmd) return;
    closeCommandPalette();
    setTimeout(() => cmd.run(), 80);
};
document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        _paletteOpen ? closeCommandPalette() : openCommandPalette();
        return;
    }
    if (!_paletteOpen) return;
    if (e.key === "Escape") { closeCommandPalette(); return; }
    if (e.key === "ArrowDown") {
        e.preventDefault();
        _paletteSelected = Math.min(_paletteSelected + 1, _paletteFiltered.length - 1);
        renderPaletteItems();
        const items = document.querySelectorAll(".cmd-palette-item");
        if (items[_paletteSelected]) items[_paletteSelected].scrollIntoView({ block: "nearest" });
        return;
    }
    if (e.key === "ArrowUp") {
        e.preventDefault();
        _paletteSelected = Math.max(_paletteSelected - 1, 0);
        renderPaletteItems();
        const items = document.querySelectorAll(".cmd-palette-item");
        if (items[_paletteSelected]) items[_paletteSelected].scrollIntoView({ block: "nearest" });
        return;
    }
    if (e.key === "Enter") {
        e.preventDefault();
        window._executePaletteCmd(_paletteSelected);
        return;
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("cmd-palette-input");
    if (input) {
        input.addEventListener("input", (e) => {
            const q = e.target.value.trim();
            _paletteFiltered = COMMANDS.filter(cmd =>
                fuzzyMatch(cmd.label, q) || (cmd.desc && fuzzyMatch(cmd.desc, q))
            ).sort((a, b) => {
                
                const aMatch = a.label.toLowerCase().includes(q.toLowerCase());
                const bMatch = b.label.toLowerCase().includes(q.toLowerCase());
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
                return 0;
            });
            _paletteSelected = 0;
            renderPaletteItems();
        });
    }
});
window.openCommandPalette = openCommandPalette;
window.closeCommandPalette = closeCommandPalette;