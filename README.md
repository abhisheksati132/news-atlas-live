# 🌐 NewsAtlas Intelligence Dashboard

**Professional Real-Time Global Telemetry & Intelligence Terminal**

NewsAtlas is a high-performance, symmetric dashboard designed for global situational awareness. It aggregates real-time world news, financial telemetry, and atmospheric data into a unified, high-contrast terminal interface.

---

## ⚡ Core Features

### 📡 Global Signal Feed (Intelligence)
- **Real-Time Briefings:** AI-generated situational assessments for any selected country, state, or city using **Groq AI (Llama 8B/70B)**.
- **Aggregated News:** Live, searchable news feeds powered by **NewsAPI.org**, categorized by topic and regional impact.
- **Strategic Summaries:** Automated analyst-style reports that strip away the noise and focus on strategic highlights.

### 📉 Financial Intelligence (Markets)
- **Live Metal Prices:** Real-time spot prices for Gold, Silver, Platinum, and Palladium in your local currency.
- **Global Indices:** Tracking major stock market benchmarks (S&P 500, NASDAQ, FTSE).
- **Forex & Commodities:** Live currency pairs and critical commodity tracking (Brent Crude, Natural Gas).
- **Automatic Refresh:** Data updates every 60 seconds to ensure telemetry accuracy.

### 🌡️ Atmospheric Telemetry (Weather)
- **Micro-Targeted Weather:** Precision data for any global sector, including temperature, wind gusts, and humidity.
- **Air Quality & UV:** Real-time health advisories based on current environmental conditions.
- **Visual Forecasts:** 24-hour hourly and 7-day daily forecasts with automated condition updates.
- **Solar/Lunar Cycles:** Tracking sunrise, sunset, and regional moon phases.

### 🗺️ Precision Mapping
- **Mapbox GL Integration:** High-performance, dark-mode geospatial interface with seamless zoom and pan.
- **Recursive Selection:** Click-to-select logic that transitions smoothly from global view to state and city-level data.
- **Interactivity:** Fully enabled map controls for tactical movement and data layer exploration.

---

## 🛠️ Technology Stack

- **Frontend Core:** HTML5, Vanilla JavaScript (ES6+), React 18 (Hybrid integration)
- **Styling Engine:** Vanilla CSS3 with **Symmetric Sharp-Edge Design** (0px border-radius enforced globally)
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

