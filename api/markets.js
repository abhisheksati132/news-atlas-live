import { getCache, setCache } from "./utils/cache.js";

export default async function handler(req, res) {
    const { type, currency = "USD" } = req.query;
    const cur = currency.toUpperCase();
    const cacheKey = `markets_${type}_${cur}`;
    const cached = getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const rand = (min, max) => Math.random() * (max - min) + min;
    const simulate = (data) => {
        setCache(cacheKey, data, 300000);
        return res.status(200).json(data);
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
            return simulate({
                data: [
                    { label: "S&P 500", price: 5120 + rand(-50, 50), change: rand(-0.8, 1.2) },
                    { label: "NASDAQ", price: 16200 + rand(-150, 150), change: rand(-1.2, 1.5) },
                    { label: "FTSE 100", price: 7650 + rand(-30, 30), change: rand(-0.5, 0.5) },
                    { label: "NIKKEI 225", price: 39500 + rand(-200, 200), change: rand(-1.5, 2) },
                    { label: "WTI CRUDE", price: 78 + rand(-2, 2), change: rand(-3, 3) },
                    { label: "BRENT CRUDE", price: 82 + rand(-2, 2), change: rand(-2, 2.5) },
                    { label: "GOLD", price: 2150 + rand(-20, 20), change: rand(-0.5, 0.8) },
                    { label: "DAX", price: 18200 + rand(-100, 100), change: rand(-0.8, 1.0) }
                ]
            });
        }
        if (type === "forex") {
            return simulate({
                base: cur,
                rates: {
                    EUR: cur === "EUR" ? 1 : (cur === "USD" ? 0.92 : 0.85) + rand(-0.01, 0.01),
                    GBP: cur === "GBP" ? 1 : (cur === "USD" ? 0.78 : 0.82) + rand(-0.01, 0.01),
                    JPY: cur === "JPY" ? 1 : (cur === "USD" ? 148.5 : 160.2) + rand(-1, 1),
                    CHF: cur === "CHF" ? 1 : (cur === "USD" ? 0.88 : 0.95) + rand(-0.01, 0.01),
                    CAD: 1.35 + rand(-0.01, 0.01),
                    AUD: 1.52 + rand(-0.01, 0.01),
                    INR: 83.12 + rand(-0.2, 0.2),
                    CNY: 7.24 + rand(-0.02, 0.02)
                }
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
