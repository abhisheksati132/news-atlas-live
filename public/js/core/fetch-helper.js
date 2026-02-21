/**
 * Fetch with retry and timeout. Use for API calls that may be flaky.
 * @param {string} url
 * @param {RequestInit} [options]
 * @param {{ retries?: number, timeoutMs?: number }} [config] - default retries 1, timeout 12s
 * @returns {Promise<Response>}
 */
window.fetchWithRetry = function (url, options, config) {
  const retries = (config && config.retries) ?? 1;
  const timeoutMs = (config && config.timeoutMs) ?? 12000;

  function attempt(n) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, {
      ...options,
      signal: options?.signal || controller.signal,
    })
      .then((res) => {
        clearTimeout(id);
        // Retry on server errors (5xx) or rate-limit (429) if retries remain
        if (!res.ok && res.status >= 429 && n < retries) return attempt(n + 1);
        return res;
      })
      .catch((err) => {
        clearTimeout(id);
        if (n < retries) return attempt(n + 1);
        throw err;
      });
  }
  return attempt(0);
};
