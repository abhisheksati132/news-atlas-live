import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import compression from "compression";
dotenv.config();
import newsHandler from "./api/news.js";
import weatherHandler from "./api/weather.js";
import marketsHandler from "./api/markets.js";
import aiHandler from "./api/ai.js";
import geoHandler from "./api/geo.js";
import openaqHandler from "./api/openaq.js";
import configHandler from "./api/config.js";
import countriesHandler from "./api/countries.js";
import issHandler from "./api/iss.js";
import gdeltHandler from "./api/gdelt.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;

app.use(compression());
app.use(express.json());
app.use(
  express.static("public", {
    etag: true,
    maxAge: process.env.NODE_ENV === "production" ? 31536000000 : 0,
    setHeaders(res, filePath) {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else if (process.env.NODE_ENV === "production") {
        res.setHeader(
          "Cache-Control",
          "public, max-age=31536000, immutable",
        );
      }
    },
  }),
);

// Request timing middleware — override res.json so header is set before flush
app.use((req, res, next) => {
  const started = process.hrtime();
  const origJson = res.json.bind(res);
  res.json = function(data) {
    const diff = process.hrtime(started);
    const ms = (diff[0] * 1e3) + (diff[1] / 1e6);
    res.setHeader('X-Response-Time', ms.toFixed(3) + 'ms');
    return origJson(data);
  };
  next();
});

app.get("/api/news", async (req, res) => await newsHandler(req, res));
app.get("/api/weather", async (req, res) => await weatherHandler(req, res));
app.get("/api/markets", async (req, res) => await marketsHandler(req, res));
app.get("/api/geo", async (req, res) => await geoHandler(req, res));
app.get("/api/openaq", async (req, res) => await openaqHandler(req, res));
app.get("/api/gdelt", async (req, res) => await gdeltHandler(req, res));
app.get("/api/config", async (req, res) => await configHandler(req, res));
app.post("/api/ai", async (req, res) => await aiHandler(req, res));
app.get("/api/ai", async (req, res) => await aiHandler(req, res));
app.get("/api/countries", async (req, res) => await countriesHandler(req, res));
app.get("/api/iss", async (req, res) => await issHandler(req, res));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`- News Feed: /api/news`);
  console.log(`- Weather: /api/weather`);
  console.log(`- Markets: /api/markets`);
  console.log(`- GDELT: /api/gdelt`);
});

// Simple health check endpoint for liveliness/ readiness
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Minimal sitemap for SEO
app.get('/sitemap.xml', (req, res) => {
  res.set('Content-Type', 'application/xml');
  const host = req.protocol + '://' + req.get('host');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>${host}/</loc><changefreq>daily</changefreq></url>
    <url><loc>${host}/terminal</loc><changefreq>daily</changefreq></url>
  </urlset>`;
  res.send(xml);
});
