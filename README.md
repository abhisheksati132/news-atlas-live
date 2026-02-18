# 🌍 NewsAtlas | Global Intelligence Terminal
### A Full-Stack Geospatial Intelligence Platform with Web3-Style Visual Effects
**Live Demo:** [https://news-atlas-live.vercel.app](https://news-atlas-live.vercel.app)

---

## 🚀 Project Overview
NewsAtlas is a cutting-edge Single Page Application (SPA) that transforms global data streams into an immersive "Command Terminal" experience. It aggregates real-time news, financial metrics, and weather telemetry, enhanced with Generative AI to produce detailed situation reports. The platform features a cinematic boot sequence, procedural audio ambience, god-tier visual effects (particle networks, matrix rain, holographic glow), and a seamless 2D/3D orbital interface inspired by Web3 dashboards like Etherscan and Dune Analytics.

---

## 🛠 Tech Stack (MERN / Serverless Architecture)
- **Frontend:** HTML5, Tailwind CSS, D3.js (Geospatial Visualization), TopoJSON, Canvas API (Particle Physics)
- **Core Logic:** Vanilla JavaScript (ES6+), Web Audio API (Procedural Sound), Web Speech API
- **Backend:** Node.js (Vercel Serverless Functions)
- **Database/Auth:** Google Firebase (Firestore & Authentication with Google OAuth)
- **AI Core:** **Groq Cloud** (Llama 3-70b-versatile) for ultra-fast, high-density intelligence synthesis
- **Data Streams:** 
  - **News:** NewsData.io / GNews
  - **Weather:** Open-Meteo High-Precision API with tactical estimation algorithms
  - **Finance:** Open Exchange Rates + Real-time Simulated Ticker Engine
  - **Geo:** REST Countries API v3.1

---

## ⚡ Key Features

### 1. 🛰️ Orbital Map Interface
* **Dual Projection:** Seamless switching between **Tactical Blueprint (2D)** and **Orthographic Globe (3D)** modes
* **Satellite Layer:** One-click toggle to high-contrast "Satellite Thermal" mode with **animated starfield background**
* **Vector Tooltips:** Interactive hover states displaying sector sovereignty data
* **Holographic Country Glow:** Triple-layer neon glow effects on hover with pulsing animations
* **Data Flow Lines:** Animated curved connections showing data routes between selected country and major global hubs

### 2. 🎨 God-Tier Visual Effects (NEW)
* **Particle Network Overlay:** 50+ floating nodes with dynamic connections that follow mouse movement using Canvas API
* **Matrix Rain Effect:** Japanese/binary character waterfall animation (configurable opacity)
* **Hexagonal Grid:** Futuristic SVG overlay pattern with configurable density
* **Pulsing Data Nodes:** 10 major cities (NY, London, Tokyo, Singapore, etc.) with expanding ripple effects
* **Live Stats Ticker:** Auto-scrolling global metrics bar (GDP, crypto market cap, active markets, global temp)
* **Smooth Camera Controls:** Buttery 60fps zoom/pan with cubic-bezier easing
* **Enhanced Glassmorphism:** Backdrop blur effects with frosted glass panels throughout UI

### 3. 🧠 Llama-3 Powered Intelligence
* **Strategic Metrics Dashboard:** Generates a 10-point high-density dossier for any selected country, analyzing:
    * *Gov Stability & Border Integrity*
    * *Cyber Threat Levels*
    * *Civil Unrest & Military Readiness*
    * *Energy Reserves & Supply Chain Status*
* **Context-Aware Fallbacks:** Robust simulation engine ensures the terminal provides immersive "Cached Intelligence" even when offline or API limits are hit
* **Neural Synthesis Display:** Real-time AI briefing with JetBrains Mono typography and typing cursor animation

### 4. 📉 Real-Time Market Telemetry
* **Live Ticker:** Scrolling electronic ticker displaying real-time volatility for major global indices (S&P 500, BTC, GOLD, OIL)
* **AI Financial Analyst:** Extracts specific commodities pricing (Gold/Silver) and generates a "Strategic Analysis" summary of global market sentiment
* **Market Intel Cards:** Glass-panel styled data cards with gradient progress bars

### 5. 🎙️ Voice Command Module
Hands-free navigation using the `SpeechRecognition` API:
* *"Go to [Country Name]"* → Vectors map to target sector
* *"Analyze"* → Triggers AI tactical briefing
* *"News"* → Switches display to the signal feed

### 6. ⌨️ Keyboard Shortcuts (NEW)
Power user navigation with full keyboard control:
* `/` → Open country search
* `?` → Show keyboard shortcuts overlay
* `P` → Toggle 2D/3D projection
* `R` → Reset map view
* `Ctrl+I` → Navigate to India (home base)
* `Esc` → Close overlays

### 7. 🔊 Immersive Audio Engine
* **Procedural Ambience:** Uses `AudioContext` oscillators to generate a dynamic "server room" hum (55Hz/110Hz)
* **Tactical UI Sounds:** Custom frequency ramps for hover, click, and success states (200Hz - 2kHz range)

### 8. 🌦️ Advanced Weather Visualization
* **Live Telemetry Card:** 72px temperature display with animated weather icons
* **Solar Cycle Arc:** Sunrise/sunset visualization with animated path
* **24-Hour Projection:** Horizontal scroll of hourly forecasts
* **Comprehensive Metrics Grid:** Wind (compass rose), UV Index (gradient bar), Humidity, Visibility, Pressure, Lunar Phase, Cloud Ceiling, 24h Precipitation
* **7-Day Tactical Outlook:** Detailed weekly forecast with icons and precipitation probability

### 9. 📊 Economic Intelligence Dashboard
* **GDP Card:** Large-format display with growth rate and per capita calculations
* **Forex Uplink:** Real-time currency exchange rates with animated progress bars
* **Economic Indicators:** Inflation (CPI), Unemployment, Central Bank Rate, Government Debt (% of GDP)
* **Major Exports:** AI-generated list of primary export commodities
* **Sovereign Data Grid:** Population, Gini Index, Demonym, Area

---

## 🎮 Interactive Controls

### **Map Control Panel**
* **SAT Toggle** → Switch to satellite mode with stars
* **Zoom +/-** → Precise zoom control
* **Reset View** → Return to global center
* **Projection Toggle** → Switch between 2D/3D

### **God-Tier Effect Toggles** (Bottom-right)
* 🔵 **Particles** → Toggle particle network on/off
* 🔢 **Matrix** → Toggle matrix rain on/off
* 🔲 **Hex Grid** → Toggle hexagon overlay on/off
* 📍 **Data Nodes** → Toggle city markers on/off

---

## 📂 Architecture

```text
/api                    -> Vercel Serverless Functions (AI, News, Weather)
   ├── ai.js            -> Context-aware Groq handler (JSON/Text switching)
   ├── news.js          -> News aggregation proxy
   └── weather.js       -> Safe-parameter weather fetcher

/public
   ├── terminal.html    -> Main application (D3 Engine, UI Logic, State Management)
   ├── index.html       -> Landing page with tactical sci-fi aesthetic
   ├── login.html       -> Firebase authentication page
   ├── /js
   │   ├── app.js       -> Core application logic
   │   └── map-godtier.js -> God-tier visual effects engine (650+ lines)
   └── /css
       └── terminal.css -> Tactical styling with glassmorphism

firebase.js             -> Database & Auth Configuration
```

---

## 🎨 Design System

### **Typography**
* **Display Font:** Syne (Bold, Black weights)
* **Monospace/Data:** JetBrains Mono (300-700 weights)
* **All-caps Labels:** 0.15em-0.3em letter-spacing

### **Color Palette**
```css
--blue:    #3b82f6  /* Primary accent */
--cyan:    #06b6d4  /* Secondary accent */
--emerald: #10b981  /* Success/Active states */
--red:     #ef4444  /* Alerts/Critical */
--amber:   #f59e0b  /* Warnings */
--bg:      #020617  /* Deep slate background */
```

### **Visual Effects**
* Scanlines overlay (4px repeating gradient)
* Noise texture (SVG filter, 0.32 opacity)
* Grid background (48px×48px, blue tint)
* Corner brackets on feature cards
* Glow effects (3-layer drop-shadow)
* Pulse animations (2s infinite)

---

## 🚀 Performance

* **60 FPS** animations using `requestAnimationFrame`
* **Canvas-based rendering** for particle effects (GPU-accelerated)
* **Lazy loading** - God-tier effects initialize after map loads (2s delay)
* **Responsive design** - Mobile-optimized with reduced particle count
* **Lighthouse Score:** ~85+ (Performance), ~95+ (Accessibility)

---

## 🔒 Security Features

* **Firebase Authentication** with Google OAuth
* **Anonymous sign-in** for guest access
* **Session tokenization** for secure API calls
* **Environment variables** for API keys (Vercel)
* **CORS-enabled** API endpoints

---

## 📱 Browser Support

* ✅ Chrome 90+
* ✅ Firefox 88+
* ✅ Safari 14+
* ✅ Edge 90+
* ⚠️ Mobile: Optimized with reduced effects

---

## 🎯 Key Innovations

1. **Dual-Mode Visualization:** Seamless 2D/3D projection switching with D3.js
2. **Real-Time AI Synthesis:** Sub-second country briefings using Groq's Llama 3
3. **Procedural Audio:** Dynamic soundscape generation using Web Audio API
4. **God-Tier Effects:** Web3-inspired particle physics and holographic UI
5. **Voice Control:** Hands-free navigation with speech recognition
6. **Tactical Aesthetic:** Military command center design language
7. **Smart Fallbacks:** Graceful degradation with simulated data when APIs fail

---

## 🌟 What Makes This Unique

* **No frameworks:** Pure vanilla JavaScript (no React/Vue/Angular)
* **Single-file power:** Core app logic in one HTML file for ultimate portability
* **Canvas mastery:** Complex particle physics and animations
* **D3.js expertise:** Advanced geospatial projections and interactions
* **Audio engineering:** Procedural sound synthesis from scratch
* **AI integration:** Real-time LLM inference with smart caching
* **Web3 aesthetics:** Cutting-edge visual design inspired by crypto dashboards

---

## 🔮 Future Enhancements

- [ ] WebSocket integration for true real-time data streaming
- [ ] Three.js 3D globe with texture mapping
- [ ] Push notification system for breaking events
- [ ] Heat map mode (color countries by GDP/population/temperature)
- [ ] Multi-language support (i18n)
- [ ] Export reports (PDF/Excel)
- [ ] Dark/Light mode toggle
- [ ] User favorites and search history

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

---

## 🙏 Acknowledgments

* D3.js community for geospatial visualization tools
* Groq for ultra-fast AI inference
* Firebase for seamless authentication
* Open-Meteo for high-quality weather data
* Inspired by: Etherscan, Dune Analytics, Zapper, and military command interfaces

---

**⚡ Built with vanilla JavaScript. Powered by AI. Designed for the future.**
