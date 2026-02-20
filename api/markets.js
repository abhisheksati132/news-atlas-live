export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    if (req.method === "OPTIONS") return res.status(200).end();
    const { type, currency = 'usd' } = req.query;
    try {
        if (type === 'ticker') {
            const symbols = [
                { label: 'S&P 500', ticker: '^GSPC' },
                { label: 'NASDAQ', ticker: '^IXIC' },
                { label: 'DOW JONES', ticker: '^DJI' },
                { label: 'FTSE 100', ticker: '^FTSE' },
                { label: 'NIKKEI 225', ticker: '^N225' },
                { label: 'BTC-USD', ticker: 'BTC-USD' },
                { label: 'ETH-USD', ticker: 'ETH-USD' },
                { label: 'GOLD', ticker: 'GC=F' },
                { label: 'CRUDE OIL', ticker: 'CL=F' },
                { label: 'EUR/USD', ticker: 'EURUSD=X' },
            ];
            const fetchTicker = async ({ label, ticker }) => {
                try {
                    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=2d`;
                    const r = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } });
                    const d = await r.json();
                    const meta = d?.chart?.result?.[0]?.meta;
                    if (!meta) return null;
                    const price = meta.regularMarketPrice || 0;
                    const prev = meta.chartPreviousClose || meta.previousClose || price;
                    const change = prev ? +((price - prev) / prev * 100).toFixed(2) : 0;
                    return { label, price: +price.toFixed(2), change };
                } catch (_) { return null; }
            };
            const results = await Promise.all(symbols.map(fetchTicker));
            return res.status(200).json({ type: 'ticker', data: results.filter(Boolean) });
        }

        if (type === 'crypto') {
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
            const base = (currency || 'USD').toUpperCase();
            const r = await fetch(`https://open.er-api.com/v6/latest/${base}`);
            if (!r.ok) throw new Error(`ExchangeRate error ${r.status}`);
            const data = await r.json();
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
            const metalsList = [
                { sym: 'XAU', name: 'Gold', ticker: 'GC=F', icon: '🥇', unit: 'per troy oz' },
                { sym: 'XAG', name: 'Silver', ticker: 'SI=F', icon: '🥈', unit: 'per troy oz' },
                { sym: 'XPT', name: 'Platinum', ticker: 'PL=F', icon: '⚪', unit: 'per troy oz' },
                { sym: 'XPD', name: 'Palladium', ticker: 'PA=F', icon: '⚫', unit: 'per troy oz' },
                { sym: 'ALI', name: 'Aluminum', ticker: 'ALI=F', icon: '🔩', unit: 'per tonne' },
                { sym: 'ZNC', name: 'Zinc', ticker: 'ZNC=F', icon: '🔋', unit: 'per tonne' }
            ];

            let rate = 1;
            const cur = (currency || 'USD').toUpperCase();
            if (cur !== 'USD') {
                try {
                    const er = await fetch(`https://open.er-api.com/v6/latest/USD`);
                    const erData = await er.json();
                    rate = erData.rates[cur] || 1;
                } catch (_) { }
            }

            const results = await Promise.all(metalsList.map(async m => {
                try {
                    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(m.ticker)}?interval=1d&range=2d`;
                    const r = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } });
                    const d = await r.json();
                    const meta = d?.chart?.result?.[0]?.meta;
                    if (!meta) return null;
                    const priceUSD = meta.regularMarketPrice || 0;
                    const prev = meta.chartPreviousClose || meta.previousClose || priceUSD;
                    const change = prev ? +((priceUSD - prev) / prev * 100).toFixed(2) : 0;
                    return { ...m, priceUSD, change };
                } catch { return null; }
            }));

            const data = {};
            results.forEach(r => {
                if (r && r.priceUSD) {
                    data[r.sym] = {
                        name: r.name,
                        symbol: r.sym,
                        priceUSD: r.priceUSD,
                        price: +(r.priceUSD * rate).toFixed(2),
                        change: r.change,
                        unit: r.unit,
                        icon: r.icon
                    };
                }
            });
            return res.status(200).json({ type: 'metals', currency: cur, data });
            return res.status(200).json({ type: 'metals', currency: cur, data });
        } else if (type === 'commodities') {
            const commodityTickers = {
                'Crude Oil (WTI)': 'CL=F',
                'Brent Oil': 'BZ=F',
                'Natural Gas': 'NG=F',
                'Wheat': 'ZW=F',
                'Corn': 'ZC=F',
                'Soybeans': 'ZS=F',
                'Gold Spot': 'GC=F',
                'Silver Spot': 'SI=F',
                'Copper': 'HG=F'
            };
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
