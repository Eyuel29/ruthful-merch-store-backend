/* eslint-disable no-console */
import env from "@/env";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { casing: "snake_case" });

export const connect = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Connected to Postgres");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
};
