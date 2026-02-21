let allNews = [];
let displayedNewsCount = 21;
let currentNewsFilters = { search: "", time: "All Time", sort: "Most Recent" };
let newsSearchQuery = "";
let newsSearchTimer = null;
let isLiveSearching = false;

async function fetchNews(overrideQ) {
  const loading = document.getElementById("news-loading");
  if (loading) loading.classList.remove("hidden");
  displayedNewsCount = 21;
  isLiveSearching = false;
  try {
    const q = overrideQ !== undefined ? overrideQ : newsSearchQuery;
    const iso2 = window.iso2Code || "";
    let url;
    if (q && q.trim()) {
      url = `/api/news?category=${window.currentCategory || "top"}&q=${encodeURIComponent(q.trim())}${iso2 ? "&iso2=" + iso2 : ""}`;
    } else {
      url = `/api/news?category=${window.currentCategory || "top"}${iso2 ? "&iso2=" + iso2 : ""}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("News fetch failed");
    const data = await res.json();
    if (data.totalResults) {
      const el = document.getElementById("news-count");
      if (el) el.innerText = data.totalResults;
    }
    allNews = data.results && data.results.length > 0 ? data.results : [];
    displayFilteredNews();
  } catch (e) {
    const container = document.getElementById("articles-container");
    if (container)
      container.innerHTML = `<div class="col-span-full p-10 text-center text-[12px] text-red-500 font-black italic uppercase tracking-widest">Uplink Error. Retrying...</div>`;
  } finally {
    if (loading) loading.classList.add("hidden");
  }
}

window.filterNews = (searchTerm) => {
  currentNewsFilters.search = searchTerm.toLowerCase();
  newsSearchQuery = searchTerm;
  clearTimeout(newsSearchTimer);
  if (!searchTerm.trim()) {
    currentNewsFilters.search = "";
    fetchNews("");
    return;
  }

  newsSearchTimer = setTimeout(() => {
    liveSearchFallback(searchTerm);
  }, 500);
};

async function liveSearchFallback(query) {
  if (isLiveSearching) return;
  isLiveSearching = true;
  const container = document.getElementById("articles-container");
  if (container) {
    container.innerHTML = `
            <div class="col-span-full p-8 text-center">
                <div class="inline-flex items-center gap-3 px-5 py-3 rounded-xl" style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2)">
                    <div class="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
                    <span class="text-[11px] font-black text-blue-400 uppercase tracking-widest" style="font-family:'JetBrains Mono',monospace">
                        Searching live feeds for "<span class="text-white">${query}</span>"...
                    </span>
                </div>
            </div>`;
  }
  await fetchNews(query);
  isLiveSearching = false;
}

window.clearNewsSearch = () => {
  const input = document.getElementById("news-search");
  if (input) input.value = "";
  currentNewsFilters.search = "";
  newsSearchQuery = "";
  fetchNews("");
};
window.setCategory = (el, cat) => {
  window.playTacticalSound("click");
  document
    .querySelectorAll(".intel-tab")
    .forEach((t) => t.classList.remove("active"));
  el.classList.add("active");
  window.currentCategory = cat;
  fetchNews();
};
function displayFilteredNews() {
  let filtered = [...allNews];
  let countToDisplay = Math.min(displayedNewsCount, filtered.length);
  const remainder = countToDisplay % 3;
  if (remainder !== 0 && countToDisplay > remainder) {
    countToDisplay -= remainder;
  }

  displayNewsArticles(filtered.slice(0, countToDisplay));

  const loadMoreEl = document.getElementById("news-load-more");
  if (loadMoreEl) {
    loadMoreEl.classList.toggle("hidden", filtered.length <= countToDisplay);
  }
}
function displayNewsArticles(articles) {
  const container = document.getElementById("articles-container");
  if (!container) return;
  container.innerHTML = "";
  if (!articles || articles.length === 0) {
    container.innerHTML =
      '<div class="col-span-full p-10 text-center text-[12px] text-slate-500 font-black italic uppercase tracking-widest">Zero news fragments matching filters.</div>';
    return;
  }
  articles.forEach((art, i) => {
    const card = document.createElement("div");
    const sents = ["signal-blue", "signal-emerald", "signal-red"];
    const img = art.image_url
      ? `<div class="h-32 w-full mb-3 rounded bg-cover bg-center border border-white/10" style="background-image: url('${art.image_url}')"></div>`
      : "";
    card.className = `dossier-card shadow-md mb-4 ${sents[i % 3]}`;
    card.onmouseenter = () => window.playTacticalSound("hover");
    card.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <div class="text-[10px] font-black text-white/70 uppercase tracking-widest bg-white/5 px-2.5 py-0.5 rounded-xl truncate max-w-[100px]">${art.source_id || "UPLINK"}</div>
                <button class="text-slate-400 hover:text-white transition-all tactical-btn"><i class="fas fa-link text-[13px]"></i></button>
            </div>
            ${img}<h3 class="font-bold text-[16px] text-white leading-tight mb-3 cursor-pointer hover:text-blue-300 transition-colors pr-4" onclick="window.open('${art.link}', '_blank')">${art.title}</h3>
        `;
    container.appendChild(card);
  });
}
window.loadMoreNews = () => {
  displayedNewsCount += 21;
  displayFilteredNews();
};
window.checkNewsScroll = () => {
  const container = document.getElementById("news-scroll-container");
  if (!container) return;
  if (
    container.scrollTop + container.clientHeight >=
    container.scrollHeight - 100
  )
    window.loadMoreNews();
};

