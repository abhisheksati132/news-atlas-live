
const cache = new Map()

export function getCache(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiry) {
    cache.delete(key)
    return null
  }
  return entry.value
}

export function setCache(key, value, ttlMs) {
  cache.set(key, { value, expiry: Date.now() + ttlMs })
}
