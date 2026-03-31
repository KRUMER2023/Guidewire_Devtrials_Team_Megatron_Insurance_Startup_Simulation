from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database.connection import get_db
from database.models import HazardEvent
from api.schemas import HazardEventCreate, HazardEventResponse

router = APIRouter()


def _serialize(event: HazardEvent) -> HazardEventResponse:
    return HazardEventResponse(
        id=event.id,
        hazard_type=event.hazard_type,
        hex_index=event.hex_index.split(",") if event.hex_index else [],
        confidence_score=float(event.confidence_score),
        severity=event.severity,
        is_active=event.is_active,
        created_at=event.created_at.isoformat() if event.created_at else "",
    )


@router.get(
    "/",
    response_model=List[HazardEventResponse],
    summary="List all hazard events",
)
async def list_hazard_events(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(HazardEvent).order_by(HazardEvent.created_at.desc())
    )
    return [_serialize(e) for e in result.scalars().all()]


@router.post(
    "/create",
    response_model=HazardEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new hazard event",
)
async def create_hazard_event(
    payload: HazardEventCreate,
    db: AsyncSession = Depends(get_db),
) -> HazardEventResponse:
    new_event = HazardEvent(
        hazard_type=payload.hazard_type,
        hex_index=",".join(payload.hex_index),
        confidence_score=payload.confidence_score,
        severity=payload.severity,
        is_active=False, # Changed to False as requested
    )
    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)
    return _serialize(new_event)


@router.patch(
    "/{event_id}/toggle",
    response_model=HazardEventResponse,
    summary="Toggle is_active for a hazard event",
)
async def toggle_hazard_event(
    event_id: str,
    db: AsyncSession = Depends(get_db),
) -> HazardEventResponse:
    import uuid as _uuid
    try:
        uid = _uuid.UUID(event_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid event UUID.")

    result = await db.execute(select(HazardEvent).where(HazardEvent.id == uid))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Hazard event not found.")

    event.is_active = not event.is_active
    await db.commit()
    await db.refresh(event)
    return _serialize(event)


@router.delete(
    "/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a hazard event",
)
async def delete_hazard_event(
    event_id: str,
    db: AsyncSession = Depends(get_db),
):
    import uuid as _uuid
    try:
        uid = _uuid.UUID(event_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid event UUID.")

    result = await db.execute(select(HazardEvent).where(HazardEvent.id == uid))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Hazard event not found.")

    await db.delete(event)
    await db.commit()
    return None
