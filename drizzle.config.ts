import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local' });
loadEnv();

export default {
  dialect: 'postgresql',
  schema: './src/storage/database/shared/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DRIZZLE_DATABASE_URL || process.env.DATABASE_URL || '',
  },
  strict: true,
  verbose: true,
};