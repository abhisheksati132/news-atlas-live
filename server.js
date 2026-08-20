import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";

// Routes handlers
import newsHandler from "./api/news.js";
import weatherHandler from "./api/weather.js";
import marketsHandler from "./api/markets.js";
import aiHandler from "./api/ai.js";
import configHandler from "./api/config.js";
import searchHandler from "./api/search.js";
import countriesHandler from "./api/countries.js";
import geoHandler from "./api/geo.js";
import gdeltHandler from "./api/gdelt.js";
import stabilityHandler from "./api/stability.js";
import economicsHandler from "./api/economics.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});
const port = process.env.PORT || 3000;

// Professional Middleware Stack
app.use(helmet({
  contentSecurityPolicy: false,
}));
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
  res.on('finish', () => {
    const elapsed = Date.now() - start;
    if (res.statusCode >= 400) {
      console.log(`\x1b[31m[ERR]\x1b[0m ${req.method} ${req.url} -> ${res.statusCode} (${elapsed}ms)`);
    } else {
      console.log(`\x1b[32m[OK]\x1b[0m ${req.method} ${req.url} -> ${res.statusCode} (${elapsed}ms)`);
    }
  });
  next();
});

// WebSocket orchestration
io.on("connection", (socket) => {
  console.log(`\x1b[35m[WS]\x1b[0m Client Connected: ${socket.id}`);
  
  // Send initial signal
  socket.emit("intelligence_link", { status: "ACTIVE", node: "GLOBAL_PRIMARY" });

  socket.on("disconnect", () => {
    console.log(`\x1b[35m[WS]\x1b[0m Client Disconnected`);
  });
});

// Provide io instance to request for route-initiated pushes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
const apiRouter = express.Router();
apiRouter.get("/news", (req, res) => newsHandler(req, res).catch(e => res.status(500).json({error: e.message})));
apiRouter.get("/weather", (req, res) => weatherHandler(req, res).catch(e => res.status(500).json({error: e.message})));
apiRouter.get("/markets", (req, res) => marketsHandler(req, res).catch(e => res.status(500).json({error: e.message})));
apiRouter.get("/config", (req, res) => configHandler(req, res).catch(e => res.status(500).json({error: e.message})));
apiRouter.get("/search", (req, res) => searchHandler(req, res).catch(e => res.status(500).json({error: e.message})));
apiRouter.post("/ai", (req, res) => aiHandler(req, res).catch(e => res.status(500).json({error: e.message})));
apiRouter.get("/ai", (req, res) => aiHandler(req, res).catch(e => res.status(500).json({error: e.message})));
apiRouter.get("/countries", (req, res) => countriesHandler(req, res).catch(e => res.status(500).json({error: e.message})));
apiRouter.get("/geo", (req, res) => geoHandler(req, res).catch(e => res.status(500).json({error: e.message})));
apiRouter.get("/gdelt", (req, res) => gdeltHandler(req, res).catch(e => res.status(500).json({error: e.message})));
apiRouter.get("/gdelt-geo", (req, res) => {
  req.query = req.query || {};
  req.query.mode = "geo";
  return gdeltHandler(req, res).catch(e => res.status(500).json({error: e.message}));
});
apiRouter.get("/news-alerts", (req, res) => {
  req.query = req.query || {};
  req.query.type = "alerts";
  return newsHandler(req, res).catch(e => res.status(500).json({error: e.message}));
});
apiRouter.get("/stability", (req, res) => stabilityHandler(req, res).catch(e => res.status(500).json({error: e.message})));
apiRouter.get("/economics", (req, res) => economicsHandler(req, res).catch(e => res.status(500).json({error: e.message})));

// Mount API router
app.use("/api", apiRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("dist"));
  app.get("/app", (req, res) => {
    res.sendFile(path.resolve(__dirname, "dist", "app.html"));
  });
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "dist", "index.html"));
  });
}

process.on("unhandledRejection", (reason, promise) => {
  console.error("\x1b[31m[SYS] Unhandled Rejection at:\x1b[0m", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("\x1b[31m[SYS] Uncaught Exception:\x1b[0m", err);
});

server.listen(port, () => {
  console.log(`\n\x1b[36m%s\x1b[0m`, `  NewsAtlas Intelligence Terminal - High-Fidelity Engine v3.0`);
  console.log(`\x1b[34m%s\x1b[0m`, `  > Local Discovery: http://localhost:${port}`);
  console.log(`\x1b[34m%s\x1b[0m`, `  > WebSocket: ws://localhost:${port}`);
  console.log(`\x1b[35m[CACHE]\x1b[0m Intelligent persistence active.`);
  console.log(`\x1b[2m%s\x1b[0m`, `  ----------------------------------------------------------\n`);
});
