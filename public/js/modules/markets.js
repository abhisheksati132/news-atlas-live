window.toggleMarketCategory = (category) => {
    const content = document.getElementById(`${category}-content`);
    const chevron = document.getElementById(`${category}-chevron`);
    if (!content || !chevron) return;
    content.classList.toggle('hidden');
    chevron.classList.toggle('fa-chevron-down');
    chevron.classList.toggle('fa-chevron-up');
};
async function displayPreciousMetals() {
    const container = document.getElementById('metals-content');
    if (!container) return;
    container.innerHTML = '<div class="col-span-3 text-slate-500 text-xs py-2">Fetching live prices...</div>';
    try {
        const cur = (window.currencyCode || 'USD').toUpperCase();
        const res = await fetch(`/api/markets?type=metals&currency=${cur}`);
        const json = await res.json();
        container.innerHTML = '';
        const metalDisplay = { XAU: 'Gold (XAU)', XAG: 'Silver (XAG)', XPT: 'Platinum (XPT)', XPD: 'Palladium (XPD)' };
        Object.entries(json.data || {}).forEach(([sym, data]) => {
            const name = metalDisplay[sym] || sym;
            const changeClass = (data.change || 0) >= 0 ? 'text-emerald-400' : 'text-red-400';
            const changeIcon = (data.change || 0) >= 0 ? '▲' : '▼';
            const card = document.createElement('div');
            card.className = 'dossier-card p-3';
            card.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                  <span class="text-2xl">${data.icon || '🪙'}</span>
                  <span class="${changeClass} text-xs font-mono font-bold">${changeIcon} ${Math.abs(data.change || 0).toFixed(2)}%</span>
                </div>
                <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">${name}</div>
                <div class="text-xl font-black text-white font-mono">${cur} ${(data.price || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div class="text-[9px] text-slate-600 mt-1">${data.unit || ''}</div>
            `;
            container.appendChild(card);
        });
        if (container.children.length === 0) container.innerHTML = '<div class="text-slate-500 text-xs col-span-3">No metals data</div>';
    } catch (e) { container.innerHTML = '<div class="text-slate-500 text-xs col-span-3">Data unavailable</div>'; }
}
function displayCountryIndices(countryName) {
    const container = document.getElementById('indices-content');
    if (!container) return;
    const indicesLabelEl = document.getElementById('indices-country');
    if (indicesLabelEl) indicesLabelEl.innerText = countryName || 'Global';
    container.innerHTML = `<div class="col-span-2 text-slate-500 text-xs py-3"><i class="fas fa-info-circle mr-1"></i>Country index data shown when market APIs for ${countryName || 'this country'} are available via live subscription or exchange data feeds.</div>`;
}
window.getIndicesForCountry = () => ({});
async function displayCrypto() {
    const container = document.getElementById('crypto-content');
    if (!container) return;
    container.innerHTML = '<div class="text-slate-500 text-xs py-2">Fetching live prices...</div>';
    try {
        const cur = (window.currencyCode || 'USD').toLowerCase();
        const res = await fetch(`/api/markets?type=crypto&currency=${cur}`);
        const json = await res.json();
        container.innerHTML = '';
        (json.data || []).forEach(data => {
            const changeClass = (data.change || 0) >= 0 ? 'text-emerald-400' : 'text-red-400';
            const changeIcon = (data.change || 0) >= 0 ? '▲' : '▼';
            const card = document.createElement('div');
            card.className = 'dossier-card p-3';
            card.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                  <img src="${data.image}" alt="${data.name}" class="w-6 h-6 rounded-full" onerror="this.style.display='none'">
                  <span class="${changeClass} text-xs font-mono font-bold">${changeIcon} ${Math.abs(data.change || 0).toFixed(2)}%</span>
                </div>
                <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">${data.symbol}</div>
                <div class="text-lg font-black text-white font-mono">${cur.toUpperCase()} ${(data.price || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div class="text-[8px] text-slate-600 mt-1">MCap: ${cur.toUpperCase()} ${((data.marketCap || 0) / 1e9).toFixed(1)}B</div>
            `;
            container.appendChild(card);
        });
    } catch (e) { container.innerHTML = '<div class="text-slate-500 text-xs">Data unavailable</div>'; }
}
async function displayForex() {
    const container = document.getElementById('forex-content');
    if (!container) return;
    container.innerHTML = '<div class="text-slate-500 text-xs py-2">Fetching live rates...</div>';
    try {
        const base = (window.currencyCode || 'USD').toUpperCase();
        const res = await fetch(`/api/markets?type=forex&currency=${base}`);
        const json = await res.json();
        container.innerHTML = '';
        Object.entries(json.rates || {}).filter(([c]) => c !== base).slice(0, 15).forEach(([pair, rate]) => {
            const card = document.createElement('div');
            card.className = 'dossier-card p-3 flex justify-between items-center';
            card.innerHTML = `
                <div>
                  <div class="text-sm font-black text-white">${base}/${pair}</div>
                  <div class="text-[9px] text-slate-500 mt-0.5">Live rate</div>
                </div>
                <div class="text-xl font-mono font-black text-cyan-400">${rate.toFixed(4)}</div>
            `;
            container.appendChild(card);
        });
    } catch (e) { container.innerHTML = '<div class="text-slate-500 text-xs">Data unavailable</div>'; }
}
async function displayCommodities() {
    const container = document.getElementById('commodities-content');
    if (!container) return;
    container.innerHTML = '<div class="col-span-3 text-slate-500 text-xs py-2">Fetching live prices...</div>';
    try {
        const cur = (window.currencyCode || 'USD').toUpperCase();
        const res = await fetch(`/api/markets?type=commodities&currency=${cur}`);
        const json = await res.json();
        container.innerHTML = '';
        Object.entries(json.data || {}).forEach(([name, data]) => {
            const changeClass = (data.change || 0) >= 0 ? 'text-emerald-400' : 'text-red-400';
            const changeIcon = (data.change || 0) >= 0 ? '▲' : '▼';
            const card = document.createElement('div');
            card.className = 'dossier-card p-3';
            card.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xl">${data.icon || '📦'}</span>
                  <span class="${changeClass} text-xs font-mono font-bold">${changeIcon} ${Math.abs(data.change || 0).toFixed(2)}%</span>
                </div>
                <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">${name}</div>
                <div class="text-lg font-black text-white font-mono">${cur} ${(data.price || 0).toFixed(2)}</div>
                <div class="text-[8px] text-slate-600 mt-1">${data.unit || ''}</div>
            `;
            container.appendChild(card);
        });
        if (container.children.length === 0) container.innerHTML = '<div class="text-slate-500 text-xs col-span-3">No commodity data</div>';
    } catch (e) { container.innerHTML = '<div class="text-slate-500 text-xs col-span-3">Data unavailable</div>'; }
}
function initializeMarkets(countryName) {
    displayPreciousMetals();
    displayCountryIndices(countryName || 'Global');
    displayCrypto();
    displayForex();
    displayCommodities();
    displayCoinGeckoTrending();
    displayCoinGeckoTop10();
}
window.displayPreciousMetals = displayPreciousMetals;
window.displayCountryIndices = displayCountryIndices;
window.displayCrypto = displayCrypto;
window.displayForex = displayForex;
window.displayCommodities = displayCommodities;
window.initializeMarkets = initializeMarkets;

// ─── COINGECKO: TRENDING COINS (no key) ──────────────────────────────────────
async function displayCoinGeckoTrending() {
    const container = document.getElementById('trending-crypto-content');
    if (!container) return;
    container.innerHTML = '<div class="text-slate-500 text-xs py-2">Fetching trending...</div>';
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/search/trending');
        const data = await res.json();
        const coins = (data.coins || []).slice(0, 7);
        container.innerHTML = '';
        coins.forEach(({ item: c }) => {
            const change = c.data?.price_change_percentage_24h?.usd ?? 0;
            const changeClass = change >= 0 ? 'text-emerald-400' : 'text-red-400';
            const changeIcon = change >= 0 ? '▲' : '▼';
            const card = document.createElement('div');
            card.className = 'dossier-card p-3 flex items-center gap-3';
            card.innerHTML = `
                <img src="${c.large}" class="w-7 h-7 rounded-full" onerror="this.style.display='none'">
                <div class="flex-1 min-w-0">
                    <div class="text-xs font-black text-white uppercase truncate">${c.symbol}</div>
                    <div class="text-[9px] text-slate-500 truncate">${c.name}</div>
                </div>
                <div class="text-right shrink-0">
                    <div class="${changeClass} text-xs font-mono font-bold">${changeIcon} ${Math.abs(change).toFixed(2)}%</div>
                    <div class="text-[8px] text-slate-600">#${c.market_cap_rank || '?'}</div>
                </div>`;
            container.appendChild(card);
        });
    } catch (e) { container.innerHTML = '<div class="text-slate-500 text-xs">Unavailable</div>'; }
}
window.displayCoinGeckoTrending = displayCoinGeckoTrending;

// ─── COINGECKO: TOP 10 BY MARKET CAP (no key) ────────────────────────────────
async function displayCoinGeckoTop10() {
    const container = document.getElementById('top10-crypto-content');
    if (!container) return;
    container.innerHTML = '<div class="text-slate-500 text-xs py-2 col-span-2">Loading top 10...</div>';
    try {
        const cur = (window.currencyCode || 'usd').toLowerCase();
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${cur}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`);
        const coins = await res.json();
        container.innerHTML = '';
        coins.forEach((c, i) => {
            const change = c.price_change_percentage_24h ?? 0;
            const changeClass = change >= 0 ? 'text-emerald-400' : 'text-red-400';
            const row = document.createElement('div');
            row.className = 'flex items-center gap-2 py-1.5 border-b border-white/5';
            row.innerHTML = `
                <span class="text-[9px] text-slate-600 font-mono w-4">${i + 1}</span>
                <img src="${c.image}" class="w-4 h-4 rounded-full" onerror="this.style.display='none'">
                <span class="text-[10px] font-black text-white uppercase flex-1">${c.symbol.toUpperCase()}</span>
                <span class="text-[10px] font-mono text-white">${cur.toUpperCase()} ${c.current_price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                <span class="${changeClass} text-[9px] font-mono font-bold w-14 text-right">${change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%</span>`;
            container.appendChild(row);
        });
    } catch (e) { container.innerHTML = '<div class="text-slate-500 text-xs col-span-2">Unavailable</div>'; }
}
window.displayCoinGeckoTop10 = displayCoinGeckoTop10;

