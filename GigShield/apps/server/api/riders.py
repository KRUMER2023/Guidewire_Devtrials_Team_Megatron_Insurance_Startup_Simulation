from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select
from typing import List

from database.connection import get_db
from database.models import Rider, VehicleType
from api.schemas import RiderCreate, RiderResponse

router = APIRouter()


@router.get(
    "/",
    response_model=List[RiderResponse],
    summary="List all riders",
    description="Returns all riders currently stored in the PostgreSQL riders table.",
)
async def list_riders(db: AsyncSession = Depends(get_db)) -> List[RiderResponse]:
    result = await db.execute(select(Rider).order_by(Rider.name))
    return result.scalars().all()


@router.post(
    "/create",
    response_model=RiderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new mock rider",
    description="Persists a new rider record to PostgreSQL and returns the created entity including its generated UUID.",
)
async def create_rider(
    payload: RiderCreate,
    db: AsyncSession = Depends(get_db),
) -> RiderResponse:
    """
    Accept a RiderCreate payload, write it to the riders table,
    and return the full database record on success.

    Raises HTTP 400 if the zomato_id already exists (IntegrityError).
    """
    new_rider = Rider(
        name=payload.name,
        age=payload.age,
        zomato_id=payload.zomato_id,
        vehicle_type=VehicleType(payload.vehicle_type),
        primary_h3_zone=payload.primary_h3_zone,
        # trust_score defaults to 80 as defined in the model
    )

    db.add(new_rider)

    try:
        await db.commit()
        await db.refresh(new_rider)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A rider with zomato_id '{payload.zomato_id}' already exists.",
        )

    return new_rider


@router.delete(
    "/{rider_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a rider",
)
async def delete_rider(
    rider_id: str,
    db: AsyncSession = Depends(get_db),
):
    import uuid as _uuid
    try:
        uid = _uuid.UUID(rider_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid rider UUID.")

    result = await db.execute(select(Rider).where(Rider.id == uid))
    rider = result.scalar_one_or_none()
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found.")

    await db.delete(rider)
    await db.commit()
    return None
