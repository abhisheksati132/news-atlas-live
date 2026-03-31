# 🌐 NewsAtlas Intelligence Terminal

**The Final Frontier of Real-Time Global Telemetry & Intelligence.**

[![Status](https://img.shields.io/badge/Operational-Active-emerald.svg?style=flat-square)](https://news-atlas-live.vercel.app/)
[![Platform](https://img.shields.io/badge/Infrastructure-Vercel-black.svg?style=flat-square)](https://news-atlas-live.vercel.app/)
[![Engine](https://img.shields.io/badge/Core-Hybrid_Stack-blue.svg?style=flat-square)](https://news-atlas-live.vercel.app/)

---

## 🎯 Mission Purpose
NewsAtlas was engineered to solve "Information Overload." Instead of browsing 10 different sites for news, weather, and markets, the **Intelligence Terminal** aggregates and correlates global signals into a unified, high-density tactical interface. 

It is designed for **Situational Awareness**—allowing an operator to click anywhere on the globe and receive an immediate 10-point strategic briefing and real-time data uplink.

---

## 🏗️ The Tech Stack (What does What?)

We utilized a **Hybrid Architecture** to balance extreme performance with high-interactivity.

| Technology | Tactical Role | Why? |
| :--- | :--- | :--- |
| **Mapbox GL JS v3** | **Geospatial Engine** | Renders the 3D globe and terrain with hardware acceleration. |
| **Vanilla JavaScript** | **Data Pipeline** | Handles news, weather, and market fetches directly to keep the UI from "lagging." |
| **React 19** | **Interactive Components** | Powers the AI Chat Assistant and stateful widgets in the "About" overlay. |
| **Groq AI (Llama 3.3)** | **The Intelligence Engine** | Generates the 10-sector strategic briefings for every country in < 2 seconds. |
| **Vercel Serverless** | **Uplink Bridge** | Connects the frontend to secure APIs (News, Stocks, AI) without exposing keys to the public. |
| **Vite** | **Flight Control** | Blazing-fast development server and optimized production builds. |

---

## 📡 The Hybrid Engine: Vanilla + React
We made a conscious design decision to use a **Hybrid Layout**:
*   **The Main Rig (Vanilla JS)**: The primary dashboard, tabs, and map logic are written in pure JavaScript. This ensures that when you rotate the map, the CPU doesn't get bogged down by heavy framework overhead (no virtual-DOM lag).
*   **The Smart Islands (React)**: The AI Chat and complex data modals are built with React. This allows for smooth, modern "message bubbles" and state management where Vanilla JS would become messy.

---

## 📊 Core Intelligence Streams

### 1. **Intelligence Sector (AI Summary)**
*   **10-Point Sweep**: Every country generates a customized SITREP covering Politics, Energy, Economy, Infrastructure, and more.
*   **Automatic Briefing**: Triggers instantly upon country selection or search.

### 2. **Financial Telemetry (Markets)**
*   **Regional Indices**: Personalized for the target sector (e.g., NIFTY 50 for India, NIKKEI 225 for Japan).
*   **Commodity Tracker**: Real-time spots for Gold, Silver, and Brent Crude.

### 3. **Economic Tracking (Sector Data)**
*   **Macro Indicators**: Detailed situational reports for GDP growth, Debt-to-GDP ratios, and regional inflation metrics.
*   **Tactical Comparisons**: Balanced snapshots of national vs. global economic health.

### 4. **Signal Feed (News)**
*   **Regional Focus**: Automatically filters intelligence based on your target mission sector.
*   **Sentiment Analysis**: Signals are tagged as **CRITICAL**, **NEUTRAL**, or **POSITIVE** based on automated tone detection.

### 5. **Atmospheric Sector (Weather)**
*   **Tactical Weather**: Precision hourly uV, Air Quality, and wind vectors for any global mission coordinate.

---

## 📂 Systems Architecture

```text
news-atlas-live/
├── api/                  # The Bridge (Backend Relay)
│   ├── ai.js             # Groq AI Orchestrator
│   ├── news.js           # Signal Feed Aggregator
│   ├── markets.js        # Financial Data Proxy
│   ├── weather.js        # Atmospheric Uplink
│   └── countries.js      # Global Geo-Registry
├── public/               # The Hull (Static Assets)
│   ├── css/style.css     # Global Design System
│   └── js/               # The Data Pilot (Main Logic)
│       ├── app.js        │  ui.js
│       ├── enhancements.js
│       └── modules/      # Tactical Signal Processors
│           ├── mapbox-engine.js 
│           ├── news.js
│           ├── markets.js
│           ├── economics.js
│           ├── weather.js
│           └── geography.js
├── src/                  # The Smart Systems (React)
│   └── main.jsx          # AI Assistant & Component Mounting
└── index.html            # The Mission Control Entry Point
```

---

## 🛠️ Local Operational Setup
1. **Clone the Mission Workspace**
2. **Initialize Dependencies**: `npm install`
3. **Environment Sync**: Create a `.env` with:
   - `GROQ_API_KEY`: For the Intelligence Engine.
   - `NEWS_API_KEY`: For the Signal Feed.
   - `MAPBOX_TOKEN`: For the Geospatial Engine.
4. **Ignition**: `npm run dev`

---

## 📄 Operational Credits
Command & Control by **Abhishek Sati**.
Built for the next generation of global information operators.
