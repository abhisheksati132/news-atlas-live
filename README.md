# 🌍 NewsAtlas | Global Intelligence Terminal

### A Full-Stack Geospatial Intelligence Platform with Web3-Style Visual Effects

**Live Demo:** [https://news-atlas-live.vercel.app](https://news-atlas-live.vercel.app)

---

---

## 🚀 Project Overview

NewsAtlas is a cutting-edge Single Page Application (SPA) that transforms global data streams into an immersive "Command Terminal" experience. It aggregates real-time news, financial metrics, and weather telemetry, enhanced with Generative AI to produce detailed situation reports. The platform features a cinematic boot sequence, procedural audio ambience, interactive particle networks, and a seamless 2D/3D orbital interface inspired by Web3 dashboards like Etherscan and Dune Analytics.

---

## 🛠 Tech Stack (Modern Full-Stack, Premium UI)

- Frontend: Vanilla JS + Vite, Tailwind CSS, D3.js (Geospatial Visualization), TopoJSON, Canvas (Particle effects), Inter + JetBrains Mono for typography
- UI/UX: Premium Apple-glass aesthetic with an accessible, high-density dashboard matrix
- Core Logic: Modern JS (ES2020+), Web Audio API (Procedural Sound), Web Speech API
- Backend/Platform: Node.js 20+ with Express; Dockerized microservices; Kubernetes readiness options
- Auth/DB: Firebase (Firestore & Google OAuth/Anonymous)
- AI Core: Groq Cloud (Llama 3-70b) for on-demand intelligence synthesis
- Data Streams & Integrations:
  - News & Events: GDELT, Live feed aggregation
  - Weather: Open-Meteo
  - Finance: CoinGecko (Crypto), Yahoo Finance (Metals/Forex/Indices), World Bank GDP
  - Geo & Seismology: REST Countries v3.1, USGS
  - Aviation: OpenSky
  - Satellite: NASA GIBS
- Data Access & Orchestration: REST APIs, WebSockets for live feeds, and server-side aggregations
- DevOps & Deployment: Dockerfiles for API/frontend, Docker Compose, Kubernetes manifests, and optional Ingress
- Security & Auth: Firebase Auth (Google OAuth/Anonymous)
- Observability: Health checks, logging, and basic instrumentation hooks
- Data Viz & UX patterns: Sparkline/ChartCard components, DataVizPanel, and a polished UX kit

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
- **Conversational Memory & Streamed AI:** Multi-turn AI chat interfaces with contextual awareness (feeding selected country and active layers to the prompt) via Groq streaming protocols.
- **Geopolitical Risk Index:** Real-time composite scoring algorithm combining GDELT conflict data and economic indicators into a 0-100 threshold mapped onto the 3D globe.

### 5. 📉 Real-Time Market Telemetry

- **Live WebSocket Integration:** Sub-second BTC/USDT price flashes piped directly from Binance into the top system ticker.
- **Global Indices Hub:** Live-tracking grids monitoring primary exchanges (S&P 500, NASDAQ, Dow Jones, FTSE 100, NIKKEI 225).
- **Crypto Command:** Live prices via CoinGecko, featuring an expandable dense-grid view of trending tokens and top-10 crypto assets by market capitalization.
- **Expanded Forex Uplink:** Continuous polling of over 16+ currency exchange rates dynamically baselined against USD.
- **Precious Metals & Commodities:** Live Spot Gold (XAU), Silver (XAG), Platinum (XPT), Palladium (XPD), Aluminum (ALI), Zinc (ZNC), alongside Copper, Crude Oil, and Natural Gas tracking.

### 6. 📰 Global Signal Intelligence & Time Scrubber

- **Real-time Server-Side Search:** Instantaneously fetches and cross-references active news events across a backend scraper.
- **GDELT Integration:** Monitors the Global Database of Events, Language, and Tone tracking granular conflict and political data point mutations.
- **Chronos Time Engine:** A temporal scrubber allowing analysts to rewind the system cache up to -72H, simulating past global intelligence states and filtering map events dynamically.

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
       ├── landing.css  -> Tactical styling with glassmorphism
       └── terminal.css -> Extracted core dashboard styles
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

## 📦 Tailwind CSS & Build Process

The application's styles and design tokens are compiled efficiently via the **Vite** build pipeline using `tailwind.config.js`. We deliberately migrated away from the heavy runtime Tailwind CDN scripts in favor of a locally bundled, pure Vanilla HTML/JS setup. This significantly improves bundle sizes, Initial Paint metrics, and cache reliability on edge networks like Vercel.

---

## 🚀 Performance

- Phase 5/6: Performance optimizations and production readiness in one go. Includes lazy loading, memoization, code-splitting, and a11y/SEO improvements. See PR_NOTES.md for full rollout details.

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
