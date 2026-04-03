from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.connection import get_db
from database.models import User
from api.schemas import LoginPayload, Token, RiderVerifyPayload, UserResponse
from core.security import verify_password, create_access_token

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(payload: LoginPayload, db: AsyncSession = Depends(get_db)):
    # Find user by email
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate JWT containing user_id
    access_token = create_access_token(subject=user.id)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/verify", response_model=UserResponse)
async def verify_rider(payload: RiderVerifyPayload, db: AsyncSession = Depends(get_db)):
    # Find user by email and phone
    result = await db.execute(
        select(User).where(User.email == payload.email, User.phone == payload.phone)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="no details found enter correct zomato's credential"
        )

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="enter correct password as zomato credentials"
        )

    return user
