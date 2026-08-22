-- =========================================================================
-- GLOBETROTTER POSTGRESQL PRODUCTION DDL SCHEMA
-- Compatible with Railway PostgreSQL, Supabase, Neon, AWS RDS, and Local PG
-- =========================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. DROP EXISTING TABLES (Clean Cascade Reset)
DROP TABLE IF EXISTS "ContactMessage" CASCADE;
DROP TABLE IF EXISTS "Transaction" CASCADE;
DROP TABLE IF EXISTS "SiteSetting" CASCADE;
DROP TABLE IF EXISTS "Budget" CASCADE;
DROP TABLE IF EXISTS "StopActivity" CASCADE;
DROP TABLE IF EXISTS "Stop" CASCADE;
DROP TABLE IF EXISTS "Trip" CASCADE;
DROP TABLE IF EXISTS "Activity" CASCADE;
DROP TABLE IF EXISTS "City" CASCADE;
DROP TABLE IF EXISTS "Otp" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Also support snake_case table drops if queried
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS stop_activities CASCADE;
DROP TABLE IF EXISTS stops CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS otps CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. CREATE CUSTOM ENUM TYPES
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BudgetCategory" AS ENUM ('TRANSPORT', 'STAY', 'ACTIVITIES', 'MEALS', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. USERS TABLE
CREATE TABLE "User" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "Role" DEFAULT 'USER',
    "photoUrl" VARCHAR(1000) DEFAULT '',
    "languagePref" VARCHAR(10) DEFAULT 'en',
    "status" "UserStatus" DEFAULT 'ACTIVE',
    "department" VARCHAR(255) DEFAULT 'Traveler',
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_user_email" ON "User"("email");

-- 4. OTP CODES TABLE
CREATE TABLE "Otp" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" VARCHAR(255) NOT NULL,
    "otp" VARCHAR(10) NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_otp_email" ON "Otp"("email");

-- 5. MASTER CITIES CATALOG TABLE
CREATE TABLE "City" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" VARCHAR(255) NOT NULL,
    "country" VARCHAR(255) NOT NULL,
    "region" VARCHAR(100) DEFAULT 'Global',
    "costIndex" INTEGER DEFAULT 3 CHECK ("costIndex" BETWEEN 1 AND 5),
    "popularityScore" INTEGER DEFAULT 80 CHECK ("popularityScore" BETWEEN 1 AND 100),
    "lat" DOUBLE PRECISION DEFAULT 0.0,
    "lng" DOUBLE PRECISION DEFAULT 0.0,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_city_name" ON "City"("name");
CREATE INDEX "idx_city_country" ON "City"("country");
CREATE INDEX "idx_city_region" ON "City"("region");

-- 6. MASTER ACTIVITIES CATALOG TABLE
CREATE TABLE "Activity" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "cityId" VARCHAR(64) NOT NULL REFERENCES "City"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) DEFAULT 'Sightseeing',
    "cost" DOUBLE PRECISION DEFAULT 0.0,
    "durationMinutes" INTEGER DEFAULT 120,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_activity_cityId" ON "Activity"("cityId");
CREATE INDEX "idx_activity_category" ON "Activity"("category");

-- 7. USER TRIPS TABLE
CREATE TABLE "Trip" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" VARCHAR(64) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "startDate" TIMESTAMP WITH TIME ZONE,
    "endDate" TIMESTAMP WITH TIME ZONE,
    "description" TEXT,
    "coverPhotoUrl" TEXT DEFAULT 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    "isPublic" BOOLEAN DEFAULT false,
    "shareSlug" VARCHAR(255) UNIQUE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_trip_userId" ON "Trip"("userId");
CREATE INDEX "idx_trip_shareSlug" ON "Trip"("shareSlug");

-- 8. TRIP STOPS (Destinations on a route)
CREATE TABLE "Stop" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "tripId" VARCHAR(64) NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
    "cityId" VARCHAR(64) NOT NULL REFERENCES "City"("id") ON DELETE CASCADE,
    "orderIndex" INTEGER DEFAULT 0,
    "arrivalDate" TIMESTAMP WITH TIME ZONE,
    "departureDate" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_stop_tripId" ON "Stop"("tripId");
CREATE INDEX "idx_stop_cityId" ON "Stop"("cityId");

-- 9. STOP ACTIVITIES (Scheduled activities per stop)
CREATE TABLE "StopActivity" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "stopId" VARCHAR(64) NOT NULL REFERENCES "Stop"("id") ON DELETE CASCADE,
    "activityId" VARCHAR(64) NOT NULL REFERENCES "Activity"("id") ON DELETE CASCADE,
    "scheduledDate" TIMESTAMP WITH TIME ZONE,
    "scheduledTime" VARCHAR(50),
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_stop_activity_stopId" ON "StopActivity"("stopId");
CREATE INDEX "idx_stop_activity_activityId" ON "StopActivity"("activityId");

-- 10. TRIP BUDGETS TABLE
CREATE TABLE "Budget" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "tripId" VARCHAR(64) NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
    "category" "BudgetCategory" DEFAULT 'OTHER',
    "estimatedAmount" DOUBLE PRECISION DEFAULT 0.0,
    "actualAmount" DOUBLE PRECISION DEFAULT 0.0,
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_budget_tripId" ON "Budget"("tripId");

-- 11. SITE SETTINGS (SMTP, PAYMENT, SEO)
CREATE TABLE "SiteSetting" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "key" VARCHAR(255) UNIQUE NOT NULL,
    "value" TEXT NOT NULL,
    "group" VARCHAR(100) DEFAULT 'GENERAL',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_site_setting_key" ON "SiteSetting"("key");
CREATE INDEX "idx_site_setting_group" ON "SiteSetting"("group");

-- 12. TRANSACTIONS TABLE
CREATE TABLE "Transaction" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" VARCHAR(64) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "tripId" VARCHAR(64) REFERENCES "Trip"("id") ON DELETE SET NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" VARCHAR(10) DEFAULT 'USD',
    "gateway" VARCHAR(50) DEFAULT 'STRIPE',
    "status" "TransactionStatus" DEFAULT 'COMPLETED',
    "gatewayRef" VARCHAR(255) DEFAULT '',
    "notes" TEXT DEFAULT '',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_transaction_userId" ON "Transaction"("userId");
CREATE INDEX "idx_transaction_tripId" ON "Transaction"("tripId");

-- 13. CONTACT INQUIRY MESSAGES
CREATE TABLE "ContactMessage" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(255) DEFAULT 'General Inquiry',
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_contact_email" ON "ContactMessage"("email");
