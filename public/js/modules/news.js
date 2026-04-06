let allNews = [];
let displayedNewsCount = 20;
let currentNewsFilters = { search: "", time: "All Time", sort: "Most Recent" };
let newsSearchQuery = "";
let newsSearchTimer = null;
let isLiveSearching = false;

// Security: escape HTML special chars to prevent XSS from external RSS content
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function getNewsSentiment(title, desc) {
  const text = ((title || "") + " " + (desc || "")).toLowerCase();
  const neg = /\b(war|attack|kill|crisis|conflict|crash|terror|dead|threat|sanction|protest|clash|bomb|missile|coup|unrest|disaster|explosion|violence|strike|riot|collapse|invasion|arrest|death|victim|destruction)\b/;
  const pos = /\b(record|growth|summit|deal|peace|recover|milestone|rise|launch|success|breakthrough|advance|reform|progress|agreement|invest|surge|rally|relief|restore|historic|sign|victory)\b/;
  if (neg.test(text)) return { cls: "sentiment-negative", label: "CRITICAL" };
  if (pos.test(text)) return { cls: "sentiment-positive", label: "POSITIVE" };
  return { cls: "sentiment-neutral", label: "NEUTRAL" };
}
function relativeTime(pubDate) {
  if (!pubDate) return "";
  const diff = Date.now() - new Date(pubDate).getTime();
  if (isNaN(diff) || diff < 0) return "";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
function getFavicon(sourceUrl) {
  if (!sourceUrl) return null;
  try {
    const domain = new URL(sourceUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
}
// No-op: replaced by static HTML skeletons in index.html for better symmetry
function showNewsSkeletons(container) {}
async function fetchNews(overrideQ) {
  const loading = document.getElementById("news-loading");
  const container = document.getElementById("articles-container");
  if (loading) loading.classList.remove("hidden");
  if (container) container.innerHTML = ""; // Clear existing during fresh fetch
  displayedNewsCount = 20;
  isLiveSearching = false;
  const previousNews = allNews.length > 0 ? [...allNews] : null;
  try {
    const q = overrideQ !== undefined ? overrideQ : newsSearchQuery;
    const iso2 = window.iso2Code || "";
    let url;
    if (q && q.trim()) {
      url = `/api/news?category=${window.currentCategory || "top"}&q=${encodeURIComponent(q.trim())}${iso2 ? "&iso2=" + iso2 : ""}`;
    } else {
      url = `/api/news?category=${window.currentCategory || "top"}${iso2 ? "&iso2=" + iso2 : ""}`;
    }
    const fetcher = window.fetchWithRetry || fetch;
    const res = await fetcher(url, {}, { retries: 1, timeoutMs: 12000 });
    if (!res.ok) throw new Error("News fetch failed");
    const data = await res.json();
    if (data.totalResults) {
      const el = document.getElementById("news-count");
      if (el) el.innerText = data.totalResults;
    }
    allNews = data.results && data.results.length > 0 ? data.results : [];
    if (window.updateHeadlineTicker) window.updateHeadlineTicker(allNews);
    displayFilteredNews();
  } catch (e) {
    if (container) {
      container.innerHTML = `
        <div class="col-span-full p-8 text-center">
          <p class="text-[12px] text-red-400 font-black uppercase tracking-widest mb-4">Could not load news</p>
          <button type="button" onclick="window.fetchNews()" class="px-5 py-2 rounded-lg border border-blue-500/40 text-blue-400 text-xs font-mono font-bold hover:bg-blue-500/10 transition-all">
            Try Again
          </button>
        </div>`;
    }
    if (previousNews && previousNews.length > 0) allNews = previousNews;
    if (window.showToast) window.showToast("News feed unavailable. Check your connection.", "error");
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
  newsSearchTimer = setTimeout(() => liveSearchFallback(searchTerm), 500);
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
  document.querySelectorAll(".intel-tab").forEach((t) => t.classList.remove("active"));
  el.classList.add("active");
  window.currentCategory = cat;
  fetchNews();
};
function displayFilteredNews() {
  let filtered = [...allNews];

  filtered.sort((a, b) => {
    const hasA = a.image_url ? 1 : 0;
    const hasB = b.image_url ? 1 : 0;
    return hasB - hasA;
  });

  let countToDisplay = Math.min(displayedNewsCount, filtered.length);
  displayNewsArticles(filtered.slice(0, countToDisplay));

  const loadMoreContainer = document.getElementById("load-more-news-container");
  if (loadMoreContainer) {
    if (countToDisplay >= filtered.length) {
      loadMoreContainer.classList.add("hidden");
    } else {
      loadMoreContainer.classList.remove("hidden");
    }
  }
}
function displayNewsArticles(articles) {
  const container = document.getElementById("articles-container");
  if (!container) return;
  container.innerHTML = "";
  if (!articles || articles.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-10 text-center">
        <p class="text-[12px] text-slate-500 font-black uppercase tracking-widest mb-3">No intelligence feeds found.</p>
        <p class="text-[11px] text-slate-600 mb-4">Try a different category or clear filters.</p>
        <button type="button" onclick="window.clearNewsSearch(); window.fetchNews();" class="px-4 py-2 border border-white/20 text-slate-400 text-xs font-mono hover:bg-white/5 transition-all">Clear & Refresh</button>
      </div>`;
    return;
  }
  articles.forEach((art, i) => {
    const sentiment = getNewsSentiment(art.title, art.description);
    const timeAgo = relativeTime(art.pubDate);
    const source = (art.source_id || "SIGNAL").toUpperCase();
    
    // Grayscale images that colorize on hover for high-end feel
    const imgHtml = art.image_url
      ? `<div class="w-full mt-2 mb-4 rounded-lg border border-white/[0.03] overflow-hidden bg-slate-900/50 group-hover:border-blue-500/20 transition-all" 
              style="height: 200px;">
              <img src="${art.image_url}" 
                   class="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
                   onerror="this.parentElement.style.display='none'">
         </div>`
      : "";

    const card = document.createElement("div");
    card.className = `p-8 border border-gray-100 bg-white hover:bg-gray-50 hover:shadow-lg transition-all cursor-pointer flex flex-col gap-5 news-card-animate group rounded-lg`;
    card.style.animationDelay = `${i * 40}ms`;
    card.onclick = () => window.open(art.link, '_blank');
    
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-[10px] font-black text-blue-500 font-mono tracking-tighter">[ ${source} ]</span>
          <span class="text-[9px] font-bold text-slate-600 uppercase tracking-widest font-mono">${timeAgo}</span>
        </div>
        <div class="flex items-center gap-2">
            <span class="text-[8px] font-black tracking-[0.2em] font-mono ${sentiment.cls} opacity-80 group-hover:opacity-100 transition-opacity">${sentiment.label}</span>
            <div class="w-1 h-1 rounded-full ${sentiment.cls.replace('text-', 'bg-')} animate-pulse"></div>
        </div>
      </div>
      
      ${imgHtml}

      <div class="flex flex-col gap-3">
        <h3 class="text-xl font-bold text-gray-900 leading-tight tracking-tight group-hover:text-blue-600 transition-colors font-serif">${escapeHtml(art.title)}</h3>
        ${art.description ? `<p class="text-[14px] text-gray-700 leading-relaxed font-sans line-clamp-3">${escapeHtml(art.description)}</p>` : ''}
      </div>

      <div class="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
        <span class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Read Full Article</span>
        <i class="fas fa-arrow-right text-[11px] text-blue-600"></i>
      </div>
    `;
    container.appendChild(card);
  });
}
window.loadMoreNews = () => {
  displayedNewsCount += 20;
  displayFilteredNews();
};
window.fetchNews = fetchNews;
window.displayFilteredNews = displayFilteredNews;
async function fetchGDELTEvents(country) {
  const container = document.getElementById("gdelt-events-content");
  if (!container) return;
  container.innerHTML = '<div class="text-slate-500 text-xs animate-pulse py-2">Loading intelligence events...</div>';

  function renderRows(articles) {
    container.innerHTML = "";
    articles.forEach((a) => {
      const tone = parseFloat(a.tone ?? 0);
      const toneClass = tone > 2 ? "text-emerald-400" : tone < -2 ? "text-red-400" : "text-amber-400";
      const toneLabel = tone > 2 ? "POSITIVE" : tone < -2 ? "NEGATIVE" : "NEUTRAL";
      const domain = a.domain || "Unknown";
      const row = document.createElement("div");
      row.className = "py-2 border-b border-white/5 cursor-pointer hover:bg-white/[0.03] transition-colors";
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
      if (a.url && a.url !== "#") row.onclick = () => window.open(a.url, "_blank");
      container.appendChild(row);
    });
  }

  try {
    const query = country ? `${country} sourcelang:english` : "conflict OR economy OR geopolitics sourcelang:english";
    const res = await fetch(`/api/gdelt?query=${encodeURIComponent(query)}&timespan=72H`);
    if (!res.ok) throw new Error("GDELT unavailable");
    const data = await res.json();
    const articles = data.articles || [];
    if (!articles.length) throw new Error("No recent events found");
    renderRows(articles);
    const stamp = document.getElementById("gdelt-timestamp");
    if (stamp) stamp.innerText = `Intel · ${articles.length} events · Live`;
  } catch (e) {
    container.innerHTML = `<div class="text-slate-600 text-[10px] py-10 text-center uppercase tracking-widest font-mono">No live intelligence events found for this sector</div>`;
    const stamp = document.getElementById("gdelt-timestamp");
    if (stamp) stamp.innerText = `Intel · Offline`;
  }
}
window.fetchGDELTEvents = fetchGDELTEvents;
async function fetchSeismicStatus() {
  const el = document.getElementById("map-seismic-val");
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

let _newsRefreshTimer = null;
function startNewsAutoRefresh() {
    if (_newsRefreshTimer) clearInterval(_newsRefreshTimer);
    _newsRefreshTimer = setInterval(() => {
        if (document.visibilityState === 'visible' && !isLiveSearching) {
            fetchNews();
        }
    }, 5 * 60 * 1000);
}
startNewsAutoRefresh();
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') startNewsAutoRefresh();
});