window.fetchNews = fetchNews;
window.displayFilteredNews = displayFilteredNews;

async function fetchGDELTEvents(country) {
  const container = document.getElementById("gdelt-events-content");
  if (!container) return;
  container.innerHTML =
    '<div class="text-slate-500 text-xs animate-pulse py-2">Scanning GDELT intelligence matrix...</div>';
  try {
    const query = country
      ? `${country} sourcelang:english`
      : "conflict OR economy OR geopolitics sourcelang:english";
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=ArtList&maxrecords=10&sort=DateDesc&format=json&timespan=24H`;
    const res = await fetch(url);
    const data = await res.json();
    const articles = data.articles || [];
    if (!articles.length) {
      container.innerHTML =
        '<div class="text-slate-500 text-xs py-2">No GDELT events in last 24h for this region.</div>';
      return;
    }
    container.innerHTML = "";
    articles.slice(0, 8).forEach((a) => {
      const tone = parseFloat(a.tone ?? 0);
      const toneClass =
        tone > 2
          ? "text-emerald-400"
          : tone < -2
            ? "text-red-400"
            : "text-amber-400";
      const toneLabel =
        tone > 2 ? "POSITIVE" : tone < -2 ? "NEGATIVE" : "NEUTRAL";
      const domain = a.domain || a.url?.split("/")[2] || "Unknown";
      const row = document.createElement("div");
      row.className =
        "py-2 border-b border-white/5 cursor-pointer hover:bg-white/2 transition-colors";
      row.innerHTML = `
                <div class="flex items-start gap-2 mb-1">
                    <span class="${toneClass} text-[8px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded shrink-0" style="background:rgba(255,255,255,0.04)">${toneLabel}</span>
                    <span class="text-[10px] font-bold text-slate-200 leading-tight line-clamp-2">${a.title || "Untitled"}</span>
                </div>
                <div class="flex items-center gap-3 mt-1">
                    <span class="text-[8px] font-mono text-slate-600">${domain}</span>
                    <span class="text-[8px] font-mono text-slate-600">TONE: <span class="${toneClass}">${tone.toFixed(1)}</span></span>
                    ${a.seendate ? `<span class="text-[8px] font-mono text-slate-600">${a.seendate.slice(0, 8)}</span>` : ""}
                </div>`;
      row.onclick = () => {
        if (a.url) window.open(a.url, "_blank");
      };
      container.appendChild(row);
    });
    const stamp = document.getElementById("gdelt-timestamp");
    if (stamp) stamp.innerText = `GDELT · ${articles.length} events · Last 24h`;
  } catch (e) {
    container.innerHTML =
      '<div class="text-slate-500 text-xs">GDELT uplink failed</div>';
  }
}
window.fetchGDELTEvents = fetchGDELTEvents;

async function fetchSeismicStatus() {
  const el = document.getElementById("seismic-count");
  if (!el) return;
  try {
    const res = await fetch(
      "https://earthquake.usgs.gov/fdsnws/event/1/count?format=geojson&starttime=" +
      new Date(Date.now() - 3600000).toISOString() +
      "&minmagnitude=2",
    );
    const data = await res.json();
    el.innerText = (data.count || 0).toString();
  } catch (_) {
    el.innerText = "--";
  }
}
window.fetchSeismicStatus = fetchSeismicStatus;

fetchSeismicStatus();
setInterval(fetchSeismicStatus, 300000);
