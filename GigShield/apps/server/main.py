import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from api import telemetry, riders, hazard_events, admin, auth, rider, orders
from database.connection import get_db, engine
from database.models import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Robust DB Startup Strategy ---
    max_retries = 5
    retry_delay = 2
    for attempt in range(max_retries):
        try:
            async with engine.begin() as conn:
                # Ensure all tables are created on startup (HazardEvent, etc.)
                await conn.run_sync(Base.metadata.create_all)
            print("--- System Matrix Online: DB Connected ---")
            break
        except Exception as e:
            if attempt == max_retries - 1:
                print(f"--- FAILED TO DETACH IN MATRIX: {e} ---")
                raise # Fail the application boot
            print(f"--- DB Synchronization Attempt {attempt+1}/{max_retries} failed. Retrying... ---")
            await asyncio.sleep(retry_delay)
    yield

app = FastAPI(title="GigShield API", lifespan=lifespan)

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the GigShield API. Access /docs for the Swagger UI."}

@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        # Pass a simple query to Postgres to verify the SQLAlchemy connection
        result = await db.execute(text("SELECT 1"))
        db_status = "Connected and Active!" if result.scalar() == 1 else "Unknown State"
    except Exception as e:
        db_status = f"Disconnected: {str(e)}"

    return {
        "status": "GigShield API Active",
        "postgres_database": db_status
    }

@app.post("/tools/h3-resolve")
def resolve_h3(lat: float, lng: float):
    import h3
    h3_index = h3.latlng_to_cell(lat, lng, 10)
    return {"h3_index": h3_index}

app.include_router(telemetry.router)
app.include_router(riders.router, prefix="/api/v1/riders", tags=["Riders"])
app.include_router(hazard_events.router, prefix="/api/v1/hazards", tags=["Hazard Events"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(rider.router, prefix="/api/v1/rider", tags=["Rider Profile"])
app.include_router(orders.router)
# app.include_router(navigation.router, prefix="/api/v1/navigation", tags=["Navigation"])

