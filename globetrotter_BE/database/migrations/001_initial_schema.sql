-- =========================================================================
-- MIGRATION: 001_initial_schema.sql
-- Created: 2026-08-22
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "BudgetCategory" AS ENUM ('TRANSPORT', 'STAY', 'ACTIVITIES', 'MEALS', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "User" (
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

CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Otp" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" VARCHAR(255) NOT NULL,
    "otp" VARCHAR(10) NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_otp_email" ON "Otp"("email");

CREATE TABLE IF NOT EXISTS "City" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" VARCHAR(255) NOT NULL,
    "country" VARCHAR(255) NOT NULL,
    "region" VARCHAR(100) DEFAULT 'Global',
    "costIndex" INTEGER DEFAULT 3 CHECK ("costIndex" BETWEEN 1 AND 5),
    "popularityScore" INTEGER DEFAULT 80 CHECK ("popularityScore" BETWEEN 1 AND 100),
    "imageUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_city_name" ON "City"("name");
CREATE INDEX IF NOT EXISTS "idx_city_country" ON "City"("country");
CREATE INDEX IF NOT EXISTS "idx_city_region" ON "City"("region");

CREATE TABLE IF NOT EXISTS "Activity" (
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

CREATE INDEX IF NOT EXISTS "idx_activity_cityId" ON "Activity"("cityId");
CREATE INDEX IF NOT EXISTS "idx_activity_category" ON "Activity"("category");

CREATE TABLE IF NOT EXISTS "Trip" (
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

CREATE INDEX IF NOT EXISTS "idx_trip_userId" ON "Trip"("userId");
CREATE INDEX IF NOT EXISTS "idx_trip_shareSlug" ON "Trip"("shareSlug");

CREATE TABLE IF NOT EXISTS "Stop" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "tripId" VARCHAR(64) NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
    "cityId" VARCHAR(64) NOT NULL REFERENCES "City"("id") ON DELETE CASCADE,
    "orderIndex" INTEGER DEFAULT 0,
    "arrivalDate" TIMESTAMP WITH TIME ZONE,
    "departureDate" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_stop_tripId" ON "Stop"("tripId");
CREATE INDEX IF NOT EXISTS "idx_stop_cityId" ON "Stop"("cityId");

CREATE TABLE IF NOT EXISTS "StopActivity" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "stopId" VARCHAR(64) NOT NULL REFERENCES "Stop"("id") ON DELETE CASCADE,
    "activityId" VARCHAR(64) NOT NULL REFERENCES "Activity"("id") ON DELETE CASCADE,
    "scheduledDate" TIMESTAMP WITH TIME ZONE,
    "scheduledTime" VARCHAR(50),
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_stop_activity_stopId" ON "StopActivity"("stopId");
CREATE INDEX IF NOT EXISTS "idx_stop_activity_activityId" ON "StopActivity"("activityId");

CREATE TABLE IF NOT EXISTS "Budget" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "tripId" VARCHAR(64) NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
    "category" "BudgetCategory" DEFAULT 'OTHER',
    "estimatedAmount" DOUBLE PRECISION DEFAULT 0.0,
    "actualAmount" DOUBLE PRECISION DEFAULT 0.0,
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_budget_tripId" ON "Budget"("tripId");

CREATE TABLE IF NOT EXISTS "SiteSetting" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "key" VARCHAR(255) UNIQUE NOT NULL,
    "value" TEXT NOT NULL,
    "group" VARCHAR(100) DEFAULT 'GENERAL',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_site_setting_key" ON "SiteSetting"("key");
CREATE INDEX IF NOT EXISTS "idx_site_setting_group" ON "SiteSetting"("group");

CREATE TABLE IF NOT EXISTS "Transaction" (
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

CREATE INDEX IF NOT EXISTS "idx_transaction_userId" ON "Transaction"("userId");
CREATE INDEX IF NOT EXISTS "idx_transaction_tripId" ON "Transaction"("tripId");

CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(255) DEFAULT 'General Inquiry',
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_contact_email" ON "ContactMessage"("email");
