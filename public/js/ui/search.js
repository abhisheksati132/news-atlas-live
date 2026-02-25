function renderTrending() {
  const resContainer = document.getElementById("search-results");
  if (!window.globalSearchData || window.globalSearchData.length === 0) {
    resContainer.innerHTML = `
            <div class="p-8 text-center flex flex-col items-center gap-3 animate-pulse">
                <i class="fas fa-satellite-dish text-blue-500 text-xl"></i>
                <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Downloading Global Index...</span>
            </div>`;
    return;
  }
  const recent = (typeof window.getRecentCountries === "function" && window.getRecentCountries()) || [];
  let recentHtml = "";

  const headerStyle = `padding: 1.25rem 1.5rem 0.75rem; font-size: 11px; font-weight: 900; color: #475569; text-transform: uppercase; letter-spacing: 0.15em; font-family: 'JetBrains Mono', monospace;`;

  if (recent.length > 0) {
    recentHtml =
      `<div style="${headerStyle}">Recent Operations</div>` +
      recent
        .map((name) => {
          const c = window.globalSearchData.find((curr) => curr.name.common === name);
          if (!c) return "";
          return `
            <div class="flex items-center gap-5 px-6 py-4 hover:bg-white/[0.03] cursor-pointer border-b border-white/[0.04] transition-all group" onclick="window.selectFromSearch('${name.replace(/'/g, "\\'")}')">
                <div class="w-10 h-6.5 rounded shadow-sm overflow-hidden border border-white/10 shrink-0">
                    <img src="${c.flags.svg}" class="w-full h-full object-cover">
                </div>
                <span class="font-bold text-white text-base tracking-tight group-hover:text-blue-400 transition-colors">${name}</span>
                <i class="fas fa-chevron-right ml-auto text-[11px] text-slate-700 group-hover:text-blue-400 transition-all group-hover:translate-x-0.5"></i>
            </div>`;
        })
        .join("") +
      `<div style="${headerStyle} border-top: 1px solid rgba(255,255,255,0.05); margin-top: 0.5rem;">High Traffic Sectors</div>`;
  } else {
    recentHtml =
      `<div style="${headerStyle}">High Traffic Sectors</div>`;
  }

  const trending = [
    "India",
    "United States",
    "United Kingdom",
    "Japan",
    "Germany",
    "France",
    "Russia",
    "China",
  ];

  resContainer.innerHTML =
    recentHtml +
    trending
      .map((name) => {
        const c = window.globalSearchData.find(
          (curr) =>
            curr.name.common === name ||
            (name === "United States" &&
              curr.name.common === "United States of America") ||
            (name === "Russia" && curr.name.common.includes("Russian")),
        );
        if (!c) return "";
        return `
            <div class="flex items-center gap-5 px-6 py-4 hover:bg-white/[0.03] cursor-pointer border-b border-white/[0.04] transition-all group" onclick="window.selectFromSearch('${name}')">
                <div class="w-10 h-6.5 rounded shadow-sm overflow-hidden border border-white/10 shrink-0">
                    <img src="${c.flags.svg}" class="w-full h-full object-cover">
                </div>
                <span class="font-bold text-white text-base tracking-tight group-hover:text-blue-400 transition-colors">${name}</span>
                <i class="fas fa-chevron-right ml-auto text-[11px] text-slate-700 group-hover:text-blue-400 transition-all group-hover:translate-x-0.5"></i>
            </div>`;
      })
      .join("");
}
window.toggleSearch = () => {
  window.playTacticalSound("click");
  const overlay = document.getElementById("search-overlay");
  overlay.classList.toggle("hidden");
  if (!overlay.classList.contains("hidden")) {
    document.getElementById("country-search").focus();
    renderTrending();
  }
};
window.renderTrending = renderTrending;