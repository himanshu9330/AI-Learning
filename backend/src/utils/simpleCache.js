/**
 * Simple In-Memory Cache Utility
 * Used to cache analytics and dashboard data for short periods.
 */
class SimpleCache {
    constructor(ttlSeconds = 60) {
        this.cache = new Map();
        this.ttl = ttlSeconds * 1000;
    }

    set(key, value) {
        const expiresAt = Date.now() + this.ttl;
        this.cache.set(key, { value, expiresAt });
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    delete(key) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }
}

module.exports = new SimpleCache(30); // 30-second cache
