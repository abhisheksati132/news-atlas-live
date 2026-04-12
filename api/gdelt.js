/**
 * Server-side proxy for the GDELT 2.1 doc API (avoids browser CORS and centralizes errors).
 * @see https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
 */
export default async function handler(req, res) {
  const { query, timespan } = req.query;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Missing query", articles: [] });
  }

  const maxrecords = Math.min(25, Math.max(1, parseInt(String(req.query.maxrecords || "15"), 10) || 15));
  const gdeltUrl = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  gdeltUrl.searchParams.set("query", query);
  gdeltUrl.searchParams.set("mode", "artlist");
  gdeltUrl.searchParams.set("maxrecords", String(maxrecords));
  gdeltUrl.searchParams.set("format", "json");
  if (timespan) gdeltUrl.searchParams.set("timespan", String(timespan));

  try {
    const r = await fetch(gdeltUrl, {
      headers: { "User-Agent": "NewsAtlas/1.0" },
    });
    if (!r.ok) {
      return res.status(502).json({ error: `GDELT HTTP ${r.status}`, articles: [] });
    }
    const data = await r.json();
    const raw = data.articles || data.artlist || [];
    const articles = (Array.isArray(raw) ? raw : []).map((a) => ({
      title: a.title || "Untitled",
      url: a.url || "#",
      tone: typeof a.tone === "number" ? a.tone : 0,
      domain: a.domain || a.source || "GDELT",
      seendate: a.seendate || a.datetime || "",
    }));
    return res.status(200).json({ articles });
  } catch (err) {
    console.error("[gdelt]", err.message);
    return res.status(502).json({ error: err.message, articles: [] });
  }
}
