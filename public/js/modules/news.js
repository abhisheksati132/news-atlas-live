let allNews = [];
let currentDisplayedArticles = [];
let selectedNewsIndex = 0;
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
  let parsedDate;
  if (typeof pubDate === "string") {
    const cleanDate = pubDate.replace(" ", "T");
    parsedDate = new Date(cleanDate);
    if (isNaN(parsedDate.getTime())) {
      parsedDate = new Date(pubDate);
    }
  } else {
    parsedDate = new Date(pubDate);
  }
  const diff = Date.now() - parsedDate.getTime();
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
    const iso2 = (window.store ? window.store.get("iso2") : window.iso2Code) || "";
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
    
    // Geographical Pulse Relay
    if (window.mapEngine && window.mapEngine.map && window.mapEngine.ready && allNews.length > 0) {
      try {
        const pulses = allNews.slice(0, 10).map(art => ({
          title: art.title,
          coordinates: window.mapEngine.map.getCenter().toArray(),
          radius: 80000
        }));
        if (window.mapEngine.setNewsPulses) {
          window.mapEngine.setNewsPulses(pulses);
        }
      } catch (err) {
        console.warn("[news] setNewsPulses skipped:", err.message);
      }
    }

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
        <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] font-mono">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>Searching for "<span class="text-[var(--text-primary)] font-semibold">${escapeHtml(query)}</span>"...</span>
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
  currentDisplayedArticles = filtered.slice(0, countToDisplay);
  displayNewsArticles(currentDisplayedArticles);
}
function displayNewsArticles(articles) {
  const container = document.getElementById("articles-container");
  if (!container) return;
  container.innerHTML = "";
  if (!articles || articles.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-10 text-center">
        <i class="fas fa-globe text-2xl text-slate-700 mb-4" aria-hidden="true"></i>
        <p class="text-[12px] text-slate-500 font-bold uppercase tracking-widest mb-2">No stories found</p>
        <p class="text-[11px] text-slate-600 mb-4">Try a different topic or clear the filter.</p>
        <button type="button" onclick="window.clearNewsSearch(); window.fetchNews();" class="px-4 py-2 border border-white/20 text-slate-400 text-xs font-mono hover:bg-white/5 transition-all">Clear &amp; refresh</button>
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
      ? `<div class="w-full mt-3 rounded-xl border border-white/[0.05] overflow-hidden bg-slate-900/50 cursor-pointer" 
              style="height: 180px;" onclick="window.openArticleReader(${i})">
              <img src="${art.image_url}" class="w-full h-full object-cover" onerror="this.parentElement.style.display='none'">
         </div>`
      : "";

    const row = document.createElement("div");
    const isSelected = i === selectedNewsIndex;
    row.dataset.newsIndex = i;
    row.className = `apple-glass p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-subtle-hover)] transition-all news-card-animate whitespace-normal cursor-pointer ${isSelected ? "news-card-active" : ""}`;
    row.style.animationDelay = `${i * 20}ms`;
    row.onclick = (e) => {
      if (e.target.closest("a") || e.target.closest("button")) return;
      window.openArticleReader(i);
    };
    row.innerHTML = `
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          ${faviconHtml}
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">${art.source_id || "NEWS WIRE"}</span>
          <span class="text-[9px] font-mono text-slate-600">·</span>
          <span class="text-[9px] font-mono text-slate-500 uppercase">${timeAgo}</span>
          <span class="text-[8px] font-bold px-2 py-0.5 rounded ${sentiment.cls} uppercase ml-auto font-mono">${sentiment.label}</span>
        </div>
        ${imgHtml}
        <h3 class="text-sm font-bold text-slate-100 leading-snug hover:text-cyan-400 transition-colors pt-0.5 cursor-pointer" onclick="window.openArticleReader(${i})">${escapeHtml(art.title)}</h3>
        ${art.description ? `<p class="text-xs text-slate-400 leading-relaxed font-normal line-clamp-3">${escapeHtml(art.description)}</p>` : ''}
        <div class="flex items-center justify-between pt-2 mt-1 border-t border-white/5 text-[11px] font-mono">
          <a href="${escapeHtml(art.link)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" class="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 font-semibold">
            Read Source <i class="fas fa-arrow-up-right-from-square text-[9px]"></i>
          </a>
          <button type="button" onclick="event.stopPropagation(); window.copyArticleLink('${escapeHtml(art.link)}', this)" class="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1">
            <i class="far fa-copy text-[10px]"></i> <span>Copy</span>
          </button>
        </div>
      </div>
    `;
    container.appendChild(row);
  });
}
window.copyArticleLink = (url, btn) => {
  try {
    navigator.clipboard?.writeText(url);
  } catch (e) { /* clipboard unavailable — no-op */ }
  if (btn) {
    const label = btn.querySelector("span");
    const icon = btn.querySelector("i");
    const origLabel = label ? label.innerText : "Copy";
    if (label) label.innerText = "Copied";
    btn.classList.add("copy-done");
    if (icon) icon.className = "fas fa-check text-[10px]";
    setTimeout(() => {
      if (label) label.innerText = origLabel;
      btn.classList.remove("copy-done");
      if (icon) icon.className = "far fa-copy text-[10px]";
    }, 1500);
  }
};
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

