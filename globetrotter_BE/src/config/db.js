import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

export const prisma = new PrismaClient();

export const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.success('PostgreSQL Database Connected via Prisma ORM');
  } catch (error) {
    logger.error('PostgreSQL Connection Failed:', error.message);
    process.exit(1);
  }
};
