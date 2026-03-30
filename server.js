import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import compression from "compression";
import cors from "cors";
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
app.use(compression());
app.use(express.json());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[REQ] ${new Date().toISOString()} | ${req.method} ${req.url}`);
  res.on('finish', () => {
    console.log(`[RES] ${new Date().toISOString()} | ${req.method} ${req.url} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});
const apiRouter = express.Router();
apiRouter.get("/news", async (req, res) => { try { await newsHandler(req, res); } catch (e) { res.status(500).json({ error: e.message }); } });
apiRouter.get("/weather", async (req, res) => { try { await weatherHandler(req, res); } catch (e) { res.status(500).json({ error: e.message }); } });
apiRouter.get("/markets", async (req, res) => { try { await marketsHandler(req, res); } catch (e) { res.status(500).json({ error: e.message }); } });
apiRouter.get("/config", async (req, res) => { try { await configHandler(req, res); } catch (e) { res.status(500).json({ error: e.message }); } });
apiRouter.post("/ai", async (req, res) => { try { await aiHandler(req, res); } catch (e) { res.status(500).json({ error: e.message }); } });
apiRouter.get("/ai", async (req, res) => { try { await aiHandler(req, res); } catch (e) { res.status(500).json({ error: e.message }); } });
apiRouter.get("/countries", async (req, res) => { try { await countriesHandler(req, res); } catch (e) { res.status(500).json({ error: e.message }); } });
app.use("/api", apiRouter);
if (process.env.NODE_ENV === "production") {
  app.use(express.static("dist"));
  app.get("*", (req, res) => res.sendFile(path.resolve(__dirname, "dist", "index.html")));
}
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.listen(port, () => console.log(`NewsAtlas Backend v2.0 - Running on http://localhost:${port}`));
