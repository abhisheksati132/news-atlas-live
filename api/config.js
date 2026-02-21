/**
 * Serves public client config from env (e.g. Firebase).
 * Use NEXT_PUBLIC_FIREBASE_CONFIG or FIREBASE_CONFIG in Vercel as a JSON string.
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  let firebase = {};
  const raw =
    process.env.NEXT_PUBLIC_FIREBASE_CONFIG || process.env.FIREBASE_CONFIG || "";
  if (raw && typeof raw === "string") {
    try {
      firebase = JSON.parse(raw);
    } catch (e) {
      console.warn("Invalid FIREBASE_CONFIG JSON:", e.message);
    }
  }

  res.status(200).json({ firebase });
}
