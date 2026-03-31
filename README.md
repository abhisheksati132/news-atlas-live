# 🌐 NewsAtlas Intelligence Dashboard

**Professional Real-Time Global Telemetry & Intelligence Terminal**

[![Deployment](https://img.shields.io/badge/Status-Live-emerald)](https://news-atlas-live.vercel.app/)
[![Vercel](https://img.shields.io/badge/Platform-Vercel-black)](https://news-atlas-live.vercel.app/)

NewsAtlas is a high-performance, symmetric dashboard designed for global situational awareness. It aggregates real-time world news, financial telemetry, and atmospheric data into a unified, high-contrast terminal interface.

**Live Terminal:** [https://news-atlas-live.vercel.app/](https://news-atlas-live.vercel.app/)

---

## ⚡ Core Features

### 📡 Global Signal Feed (Intelligence)
- **Real-Time Briefings:** AI-generated situational assessments for any selected country, state, or city using **Groq AI (Llama 8B/70B)**.
- **Aggregated News:** Live, searchable news feeds powered by **NewsAPI.org**, categorized by topic and regional impact.
- **Rich Media Integration:** High-fidelity imagery and descriptive summaries for each situation report.
- **Strategic Summaries:** Automated analyst-style reports that strip away the noise and focus on strategic highlights.

### 📉 Financial Intelligence (Markets)
- **Live Metal Prices (Gold, Silver, Platinum, Palladium):** Real-time spot prices in your local currency.
- **Global Indices:** Tracking major stock market benchmarks (S&P 500, NASDAQ, FTSE).
- **Forex & Commodities:** Live currency pairs and critical commodity tracking (Brent Crude, Natural Gas).
- **Consolidated Portfolio Terminal:** Unified high-density display of all market sectors.

### 🌡️ Atmospheric Telemetry (Weather)
- **Micro-Targeted Weather:** Precision data for any global sector, including temperature, wind gusts, and humidity.
- **Air Quality & UV:** Real-time health advisories based on current environmental conditions.
- **Visual Forecasts:** 24-hour hourly and 7-day daily forecasts with automated condition updates.

### 🗺️ Precision Mapping
- **Mapbox GL Integration:** High-performance geospatial interface with seamless zoom and pan.
- **Tactical Navigation:** Centralized 5-tab shortcuts for Monitor, Intel, Markets, Atmosphere, and Terminal.
- **Orbital Centering:** Auto-centered globe physics for balanced situational awareness.
- **3D Buildings:** Real-time 3D extrusion of cities at high zoom levels.

---

## 📂 Project Structure

```text
news-atlas-live/
├── api/                  # Vercel Serverless Functions (Backend)
│   ├── markets.js        # Market Data Aggregation
│   ├── news.js           # NewsAPI.org Integration
│   ├── weather.js        # Open-Meteo Integration
│   └── ai.js             # Groq AI Orchestration
├── public/               # Static Assets
│   ├── css/
│   │   └── style.css     # Global Design System
│   └── js/
│       ├── app.js        # Main Application Logic
│       ├── ui.js         # Navigation & Tab Handling
│       └── modules/      # Tactical Feature Modules
│           ├── mapbox-engine.js  # Geo-Physical Engine
│           ├── markets.js        # Financial Module
│           ├── news.js           # Intelligence Module
│           └── weather.js        # Atmospheric Module
├── index.html            # Primary Terminal Entry
├── vercel.json           # Tactical Deployment Configuration
└── README.md             # Systems documentation
```

---

## 🛠️ Technology Stack

- **Frontend Core:** HTML5, Vanilla JavaScript (ES6+), React 18 (Hybrid integration)
- **Styling Engine:** Vanilla CSS3 with **Modern Rounded Aesthetic** (12px border-radius)
- **Mapping:** Mapbox GL JS v3.0+
- **Backend Infrastructure:** Node.js / Express (Vercel Serverless Architecture)
- **AI Engine:** Groq API (LLM Orchestration)
- **Data Providers:**
  - **News:** NewsAPI.org
  - **Meteorological:** Open-Meteo API
  - **Finance:** Alpha-Vantage, metals-api
  - **Geocoding:** Reverse-geocoding via Mapbox & Open-Meteo

---

## 🚀 Environment Configuration

To run this platform locally, create a `.env` file in the root directory with the following keys:

```env
GROQ_API_KEY=your_groq_key
NEWS_API_KEY=your_news_api_org_key
MAPBOX_TOKEN=your_mapbox_public_token
```

---

## 📄 Operational Credits
Created by **Abhishek Sati**.
Designed for maximum information density, symmetry, and real-time responsiveness.
