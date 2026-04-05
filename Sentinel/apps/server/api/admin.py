from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from database.models import User, RiderStats, Rider, VehicleType
from api.schemas import UserCreate, UserResponse
from core.security import get_password_hash
from sqlalchemy import select

router = APIRouter()

@router.post("/create-rider", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_rider(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user identity already exists
    existing_user = await db.execute(select(User).where((User.email == payload.email) | (User.phone == payload.phone)))
    if existing_user.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User with this email or phone already exists.")

    # 1. Create User Identity
    new_user = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=get_password_hash(payload.password),
        vehicle_type=payload.vehicle_type
    )
    db.add(new_user)
    await db.flush() # Populate new_user.id

    # 2. Create Rider Simulation Node (to show up in the simulator list)
    # Using phone or zomato_id payload alternatively
    zomato_id = payload.zomato_id if payload.zomato_id else f"ZOM-{payload.phone[-4:]}"
    new_rider = Rider(
        id=new_user.id, # Ensure IDs match for easy linking
        name=payload.name,
        age=payload.age,
        zomato_id=zomato_id,
        vehicle_type=VehicleType.EV if payload.vehicle_type == "EV" else VehicleType.PETROL,
        trust_score=85,
        primary_h3_zone=payload.primary_h3_zone,
        latitude=payload.latitude,
        longitude=payload.longitude
    )
    db.add(new_rider)

    # 3. Initialize RiderStats (1-to-1)
    stats = RiderStats(
        user_id=new_user.id,
        trust_score=85,
        current_premium=60.0,
        total_payouts=0.0
    )
    db.add(stats)

    await db.commit()
    await db.refresh(new_user)
    return new_user
