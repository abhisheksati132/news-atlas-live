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
  if (recent.length > 0) {
    recentHtml =
      '<div class="p-4 text-[10px] font-black text-cyan-500/90 uppercase tracking-widest sticky top-0 bg-[#020617]/95 backdrop-blur z-10 border-b border-white/5">Recent</div>' +
      recent
        .map((name) => {
          const c = window.globalSearchData.find((curr) => curr.name.common === name);
          if (!c) return "";
          return `
            <div class="p-4 hover:bg-cyan-600/10 cursor-pointer flex items-center gap-4 border-b border-white/5 transition-all group" onclick="window.selectFromSearch('${name.replace(/'/g, "\\'")}')">
                <div class="w-8 h-5 rounded shadow-sm overflow-hidden relative border border-white/10 group-hover:border-cyan-400/50">
                    <img src="${c.flags.svg}" class="w-full h-full object-cover">
                </div>
                <span class="font-bold text-white text-sm tracking-tight group-hover:text-cyan-300 transition-colors">${name}</span>
                <i class="fas fa-chevron-right ml-auto text-[10px] text-slate-600 group-hover:text-cyan-400"></i>
            </div>`;
        })
        .join("") +
      '<div class="p-4 text-[10px] font-black text-slate-600 uppercase tracking-widest bg-[#020617]/95 border-b border-white/5">High Traffic Sectors</div>';
  } else {
    recentHtml =
      '<div class="p-4 text-[10px] font-black text-slate-600 uppercase tracking-widest sticky top-0 bg-[#020617]/95 backdrop-blur z-10 border-b border-white/5">High Traffic Sectors</div>';
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
            <div class="p-4 hover:bg-blue-600/10 cursor-pointer flex items-center gap-4 border-b border-white/5 transition-all group" onclick="window.selectFromSearch('${name}')">
                <div class="w-8 h-5 rounded shadow-sm overflow-hidden relative border border-white/10 group-hover:border-blue-400/50">
                    <img src="${c.flags.svg}" class="w-full h-full object-cover">
                </div>
                <span class="font-bold text-white text-sm tracking-tight group-hover:text-blue-300 transition-colors">${name}</span>
                <i class="fas fa-chevron-right ml-auto text-[10px] text-slate-600 group-hover:text-blue-400"></i>
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
