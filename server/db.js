import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

export function formatErrorMessage(err) {
  if (!err) return 'Unknown database error';
  if (err.code === 'ECONNREFUSED') {
    return `Koneksi ditolak (ECONNREFUSED): PostgreSQL tidak dapat dihubungi di port ${process.env.DB_PORT || 5432}. Pastikan PostgreSQL aktif dan port di .env sesuai.`;
  }
  if (err.code === '28P01') {
    return 'Password PostgreSQL salah (28P01: password authentication failed). Silakan periksa DB_PASSWORD di file .env.';
  }
  if (err.code === '3D000') {
    return `Database '${process.env.DB_NAME || 'krs_dev'}' tidak ditemukan di PostgreSQL. Buat database tersebut terlebih dahulu di pgAdmin/psql.`;
  }
  if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
    return err.errors.map(e => e.message || e.code || 'Connection error').join('; ');
  }
  return err.message || err.code || String(err);
}

const rawDbUrl = (process.env.DATABASE_URL || '').trim();
const rawHost = (process.env.DB_HOST || '').trim();

// Remote / cloud PostgreSQL requires SSL; local PostgreSQL does not
const isRemoteOrCloud = Boolean(
  (rawDbUrl && (rawDbUrl.includes('supabase.co') || rawDbUrl.includes('pooler.supabase.com'))) ||
  (rawHost && rawHost !== 'localhost' && rawHost !== '127.0.0.1') ||
  process.env.DB_SSL === 'true'
);

const poolConfig = rawDbUrl
  ? {
      connectionString: rawDbUrl,
      ssl: isRemoteOrCloud ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: rawHost || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'krs_dev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: isRemoteOrCloud ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

export const pool = new Pool(poolConfig);

// Helper query function with error logging
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    const friendlyError = formatErrorMessage(err);
    console.error(`[DB ERROR] ${friendlyError}\nQuery: ${text.replace(/\s+/g, ' ').trim()}`);
    throw err;
  }
}

// Check database connection and verify identity
export async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW() as now, current_database() as db, current_user as user');
    console.log(`[DB CONNECTED] Terhubung ke PostgreSQL '${res.rows[0].db}' sebagai user '${res.rows[0].user}' pada port ${poolConfig.port || 5432} (${res.rows[0].now})`);
    return { connected: true, data: res.rows[0] };
  } catch (err) {
    const friendlyError = formatErrorMessage(err);
    console.error(`[DB CONNECTION ERROR] Gagal terhubung ke database: ${friendlyError}`);
    return { connected: false, error: friendlyError };
  }
}

// Safe database schema synchronization on startup
export async function initDatabase() {
  try {
    // 1. Ensure helper columns exist in kelas and krs
    await query(`
      ALTER TABLE kelas ADD COLUMN IF NOT EXISTS hari VARCHAR(20) DEFAULT 'Senin';
      ALTER TABLE kelas ADD COLUMN IF NOT EXISTS jam VARCHAR(20) DEFAULT '08:00 - 10:30';
      ALTER TABLE kelas ADD COLUMN IF NOT EXISTS ruang VARCHAR(30) DEFAULT 'R.301';
      ALTER TABLE krs ADD COLUMN IF NOT EXISTS catatan_dosen TEXT DEFAULT '';
    `);

    // 2. Ensure defects table exists for Quality Hub
    await query(`
      CREATE TABLE IF NOT EXISTS defects (
        id VARCHAR(20) PRIMARY KEY,
        module VARCHAR(100) NOT NULL,
        title VARCHAR(200) NOT NULL,
        error_type VARCHAR(50),
        fault TEXT,
        defect TEXT,
        status VARCHAR(50) DEFAULT 'Open',
        severity VARCHAR(20) DEFAULT 'Medium',
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // 3. Seed default defects if empty
    const checkDefects = await query('SELECT COUNT(*)::int as total FROM defects');
    if (checkDefects.rows[0].total === 0) {
      await query(`
        INSERT INTO defects (id, module, title, error_type, fault, defect, status, severity) VALUES
        ('DEF-001', 'Validasi KRS', 'Sistem menolak KRS dengan 25 SKS (Trigger Test)', 'Human Error', 'Kondisi program batas SKS', 'Total SKS 25 melebihi batas 24', 'Verified Fixed', 'Critical'),
        ('DEF-002', 'Autentikasi', 'Validasi password sesuai spesifikasi', 'Fault', 'Password length check', 'Password < 8 karakter', 'Closed', 'Medium')
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    console.log('[DB SCHEMA SYNC] Skema database berhasil diverifikasi & disinkronkan.');
  } catch (err) {
    console.warn(`[DB SCHEMA SYNC NOTICE] ${err.message}`);
  }
}
