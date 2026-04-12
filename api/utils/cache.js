import NodeCache from "node-cache";

// Intelligence Cache - 15 minute default TTL with automatic cleanup
const cache = new NodeCache({ 
    stdTTL: 900, 
    checkperiod: 120,
    useClones: false 
});

export function getCache(key) {
  return cache.get(key);
}

export function setCache(key, value, ttlSecs) {
  // Convert to seconds if passed as large ms value
  const ttl = ttlSecs > 1000000 ? Math.floor(ttlSecs / 1000) : ttlSecs;
  cache.set(key, value, ttl);
}

export const cacheInstance = cache;
