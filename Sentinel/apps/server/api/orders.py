from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database.connection import get_db
from database.models import Order
from api.schemas import OrderCreate, OrderResponse

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])

@router.post("/create", response_model=OrderResponse)
async def create_order(payload: OrderCreate, db: AsyncSession = Depends(get_db)):
    """
    Creates a new simulation mission (order) vector.
    """
    new_order = Order(
        order_name=payload.order_name,
        zom_id=payload.zom_id,
        pickup_latitude=payload.pickup_latitude,
        pickup_longitude=payload.pickup_longitude,
        delivery_latitude=payload.delivery_latitude,
        delivery_longitude=payload.delivery_longitude
    )
    
    db.add(new_order)
    try:
        await db.commit()
        await db.refresh(new_order)
        return new_order
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/", response_model=List[OrderResponse])
async def list_orders(db: AsyncSession = Depends(get_db)):
    """
    Lists all simulation orders in the system.
    """
    result = await db.execute(select(Order).order_by(Order.created_at.desc()))
    return result.scalars().all()

@router.delete("/{ord_id}")
async def delete_order(ord_id: str, db: AsyncSession = Depends(get_db)):
    """
    Deletes a simulation order.
    """
    import uuid as _uuid
    try:
        uid = _uuid.UUID(ord_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid order UUID.")

    result = await db.execute(select(Order).where(Order.ord_id == uid))
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    await db.delete(order)
    await db.commit()
    return {"message": "Order deleted successfully"}
