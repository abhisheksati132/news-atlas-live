const COMMANDS = [
    { id: "search", label: "Search Countries", icon: "fa-search", shortcut: "/", run: () => window.toggleSearch() },
    { id: "3d", label: "Switch to 3D Globe", icon: "fa-globe", shortcut: "P", run: () => { if (window.projectionType !== "3d" && window.toggleProjection) window.toggleProjection(); } },
    { id: "2d", label: "Switch to 2D Map", icon: "fa-map", shortcut: "P", run: () => { if (window.projectionType !== "2d" && window.toggleProjection) window.toggleProjection(); } },
    { id: "tab-intel", label: "Open Intel Tab", icon: "fa-brain", shortcut: null, run: () => window.switchTab("intel") },
    { id: "tab-news", label: "Open News Tab", icon: "fa-newspaper", shortcut: null, run: () => window.switchTab("news") },
    { id: "tab-markets", label: "Open Markets Tab", icon: "fa-chart-line", shortcut: null, run: () => window.switchTab("markets") },
    { id: "tab-atmo", label: "Open Atmosphere Tab", icon: "fa-cloud", shortcut: null, run: () => window.switchTab("atmosphere") },
    { id: "tab-eco", label: "Open Economic Tab", icon: "fa-coins", shortcut: null, run: () => window.switchTab("economic") },
    { id: "quake", label: "Toggle Earthquake Layer", icon: "fa-radiation", shortcut: null, run: () => window.toggleEarthquakeLayer && window.toggleEarthquakeLayer() },
    { id: "aircraft", label: "Toggle Aircraft Layer", icon: "fa-plane", shortcut: null, run: () => window.toggleAircraftLayer && window.toggleAircraftLayer() },
    { id: "gdelt", label: "Toggle Conflict Layer", icon: "fa-crosshairs", shortcut: null, run: () => window.toggleGDELTLayer && window.toggleGDELTLayer() },
    { id: "airq", label: "Toggle Air Quality", icon: "fa-leaf", shortcut: null, run: () => window.toggleAirQuality && window.toggleAirQuality() },
    { id: "reset", label: "Reset View to Global", icon: "fa-expand", shortcut: "R", run: () => window.resetToGlobalCenter && window.resetToGlobalCenter() },
    { id: "copy", label: "Copy Intel Briefing", icon: "fa-copy", shortcut: null, run: () => window.copyBriefingToClipboard && window.copyBriefingToClipboard() },
    { id: "voice", label: "Activate Voice Command", icon: "fa-microphone", shortcut: "V", run: () => window.activateVoice && window.activateVoice() },
    { id: "about", label: "Open About Panel", icon: "fa-info-circle", shortcut: null, run: () => window.toggleAbout && window.toggleAbout(true) },
    { id: "download", label: "Download Intel Dossier", icon: "fa-file-download", shortcut: null, run: () => window.downloadDossier && window.downloadDossier() },
    { id: "india", label: "Go to India Base", icon: "fa-home", shortcut: "Ctrl+I", run: () => window.goToIndiaHome && window.goToIndiaHome() },
    { id: "watchlist", label: "Show Watchlist", icon: "fa-star", shortcut: null, run: () => { window.toggleSearch(); setTimeout(() => { const i = document.getElementById("country-search"); if (i) { i.value = ""; i.dispatchEvent(new Event("input")); } }, 100); } },
    { id: "choropleth-gdp", label: "Color Map by GDP", icon: "fa-layer-group", shortcut: null, run: () => window.setChoropleth && window.setChoropleth("gdp") },
    { id: "choropleth-pop", label: "Color Map by Population", icon: "fa-users", shortcut: null, run: () => window.setChoropleth && window.setChoropleth("population") },
    { id: "choropleth-off", label: "Clear Map Color Overlay", icon: "fa-times", shortcut: null, run: () => window.setChoropleth && window.setChoropleth(null) },
    { id: "compare", label: "Enter Country Compare Mode", icon: "fa-columns", shortcut: null, run: () => window.toggleCompareMode && window.toggleCompareMode() },
    { id: "cli", label: "Open Neural CLI Terminal", icon: "fa-terminal", shortcut: "`", run: () => window.toggleCLI && window.toggleCLI() },
];
let _paletteOpen = false;
let _paletteSelected = 0;
let _paletteFiltered = [...COMMANDS];
function fuzzyMatch(haystack, needle) {
    if (!needle) return true;
    const h = haystack.toLowerCase();
    const n = needle.toLowerCase();
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
      class="cmd-palette-item flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${i === _paletteSelected ? "bg-blue-500/15 border-l-2 border-blue-400" : "border-l-2 border-transparent hover:bg-white/4"}"
      onclick="window._executePaletteCmd(${i})"
      onmouseenter="window._paletteHover(${i})"
    >
      <i class="fas ${cmd.icon} text-blue-400 text-xs w-4 text-center shrink-0"></i>
      <span class="text-[13px] font-bold text-white flex-1">${cmd.label}</span>
      ${cmd.shortcut ? `<kbd class="text-[9px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-white/6 border border-white/10">${cmd.shortcut}</kbd>` : ""}
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
            _paletteFiltered = COMMANDS.filter(cmd => fuzzyMatch(cmd.label, q));
            _paletteSelected = 0;
            renderPaletteItems();
        });
    }
});
window.openCommandPalette = openCommandPalette;
window.closeCommandPalette = closeCommandPalette;