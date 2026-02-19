# 🌍 NewsAtlas | Global Intelligence Terminal
### A Full-Stack Geospatial Intelligence Platform with Web3-Style Visual Effects
**Live Demo:** [https://news-atlas-live.vercel.app](https://news-atlas-live.vercel.app)

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
  - **News:** NewsData.io / GNews (Live Filtering)
  - **Weather:** Open-Meteo High-Precision API with tactical estimation algorithms
  - **Finance:** CoinGecko (Crypto), GoldAPI (Metals), Open Exchange Rates (Forex), World Bank API (GDP)
  - **Geo:** REST Countries API v3.1 + CountriesNow API (Drill-down)
  - **Satellite:** NASA GIBS (Real-time WMS Overlay)

---

## ⚡ Key Features

### 1. 🛰️ Orbital Map Interface
* **Dual Projection:** Seamless switching between **Tactical Blueprint (2D)** and **Orthographic Globe (3D)** modes
* **NASA Satellite Layer:** Real-time WMS overlay using NASA's GIBS Blue Marble data
* **Vector Tooltips:** Interactive hover states displaying sector sovereignty data
* **Holographic Country Glow:** Triple-layer neon glow effects on hover with pulsing animations

### 2. 🗺️ Deep-Dive Geography Engine
* **Hierarchical Navigation:** Drill down from **Country** → **State/Province** → **City** level
* **Smart Breadcrumbs:** Real-time tracking of current geographical context
* **Location Intelligence:** Auto-fetches weather and news for specific grid coordinates of selected cities

### 3. 🎨 Visual Effects
* **Particle Network Overlay:** 50+ floating nodes with dynamic connections that follow mouse movement using Canvas API
* **Traffic Pattern Canvas:** Real-time network traffic visualization in the About section
* **Smooth Camera Controls:** Buttery 60fps zoom/pan with cubic-bezier easing

### 4. 🧠 AI-Powered Intelligence
* **Strategic Metrics Dashboard:** Generates a 10-point high-density dossier for any selected country, analyzing:
    * *Gov Stability & Border Integrity*
    * *Cyber Threat Levels*
    * *Civil Unrest & Military Readiness*
    * *Energy Reserves & Supply Chain Status*
* **Structured Briefings:** Neural synthesis of "Political Overview", "Security Assessment", and "Economic Outlook"
* **Context-Aware Fallbacks:** Robust simulation engine ensures the terminal provides immersive "Cached Intelligence" even when offline or API limits are hit

### 5. 📉 Real-Time Market Telemetry
* **Crypto Command:** Live prices for BTC, ETH with market cap and 24h change
* **Forex Uplink:** Real-time currency exchange rates against base currency (USD)
* **Precious Metals:** Live Spot Gold (XAU), Silver (XAG), Platinum (XPT), Palladium (XPD)
* **Commodities:** Oil, Gas, and Agricultural spot prices

### 6. 📊 Economic Intelligence Dashboard
* **GDP Trend Analysis:** 5-Year historical GDP visualization using World Bank API data (Canvas rendered)
* **Macro Indicators:** Inflation (CPI), Unemployment, Central Bank Rate, Government Debt (% of GDP)
* **Major Exports:** AI-generated list of primary export commodities
* **Sovereign Data Grid:** Population, Gini Index, Demonym, Area

### 7. 🎙️ Voice Command Module
Hands-free navigation using the `SpeechRecognition` API:
* *"Go to [Country Name]"* → Vectors map to target sector
* *"Analyze"* → Triggers AI tactical briefing
* *"News"* → Switches display to the signal feed

### 8. ⌨️ Keyboard Shortcuts
Power user navigation with full keyboard control:
* `/` → Open country search
* `?` → Show keyboard shortcuts overlay
* `P` → Toggle 2D/3D projection
* `R` → Reset map view
* `Ctrl+I` → Navigate to India (home base)
* `Esc` → Close overlays

### 9. 🔊 Immersive Audio Engine
* **Procedural Ambience:** Uses `AudioContext` oscillators to generate a dynamic "server room" hum (55Hz/110Hz)
* **Tactical UI Sounds:** Custom frequency ramps for hover, click, and success states (200Hz - 2kHz range)

---

## 📂 Architecture (Refactored Modular Design)

```text
/api                    -> Vercel Serverless Functions
   ├── ai.js            -> Groq Llama 3 handler
   ├── news.js          -> News aggregation proxy
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
   │   │   └── firebase.js -> Auth & DB
   │   ├── /modules     -> Feature Modules
   │   │   ├── map-engine.js -> Visual Effects (Particles)
   │   │   ├── geography.js  -> Drill-down Logic
   │   │   ├── markets.js    -> Financial Data Logic
   │   │   ├── economics.js  -> GDP & Macro Data
   │   │   ├── news.js       -> Feed Manager
   │   │   ├── weather.js    -> Atmosphere Logic
   │   └── /ui          -> UI Components
   │       ├── search.js     -> Global Search Overlay
   │       └── about.js      -> System Stats & CLI
   └── /css
       └── terminal.css -> Tactical styling with glassmorphism
```

---

## 🎨 Design System

### **Typography**
* **Display Font:** Syne (Bold, Black weights)
* **Monospace/Data:** JetBrains Mono (300-700 weights)

### **Color Palette**
```css
--blue:    #3b82f6  /* Primary accent */
--cyan:    #06b6d4  /* Secondary accent */
--emerald: #10b981  /* Success/Active states */
--red:     #ef4444  /* Alerts/Critical */
--amber:   #f59e0b  /* Warnings */
--bg:      #020617  /* Deep slate background */
```

---

## 🚀 Performance
* **60 FPS** animations using `requestAnimationFrame`
* **Canvas-based rendering** for particle effects (GPU-accelerated)
* **Modular Logic** - JS split into micro-modules for better maintainability and caching

---

## 🔒 Security Features
* **Firebase Authentication** with Google OAuth
* **Anonymous sign-in** for guest access
* **Session tokenization** for secure API calls
* **Environment variables** for API keys (Vercel)

---

## 👨‍💻 Author
**Abhishek Sati**
Lead Systems Architect | Full-Stack Developer

* [GitHub](https://github.com/abhisheksati132)
* [LinkedIn](https://www.linkedin.com/in/abhisheksati132)
* [Instagram](https://www.instagram.com/satiabhishek/)

---

## 📄 License
MIT License - Feel free to use this project for learning and portfolio purposes.
