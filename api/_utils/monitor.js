// Shared backend error monitoring. Lazy-loads @sentry/node only when
// SENTRY_DSN is set, so there's zero cost otherwise. Safe to call from
// both Express (server.js) and Vercel serverless handlers.

let sentry = null;
let initAttempted = false;

async function getSentry() {
  if (sentry || initAttempted) return sentry;
  initAttempted = true;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return null;
  try {
    const mod = await import("@sentry/node");
    mod.init({ dsn, environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development" });
    sentry = mod;
  } catch {
    sentry = null;
  }
  return sentry;
}

export async function captureError(err, context = {}) {
  try {
    const client = await getSentry();
    if (client) client.captureException(err, { extra: context });
    else console.error(`[${context.handler || "api"}]`, err?.message || err);
  } catch {
    // Monitoring must never break request handling
  }
}

export function initMonitoring() {
  getSentry();
}
