import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:0427@localhost:5432/krs_dev'
});

async function cleanup() {
  console.log('\n🧹 Membersihkan 1.000 data mahasiswa uji (NIM 2450234001 - 2450235000)...');
  const res = await pool.query("DELETE FROM mahasiswa WHERE nim >= '2450234001' AND nim <= '2450235000'");
  console.log(` Berhasil menghapus ${res.rowCount} baris data uji.`);
  const check = await pool.query("SELECT count(*) FROM mahasiswa");
  console.log(` Sisa data master mahasiswa di database: ${check.rows[0].count} baris.\n`);
  await pool.end();
}

cleanup().catch(err => {
  console.error('Error saat cleanup:', err.message);
  process.exit(1);
});
