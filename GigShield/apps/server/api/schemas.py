import uuid
from pydantic import BaseModel, Field
from typing import List, Literal, Optional


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
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class RiderResponse(BaseModel):
    id: uuid.UUID
    name: str
    age: int
    zomato_id: str
    vehicle_type: str
    trust_score: int
    primary_h3_zone: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]

    model_config = {"from_attributes": True}


# ── Hazard Events ───────────────────────────────────────────────────────────────

class HazardEventCreate(BaseModel):
    hazard_type: str = Field(..., min_length=1, max_length=50)
    hex_index: List[str] = Field(..., min_length=1)
    confidence_score: float = Field(default=100.00, ge=0, le=100)
    severity: int = Field(default=8, ge=1, le=10)


class HazardEventResponse(BaseModel):
    id: uuid.UUID
    hazard_type: str
    hex_index: List[str]
    confidence_score: float
    severity: int
    is_active: bool
    created_at: str  # serialized as ISO string

    model_config = {"from_attributes": True}


# ── Identity & Auth ─────────────────────────────────────────────────────────────

from pydantic import EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    phone: str = Field(..., min_length=10)
    password: str = Field(..., min_length=8)
    vehicle_type: Optional[str] = None
    # For simulation compatibility
    age: int = Field(default=24)
    zomato_id: str = Field(default="")
    primary_h3_zone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    phone: str
    joined_at: datetime
    vehicle_type: Optional[str]
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    model_config = {"from_attributes": True}

class LoginPayload(BaseModel):
    email: str
    password: str

class RiderVerifyPayload(BaseModel):
    email: EmailStr
    phone: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class RiderStatsResponse(BaseModel):
    trust_score: int
    current_premium: float
    total_payouts: float

    model_config = {"from_attributes": True}

class ActivityLogResponse(BaseModel):
    event_type: str
    h3_index: Optional[str]
    amount: float
    timestamp: datetime

    model_config = {"from_attributes": True}

class RiderMeResponse(BaseModel):
    user: UserResponse
    stats: RiderStatsResponse
    recent_logs: List[ActivityLogResponse]

# ── Orders (Missions) ──────────────────────────────────────────────────────────

class OrderCreate(BaseModel):
    order_name: str = Field(..., min_length=1, max_length=255)
    zom_id: str = Field(..., min_length=1, max_length=50)
    pickup_latitude: float
    pickup_longitude: float
    delivery_latitude: float
    delivery_longitude: float

class OrderResponse(BaseModel):
    ord_id: uuid.UUID
    order_name: str
    zom_id: str
    pickup_latitude: float
    pickup_longitude: float
    delivery_latitude: float
    delivery_longitude: float
    created_at: datetime

    model_config = {"from_attributes": True}
 
 
class PayoutRequest(BaseModel):
    amount: float
    hazard_type: str
