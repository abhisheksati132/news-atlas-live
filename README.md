# 🌍 NewsAtlas | Global Intelligence Terminal

### A Full-Stack Geospatial Intelligence Platform
**Live Demo:** [https://news-atlas-live.vercel.app](https://news-atlas-live.vercel.app)

## 🚀 Project Overview
NewsAtlas is a Single Page Application (SPA) designed to visualize global data streams. It aggregates real-time news, financial metrics, weather telemetry, and Generative AI briefings into a unified 3D "Command Terminal" interface.

## 🛠 Tech Stack (MERN / Serverless Architecture)
- **Frontend:** HTML5, Tailwind CSS, D3.js (Geospatial Visualization), TopoJSON.
- **Backend:** Node.js (Vercel Serverless Functions).
- **Database/Auth:** Google Firebase (Firestore & Authentication).
- **AI Core:** Google Gemini 1.5 Flash (Generative Intelligence).
- **APIs:** NewsData.io (Live Feeds), Open-Meteo (Atmospheric Data).

## ⚡ Key Features
1.  **3D Orbital Interface:** Interactive D3.js globe with click-to-target functionality.
2.  **Server-Side Security:** API keys (Gemini, News) are hidden behind Node.js proxy endpoints (`/api/*`).
3.  **Generative Briefings:** AI dynamically generates "Tactical Situation Reports" for any selected country.
4.  **Real-Time Telemetry:** Live currency exchange rates and weather conditions.
5.  **Terminal Aesthetics:** Fully responsive Glassmorphism UI with "Sci-Fi" sound design.

## 📂 Architecture
/api        -> Serverless Backend Endpoints
/public     -> Frontend Assets
firebase.js -> Database Configuration
