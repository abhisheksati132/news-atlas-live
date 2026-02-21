# 🌍 NewsAtlas | Global Intelligence Terminal

### A Full-Stack Geospatial Intelligence Platform with Web3-Style Visual Effects

**Live Demo:** [https://news-atlas-live.vercel.app](https://news-atlas-live.vercel.app)

---

## ▶ Running locally (important)

**Do not open the app with Live Server (e.g. port 5500).** The APIs (`/api/news`, `/api/config`, `/api/markets`, etc.) are served by the Node backend. If you open only the static files, you will get **404** and **405** errors.

1. In the project root, run:
   ```bash
   npm install
   npm run dev
   ```
2. Open in your browser: **http://localhost:3000**
3. Use **terminal.html** (main app) or **index.html** (landing) from that origin.

If you see a yellow banner saying "API not available", the backend is not running — start it with `npm run dev` and use `http://localhost:3000`.

---

## 🚀 Project Overview

NewsAtlas is a cutting-edge Single Page Application (SPA) that transforms global data streams into an immersive "Command Terminal" experience. It aggregates real-time news, financial metrics, and weather telemetry, enhanced with Generative AI to produce detailed situation reports. The platform features a cinematic boot sequence, procedural audio ambience, interactive particle networks, and a seamless 2D/3D orbital interface inspired by Web3 dashboards like Etherscan and Dune Analytics.

---

## 🛠 Tech Stack (MERN / Serverless Architecture)

- **Frontend:** HTML5, Tailwind CSS, D3.js (Geospatial Visualization), TopoJSON, Canvas API (Particle Physics)
- **Core Logic:** Vanilla JavaScript (ES6+), Web Audio API (Procedural Sound), Web Speech API
- **Backend:** Node.js (Vercel Serverless Functions)
- **Database/Auth:** Google Firebase (Firestore & Authentication with Google OAuth/Anonymous)
- **AI Core:** **Groq Cloud** (Llama 3-70b-versatile) for ultra-fast, high-density intelligence synthesis
- **Data Streams:**
  - **News & Events:** Live Server-Side Feed Aggregation (Global Search), GDELT Project (Event Matrix)
  - **Weather:** Open-Meteo High-Precision API with tactical estimation algorithms
  - **Finance:** CoinGecko (Crypto), Yahoo Finance (Metals, Forex, Global Indices, Commodities), World Bank API (GDP)
  - **Geo & Seismology:** REST Countries API v3.1, USGS (Real-time Earthquakes)
  - **Aviation:** OpenSky Network (Live Flight Telemetry)
  - **Satellite:** NASA GIBS (Real-time WMS Overlay)

---

## ⚡ Key Features

### 1. 🛰️ Orbital Map Interface

- **Dual Projection Engine:** Seamlessly transitions between **Tactical Blueprint (2D)** and **Orthographic Globe (3D)** modes. Custom spherical math ensures interactive markers (earthquakes, flights) synchronize across projections with accurate geometric occlusion routing behind the 3D globe.
- **NASA Satellite Layer:** Real-time WMS overlay using NASA's GIBS Blue Marble data.
- **Contextual Data Vectors:** Dynamic interactive tooltips instantly adapt labels (e.g., displaying "Capital/Pop" for regions vs "Altitude/Velocity" for aviation vs "Depth/Time" for seismic data) on hover.
- **Holographic Country Glow:** Triple-layer neon glow effects on hover with pulsing animations, restoring default cyclical color mappings when thematic overlays (GDP/Air Quality) are deactivated.

### 2. 🗺️ Deep-Dive Geography Engine

- **Hierarchical Navigation:** Drill down from **Country** → **State/Province** → **City** level.
- **Smart Breadcrumbs:** Real-time tracking of current geographical context.
- **Location Intelligence:** Auto-fetches weather and news for specific grid coordinates of selected cities.

### 3. 🎨 Visual Effects & UI Architecture

- **Global Typography Scaling:** Carefully calibrated variable text scaling ensuring high accessibility and legibility without compromising the dense, glassmorphic Flexbox/Grid dossier matrix structures.
- **Particle Network Overlay:** 50+ floating nodes with dynamic connections that follow mouse movement using Canvas API.
- **Traffic Pattern Canvas:** Real-time network traffic visualization in the About section.
- **Smooth Camera Controls:** Buttery 60fps zoom/pan with cubic-bezier easing.

### 4. 🧠 Intelligence & AI Synthesis

- **Strategic Metrics Dashboard:** Generates a high-density, 10-point dossier analyzing global sectors:
  - _Political Stability & Economic Outlook_
  - _Cyber Threat Levels & Border Integrity_
  - _Military Readiness & Global Relations_
- **Multi-Tab AI Chat Widgets:** Each of the 5 main system tabs (Intel, News, Markets, Atmosphere, Economics) features a dedicated generative AI chat widget capable of contextually analyzing the active data streams.

### 5. 📉 Real-Time Market Telemetry

- **Global Indices Hub:** Live-tracking grids monitoring primary exchanges (S&P 500, NASDAQ, Dow Jones, FTSE 100, NIKKEI 225).
- **Crypto Command:** Live prices via CoinGecko, featuring an expandable dense-grid view of trending tokens and top-10 crypto assets by market capitalization.
- **Expanded Forex Uplink:** Continuous polling of over 16+ currency exchange rates dynamically baselined against USD.
- **Precious Metals & Commodities:** Live Spot Gold (XAU), Silver (XAG), Platinum (XPT), Palladium (XPD), Aluminum (ALI), Zinc (ZNC), alongside Copper, Crude Oil, and Natural Gas tracking.

### 6. 📰 Global Signal Intelligence (News)

- **Real-time Server-Side Search:** Instantaneously fetches and cross-references active news events across a backend scraper. Dropdown time limitations have been entirely stripped out for unfiltered global searching without third-party API keys limitations.
- **GDELT Integration:** Monitors the Global Database of Events, Language, and Tone tracking granular conflict and political data point mutations.

### 7. 📊 Economic Intelligence Dashboard

- **GDP Trend Analysis:** 5-Year historical GDP visualization using World Bank API data (Canvas rendered).
- **Macro Indicators:** Inflation (CPI), Unemployment, Central Bank Rate, Government Debt (% of GDP).
- **Major Exports:** AI-generated list of primary export commodities.
- **Sovereign Data Grid:** Population, Gini Index, Demonym, Area calculations.

### 8. 🎙️ Voice Command Module

Hands-free navigation using the `SpeechRecognition` API:

- _"Go to [Country Name]"_ → Vectors map to target sector.
- _"Analyze"_ → Triggers AI tactical briefing.
- _"News"_ → Switches display to the signal feed.

### 9. ⌨️ Keyboard Shortcuts

Power user navigation with full keyboard control:

- `/` → Open country search.
- `?` → Show keyboard shortcuts overlay.
- `P` → Toggle 2D/3D projection.
- `R` → Reset map view.
- `Ctrl+I` → Navigate to India (home base).
- `Esc` → Close overlays.

### 10. 🔊 Immersive Audio Engine

- **Procedural Ambience:** Uses `AudioContext` oscillators to generate a dynamic "server room" hum (55Hz/110Hz).
- **Tactical UI Sounds:** Custom frequency ramps for hover, click, and success states (200Hz - 2kHz range).

---

## 📂 Architecture (Refactored Modular Design)

```text
/api                    -> Vercel Serverless Functions
   ├── ai.js            -> Groq Llama 3 handler
   ├── news.js          -> Deep-scan Web scraping proxy for live news
   ├── market.js        -> Unified crypto/forex/metals fetcher
   ├── geo.js           -> CountriesNow hierarchy fetcher
   └── weather.js       -> Open-Meteo proxy

/public
   ├── terminal.html    -> Main Application Shell
   ├── index.html       -> Landing Page
   ├── /js
   │   ├── app.js       -> Main Entry Point (Boot, Init, Map Logic)
   │   ├── /core        -> Core Utilities
   │   │   ├── audio.js    -> Sound Engine
   │   │   └── firebase.js -> Auth & DB setup
   │   ├── /modules     -> Feature Modules
   │   │   ├── map-engine.js -> Map Rendering logic
   │   │   ├── geography.js  -> Drill-down Logic & Feature Layers
   │   │   ├── markets.js    -> Financial Data Logic
   │   │   ├── economics.js  -> GDP & Macro Data
   │   │   ├── news.js       -> Feed Manager
   │   │   ├── weather.js    -> Atmosphere & Telemetry Logic
   │   └── /ui          -> UI Components
   │       ├── search.js     -> Global Search Interface
   │       └── about.js      -> System Stats & CLI
   └── /css
       └── landing.css  -> Tactical styling with glassmorphism
```

---

## 🎨 Design System

### **Typography**

- **Display Font:** Syne (Bold, Black weights)
- **Monospace/Data:** JetBrains Mono (300-700 weights)

### **Color Palette**

```css
--blue: #3b82f6 /* Primary accent */ 
--cyan: #06b6d4 /* Secondary accent */
--emerald: #10b981 /* Success/Active states */ 
--red: #ef4444 /* Alerts/Critical */ 
--amber: #f59e0b /* Warnings */ 
--bg: #020617 /* Deep slate background */
```

---

## 📦 Tailwind CSS

The app uses the **Tailwind CDN** (`cdn.tailwindcss.com`) for quick local development. The browser may show: *"cdn.tailwindcss.com should not be used in production."* For production (e.g. Vercel), either:

- Keep using the CDN (simplest; the warning is a recommendation), or  
- Install Tailwind as a dependency and build a static CSS file: see [Tailwind installation](https://tailwindcss.com/docs/installation).

---

## 🚀 Performance

- **60 FPS** animations using `requestAnimationFrame`
- **Canvas-based rendering** for particle effects (GPU-accelerated)
- **Modular Logic** - JS split into micro-modules for better maintainability and caching

---

## 🔒 Security Features

- **Firebase Authentication** with Google OAuth
- **Anonymous sign-in** for guest access
- **Session tokenization** for secure API calls
- **Environment variables** for protected backends (Vercel)

---

## 👨‍💻 Author

**Abhishek Sati**
Lead Systems Architect | Full-Stack Developer

- [GitHub](https://github.com/abhisheksati132)
- [LinkedIn](https://www.linkedin.com/in/abhisheksati132)
- [Instagram](https://www.instagram.com/satiabhishek/)

---

## 📄 License

MIT License - Feel free to use this project for learning and portfolio purposes.
