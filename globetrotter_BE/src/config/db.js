import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

export const prisma = new PrismaClient();

export const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.success('✅ PostgreSQL Database Connected via Prisma ORM');
  } catch (error) {
    logger.error('❌ PostgreSQL Connection Failed:', error.message);
    if (process.env.DATABASE_URL?.includes('railway.internal')) {
      console.log('\n💡 [RAILWAY NOTICE]: You are using `postgres.railway.internal` which only resolves inside Railway VPC containers.');
      console.log('👉 To connect from your local computer:');
      console.log('   1. Open Railway -> your PostgreSQL service -> "Connect" tab -> copy the "Public Networking" / TCP Proxy URL (e.g. postgresql://postgres:...@...roundhouse.proxy.rlwy.net:port/railway)');
      console.log('   2. Paste it as DATABASE_URL in `globetrotter_BE/.env`');
      console.log('   3. Alternatively, you can run `schema.sql` and `seed.sql` directly inside Railway SQL Console!\n');
    }
  }
};
