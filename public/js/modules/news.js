let allNews = [];
let displayedNewsCount = 21;
let currentNewsFilters = { search: "", time: "All Time", sort: "Most Recent" };
let newsSearchQuery = "";
let newsSearchTimer = null;
let isLiveSearching = false;

// Using global escapeHtml from app.js
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
function showNewsSkeletons(container) {
  if (!container) return;
  const skels = Array.from({ length: 3 }, () => `
    <div class="dossier-card mb-4 skeleton" style="height:140px;">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-16 h-3 rounded-full skeleton" style="background:rgba(255,255,255,0.05)"></div>
        <div class="ml-auto w-10 h-3 rounded-full skeleton" style="background:rgba(255,255,255,0.04)"></div>
      </div>
      <div class="w-full h-4 rounded skeleton mb-2" style="background:rgba(255,255,255,0.05)"></div>
      <div class="w-4/5 h-4 rounded skeleton" style="background:rgba(255,255,255,0.04)"></div>
    </div>`).join("");
  container.innerHTML = skels;
}
async function fetchNews(overrideQ) {
  const loading = document.getElementById("news-loading");
  const container = document.getElementById("articles-container");
  if (loading) loading.classList.remove("hidden");
  if (container) showNewsSkeletons(container);
  displayedNewsCount = 21;
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
    const stamp = document.getElementById("news-last-updated");
    if (stamp) stamp.innerText = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
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
  const remainder = countToDisplay % 3;
  if (remainder !== 0 && countToDisplay > remainder) countToDisplay -= remainder;
  displayNewsArticles(filtered.slice(0, countToDisplay));
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
    const favicon = getFavicon(art.source_url);
    const faviconHtml = favicon
      ? `<img src="${favicon}" alt="" class="w-3 h-3 rounded-full object-cover grayscale opacity-60">`
      : `<i class="fas fa-newspaper text-[8px] text-slate-500"></i>`;
    
    const imgHtml = art.image_url
      ? `<div class="w-full mt-3 rounded-xl border border-white/[0.05] overflow-hidden bg-slate-900/50" 
              style="height: 180px;">
              <img src="${art.image_url}" class="w-full h-full object-cover" onerror="this.parentElement.style.display='none'">
         </div>`
      : "";

    const row = document.createElement("div");
    row.className = `p-4 border-b border-white/5 cursor-pointer hover:bg-white/[0.03] transition-colors news-card-animate whitespace-normal`;
    row.style.animationDelay = `${i * 30}ms`;
    row.innerHTML = `
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          ${faviconHtml}
          <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">${art.source_id || "UPLINK"}</span>
          <span class="text-[8px] font-mono text-slate-600">/</span>
          <span class="text-[8px] font-mono text-slate-600 uppercase">${timeAgo}</span>
          <span class="text-[8px] font-bold px-1.5 py-0.5 rounded-sm ${sentiment.cls} uppercase ml-auto">${sentiment.label}</span>
        </div>
        ${imgHtml}
        <h3 class="text-base font-bold text-slate-100 leading-tight hover:text-blue-400 transition-colors pt-1" onclick="window.open('${escapeHtml(art.link)}', '_blank')">${escapeHtml(art.title)}</h3>
        ${art.description ? `<p class="text-[12px] text-slate-400 leading-relaxed font-normal line-clamp-3">${escapeHtml(art.description)}</p>` : ''}
      </div>
    `;
    container.appendChild(row);
  });
}
window.loadMoreNews = () => {
  displayedNewsCount += 21;
  displayFilteredNews();
};
window.checkNewsScroll = () => {
  const container = document.getElementById("news-scroll-container");
  if (!container) return;
  if (container.scrollTop + container.clientHeight >= container.scrollHeight - 100)
    window.loadMoreNews();
};
window.fetchNews = fetchNews;
window.displayFilteredNews = displayFilteredNews;
async function fetchGDELTEvents(country) {
  const container = document.getElementById("gdelt-events-content");
  if (!container) return;
  const countryLabel =
    typeof country === "string"
      ? country
      : country?.properties?.name || country?.name || "";
  container.innerHTML = '<div class="text-slate-500 text-xs animate-pulse py-2">Loading intelligence events...</div>';

  const simulated = [
    { title: "Global trade negotiations enter critical phase amid supply chain concerns", tone: -1.2, domain: "Reuters", seendate: new Date().toISOString().slice(0, 10).replace(/-/g, "") },
    { title: "Central banks coordinate on inflation response strategy", tone: 2.5, domain: "Bloomberg", seendate: new Date().toISOString().slice(0, 10).replace(/-/g, "") },
    { title: "Regional security summit addresses emerging threat vectors", tone: -2.8, domain: "FT", seendate: new Date().toISOString().slice(0, 10).replace(/-/g, "") },
    { title: "Technology export controls reshape global semiconductor landscape", tone: -0.5, domain: "WSJ", seendate: new Date().toISOString().slice(0, 10).replace(/-/g, "") },
    { title: "UN peacekeeping mission reports progress in conflict zones", tone: 3.1, domain: "AP News", seendate: new Date().toISOString().slice(0, 10).replace(/-/g, "") },
    { title: "Energy markets adjust to new geopolitical supply dynamics", tone: -1.8, domain: "CNBC", seendate: new Date().toISOString().slice(0, 10).replace(/-/g, "") },
    { title: "Climate cooperation framework achieves binding commitments", tone: 4.2, domain: "Guardian", seendate: new Date().toISOString().slice(0, 10).replace(/-/g, "") },
    { title: "Diplomatic channels reopened after months of tension", tone: 3.8, domain: "BBC", seendate: new Date().toISOString().slice(0, 10).replace(/-/g, "") }
  ];

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
    const query = countryLabel
      ? `${countryLabel} sourcelang:english`
      : "conflict OR economy OR geopolitics sourcelang:english";
    const res = await fetch(`/api/gdelt?query=${encodeURIComponent(query)}&timespan=72H`);
    if (!res.ok) throw new Error("GDELT unavailable");
    const data = await res.json();
    const articles = data.articles || [];
    if (!articles.length) throw new Error("No articles");
    renderRows(articles);
    const stamp = document.getElementById("gdelt-timestamp");
    if (stamp) stamp.innerText = `Intel · ${articles.length} events · Live`;
  } catch (e) {
    renderRows(simulated);
    const stamp = document.getElementById("gdelt-timestamp");
    if (stamp) stamp.innerText = `Intel · ${simulated.length} events · Simulated`;
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