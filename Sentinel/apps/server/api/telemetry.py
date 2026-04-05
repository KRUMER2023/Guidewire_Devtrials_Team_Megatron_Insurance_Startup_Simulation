from fastapi import APIRouter, Depends
from redis.asyncio import Redis
from core.redis import get_redis
from api.schemas import TelemetryBatch

router = APIRouter(prefix="/api/v1/telemetry", tags=["Telemetry"])

@router.post("/ingest")
async def ingest_telemetry(batch: TelemetryBatch, redis_client: Redis = Depends(get_redis)):
    """
    High-speed ingestion endpoint for a batch of rider telemetry pings.
    Values are stored in Redis as JSON strings with a 300 second TTL.
    """
    pipeline = redis_client.pipeline()
    for ping in batch.pings:
        key = f"rider:{ping.zomato_id}:state"
        pipeline.setex(key, 300, ping.model_dump_json())
    
    await pipeline.execute()
    
    return {
        "status": "success", 
        "processed": len(batch.pings)
    }
