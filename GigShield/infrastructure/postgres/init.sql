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
    primary_h3_zone VARCHAR(20) NULL
);

-- ============================================================
-- POLICIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    rider_id UUID NOT NULL REFERENCES riders (id) ON DELETE CASCADE,
    status policystatus NOT NULL,
    weekly_premium NUMERIC(6, 2) NOT NULL,
    valid_until TIMESTAMP NOT NULL
);

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
-- MOCK RIDER DATA  (10 realistic Delhi/NCR delivery partners)
-- ============================================================
INSERT INTO
    riders (
        name,
        age,
        zomato_id,
        vehicle_type,
        trust_score,
        primary_h3_zone
    )
VALUES (
        'Arjun Sharma',
        24,
        'ZOM-R-1024',
        'EV',
        92,
        '8a28308281effff'
    ), -- Connaught Place
    (
        'Rohit Verma',
        29,
        'ZOM-R-2048',
        'PETROL',
        74,
        '8a283082817ffff'
    ), -- Lajpat Nagar
    (
        'Priya Nair',
        26,
        'ZOM-R-3072',
        'EV',
        88,
        '8a2830822cfffff'
    ), -- Noida Sector 18
    (
        'Suresh Babu',
        32,
        'ZOM-R-4096',
        'PETROL',
        61,
        '8a28308281bffff'
    ), -- Saket
    (
        'Amit Joshi',
        22,
        'ZOM-R-5120',
        'EV',
        95,
        '8a2830828bdffff'
    ), -- Gurugram Sector 29
    (
        'Deepak Singh',
        35,
        'ZOM-R-6144',
        'PETROL',
        45,
        '8a28308280fffff'
    ), -- Dwarka
    (
        'Kavya Patel',
        27,
        'ZOM-R-7168',
        'EV',
        82,
        '8a2830828b1ffff'
    ), -- Cyber City GGN
    (
        'Ravi Kumar',
        31,
        'ZOM-R-8192',
        'PETROL',
        57,
        '8a28308280bffff'
    ), -- Rohini
    (
        'Sneha Gupta',
        23,
        'ZOM-R-9216',
        'EV',
        90,
        '8a283082817ffff'
    ), -- CR Park
    (
        'Manish Yadav',
        28,
        'ZOM-R-A240',
        'PETROL',
        38,
        NULL
    ) -- Unzoned / roaming
ON CONFLICT (zomato_id) DO NOTHING;