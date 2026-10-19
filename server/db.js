import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'krs_dev',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Helper query function with log
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Database query error:', err.message, '\nQuery:', text);
    throw err;
  }
}

// Check database connection
export async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW() as now, current_database() as db, current_user as user');
    console.log(`[DB SUCCESS] Connected to PostgreSQL '${res.rows[0].db}' as '${res.rows[0].user}' at ${res.rows[0].now}`);
    return { connected: true, data: res.rows[0] };
  } catch (err) {
    console.warn(`[DB WARN] PostgreSQL direct connection notice: ${err.message}. System will support local state synchronization.`);
    return { connected: false, error: err.message };
  }
}
