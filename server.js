import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

import newsHandler from "./api/news.js";
import weatherHandler from "./api/weather.js";
import marketsHandler from "./api/markets.js";
import aiHandler from "./api/ai.js";
import geoHandler from "./api/geo.js";
import openaqHandler from "./api/openaq.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

app.use(express.static("public"));

app.get("/api/news", async (req, res) => await newsHandler(req, res));
app.get("/api/weather", async (req, res) => await weatherHandler(req, res));
app.get("/api/markets", async (req, res) => await marketsHandler(req, res));
app.get("/api/geo", async (req, res) => await geoHandler(req, res));
app.get("/api/openaq", async (req, res) => await openaqHandler(req, res));

app.post("/api/ai", async (req, res) => await aiHandler(req, res));

app.get("/api/ai", async (req, res) => await aiHandler(req, res));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`- News Feed: /api/news`);
  console.log(`- Weather: /api/weather`);
});
