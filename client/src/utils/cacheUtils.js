class CacheService {
  constructor(ttl = 5 * 60 * 1000) {
    // 5 minutes default TTL
    this.cache = new Map();
    this.defaultTTL = ttl;
  }

  generateKey(url, params) {
    const sortedParams = params
      ? JSON.stringify(params, Object.keys(params).sort())
      : "";
    return `${url}:${sortedParams}`;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Clear all expired items
  clearExpired() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

const cacheService = new CacheService();

// Higher order function to cache API responses
export const withCache =
  (fn, ttl) =>
  async (...args) => {
    const key = cacheService.generateKey(fn.name, args);

    const cachedResult = cacheService.get(key);
    if (cachedResult) {
      return cachedResult;
    }

    const result = await fn(...args);
    cacheService.set(key, result, ttl);
    return result;
  };

// Clear cache when user logs out
export const clearCache = () => {
  cacheService.clear();
};

// Clear specific cache entries by prefix
export const clearCacheByPrefix = (prefix) => {
  for (const [key] of cacheService.cache.entries()) {
    if (key.startsWith(prefix)) {
      cacheService.delete(key);
    }
  }
};

// Export cache service instance
export { cacheService };
