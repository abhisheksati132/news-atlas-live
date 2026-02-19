let allNews = [];
let displayedNewsCount = 20;
let currentNewsFilters = { search: '', time: 'All Time', sort: 'Most Recent' };
let newsSearchQuery = '';
let newsSearchTimer = null;
async function fetchNews(overrideQ) {
    const loading = document.getElementById('news-loading');
    if (loading) loading.classList.remove('hidden');
    displayedNewsCount = 20;
    try {
        const q = overrideQ !== undefined ? overrideQ : newsSearchQuery;
        let url;
        if (q && q.trim()) {
            url = `/api/news?category=${window.currentCategory || 'top'}&q=${encodeURIComponent(q.trim())}`;
        } else {
            url = `/api/news?category=${window.currentCategory || 'top'}&country=${window.iso2Code || ''}&q=${window.selectedCountry ? encodeURIComponent(window.selectedCountry.properties.name) : ''}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error('News fetch failed');
        const data = await res.json();
        if (data.totalResults) {
            const el = document.getElementById('news-count');
            if (el) el.innerText = data.totalResults;
        }
        allNews = (data.results && data.results.length > 0) ? data.results : [];
        displayFilteredNews();
    } catch (e) {
        const container = document.getElementById('articles-container');
        if (container) container.innerHTML = `<div class="col-span-full p-10 text-center text-[12px] text-red-500 font-black italic uppercase tracking-widest">Uplink Error. Retrying...</div>`;
    } finally { if (loading) loading.classList.add('hidden'); }
}
window.filterNews = (searchTerm) => {
    newsSearchQuery = searchTerm;
    clearTimeout(newsSearchTimer);
    if (!searchTerm.trim()) { fetchNews(''); return; }
    newsSearchTimer = setTimeout(() => fetchNews(searchTerm), 700);
};
window.clearNewsSearch = () => {
    const input = document.getElementById('news-search');
    if (input) input.value = '';
    currentNewsFilters.search = '';
    displayFilteredNews();
};
window.setCategory = (el, cat) => {
    window.playTacticalSound('click');
    document.querySelectorAll('.intel-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    window.currentCategory = cat;
    fetchNews();
};
function displayFilteredNews() {
    let filtered = [...allNews];
    if (currentNewsFilters.search) {
        filtered = filtered.filter(article =>
            (article.title && article.title.toLowerCase().includes(currentNewsFilters.search)) ||
            (article.description && article.description.toLowerCase().includes(currentNewsFilters.search))
        );
    }
    const now = new Date();
    if (currentNewsFilters.time === 'Last 24 hours') {
        filtered = filtered.filter(a => { const d = new Date(a.pubDate); return !isNaN(d) && (now - d) < 24 * 3600000; });
    } else if (currentNewsFilters.time === 'Last 7 days') {
        filtered = filtered.filter(a => { const d = new Date(a.pubDate); return !isNaN(d) && (now - d) < 7 * 24 * 3600000; });
    }
    if (currentNewsFilters.sort === 'Most Recent') {
        filtered.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    } else if (currentNewsFilters.sort === 'Alphabetical') {
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    displayNewsArticles(filtered.slice(0, displayedNewsCount));
    const loadMoreEl = document.getElementById('news-load-more');
    if (loadMoreEl) {
        loadMoreEl.classList.toggle('hidden', filtered.length <= displayedNewsCount);
    }
}
function displayNewsArticles(articles) {
    const container = document.getElementById('articles-container');
    if (!container) return;
    container.innerHTML = '';
    if (!articles || articles.length === 0) {
        container.innerHTML = '<div class="col-span-full p-10 text-center text-[12px] text-slate-500 font-black italic uppercase tracking-widest">Zero news fragments matching filters.</div>';
        return;
    }
    articles.forEach((art, i) => {
        const card = document.createElement('div');
        const sents = ['signal-blue', 'signal-emerald', 'signal-red'];
        const img = art.image_url ? `<div class="h-32 w-full mb-3 rounded bg-cover bg-center border border-white/10" style="background-image: url('${art.image_url}')"></div>` : '';
        card.className = `dossier-card shadow-md mb-4 ${sents[i % 3]}`;
        card.onmouseenter = () => window.playTacticalSound('hover');
        card.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <div class="text-[10px] font-black text-white/70 uppercase tracking-widest bg-white/5 px-2.5 py-0.5 rounded-lg truncate max-w-[100px]">${art.source_id || 'UPLINK'}</div>
                <button class="text-slate-400 hover:text-white transition-all tactical-btn"><i class="fas fa-link text-[13px]"></i></button>
            </div>
            ${img}<h3 class="font-bold text-[16px] text-white leading-tight mb-3 cursor-pointer hover:text-blue-300 transition-colors pr-4" onclick="window.open('${art.link}', '_blank')">${art.title}</h3>
        `;
        container.appendChild(card);
    });
}
window.loadMoreNews = () => { displayedNewsCount += 20; displayFilteredNews(); };
window.checkNewsScroll = () => {
    const container = document.getElementById('news-scroll-container');
    if (!container) return;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 100) window.loadMoreNews();
};
window.fetchNews = fetchNews;
window.displayFilteredNews = displayFilteredNews;