export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  let firebase = {};
  const raw = process.env.NEXT_PUBLIC_FIREBASE_CONFIG || process.env.FIREBASE_CONFIG || "";
  
  if (raw && typeof raw === "string") {
    try {
      let clean = raw.trim();
      if ((clean.startsWith("'") && clean.endsWith("'")) || (clean.startsWith('"') && clean.endsWith('"') && !clean.includes('{"'))) {
        clean = clean.slice(1, -1);
      }
      firebase = JSON.parse(clean);
    } catch (e) {
      try {
        const unescaped = raw.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        firebase = JSON.parse(unescaped);
      } catch (err2) {
        console.warn("Invalid FIREBASE_CONFIG JSON:", e.message);
      }
    }
  }

  // Fallback to individual env vars if object is empty
  if (!firebase.apiKey && process.env.FIREBASE_API_KEY) {
    firebase = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || (process.env.FIREBASE_PROJECT_ID ? `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com` : ""),
      projectId: process.env.FIREBASE_PROJECT_ID || "",
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || (process.env.FIREBASE_PROJECT_ID ? `${process.env.FIREBASE_PROJECT_ID}.appspot.com` : ""),
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.FIREBASE_APP_ID || ""
    };
  }

  const mapboxToken = process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN || "";

  res.status(200).json({
    firebase,
    mapboxToken: mapboxToken || null,
    realtime: { enabled: process.env.SOCKET_IO_ENABLED === "true" }
  });
}
