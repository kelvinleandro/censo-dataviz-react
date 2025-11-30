import { Pool } from "pg";

const globalForPg = globalThis as { pgPool?: Pool };

const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (!globalForPg.pgPool) {
  globalForPg.pgPool = pool;
}

export async function query(sql: string, params?: unknown[]) {
  const result = await pool.query(sql, params);
  return result.rows;
}

export default pool;
