import { getCache, setCache } from "./_utils/cache.js";

function computeSentimentTone(text) {
  const positiveWords = ["peace", "accord", "treaty", "agreement", "cooperation", "growth", "aid", "alliance", "bilateral", "resolution", "pact", "recovery", "success", "progress"];
  const negativeWords = ["war", "conflict", "strike", "crisis", "sanction", "tensions", "threat", "attack", "casualty", "protest", "dispute", "clash", "missile", "condemn", "kill", "bomb", "riot"];
  
  const lower = (text || "").toLowerCase();
  let score = 0;
  positiveWords.forEach(w => { if (lower.includes(w)) score += 1.8; });
  negativeWords.forEach(w => { if (lower.includes(w)) score -= 2.2; });
  return Math.min(8.0, Math.max(-8.0, score));
}

async function fetchGoogleGeopoliticalFallback(query) {
  try {
    const cleanQ = encodeURIComponent(`${query} (geopolitics OR diplomacy OR security OR summit OR defense)`);
    const rssUrl = `https://news.google.com/rss/search?q=${cleanQ}&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(rssUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 15) {
      const block = match[1];
      const titleMatch = block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || block.match(/<title>([\s\S]*?)<\/title>/i);
      const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/i);
      const dateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
      const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);

      const title = titleMatch ? titleMatch[1].replace(/ - [^-]+$/, '').trim() : "Intelligence dispatch";
      const url = linkMatch ? linkMatch[1].trim() : "#";
      const domain = sourceMatch ? sourceMatch[1].trim() : "International Wire";
      const pubDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString();
      const tone = computeSentimentTone(title);

      items.push({
        title,
        url,
        tone,
        domain,
        seendate: new Date(pubDate).toISOString().replace(/[-:T]/g, '').slice(0, 14)
      });
    }
    return items;
  } catch (e) {
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { query, timespan, mode } = req.query || {};

  if (mode === "geo" || mode === "PointData") {
    return res.status(200).json({
      type: "FeatureCollection",
      features: []
    });
  }

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Missing query parameter", articles: [] });
  }

  const cacheKey = `gdelt_${query.trim().toLowerCase()}_${timespan || '72h'}`;
  const cached = getCache(cacheKey);
  if (cached) return res.status(200).json(cached);

  const maxrecords = Math.min(25, Math.max(1, parseInt(String(req.query.maxrecords || "15"), 10) || 15));
  const gdeltUrl = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  gdeltUrl.searchParams.set("query", query);
  gdeltUrl.searchParams.set("mode", "artlist");
  gdeltUrl.searchParams.set("maxrecords", String(maxrecords));
  gdeltUrl.searchParams.set("format", "json");
  if (timespan) gdeltUrl.searchParams.set("timespan", String(timespan));

  try {
    const r = await fetch(gdeltUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NewsAtlas/2.0" },
      signal: AbortSignal.timeout(3500)
    });

    if (r.ok) {
      const data = await r.json();
      const raw = data.articles || data.artlist || [];
      if (Array.isArray(raw) && raw.length > 0) {
        const articles = raw.map((a) => ({
          title: a.title || "Untitled",
          url: a.url || "#",
          tone: typeof a.tone === "number" ? a.tone : parseFloat(a.tone || 0),
          domain: a.domain || a.source || "GDELT",
          seendate: a.seendate || a.datetime || ""
        }));
        const payload = { articles };
        setCache(cacheKey, payload, 600); // 10 min cache
        return res.status(200).json(payload);
      }
    }
  } catch (err) {
    // Fallthrough to resilient fallback
  }

  // Resilient fallback to real-time geopolitical intelligence RSS
  const fallbackArticles = await fetchGoogleGeopoliticalFallback(query);
  if (fallbackArticles.length > 0) {
    const payload = { articles: fallbackArticles };
    setCache(cacheKey, payload, 300);
    return res.status(200).json(payload);
  }

  return res.status(200).json({ articles: [] });
}
