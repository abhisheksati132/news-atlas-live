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