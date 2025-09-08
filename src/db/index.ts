/* eslint-disable no-console */
import env from '@/env';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { casing: 'snake_case', schema });

export const connect = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Connected to Postgres DB');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
};
