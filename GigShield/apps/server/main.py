from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from api import telemetry
from database.connection import get_db

app = FastAPI(title="GigShield API")

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
def resolve_h3():
    return {"h3_index": "8828308281fffff"}

app.include_router(telemetry.router)
