import { getCache, setCache } from "./utils/cache.js";

export default async function handler(req, res) {
    const { type, currency = "USD", country = "Global" } = req.query;
    const cur = currency.toUpperCase();
    const loc = country.trim();
    const cacheKey = `markets_${type}_${cur}_${loc}`;
    const cached = getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const rand = (min, max) => Math.random() * (max - min) + min;
    const simulate = (data) => {
        setCache(cacheKey, data, 300000); // 5 min cache
        return res.status(200).json(data);
    };

    const COUNTRY_INDICES = {
        "India": [{ label: "NIFTY 50", price: 22100 + rand(-200, 200), change: rand(-1, 1.5) }, { label: "BSE SENSEX", price: 72800 + rand(-500, 500), change: rand(-0.8, 1.2) }],
        "United States": [{ label: "S&P 500", price: 5120 + rand(-50, 50), change: rand(-0.5, 0.8) }, { label: "NASDAQ 100", price: 18100 + rand(-150, 150), change: rand(-1.2, 1.5) }, { label: "DOW JONES", price: 39100 + rand(-200, 200), change: rand(-0.6, 0.7) }],
        "United Kingdom": [{ label: "FTSE 100", price: 7650 + rand(-30, 30), change: rand(-0.5, 0.5) }],
        "Japan": [{ label: "NIKKEI 225", price: 39500 + rand(-200, 200), change: rand(-1.5, 2) }, { label: "TOPIX", price: 2700 + rand(-10, 10), change: rand(-1, 1) }],
        "China": [{ label: "SSE Composite", price: 3050 + rand(-20, 20), change: rand(-1.2, 0.8) }, { label: "CSI 300", price: 3550 + rand(-30, 30), change: rand(-1, 1) }],
        "Germany": [{ label: "DAX 40", price: 18200 + rand(-100, 100), change: rand(-0.8, 1.0) }],
        "France": [{ label: "CAC 40", price: 8100 + rand(-50, 50), change: rand(-0.5, 0.5) }],
        "Australia": [{ label: "ASX 200", price: 7750 + rand(-40, 40), change: rand(-0.8, 0.8) }],
        "Brazil": [{ label: "IBOVESPA", price: 128000 + rand(-1000, 1000), change: rand(-1.5, 1.5) }],
        "South Korea": [{ label: "KOSPI", price: 2650 + rand(-20, 20), change: rand(-1.2, 1.2) }],
        "Canada": [{ label: "S&P/TSX", price: 21800 + rand(-100, 100), change: rand(-0.6, 0.6) }]
    };

    try {
        if (type === "metals") {
            return simulate({
                data: {
                    XAU: { price: 2150 + rand(-20, 20), change: rand(-1, 1.5), unit: "oz/t", icon: "🥇" },
                    XAG: { price: 24.5 + rand(-0.5, 0.5), change: rand(-2, 2.5), unit: "oz/t", icon: "🥈" },
                    XPT: { price: 920 + rand(-10, 10), change: rand(-1.5, 1.2), unit: "oz/t", icon: "🪙" },
                    XPD: { price: 1050 + rand(-15, 15), change: rand(-3, 1), unit: "oz/t", icon: "⚙️" }
                }
            });
        }
        if (type === "ticker") {
            let data = [];
            const countryMatches = COUNTRY_INDICES[loc] || [];
            
            if (countryMatches.length > 0) {
                data = JSON.parse(JSON.stringify(countryMatches));
                data.push({ label: "GLOBAL GOLD (Spot)", price: 2150 + rand(-10, 10), change: rand(-0.5, 0.5) });
                data.push({ label: "BRENT CRUDE", price: 82 + rand(-1, 1), change: rand(-1, 1) });
            } else if (loc !== "Global" && loc !== "Worldwide") {
                const baseVal = rand(500, 15000);
                data = [
                    { label: `${loc.toUpperCase()} COMPOSITE`, price: baseVal + rand(-baseVal*0.01, baseVal*0.01), change: rand(-2, 2) },
                    { label: "EMERGING MKTS IDX", price: 1050 + rand(-10, 10), change: rand(-1, 1) },
                    { label: "WTI CRUDE", price: 78 + rand(-1, 1), change: rand(-1, 1) }
                ];
            } else {
                data = [
                    { label: "S&P 500", price: 5120 + rand(-50, 50), change: rand(-0.8, 1.2) },
                    { label: "NASDAQ", price: 16200 + rand(-150, 150), change: rand(-1.2, 1.5) },
                    { label: "FTSE 100", price: 7650 + rand(-30, 30), change: rand(-0.5, 0.5) },
                    { label: "NIKKEI 225", price: 39500 + rand(-200, 200), change: rand(-1.5, 2) },
                    { label: "DAX", price: 18200 + rand(-100, 100), change: rand(-0.8, 1.0) }
                ];
            }
            return simulate({ data });
        }
        if (type === "forex") {
            const matrix = {
                USD: { EUR: 0.92, GBP: 0.79, JPY: 151.2, CHF: 0.90, CAD: 1.36, AUD: 1.53, INR: 83.3, CNY: 7.23, SGD: 1.35 },
                EUR: { USD: 1.08, GBP: 0.85, JPY: 164.5, CHF: 0.98, CAD: 1.48, AUD: 1.66, INR: 90.6, CNY: 7.86, SGD: 1.47 },
                GBP: { USD: 1.26, EUR: 1.17, JPY: 192.4, CHF: 1.15, CAD: 1.72, AUD: 1.94, INR: 105.8, CNY: 9.18, SGD: 1.71 },
                INR: { USD: 0.012, EUR: 0.011, GBP: 0.009, JPY: 1.81, CAD: 0.016, CNY: 0.087, AED: 0.044, SGD: 0.016 }
            };

            const baseSet = matrix[cur] || matrix.USD;
            const rates = { [cur]: 1.0000 };
            
            Object.entries(baseSet).forEach(([symbol, baseVal]) => {
                rates[symbol] = baseVal + rand(-baseVal * 0.002, baseVal * 0.002);
            });

            // Extra cross rates for richness
            if (!rates.HKD) rates.HKD = (rates.USD || 1.0) * (7.82 + rand(-0.01, 0.01));
            if (!rates.BRL) rates.BRL = (rates.USD || 1.0) * (5.05 + rand(-0.03, 0.03));

            return simulate({ 
                base: cur, 
                rates: rates,
                uplink: cur === "EUR" ? "ECB_REFERENCE" : "INTERBANK_SPOT",
                timestamp: new Date().toISOString()
            });
        }
        if (type === "commodities") {
            return simulate({
                data: {
                    "Crude Oil": { price: 78.5 + rand(-1, 1), change: rand(-2, 2), unit: "USD/bbl", icon: "🛢️" },
                    "Natural Gas": { price: 1.8 + rand(-0.1, 0.1), change: rand(-5, 5), unit: "USD/MMBtu", icon: "🔥" },
                    "Copper": { price: 3.85 + rand(-0.05, 0.05), change: rand(-1, 1), unit: "USD/lb", icon: "🏗️" },
                    "Wheat": { price: 540 + rand(-10, 10), change: rand(-2, 2), unit: "USD/bu", icon: "🌾" },
                    "Corn": { price: 430 + rand(-5, 5), change: rand(-1.5, 1.5), unit: "USD/bu", icon: "🌽" }
                }
            });
        }
        res.status(400).json({ error: "Invalid type" });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
}
