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
