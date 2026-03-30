import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import compression from "compression";
import cors from "cors";

// Routes handlers
import newsHandler from "./api/news.js";
import weatherHandler from "./api/weather.js";
import marketsHandler from "./api/markets.js";
import aiHandler from "./api/ai.js";
import configHandler from "./api/config.js";
import countriesHandler from "./api/countries.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;

// Professional Middleware Stack
app.use(compression());
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request time logger
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[REQ] ${new Date().toISOString()} | ${req.method} ${req.url}`);
  res.on('finish', () => {
    const elapsed = Date.now() - start;
    console.log(`[RES] ${new Date().toISOString()} | ${req.method} ${req.url} -> ${res.statusCode} (${elapsed}ms)`);
    res.setHeader('X-Response-Time', `${elapsed}ms`);
  });
  next();
});

// API Routes
const apiRouter = express.Router();

apiRouter.get("/news", (req, res) => newsHandler(req, res).catch(e => res.status(500).json({error: e.message})));
apiRouter.get("/weather", (req, res) => weatherHandler(req, res).catch(e => res.status(500).json({error: e.message})));
apiRouter.get("/markets", (req, res) => marketsHandler(req, res).catch(e => res.status(500).json({error: e.message})));
apiRouter.get("/config", (req, res) => configHandler(req, res).catch(e => res.status(500).json({error: e.message})));
apiRouter.post("/ai", (req, res) => aiHandler(req, res).catch(e => res.status(500).json({error: e.message})));
apiRouter.get("/ai", (req, res) => aiHandler(req, res).catch(e => res.status(500).json({error: e.message})));
apiRouter.get("/countries", (req, res) => countriesHandler(req, res).catch(e => res.status(500).json({error: e.message})));

app.use("/api", apiRouter);

// Serve Static Assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("dist"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "dist", "index.html"));
  });
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`\n\x1b[36m%s\x1b[0m`, `  NewsAtlas Intelligence Terminal - Backend v2.0`);
  console.log(`\x1b[34m%s\x1b[0m`, `  > Serving API at http://localhost:${port}/api`);
  console.log(`\x1b[34m%s\x1b[0m`, `  > Node Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\x1b[2m%s\x1b[0m`, `  --------------------------------------------------\n`);
});
