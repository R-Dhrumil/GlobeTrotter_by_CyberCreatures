-- 1. Create SavedTrip table
CREATE TABLE IF NOT EXISTS "SavedTrip" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" VARCHAR(64) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "tripId" VARCHAR(64) NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "tripId")
);

CREATE INDEX IF NOT EXISTS "idx_savedtrip_userId" ON "SavedTrip"("userId");

-- 2. Create LikedItem table (Polymorphic for Activities and Trips)
CREATE TABLE IF NOT EXISTS "LikedItem" (
    "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" VARCHAR(64) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "itemId" VARCHAR(64) NOT NULL, -- Could be a Trip ID or Activity ID
    "itemType" VARCHAR(20) NOT NULL, -- 'TRIP' or 'ACTIVITY'
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "itemId", "itemType")
);

CREATE INDEX IF NOT EXISTS "idx_likeditem_userId" ON "LikedItem"("userId");
CREATE INDEX IF NOT EXISTS "idx_likeditem_item" ON "LikedItem"("itemId", "itemType");
