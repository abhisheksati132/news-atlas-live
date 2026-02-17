# 🌍 NewsAtlas | Global Intelligence Terminal

### A Full-Stack Geospatial Intelligence Platform
**Live Demo:** [https://news-atlas-live.vercel.app](https://news-atlas-live.vercel.app)

## 🚀 Project Overview
NewsAtlas is a Single Page Application (SPA) designed to visualize global data streams in a high-fidelity "Command Terminal" interface. It aggregates real-time news, financial metrics, and weather telemetry, fusing them with Generative AI to produce detailed situation reports. The system features a cinematic boot sequence, procedural audio ambience, and a seamless 2D/3D orbital interface.

## 🛠 Tech Stack (MERN / Serverless Architecture)
- **Frontend:** HTML5, Tailwind CSS, D3.js (Geospatial Visualization), TopoJSON.
- **Core Logic:** Vanilla JavaScript (ES6+), Web Audio API (Procedural Sound), Web Speech API.
- **Backend:** Node.js (Vercel Serverless Functions).
- **Database/Auth:** Google Firebase (Firestore & Authentication).
- **AI Core:** **Groq Cloud** (Llama 3-70b-versatile) for ultra-fast, high-density intelligence.
- **Data Streams:** - **News:** NewsData.io / GNews.
  - **Weather:** Open-Meteo High-Precision API with tactical estimation algorithms.
  - **Finance:** Open Exchange Rates + Real-time Simulated Ticker Engine.
  - **Geo:** REST Countries API v3.1.

## ⚡ Key Features

### 1. 🛰️ Orbital Map Interface
* **Dual Projection:** Seamless switching between **Tactical Blueprint (2D)** and **Orthographic Globe (3D)** modes.
* **Satellite Layer:** One-click toggle to switch map visualization to a high-contrast "Satellite Thermal" mode.
* **Vector Tooltips:** Interactive hover states displaying sector sovereignty data.

### 2. 🧠 Llama-3 Powered Intelligence
* **Strategic Metrics Dashboard:** Generates a 10-point high-density dossier for any selected country, analyzing:
    * *Gov Stability & Border Integrity*
    * *Cyber Threat Levels*
    * *Civil Unrest & Military Readiness*
    * *Energy Reserves & Supply Chain Status*
* **Context-Aware Fallbacks:** Robust simulation engine ensures the terminal provides immersive "Cached Intelligence" even when offline or API limits are hit.

### 3. 📉 Real-Time Market Telemetry
* **Live Ticker:** Scrolling electronic ticker displaying real-time volatility for major global indices (S&P 500, BTC, GOLD, OIL).
* **AI Financial Analyst:** Extracts specific commodities pricing (Gold/Silver) and generates a "Strategic Analysis" summary of global market sentiment.

### 4. 🎙️ Voice Command Module
Hands-free navigation using the `SpeechRecognition` API:
* *"Go to [Country Name]"* -> Vectors map to target sector.
* *"Analyze"* -> Triggers AI tactical briefing.
* *"News"* -> Switches display to the signal feed.

### 5. 🔊 Immersive Audio Engine
* **Procedural Ambience:** Uses `AudioContext` oscillators to generate a dynamic "server room" hum (55Hz/110Hz).
* **Tactical UI Sounds:** Custom frequency ramps for hover, click, and success states (200Hz - 2kHz range).

## 📂 Architecture
```text
/api            -> Vercel Serverless Functions (AI, News, Weather)
   ├── ai.js    -> Context-aware Groq handler (JSON/Text switching)
   ├── news.js  -> News aggregation proxy
   └── weather.js -> Safe-parameter weather fetcher
index.html      -> Monolithic Core (D3 Engine, UI Logic, State Management)
firebase.js     -> Database & Auth Configuration
