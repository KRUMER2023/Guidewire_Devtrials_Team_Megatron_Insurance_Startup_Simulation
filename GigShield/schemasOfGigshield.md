# GigShield — Database Schemas

> **Database:** PostgreSQL 15 · **Extensions:** `postgis`, `pgvector`
> **Source of truth:** `GigShield/apps/server/database/models.py`

---

## Table: `riders`

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | Primary Key, default `uuid4()` |
| `name` | `VARCHAR` | NOT NULL |
| `age` | `INTEGER` | NOT NULL |
| `zomato_id` | `VARCHAR(50)` | NOT NULL, UNIQUE, Indexed |
| `vehicle_type` | `ENUM('EV', 'PETROL')` | NOT NULL |
| `trust_score` | `INTEGER` | Default `80` |
| `primary_h3_zone` | `VARCHAR(20)` | Nullable, Indexed |

---

## Table: `policies`

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | Primary Key, default `uuid4()` |
| `rider_id` | `UUID` | NOT NULL, FK → `riders.id` |
| `status` | `ENUM('ACTIVE', 'INCUBATING')` | NOT NULL |
| `weekly_premium` | `NUMERIC(6, 2)` | NOT NULL |
| `valid_until` | `DATETIME` | NOT NULL |

---

## Table: `payout_ledger`

| Column | Type | Constraints |
|---|---|---|
| `tx_id` | `UUID` | Primary Key, default `uuid4()` |
| `rider_id` | `UUID` | NOT NULL, FK → `riders.id` |
| `trigger_h3_zone` | `VARCHAR(15)` | NOT NULL |
| `amount` | `NUMERIC(8, 2)` | NOT NULL |
| `status` | `ENUM('PENDING', 'SUCCESS')` | NOT NULL |

---

## Relationships

```
riders  ──< policies        (one rider → many policies,   ON DELETE CASCADE)
riders  ──< payout_ledger   (one rider → many payouts,    ON DELETE CASCADE)
```

---

## Enum Types

| Enum | Values |
|---|---|
| `VehicleType` | `EV`, `PETROL` |
| `PolicyStatus` | `ACTIVE`, `INCUBATING` |
| `PayoutStatus` | `PENDING`, `SUCCESS` |

---

> **Planned (not yet implemented):** `hazard_events` table — specified in TDD/PRD but not yet added to `models.py`.
