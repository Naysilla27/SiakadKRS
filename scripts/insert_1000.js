/**
 * =====================================================================
 * SISTEM INFORMASI KRS & PERWALIAN (SIAKAD) - UNIVERSITAS JENDERAL ACHMAD YANI
 * Course: SI611029 - Implementasi dan Pengujian Sistem Informasi
 * =====================================================================
 * TOOL TERMINAL IMPORT 1.000 DATA MAHASISWA KE POSTGRESQL
 * Pemilik Dataset: Naysilla Sifa Aprilianissa (2450231059)
 * 
 * Cara Penggunaan di Terminal VS Code:
 *   npm run insert:1000
 *   atau
 *   node scripts/insert_1000.js
 *   atau (jika ingin pakai file Anita)
 *   node scripts/insert_1000.js --anita
 * =====================================================================
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Deteksi argumen flag (--anita, --clean, dll)
const args = process.argv.slice(2);
const isAnita = args.includes('--anita');
const isClean = args.includes('--clean');

// Tentukan file CSV sumber
const csvFileName = isAnita ? 'dataset_1000_anita.csv' : 'dataset_1000_naysilla.csv';
const csvPath = path.resolve(__dirname, '../data', csvFileName);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:0427@localhost:5432/krs_dev',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

async function main() {
  console.log('\n' + '='.repeat(75));
  console.log('   SIAKAD KRS UNJANI - TOOL TERMINAL IMPORT 1.000 DATA KE DATABASE');
  console.log('   Course: SI611029 Implementasi & Pengujian Sistem Informasi');
  console.log('='.repeat(75));

  // Jika dipanggil dengan flag --clean, hanya lakukan pembersihan
  if (isClean) {
    console.log('\n🧹 Menghapus data 1.000 mahasiswa dari database...');
    const delRes = await pool.query("DELETE FROM mahasiswa WHERE nim >= '2450234001' AND nim <= '2450235000'");
    console.log(` Berhasil menghapus ${delRes.rowCount} baris data uji.`);
    const totalNow = await pool.query("SELECT count(*) FROM mahasiswa");
    console.log(` Sisa data master di tabel mahasiswa: ${totalNow.rows[0].count} baris.\n`);
    await pool.end();
    return;
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`\n❌ Error: File CSV tidak ditemukan di: ${csvPath}`);
    console.log('   Jalankan terlebih dahulu: node scripts/generate_personal_stress_data.js\n');
    process.exit(1);
  }

  // 1. Baca data dari CSV
  console.log(`\n📂 Membaca file CSV: ${path.basename(csvPath)}`);
  const rawContent = fs.readFileSync(csvPath, 'utf8').trim().split('\n');
  const rows = [];

  for (let i = 1; i < rawContent.length; i++) {
    const line = rawContent[i].trim();
    if (!line) continue;
    const cols = parseCsvLine(line);
    rows.push({
      nim: cols[0],
      nama: cols[1].replace(/^"|"$/g, ''),
      email: cols[2],
      tahun_masuk: parseInt(cols[3], 10),
      status: cols[4],
      kode_prodi: cols[5],
      id_dosen_pa: parseInt(cols[6], 10),
      no_hp: cols[7],
      ips_lalu: parseFloat(cols[8]),
      maks_sks: parseInt(cols[9], 10),
      kontributor: cols[10].replace(/^"|"$/g, ''),
      peran_tim: cols[11].replace(/^"|"$/g, '')
    });
  }

  console.log(` Total data CSV: ${rows.length} mahasiswa.`);
  console.log(` Pemilik Kontribusi: ${rows[0].kontributor} (${rows[0].peran_tim})`);
  console.log(` Status IPK: Lengkap dengan beban maksimum SKS dinamis (12 - 24 SKS).`);

  // 2. Cek status koneksi PostgreSQL
  console.log(`\n🔌 Menghubungkan ke PostgreSQL: krs_dev@localhost:5432...`);
  const client = await pool.connect();

  try {
    // 3. Sanitasi data lama jika sudah pernah diinsert sebelumnya
    const checkOld = await client.query("SELECT count(*) FROM mahasiswa WHERE nim >= '2450234001' AND nim <= '2450235000'");
    const oldCount = parseInt(checkOld.rows[0].count, 10);
    if (oldCount > 0) {
      console.log(`⚠️  Ditemukan ${oldCount} data lama dari rentang NIM uji. Membersihkan data lama terlebih dahulu...`);
      await client.query("DELETE FROM mahasiswa WHERE nim >= '2450234001' AND nim <= '2450235000'");
      console.log(` Data lama berhasil dibersihkan.`);
    }

    // 4. Proses Insert ke Database menggunakan Batching Multi-Row dalam Transaksi
    console.log(`\n Memulai proses insert 1.000 data ke tabel 'mahasiswa'...`);
    const startTime = performance.now();
    await client.query('BEGIN');

    const batchSize = 250;
    const totalBatches = Math.ceil(rows.length / batchSize);

    for (let b = 0; b < totalBatches; b++) {
      const batchRows = rows.slice(b * batchSize, (b + 1) * batchSize);
      const valuePlaceholders = [];
      const params = [];
      let pIdx = 1;

      for (const r of batchRows) {
        valuePlaceholders.push(`($${pIdx}, $${pIdx+1}, $${pIdx+2}, $${pIdx+3}, $${pIdx+4}, $${pIdx+5}, $${pIdx+6}, $${pIdx+7}, $${pIdx+8})`);
        params.push(r.nim, r.nama, r.email, r.tahun_masuk, r.status, r.kode_prodi, r.id_dosen_pa, r.no_hp, r.ips_lalu);
        pIdx += 9;
      }

      const querySql = `
        INSERT INTO mahasiswa (nim, nama, email, tahun_masuk, status, kode_prodi, id_dosen_pa, no_hp, ips_lalu)
        VALUES ${valuePlaceholders.join(', ')}
      `;
      await client.query(querySql, params);

      const progress = Math.min(((b + 1) * batchSize), rows.length);
      const percent = Math.round((progress / rows.length) * 100);
      const barFilled = '█'.repeat(Math.round(percent / 5));
      const barEmpty = '░'.repeat(20 - Math.round(percent / 5));
      console.log(`   [${barFilled}${barEmpty}] ${percent}% | Batch ${b + 1}/${totalBatches}: ${progress}/${rows.length} mahasiswa`);
    }

    await client.query('COMMIT');
    const endTime = performance.now();
    const durationMs = (endTime - startTime).toFixed(2);

    // 5. Verifikasi Data Tersimpan di Database
    const verifyTotal = await client.query("SELECT count(*) FROM mahasiswa");
    const verifyInserted = await client.query("SELECT count(*) FROM mahasiswa WHERE nim >= '2450234001' AND nim <= '2450235000'");

    console.log('\n' + '='.repeat(75));
    console.log('    1.000 DATA MAHASISWA BERHASIL DIMASUKKAN KE DATABASE!');
    console.log('='.repeat(75));
    console.log(`   Waktu Eksekusi   : ${durationMs} ms (${(durationMs / 1000).toFixed(3)} detik)`);
    console.log(`   Throughput       : ${(rows.length / (durationMs / 1000)).toFixed(1)} baris/detik`);
    console.log(`   Data Baru Masuk  : ${verifyInserted.rows[0].count} baris`);
    console.log(`   Total Mahasiswa  : ${verifyTotal.rows[0].count} baris di tabel 'mahasiswa'`);

    // 6. Preview 5 Sampel Data yang Baru Dimasukkan
    console.log('\n📋 Preview 5 Sampel Data Mahasiswa di Database:');
    const sampleQuery = await client.query(`
      SELECT m.nim, m.nama, m.kode_prodi, m.ips_lalu,
             CASE 
               WHEN m.ips_lalu >= 3.00 THEN '24 SKS'
               WHEN m.ips_lalu >= 2.50 THEN '21 SKS'
               WHEN m.ips_lalu >= 2.00 THEN '18 SKS'
               WHEN m.ips_lalu >= 1.50 THEN '15 SKS'
               ELSE '12 SKS'
             END AS kuota_sks
      FROM mahasiswa m
      WHERE m.nim >= '2450234001' AND m.nim <= '2450235000'
      ORDER BY m.nim ASC
      LIMIT 5
    `);
    console.table(sampleQuery.rows);

    console.log('💡 TIPS PENGGUNAAN SELANJUTNYA:');
    console.log('   - Jalankan stress test : npm run test:stress');
    console.log('   - Hapus data 1.000     : npm run cleanup:1000');
    console.log('   - Cek jumlah data DB   : npm run data:count\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Terjadi kesalahan saat memasukkan data:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
