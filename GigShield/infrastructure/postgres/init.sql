CREATE EXTENSION IF NOT EXISTS postgis;

CREATE EXTENSION IF NOT EXISTS vector;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
    CREATE TYPE vehicletype AS ENUM ('EV', 'PETROL');

EXCEPTION WHEN duplicate_object THEN NULL;

END $$;

DO $$ BEGIN
    CREATE TYPE policystatus AS ENUM ('ACTIVE', 'INCUBATING');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payoutstatus AS ENUM ('PENDING', 'SUCCESS');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- RIDERS TABLE  (updated schema with name, age, primary_h3_zone nullable)
-- ============================================================
CREATE TABLE IF NOT EXISTS riders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    zomato_id VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type vehicletype NOT NULL,
    trust_score INTEGER DEFAULT 80,
    primary_h3_zone VARCHAR(20) NULL,
    latitude FLOAT NULL,
    longitude FLOAT NULL
);

-- ============================================================
-- USERS TABLE (New Identity System)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    vehicle_type VARCHAR(50), -- e.g., 'ELECTRIC', 'PETROL'
    latitude FLOAT NULL,
    longitude FLOAT NULL
);

-- ============================================================
-- RIDER STATS TABLE (1-to-1 with Users)
-- ============================================================
CREATE TABLE IF NOT EXISTS rider_stats (
    user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    trust_score INTEGER DEFAULT 85,
    current_premium FLOAT DEFAULT 60.0,
    total_payouts FLOAT DEFAULT 0.0,
    UNIQUE (user_id)
);

-- ============================================================
-- ACTIVITY LOGS TABLE (History)
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    h3_index VARCHAR(15),
    amount FLOAT DEFAULT 0.0,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_timestamp ON activity_logs (user_id, timestamp);

-- -- ============================================================
-- -- POLICIES TABLE
-- -- ============================================================
-- CREATE TABLE IF NOT EXISTS policies (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
--     rider_id UUID NOT NULL REFERENCES riders (id) ON DELETE CASCADE,
--     status policystatus NOT NULL,
--     weekly_premium NUMERIC(6, 2) NOT NULL,
--     valid_until TIMESTAMP NOT NULL
-- );

-- ============================================================
-- PAYOUT LEDGER TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payout_ledger (
    tx_id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    rider_id UUID NOT NULL REFERENCES riders (id) ON DELETE CASCADE,
    trigger_h3_zone VARCHAR(20) NOT NULL,
    amount NUMERIC(8, 2) NOT NULL,
    status payoutstatus NOT NULL
);

-- ============================================================
-- HAZARD EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS hazard_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    hazard_type VARCHAR(50) NOT NULL, -- e.g., 'WATERLOGGING', 'TRAFFIC_JAM'
    hex_index TEXT NOT NULL, -- List of H3 cells (comma-separated for the demo)
    confidence_score DECIMAL(5, 2) DEFAULT 100.00, -- Hardcoded to 100% for the demo
    severity INT DEFAULT 8, -- Useful for payout math (1-10)
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- ORDERS (Simulation Mission Vectors)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    ord_id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    order_name VARCHAR(255) NOT NULL,
    zom_id VARCHAR(50) NOT NULL,
    pickup_latitude FLOAT NOT NULL,
    pickup_longitude FLOAT NOT NULL,
    delivery_latitude FLOAT NOT NULL,
    delivery_longitude FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- MOCK DATA (Riders, Users, and Rider Stats from mock_users.csv)
-- ============================================================

DELETE FROM rider_stats;

DELETE FROM riders;

DELETE FROM users;

DELETE FROM orders;

DELETE FROM hazard_events;

-- 1. Insert into users (Identity System)
-- NOTE: hashed_password is set to plain text for now; in production, these should be bcrypt hashes.
INSERT INTO
    users (
        name,
        phone,
        email,
        hashed_password,
        joined_at,
        vehicle_type,
        latitude,
        longitude
    )
