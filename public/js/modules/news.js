let allNews = [];
let displayedNewsCount = 21;
let currentNewsFilters = { search: "", time: "All Time", sort: "Most Recent" };
let newsSearchQuery = "";
let newsSearchTimer = null;
let isLiveSearching = false;
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
          <p class="text-[12px] text-red-400 font-black uppercase tracking-widest mb-4">Uplink error</p>
          <button type="button" onclick="window.fetchNews()" class="px-5 py-2 rounded-lg border border-blue-500/40 text-blue-400 text-xs font-mono font-bold hover:bg-blue-500/10 transition-all">
            Retry
          </button>
        </div>`;
    }
    if (previousNews && previousNews.length > 0) allNews = previousNews;
    if (window.showToast) window.showToast("News feed unavailable. Retry or check connection.", "error");
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
  let countToDisplay = Math.min(displayedNewsCount, filtered.length);
  const remainder = countToDisplay % 3;
  if (remainder !== 0 && countToDisplay > remainder) countToDisplay -= remainder;
  displayNewsArticles(filtered.slice(0, countToDisplay));
  const loadMoreEl = document.getElementById("news-load-more");
  if (loadMoreEl) loadMoreEl.classList.toggle("hidden", filtered.length <= countToDisplay);
}
function displayNewsArticles(articles) {
  const container = document.getElementById("articles-container");
  if (!container) return;
  container.innerHTML = "";
  if (!articles || articles.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-10 text-center">
        <p class="text-[12px] text-slate-500 font-black uppercase tracking-widest mb-3">Zero news fragments matching filters.</p>
        <p class="text-[11px] text-slate-600 mb-4">Try another category or search term.</p>
        <button type="button" onclick="window.clearNewsSearch(); window.fetchNews();" class="px-4 py-2 rounded-lg border border-white/20 text-slate-400 text-xs font-mono hover:bg-white/5 transition-all">Clear &amp; refresh</button>
      </div>`;
    return;
  }
  articles.forEach((art, i) => {
    const card = document.createElement("div");
    const isFeatured = i === 0;
    const sentiment = getNewsSentiment(art.title, art.description);
    const timeAgo = relativeTime(art.pubDate);
    const favicon = getFavicon(art.source_url);
    const faviconHtml = favicon
      ? `<img src="${favicon}" alt="" class="w-4 h-4 rounded object-cover shrink-0" onerror="this.style.display='none'">`
      : `<i class="fas fa-newspaper text-[10px] text-slate-500"></i>`;
    const imgHtml = art.image_url && isFeatured
      ? `<div class="h-40 w-full mb-4 rounded-lg bg-cover bg-center border border-white/8 overflow-hidden" style="background-image:url('${art.image_url}')"></div>`
      : "";
    card.className = `dossier-card news-card-animate mb-4 ${isFeatured ? "news-card-featured" : ""}`;
    card.style.animationDelay = `${i * 45}ms`;
    card.onmouseenter = () => window.playTacticalSound("hover");
    card.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        ${faviconHtml}
        <span class="text-[10px] font-black text-white/60 uppercase tracking-widest truncate max-w-[120px]">${art.source_id || "UPLINK"}</span>
        <div class="flex-1"></div>
        <span class="text-[9px] font-mono text-slate-600">${timeAgo}</span>
        <span class="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${sentiment.cls}">${sentiment.label}</span>
      </div>
      ${imgHtml}
      <h3 class="font-bold ${isFeatured ? "text-[17px]" : "text-[14px]"} text-white leading-snug mb-3 cursor-pointer hover:text-blue-300 transition-colors" onclick="window.open('${art.link}', '_blank')">${art.title}</h3>
      <div class="flex items-center gap-3 mt-auto pt-2 border-t border-white/5">
        <button class="text-[9px] font-mono text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1" onclick="window.open('${art.link}', '_blank')">
          <i class="fas fa-external-link-alt"></i> Read
        </button>
        ${isFeatured ? `<span class="text-[9px] font-mono text-blue-400/60 ml-auto"><i class="fas fa-star mr-1 text-[8px]"></i>TOP STORY</span>` : ""}
      </div>
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
  if (container.scrollTop + container.clientHeight >= container.scrollHeight - 100)
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
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=ArtList&maxrecords=50&sort=DateDesc&format=json&timespan=72H`;
    const res = await fetch(url);
    const data = await res.json();
    let articles = data.articles || [];
    if (typeof window._timeOffsetHours === 'number' && window._timeOffsetHours < 0) {
      const thresholdDate = new Date();
      thresholdDate.setHours(thresholdDate.getHours() + window._timeOffsetHours);
      articles = articles.filter(a => {
        if (!a.seendate) return false;
        const dStr = a.seendate;
        const iso = `${dStr.slice(0, 4)}-${dStr.slice(4, 6)}-${dStr.slice(6, 8)}T${dStr.slice(9, 11)}:${dStr.slice(11, 13)}:${dStr.slice(13, 15)}Z`;
        const pubDate = new Date(iso);
        return pubDate <= thresholdDate;
      });
    }
    if (!articles.length) {
      container.innerHTML =
        '<div class="text-slate-500 text-xs py-2">No GDELT events found for this timeframe.</div>';
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
      '<div class="text-slate-500 text-xs py-2">GDELT uplink failed. Events may be temporarily unavailable.</div>';
    if (window.showToast) window.showToast("GDELT events unavailable.", "info");
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