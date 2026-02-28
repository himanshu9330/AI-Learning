import redis
import json
import hashlib
from typing import Optional
from app.config import settings

class CacheService:
    def __init__(self):
        try:
            self.redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB,
                password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
                decode_responses=True
            )
            # Test connection
            self.redis_client.ping()
            self.available = True
        except Exception as e:
            print(f"Redis connection failed: {e}")
            print("Cache will be disabled")
            self.available = False
    
    def _generate_key(self, prefix: str, data: dict) -> str:
        """Generate cache key from data"""
        data_str = json.dumps(data, sort_keys=True)
        hash_key = hashlib.md5(data_str.encode()).hexdigest()
        return f"{prefix}:{hash_key}"
    
    def get(self, prefix: str, data: dict) -> Optional[dict]:
        """Get cached response"""
        if not self.available:
            return None
        
        try:
            key = self._generate_key(prefix, data)
            cached = self.redis_client.get(key)
            if cached:
                return json.loads(cached)
            return None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None
    
    def set(self, prefix: str, data: dict, response: dict, ttl: int = None) -> bool:
        """Set cache with TTL"""
        if not self.available:
            return False
        
        try:
            key = self._generate_key(prefix, data)
            ttl = ttl or settings.CACHE_TTL
            self.redis_client.setex(
                key,
                ttl,
                json.dumps(response)
            )
            return True
        except Exception as e:
            print(f"Cache set error: {e}")
            return False
    
    def is_available(self) -> bool:
        """Check if cache is available"""
        return self.available

# Global cache instance
cache_service = CacheService()
