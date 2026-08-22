import pkg from 'pg';
const { Pool } = pkg;
import { logger } from '../utils/logger.js';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') || process.env.NODE_ENV === 'production'
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
    return res;
  } catch (error) {
    logger.error('❌ PostgreSQL Connection Failed:', error.message);
    if (process.env.DATABASE_URL?.includes('railway.internal')) {
      console.log('\n💡 [RAILWAY NOTICE]: You are using `postgres.railway.internal` which only resolves inside Railway VPC containers.');
      console.log('👉 To connect from your local computer:');
      console.log('   1. Open Railway -> your PostgreSQL service -> "Connect" tab -> copy the "Public Networking" / TCP Proxy URL');
      console.log('   2. Paste it as DATABASE_URL in `globetrotter_BE/.env`');
      console.log('   3. Alternatively, you can run `schema.sql` and `seed.sql` directly inside Railway SQL Console!\n');
    }
  }
};
