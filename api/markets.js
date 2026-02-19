// ═══════════════════════════════════════════════════════
// MARKETS API — Real live market data (all free, no key)
// Crypto: CoinGecko | Forex: open.er-api.com | Metals: gold-api.com
// ═══════════════════════════════════════════════════════
export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    if (req.method === "OPTIONS") return res.status(200).end();

    const { type, currency = 'usd' } = req.query;

    try {
        if (type === 'crypto') {
            // CoinGecko free API — top 20 coins by market cap
            const cur = (currency || 'usd').toLowerCase();
            const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${cur}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`;
            const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
            if (!r.ok) throw new Error(`CoinGecko error ${r.status}`);
            const coins = await r.json();
            const result = coins.map(c => ({
                name: c.name,
                symbol: c.symbol.toUpperCase(),
                price: c.current_price,
                change: c.price_change_percentage_24h ?? 0,
                marketCap: c.market_cap,
                volume24h: c.total_volume,
                image: c.image,
                rank: c.market_cap_rank
            }));
            return res.status(200).json({ type: 'crypto', currency: cur, data: result });

        } else if (type === 'forex') {
            // ExchangeRate API — free, no key
            const base = (currency || 'USD').toUpperCase();
            const r = await fetch(`https://open.er-api.com/v6/latest/${base}`);
            if (!r.ok) throw new Error(`ExchangeRate error ${r.status}`);
            const data = await r.json();
            // Return major pairs
            const majorPairs = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'SGD', 'HKD', 'NOK', 'SEK', 'NZD', 'MXN', 'BRL', 'ZAR', 'TRY', 'RUB', 'KRW'];
            const rates = {};
            majorPairs.forEach(p => { if (data.rates[p]) rates[p] = data.rates[p]; });
            return res.status(200).json({
                type: 'forex',
                base,
                rates,
                time_last_update_utc: data.time_last_update_utc
            });

        } else if (type === 'metals') {
            // Fetch gold/silver from gold-api.com (free community API, USD only)
            // Then convert to target currency using er-api
            const metals = ['XAU', 'XAG', 'XPT', 'XPD'];
            const metalNames = { XAU: 'Gold', XAG: 'Silver', XPT: 'Platinum', XPD: 'Palladium' };
            const metalIcons = { XAU: '🥇', XAG: '🥈', XPT: '⚪', XPD: '⚫' };
            const metalUnits = { XAU: 'per troy oz', XAG: 'per troy oz', XPT: 'per troy oz', XPD: 'per troy oz' };

            const results = await Promise.allSettled(
                metals.map(m => fetch(`https://api.gold-api.com/price/${m}`).then(r => r.json()))
            );

            // Get exchange rate if currency != USD
            let rate = 1;
            const cur = (currency || 'USD').toUpperCase();
            if (cur !== 'USD') {
                try {
                    const er = await fetch(`https://open.er-api.com/v6/latest/USD`);
                    const erData = await er.json();
                    rate = erData.rates[cur] || 1;
                } catch (_) { }
            }

            const data = {};
            metals.forEach((sym, i) => {
                if (results[i].status === 'fulfilled') {
                    const d = results[i].value;
                    const priceUSD = d.price || d.Price || 0;
                    data[sym] = {
                        name: metalNames[sym],
                        symbol: sym,
                        priceUSD,
                        price: +(priceUSD * rate).toFixed(2),
                        change: d.prev_close_price ? +((priceUSD - d.prev_close_price) / d.prev_close_price * 100).toFixed(2) : 0,
                        unit: metalUnits[sym],
                        icon: metalIcons[sym]
                    };
                }
            });

            return res.status(200).json({ type: 'metals', currency: cur, data });

        } else if (type === 'commodities') {
            // Commodity prices via Yahoo Finance informal proxy - use open.er-api for FX context
            // Fallback: return reference prices from reliable free source via allorigins proxy
            // We'll use CoinGecko's commodity-linked coins as proxy for energy + generic commodity feed
            // For agriculture, we fetch from a public commodities RSS or open-meteo adjacent

            // Best free: world bank commodity prices API
            const wbCommodities = {
                'Crude Oil (WTI)': { indicator: 'CRUDE_OIL', unit: 'per barrel', icon: '🛢️', category: 'energy' },
                'Natural Gas': { indicator: 'ngas', unit: 'per MMBtu', icon: '🔥', category: 'energy' },
                'Wheat': { indicator: 'wheat', unit: 'per mt', icon: '🌾', category: 'agriculture' },
                'Corn': { indicator: 'maize', unit: 'per mt', icon: '🌽', category: 'agriculture' },
                'Coffee': { indicator: 'coffee_arabica', unit: 'per kg', icon: '☕', category: 'agriculture' }
            };

            // World Bank Commodity Prices API (free, no key)
            const wbUrl = `https://api.worldbank.org/v2/en/indicator/PBARL?format=json&mrv=1`;

            // Use a static fallback with World Bank data hints since their API returns growth data
            // Instead use the allorigins CORS proxy to hit Yahoo Finance quote for key commodities
            const commodityTickers = {
                'Crude Oil (WTI)': 'CL=F',
                'Brent Oil': 'BZ=F',
                'Natural Gas': 'NG=F',
                'Wheat': 'ZW=F',
                'Corn': 'ZC=F',
                'Soybeans': 'ZS=F',
                'Gold Spot': 'GC=F',
                'Silver Spot': 'SI=F'
            };

            // Use Yahoo Finance v8 chart endpoint (public, no auth)
            const fetchCommodity = async (ticker) => {
                const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=2d`;
                const r = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } });
                const d = await r.json();
                const meta = d?.chart?.result?.[0]?.meta;
                if (!meta) return null;
                const price = meta.regularMarketPrice || 0;
                const prev = meta.chartPreviousClose || meta.previousClose || price;
                const chg = prev ? +((price - prev) / prev * 100).toFixed(2) : 0;
                return { price: +price.toFixed(2), change: chg, currency: meta.currency };
            };

            const cur = (currency || 'USD').toUpperCase();
            let exchangeRate = 1;
            if (cur !== 'USD') {
                try {
                    const er = await fetch(`https://open.er-api.com/v6/latest/USD`);
                    const erData = await er.json();
                    exchangeRate = erData.rates[cur] || 1;
                } catch (_) { }
            }

            const commodityResults = await Promise.allSettled(
                Object.entries(commodityTickers).map(async ([name, ticker]) => {
                    const d = await fetchCommodity(ticker);
                    return { name, ...(d || { price: 0, change: 0 }) };
                })
            );

            const commodityData = {};
            commodityResults.forEach(r => {
                if (r.status === 'fulfilled' && r.value) {
                    const { name, price, change } = r.value;
                    const meta = { 'Crude Oil (WTI)': { icon: '🛢️', unit: 'per barrel', category: 'energy' }, 'Brent Oil': { icon: '🛢️', unit: 'per barrel', category: 'energy' }, 'Natural Gas': { icon: '🔥', unit: 'per MMBtu', category: 'energy' }, 'Wheat': { icon: '🌾', unit: 'per bushel', category: 'agriculture' }, 'Corn': { icon: '🌽', unit: 'per bushel', category: 'agriculture' }, 'Soybeans': { icon: '🫘', unit: 'per bushel', category: 'agriculture' }, 'Gold Spot': { icon: '🥇', unit: 'per troy oz', category: 'metals' }, 'Silver Spot': { icon: '🥈', unit: 'per troy oz', category: 'metals' } }[name] || {};
                    commodityData[name] = { price: +(price * exchangeRate).toFixed(2), change, ...meta };
                }
            });

            return res.status(200).json({ type: 'commodities', currency: cur, data: commodityData });
        }

        return res.status(400).json({ error: 'Invalid type. Use: crypto, forex, metals, commodities' });

    } catch (err) {
        return res.status(500).json({ error: 'Markets fetch failed', detail: err.message });
    }
}
