let allNews = [];
let displayedNewsCount = 20;
let currentNewsFilters = { search: "", time: "All Time", sort: "Most Recent" };
let newsSearchQuery = "";
let newsSearchTimer = null;
let isLiveSearching = false;

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
function showNewsSkeletons(container) { }
async function fetchNews(overrideQ) {
  const loading = document.getElementById("news-loading");
  const container = document.getElementById("articles-container");
  if (loading) loading.classList.remove("hidden");
  if (container) container.innerHTML = "";
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
    const timeAgo = (art.pubDate ? relativeTime(art.pubDate) : "RECENT");
    const source = (art.source_id || "GLOBAL").toUpperCase();
    
    const imgHtml = art.image_url
      ? `<div style="width:100%; height:180px; margin-top:1rem; overflow:hidden; background:var(--surface-2); border-bottom:1px solid var(--border);">
              <img src="${art.image_url}" 
                   style="width:100%; height:100%; object-fit:cover; opacity:0.95; transition:transform 0.4s ease;" 
                   class="group-hover:scale-105"
                   onerror="this.parentElement.style.display='none'">
         </div>`
      : "";

    const card = document.createElement("div");
    card.className = "news-card-animate group";
    card.style.cssText = "background:var(--surface); border:1px solid var(--border); overflow:hidden; display:flex; flex-direction:column; cursor:pointer; transition:border-color 0.15s ease, background 0.15s ease;";
    card.style.animationDelay = `${i * 30}ms`;
    card.onmouseover = () => { card.style.borderColor = "var(--ink-900)"; card.style.background = "var(--surface-2)" };
    card.onmouseout = () => { card.style.borderColor = "var(--border)"; card.style.background = "var(--surface)" };
    card.onclick = () => window.open(art.link, '_blank');
    
    card.innerHTML = `
      ${imgHtml}
      <div style="padding:1.5rem; display:flex; flex-direction:column; flex:1;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem;">
          <div style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; font-family:var(--font-sans);">
            ${source} <span style="margin:0 0.4rem; color:var(--border-2);">|</span> ${timeAgo}
          </div>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <div style="width:6px; height:6px; background:${sentiment.label === 'POSITIVE' ? 'var(--up)' : sentiment.label === 'CRITICAL' ? 'var(--down)' : 'var(--text-faint)'};"></div>
            <span style="font-size:9px; font-weight:700; font-family:var(--font-sans); color:${sentiment.label === 'POSITIVE' ? 'var(--up)' : sentiment.label === 'CRITICAL' ? 'var(--down)' : 'var(--text-faint)'}; uppercase tracking-widest">${sentiment.label}</span>
          </div>
        </div>
        
        <h3 style="font-size:1.15rem; font-weight:700; color:var(--text); font-family:var(--font-serif); line-height:1.3; margin-bottom:0.75rem;">
          ${escapeHtml(art.title)}
        </h3>
        
        ${art.description ? `<p style="font-size:13px; color:var(--text-2); line-height:1.6; font-family:var(--font-sans); display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; margin-bottom:1.5rem;">${escapeHtml(art.description)}</p>` : '<div style="margin-bottom:1.5rem;"></div>'}

        <div style="margin-top:auto; padding-top:1rem; border-top:1px solid var(--divider); display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:var(--text);">Read Analysis</span>
          <i class="fas fa-arrow-right" style="font-size:10px; color:var(--text-muted);"></i>
        </div>
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