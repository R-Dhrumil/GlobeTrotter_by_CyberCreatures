-- =========================================================================
-- GROUP TRAVEL FEATURE MIGRATION
-- Adds: Trip.inviteToken, User.currency/country, GroupMember, GroupExpense
-- =========================================================================

-- 1. Add invite token column to Trip table
ALTER TABLE "Trip" ADD COLUMN IF NOT EXISTS "inviteToken" VARCHAR(64) UNIQUE;
CREATE INDEX IF NOT EXISTS "idx_trip_inviteToken" ON "Trip"("inviteToken");

-- 2. Add currency and country preferences to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "currency" VARCHAR(10) DEFAULT 'USD';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "country" VARCHAR(100) DEFAULT '';

-- 3. Group Members table
CREATE TABLE IF NOT EXISTS "GroupMember" (
    "id"        VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "tripId"    VARCHAR(64) NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
    "userId"    VARCHAR(64) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "role"      VARCHAR(20) DEFAULT 'MEMBER',
    "joinedAt"  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("tripId", "userId")
);

CREATE INDEX IF NOT EXISTS "idx_group_member_tripId" ON "GroupMember"("tripId");
CREATE INDEX IF NOT EXISTS "idx_group_member_userId" ON "GroupMember"("userId");

-- 4. Group Expenses table (per-person expense log)
CREATE TABLE IF NOT EXISTS "GroupExpense" (
    "id"            VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "tripId"        VARCHAR(64) NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
    "paidByUserId"  VARCHAR(64) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "category"      VARCHAR(50) NOT NULL DEFAULT 'OTHER',
    "amount"        DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "description"   TEXT DEFAULT '',
    "expenseDate"   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "createdAt"     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_group_expense_tripId" ON "GroupExpense"("tripId");
CREATE INDEX IF NOT EXISTS "idx_group_expense_paidByUserId" ON "GroupExpense"("paidByUserId");
