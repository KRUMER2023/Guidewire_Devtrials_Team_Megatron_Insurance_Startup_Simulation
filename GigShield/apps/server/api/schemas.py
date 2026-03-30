import uuid
from pydantic import BaseModel, Field
from typing import List, Literal


# ── Telemetry ──────────────────────────────────────────────────────────────────

class TelemetryPing(BaseModel):
    zomato_id: str
    lat: float
    lng: float
    h3_index: str
    status: str

class TelemetryBatch(BaseModel):
    pings: List[TelemetryPing]


# ── Riders ─────────────────────────────────────────────────────────────────────

class RiderCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    age: int = Field(..., ge=18, le=70)
    zomato_id: str = Field(..., min_length=1, max_length=50)
    vehicle_type: Literal["EV", "PETROL"]
    primary_h3_zone: str = Field(..., min_length=1, max_length=20)


class RiderResponse(BaseModel):
    id: uuid.UUID
    name: str
    age: int
    zomato_id: str
    vehicle_type: str
    trust_score: int
    primary_h3_zone: str | None

    model_config = {"from_attributes": True}
