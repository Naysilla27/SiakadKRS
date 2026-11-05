import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:0427@localhost:5432/krs_dev'
});

async function countData() {
  console.log('\n📊 STATUS DATA MAHASISWA DI DATABASE POSTGRESQL (krs_dev)');
  console.log('='.repeat(60));
  
  const total = await pool.query('SELECT count(*) FROM mahasiswa');
  const uji = await pool.query("SELECT count(*) FROM mahasiswa WHERE nim >= '2450234001' AND nim <= '2450235000'");
  const master = parseInt(total.rows[0].count, 10) - parseInt(uji.rows[0].count, 10);

  console.log(`  Total Seluruh Mahasiswa : ${total.rows[0].count} baris`);
  console.log(`  Data Master Asli        : ${master} baris`);
  console.log(`  Data Uji 1.000 (Stress) : ${uji.rows[0].count} baris`);

  if (parseInt(uji.rows[0].count, 10) > 0) {
    const prodiDist = await pool.query(`
      SELECT kode_prodi, count(*) as jumlah 
      FROM mahasiswa 
      WHERE nim >= '2450234001' AND nim <= '2450235000'
      GROUP BY kode_prodi
    `);
    console.log('\n  Distribusi Data Uji per Program Studi:');
    console.table(prodiDist.rows);

    const ipkDist = await pool.query(`
      SELECT 
        CASE 
          WHEN ips_lalu >= 3.00 THEN 'Tier 1: 3.00 - 4.00 (24 SKS)'
          WHEN ips_lalu >= 2.50 THEN 'Tier 2: 2.50 - 2.99 (21 SKS)'
          WHEN ips_lalu >= 2.00 THEN 'Tier 3: 2.00 - 2.49 (18 SKS)'
          WHEN ips_lalu >= 1.50 THEN 'Tier 4: 1.50 - 1.99 (15 SKS)'
          ELSE 'Tier 5: 0.00 - 1.49 (12 SKS)'
        END AS tier_sks,
        count(*) as jumlah
      FROM mahasiswa 
      WHERE nim >= '2450234001' AND nim <= '2450235000'
      GROUP BY 1
      ORDER BY 1 ASC
    `);
    console.log('  Distribusi Beban SKS Data Uji:');
    console.table(ipkDist.rows);
  }
  console.log('='.repeat(60) + '\n');
  await pool.end();
}

countData().catch(err => {
  console.error(err);
  process.exit(1);
});