window.openArticleReader = (index) => {
  if (!currentDisplayedArticles || currentDisplayedArticles.length === 0) return;
  const idx = Math.max(0, Math.min(index, currentDisplayedArticles.length - 1));
  selectedNewsIndex = idx;

  document.querySelectorAll("#articles-container > div").forEach((c, i) => {
    c.classList.toggle("news-card-active", i === idx);
  });

  const art = currentDisplayedArticles[idx];
  if (!art) return;

  const sentiment = getNewsSentiment(art.title, art.description);
  const timeAgo = relativeTime(art.pubDate);
  const favicon = getFavicon(art.source_url || art.link);

  const titleEl = document.getElementById("reader-title");
  if (titleEl) titleEl.innerText = art.title || "Untitled Dispatch";

  const descEl = document.getElementById("reader-description");
  if (descEl) descEl.innerText = art.description || "No full summary wire provided. You can inspect the full article at the verified original source link below.";

  const sourceNameEl = document.getElementById("reader-source-name");
  if (sourceNameEl) sourceNameEl.innerText = (art.source_id || "NEWS WIRE").toUpperCase();

  const pubTimeEl = document.getElementById("reader-pub-time");
  if (pubTimeEl) pubTimeEl.innerText = timeAgo ? `${timeAgo}` : "Recent";

  const badgeEl = document.getElementById("reader-sentiment-badge");
  if (badgeEl) {
    badgeEl.className = `text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase ${sentiment.cls}`;
    badgeEl.innerText = sentiment.label;
  }

  const linkEl = document.getElementById("reader-source-link");
  if (linkEl) linkEl.href = art.link || "#";

  let domain = "news.wire";
  try {
    domain = new URL(art.link).hostname.replace(/^www\./, "");
  } catch (_) {}
  const domainEl = document.getElementById("reader-domain");
  if (domainEl) domainEl.innerText = domain;

  const catEl = document.getElementById("reader-category");
  if (catEl) catEl.innerText = (window.currentCategory || "Global").toUpperCase();

  const tsEl = document.getElementById("reader-timestamp");
  if (tsEl) {
    let cleanTs = "Live Wire";
    if (art.pubDate) {
      try { cleanTs = new Date(art.pubDate).toLocaleString(); } catch (_) {}
    }
    tsEl.innerText = cleanTs;
  }

  const iconWrap = document.getElementById("reader-source-icon");
  if (iconWrap) {
    if (favicon) {
      iconWrap.innerHTML = `<img src="${favicon}" alt="" class="w-full h-full object-cover grayscale opacity-90">`;
    } else {
      iconWrap.innerHTML = `<i class="fas fa-newspaper text-[10px] text-[var(--text-tertiary)]"></i>`;
    }
  }

  const imgWrap = document.getElementById("reader-image-wrap");
  const imgEl = document.getElementById("reader-image");
  if (imgWrap && imgEl) {
    if (art.image_url) {
      imgEl.src = art.image_url;
      imgWrap.classList.remove("hidden");
    } else {
      imgWrap.classList.add("hidden");
      imgEl.src = "";
    }
  }

  const drawer = document.getElementById("news-reader-drawer");
  const backdrop = document.getElementById("news-reader-backdrop");
  if (drawer) {
    drawer.classList.remove("hidden");
    requestAnimationFrame(() => drawer.classList.add("open"));
  }
  if (backdrop) {
    backdrop.classList.remove("hidden");
    requestAnimationFrame(() => backdrop.classList.add("open"));
  }
  if (window.audioHaptics) window.audioHaptics.play("open");
};

window.closeArticleReader = () => {
  const drawer = document.getElementById("news-reader-drawer");
  const backdrop = document.getElementById("news-reader-backdrop");
  if (drawer) drawer.classList.remove("open");
  if (backdrop) backdrop.classList.remove("open");
  setTimeout(() => {
    if (drawer && !drawer.classList.contains("open")) drawer.classList.add("hidden");
    if (backdrop && !backdrop.classList.contains("open")) backdrop.classList.add("hidden");
  }, 300);
  if (window.audioHaptics) window.audioHaptics.play("close");
};

window.navigateNews = (delta) => {
  if (!currentDisplayedArticles || currentDisplayedArticles.length === 0) return;
  const nextIdx = Math.max(0, Math.min(selectedNewsIndex + delta, currentDisplayedArticles.length - 1));
  selectedNewsIndex = nextIdx;

  document.querySelectorAll("#articles-container > div").forEach((c, idx) => {
    c.classList.toggle("news-card-active", idx === selectedNewsIndex);
  });

  const activeCard = document.querySelector(`[data-news-index="${selectedNewsIndex}"]`);
  if (activeCard) {
    activeCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  const drawer = document.getElementById("news-reader-drawer");
  if (drawer && drawer.classList.contains("open")) {
    window.openArticleReader(selectedNewsIndex);
  }
  if (window.audioHaptics) window.audioHaptics.play("tick");
};

window.openSelectedArticle = () => {
  if (currentDisplayedArticles && currentDisplayedArticles.length > 0) {
    window.openArticleReader(selectedNewsIndex);
  }
};

window.copyCurrentReaderLink = (btn) => {
  const art = currentDisplayedArticles[selectedNewsIndex];
  if (art && art.link) {
    window.copyArticleLink(art.link, btn);
  }
};
async function fetchGDELTEvents(country) {
  const container = document.getElementById("gdelt-events-content");
  if (!container) return;
  const countryLabel =
    typeof country === "string"
      ? country
      : country?.properties?.name || country?.name || "";
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
          <span class="text-[10px] font-bold text-slate-200 leading-tight line-clamp-2">${escapeHtml(a.title || "Untitled")}</span>
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
    container.innerHTML = '<div class="text-amber-400 text-xs py-2">Live GDELT intelligence is unavailable.</div>';
    const unavailableStamp = document.getElementById("gdelt-timestamp");
    if (unavailableStamp) unavailableStamp.innerText = "Intel provider unavailable";
    return;
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
