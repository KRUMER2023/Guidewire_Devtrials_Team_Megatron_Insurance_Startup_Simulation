import os
import redis.asyncio as redis

# Fallback specifically intended for when not hitting the docker-compose network directly
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")

# Initialize global connection pool
redis_pool = redis.ConnectionPool.from_url(REDIS_URL, decode_responses=True)

async def get_redis() -> redis.Redis:
    """Dependency generator to provide an async Redis client."""
    client = redis.Redis(connection_pool=redis_pool)
    try:
        yield client
    finally:
        await client.aclose()
