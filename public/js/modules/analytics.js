// Central analytics: subscribes to store changes so tracking stays in one place.
// Plausible script is loaded in index.html; all calls no-op safely when blocked/absent.

export function trackEvent(name, props) {
  try {
    if (typeof window !== "undefined" && typeof window.plausible === "function") {
      if (props) window.plausible(name, { props });
      else window.plausible(name);
    }
  } catch (e) {
    // Analytics must never break the app
  }
}

window.trackEvent = trackEvent;

function initAnalytics() {
  if (!window.store || typeof window.store.on !== "function") return;

  let firstTab = true;
  window.store.on("tab", (tab) => {
    // Skip the initial default tab — only track user-initiated switches
    if (firstTab) {
      firstTab = false;
      return;
    }
    trackEvent("tab-switch", { tab });
  });

  window.store.on("country", (country) => {
    if (country) trackEvent("country-select", { country });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAnalytics);
} else {
  initAnalytics();
}
