import { config as loadEnv } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './shared/schema';

loadEnv({ path: '.env.local' });
loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

pool.on('connect', (client) => {
  // Neon pooler can return empty search_path; enforce public for unqualified table names.
  void client.query('SET search_path TO public');
});

export const db = drizzle(pool, { schema });