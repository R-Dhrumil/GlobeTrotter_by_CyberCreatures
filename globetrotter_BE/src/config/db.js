import pkg from 'pg';
const { Pool } = pkg;
import { logger } from '../utils/logger.js';
import { env } from './env.js';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_URL?.includes('sslmode=require') || env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

export const query = (text, params) => pool.query(text, params);

export const db = {
  query: (text, params) => pool.query(text, params),
};

export const connectDB = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    logger.success('✅ PostgreSQL Database Connected via pg (node-postgres)');
    
    // Ensure lastLoginAt column exists on User table for first-time login detection
    try {
      await pool.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP WITH TIME ZONE;');
    } catch (e) {
      logger.warn('Could not run column migration for User.lastLoginAt:', e.message);
    }

    // Group Travel feature migrations
    try {
      await pool.query('ALTER TABLE "Trip" ADD COLUMN IF NOT EXISTS "inviteToken" VARCHAR(64) UNIQUE;');
      await pool.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "currency" VARCHAR(10) DEFAULT \'USD\';');
      await pool.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "country" VARCHAR(100) DEFAULT \'\';');
      await pool.query(`CREATE TABLE IF NOT EXISTS "GroupMember" (
        "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "tripId" VARCHAR(64) NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
        "userId" VARCHAR(64) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "role" VARCHAR(20) DEFAULT 'MEMBER',
        "joinedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("tripId", "userId")
      );`);
      await pool.query(`CREATE TABLE IF NOT EXISTS "GroupExpense" (
        "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "tripId" VARCHAR(64) NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
        "paidByUserId" VARCHAR(64) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "category" VARCHAR(50) NOT NULL DEFAULT 'OTHER',
        "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "description" TEXT DEFAULT '',
        "expenseDate" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`);
    } catch (e) {
      logger.warn('Could not run group travel migrations:', e.message);
    }

    // Gallery social interactions migrations
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS "SavedTrip" (
        "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" VARCHAR(64) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "tripId" VARCHAR(64) NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("userId", "tripId")
      );`);
      await pool.query('CREATE INDEX IF NOT EXISTS "idx_savedtrip_userId" ON "SavedTrip"("userId");');
      
      await pool.query(`CREATE TABLE IF NOT EXISTS "LikedItem" (
        "id" VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" VARCHAR(64) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "itemId" VARCHAR(64) NOT NULL,
        "itemType" VARCHAR(20) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("userId", "itemId", "itemType")
      );`);
      await pool.query('CREATE INDEX IF NOT EXISTS "idx_likeditem_userId" ON "LikedItem"("userId");');
      await pool.query('CREATE INDEX IF NOT EXISTS "idx_likeditem_item" ON "LikedItem"("itemId", "itemType");');
    } catch (e) {
      logger.warn('Could not run gallery social migrations:', e.message);
    }

    return res;
  } catch (error) {
    logger.error('❌ PostgreSQL Connection Failed:', error.message);
    if (env.DATABASE_URL?.includes('railway.internal')) {
      console.log('\n💡 [RAILWAY NOTICE]: You are using `postgres.railway.internal` which only resolves inside Railway VPC containers.');
      console.log('👉 To connect from your local computer:');
      console.log('   1. Open Railway -> your PostgreSQL service -> "Connect" tab -> copy the "Public Networking" / TCP Proxy URL');
      console.log('   2. Paste it as DATABASE_URL in `globetrotter_BE/.env`');
      console.log('   3. Alternatively, you can run `schema.sql` and `seed.sql` directly inside Railway SQL Console!\n');
    }
  }
};
