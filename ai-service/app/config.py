import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # LLM Provider
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq")
    
    # Groq
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    GROQ_TEMPERATURE: float = float(os.getenv("GROQ_TEMPERATURE", 0.7))
    GROQ_MAX_TOKENS: int = int(os.getenv("GROQ_MAX_TOKENS", 2048))
    
    # Redis
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))
    REDIS_DB: int = int(os.getenv("REDIS_DB", 0))
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")
    CACHE_TTL: int = int(os.getenv("CACHE_TTL", 86400))
    
    # Retry
    MAX_RETRIES: int = int(os.getenv("MAX_RETRIES", 3))
    RETRY_DELAY: int = int(os.getenv("RETRY_DELAY", 1))
    
    # CORS
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5000").split(",")

settings = Settings()
