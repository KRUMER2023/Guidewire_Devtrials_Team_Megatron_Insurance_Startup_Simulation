from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from jose import jwt, JWTError
from database.connection import get_db
from database.models import User, RiderStats, ActivityLog
from api.schemas import RiderMeResponse
from core.security import SECRET_KEY, ALGORITHM

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return user_id
    except JWTError:
        raise credentials_exception

@router.get("/me", response_model=RiderMeResponse)
async def get_rider_me(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    import uuid as _uuid
    try:
        uid = _uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token subject.")

    # Fetch User, Stats, and last 5 Activity Logs
    user_res = await db.execute(select(User).where(User.id == uid))
    user = user_res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    stats_res = await db.execute(select(RiderStats).where(RiderStats.user_id == uid))
    stats = stats_res.scalar_one_or_none()
    
    logs_res = await db.execute(
        select(ActivityLog)
        .where(ActivityLog.user_id == uid)
        .order_by(desc(ActivityLog.timestamp))
        .limit(5)
    )
    logs = logs_res.scalars().all()

    return {
        "user": user,
        "stats": stats or {"trust_score": 0, "current_premium": 0, "total_payouts": 0},
        "recent_logs": logs
    }
