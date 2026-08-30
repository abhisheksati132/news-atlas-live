import * as Sentry from "@sentry/browser";
import { browserTracingIntegration, replayIntegration } from "@sentry/browser";

const DSN = import.meta.env.VITE_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: import.meta.env.MODE,
    integrations: [
      browserTracingIntegration(),
      replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    ignoreErrors: [
      "Non-Error promise rejection captured",
      "ResizeObserver loop limit exceeded",
      "NetworkError",
    ],
    beforeSend(event) {
      // Filter out known noisy errors
      if (event.exception) {
        for (const ex of event.exception.values || []) {
          if (ex.value?.includes("ResizeObserver loop limit exceeded")) return null;
        }
      }
      return event;
    },
  });
}

export function captureError(error, context = {}) {
  if (DSN) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error("[Sentry disabled]", error, context);
  }
}

export function captureMessage(message, level = "info", context = {}) {
  if (DSN) {
    Sentry.captureMessage(message, level, { extra: context });
  } else {
    console.log(`[Sentry disabled] ${level}:`, message, context);
  }
}

export function setUserContext(user) {
  if (DSN) {
    Sentry.setUser(user);
  }
}

export function clearUserContext() {
  if (DSN) {
    Sentry.setUser(null);
  }
}

export function addBreadcrumb(category, message, data = {}) {
  if (DSN) {
    Sentry.addBreadcrumb({
      category,
      message,
      data,
      level: "info",
    });
  }
}