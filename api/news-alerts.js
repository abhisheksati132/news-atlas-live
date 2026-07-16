export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const alerts = [
    { title: "FLASH: Coordinated infrastructure funding pact signed between US and India.", type: "success" },
    { title: "ALERT: High volatility signatures detected in maritime shipping channels.", type: "error" },
    { title: "INTEL: Diplomatic hotline communication channels reopened in Europe.", type: "info" }
  ];

  const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
  return res.status(200).json(randomAlert);
}
