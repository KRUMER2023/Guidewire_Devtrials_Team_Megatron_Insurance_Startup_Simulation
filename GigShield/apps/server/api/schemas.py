from pydantic import BaseModel
from typing import List

class TelemetryPing(BaseModel):
    zomato_id: str
    lat: float
    lng: float
    h3_index: str
    status: str

class TelemetryBatch(BaseModel):
    pings: List[TelemetryPing]
