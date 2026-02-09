# 🌍 NewsAtlas | Global Intelligence Terminal

### A Full-Stack Geospatial Intelligence Platform
**Live Demo:** [https://news-atlas-live.vercel.app](https://news-atlas-live.vercel.app)

## 🚀 Project Overview
NewsAtlas is a Single Page Application (SPA) designed to visualize global data streams. It aggregates real-time news, financial metrics, weather telemetry, and Generative AI briefings into a unified 3D "Command Terminal" interface. The system features a cinematic boot sequence and immersive audio to mimic a high-fidelity sci-fi operating system.

## 🛠 Tech Stack (MERN / Serverless Architecture)
- **Frontend:** HTML5, Tailwind CSS, D3.js (Geospatial Visualization), TopoJSON.
- **Core Logic:** Vanilla JavaScript (ES6+), Web Audio API (Procedural Sound), Web Speech API.
- **Backend:** Node.js (Vercel Serverless Functions).
- **Database/Auth:** Google Firebase (Firestore & Authentication).
- **AI Core:** Google Gemini 1.5 Flash (Generative Intelligence).
- **Data Streams:** - **News:** NewsData.io / GNews.
  - **Weather:** Open-Meteo High-Precision API.
  - **Finance:** Frankfurter API (Currency Exchange).
  - **Geo:** REST Countries API v3.1.

## ⚡ Key Features
1.  **3D Orbital Interface:** Interactive D3.js globe with seamless 2D/3D projection switching and hover-state vector tooltips.
2.  **Voice Command Module:** Hands-free navigation using the `SpeechRecognition` API.
    * *"Go to [Country Name]"* -> Vectors map to target.
    * *"Analyze"* -> Triggers Gemini AI tactical briefing.
    * *"News"* -> Switches display to the signal feed.
3.  **Generative Briefings:** AI dynamically generates "Tactical Situation Reports" for any selected sector, analyzing geopolitical context.
4.  **Immersive Ambience:** Procedural audio engine using `AudioContext` oscillators to generate a dynamic "server room" hum (55Hz/110Hz).
5.  **Cinematic Boot Sequence:** JavaScript-driven "System Initialization" overlay with simulated log outputs.
6.  **Server-Side Security:** API keys (Gemini, News) are securely proxied behind Node.js endpoints (`/api/*`).

## 📂 Architecture
```text
/api           -> Vercel Serverless Functions (AI, News, Weather)
/public        -> Static Assets (Icons, Images)
index.html     -> Core Logic (D3 Map, UI State, Event Listeners)
firebase.js    -> Database & Auth Configuration