VALUES (
        'Raju Rastogi',
        '9876543210',
        'raju@gig.com',
        '$2b$12$3gDXeuNT8UDYygTI3P/V.ejJ.MMIVV54oZq.oC85lbvm0xHNw2QQq',
        '2026-03-28',
        'EV',
        22.312049,
        73.162498
    ),
    (
        'Sunita Sharma',
        '9876543211',
        'sunita@gig.com',
        '$2b$12$3gDXeuNT8UDYygTI3P/V.ejJ.MMIVV54oZq.oC85lbvm0xHNw2QQq',
        '2025-01-10',
        'EV',
        22.306432,
        73.163304
    ),
    (
        'Amit Patel',
        '9876543212',
        'amit@gig.com',
        '$2b$12$3gDXeuNT8UDYygTI3P/V.ejJ.MMIVV54oZq.oC85lbvm0xHNw2QQq',
        '2026-01-15',
        'PETROL',
        22.307271,
        73.170982
    ),
    (
        'Vikram Singh',
        '9876543213',
        'vikram@gig.com',
        '$2b$12$3gDXeuNT8UDYygTI3P/V.ejJ.MMIVV54oZq.oC85lbvm0xHNw2QQq',
        '2025-08-20',
        'PETROL',
        22.313424,
        73.175308
    ),
    (
        'Suresh Kumar',
        '9876543214',
        'suresh@gig.com',
        '$2b$12$3gDXeuNT8UDYygTI3P/V.ejJ.MMIVV54oZq.oC85lbvm0xHNw2QQq',
        '2026-02-01',
        'EV',
        22.303742,
        73.182506
    ),
    (
        'Deepa Kumari',
        '9876543215',
        'deepa@gig.com',
        '$2b$12$3gDXeuNT8UDYygTI3P/V.ejJ.MMIVV54oZq.oC85lbvm0xHNw2QQq',
        '2025-05-12',
        'EV',
        22.313166,
        73.172739
    )
ON CONFLICT (email) DO NOTHING;

-- 2. Insert into rider_stats (Performance & Payout Matrix)
-- Linked to users via email lookup
INSERT INTO
    rider_stats (
        user_id,
        trust_score,
        current_premium,
        total_payouts
    )
SELECT id, 85, 60.0, 0.0
FROM users
WHERE
    email = 'raju@gig.com'
UNION ALL
SELECT id, 98, 60.0, 0.0
FROM users
WHERE
    email = 'sunita@gig.com'
UNION ALL
SELECT id, 62, 98.5, 0.0
FROM users
WHERE
    email = 'amit@gig.com'
UNION ALL
SELECT id, 75, 82.0, 400.0
FROM users
WHERE
    email = 'vikram@gig.com'
UNION ALL
SELECT id, 45, 115.0, 0.0
FROM users
WHERE
    email = 'suresh@gig.com'
UNION ALL
SELECT id, 92, 68.0, 800.0
FROM users
WHERE
    email = 'deepa@gig.com'
ON CONFLICT (user_id) DO NOTHING;

-- 3. Insert into riders (Simulation Model)
INSERT INTO
    riders (
        name,
        age,
        zomato_id,
        vehicle_type,
        trust_score,
        primary_h3_zone,
        latitude,
        longitude
    )
VALUES (
        'Raju Rastogi',
        24,
        'ZOM-VAD-001',
        'EV',
        85,
        '8a42ca853547fff',
        22.312049,
        73.162498
    ),
    (
        'Sunita Sharma',
        29,
        'ZOM-VAD-002',
        'EV',
        98,
        '8a42ca85348ffff',
        22.306432,
        73.163304
    ),
    (
        'Amit Patel',
        31,
        'ZOM-VAD-003',
        'PETROL',
        62,
        '8a42ca853687fff',
        22.307271,
        73.170982
    ),
    (
        'Vikram Singh',
        35,
        'ZOM-VAD-004',
        'PETROL',
        75,
        '8a42ca85329ffff',
        22.313424,
        73.175308
    ),
    (
        'Suresh Kumar',
        27,
        'ZOM-VAD-005',
        'EV',
        45,
        '8a42ca8ed187fff',
        22.303742,
        73.182506
    ),
    (
        'Deepa Kumari',
        26,
        'ZOM-VAD-006',
        'EV',
        92,
        '8a42ca85374ffff',
        22.313166,
        73.172739
    )
ON CONFLICT (zomato_id) DO NOTHING;

-- 4. Insert into hazard_events (Default Active Hazard)
INSERT INTO
    hazard_events (
        hazard_type,
        hex_index,
        confidence_score,
        severity,
        is_active
    )
VALUES (
        'WATERLOGGING',
        '8a42ca8536d7fff',
        100.00,
        8,
        TRUE
    );

-- 5. Insert into orders (Default Simulation Mission)
INSERT INTO
    orders (
        order_name,
        zom_id,
        pickup_latitude,
        pickup_longitude,
        delivery_latitude,
        delivery_longitude
    )
VALUES (
        'URGENT: Pizza Delivery',
        'ZOM-VAD-001',
        22.312049,
        73.162498,
        22.306432,
        73.163304
    );