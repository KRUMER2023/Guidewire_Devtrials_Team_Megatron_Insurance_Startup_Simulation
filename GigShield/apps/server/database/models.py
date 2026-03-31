import uuid
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import (
    String,
    Integer,
    DateTime,
    Numeric,
    ForeignKey,
    Enum as SQLEnum
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class VehicleType(str, PyEnum):
    EV = "EV"
    PETROL = "PETROL"

class PolicyStatus(str, PyEnum):
    ACTIVE = "ACTIVE"
    INCUBATING = "INCUBATING"

class PayoutStatus(str, PyEnum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"

class Rider(Base):
    __tablename__ = "riders"

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    zomato_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    vehicle_type: Mapped[VehicleType] = mapped_column(SQLEnum(VehicleType), nullable=False)
    trust_score: Mapped[int] = mapped_column(Integer, default=80)
    primary_h3_zone: Mapped[str | None] = mapped_column(String(20), index=True, nullable=True)

    policies: Mapped[list["Policy"]] = relationship("Policy", back_populates="rider", cascade="all, delete-orphan")
    payouts: Mapped[list["PayoutLedger"]] = relationship("PayoutLedger", back_populates="rider", cascade="all, delete-orphan")

class Policy(Base):
    __tablename__ = "policies"

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rider_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("riders.id"), nullable=False)
    status: Mapped[PolicyStatus] = mapped_column(SQLEnum(PolicyStatus), nullable=False)
    weekly_premium: Mapped[float] = mapped_column(Numeric(6, 2), nullable=False)
    valid_until: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    rider: Mapped["Rider"] = relationship("Rider", back_populates="policies")

class PayoutLedger(Base):
    __tablename__ = "payout_ledger"

    tx_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rider_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("riders.id"), nullable=False)
    trigger_h3_zone: Mapped[str] = mapped_column(String(15), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(8, 2), nullable=False)
    status: Mapped[PayoutStatus] = mapped_column(SQLEnum(PayoutStatus), nullable=False)

    rider: Mapped["Rider"] = relationship("Rider", back_populates="payouts")

class HazardEvent(Base):
    __tablename__ = "hazard_events"

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hazard_type: Mapped[str] = mapped_column(String(50), nullable=False)
    hex_index: Mapped[str] = mapped_column(String, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Numeric(5, 2), default=100.00)
    severity: Mapped[int] = mapped_column(Integer, default=8)
    is_active: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
