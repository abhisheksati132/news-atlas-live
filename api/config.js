export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  let firebase = {};
  
  // Note: FIREBASE_CONFIG exposed below only contains safe public mapping keys 
  // (projectId, appId, apiKey) required to initialize the Firebase Client SDK.
  // It does NOT expose Service Account keys or admin credentials.
  const raw = process.env.NEXT_PUBLIC_FIREBASE_CONFIG || process.env.FIREBASE_CONFIG || "";
  
  if (raw && typeof raw === "string") {
    try {
      firebase = JSON.parse(raw);
    } catch (e) {
      console.warn("Invalid FIREBASE_CONFIG JSON:", e.message);
    }
  }
  const mapboxToken = process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN || "";

  res.status(200).json({
    firebase,
    mapboxToken: mapboxToken || null,
    realtime: { enabled: process.env.SOCKET_IO_ENABLED === "true" }
  });
}
