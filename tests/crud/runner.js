/**
 * Test Runner Utama: Pengujian Otomatis CRUD Database SIAKAD KRS UNJANI
 * Menggabungkan kontribusi 4 anggota kelompok:
 * 1. Anita Nurhayati (DBA)          - CREATE Testing
 * 2. Naysilla Sifa A. (Backend)      - READ Testing
 * 3. Nayla Putri Romdoni (Frontend) - UPDATE Testing
 * 4. Meila Fitri (QA / Tester)       - DELETE Testing & Runner Orchestrator
 *
 * Mata Kuliah: SI611029 Implementasi dan Pengujian Sistem Informasi
 * Dosen Pengampu: Dr. Ir. Sigit Anggoro, S.T., M.T., IPM
 */

import { runCreateTests } from './01_test_create.js';
import { runReadTests } from './02_test_read.js';
import { runUpdateTests } from './03_test_update.js';
import { runDeleteTests } from './04_test_delete.js';
import { pool, testConnection } from '../../server/db.js';

async function main() {
  console.clear ? console.clear() : null;
  console.log(`\n================================================================================`);
  console.log(`? SUITE PENGUJIAN OTOMATIS CRUD DATABASE (TUGAS P5)`);
  console.log(`   SISTEM INFORMASI AKADEMIK KRS & PERWALIAN - UNJANI`);
  console.log(`================================================================================`);
  console.log(`Waktu Uji  : ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`);

  // Verifikasi Koneksi Database
  const conn = await testConnection();
  if (!conn.connected) {
    console.error(`\n[FATAL] Gagal terhubung ke database: ${conn.error}`);
    console.error(`Pastikan PostgreSQL aktif pada port ${process.env.DB_PORT || 5432}.`);
    process.exit(1);
  }
  console.log(`Database   : PostgreSQL 'krs_dev' (User: postgres, Port: ${process.env.DB_PORT || 5432})`);
  console.log(`Status DB  : TERHUBUNG & SIAP\n`);

  const startTime = Date.now();
  let allResults = [];

  try {
    // 1. CREATE Testing (Anita Nurhayati - DBA)
    const createResults = await runCreateTests();
    allResults = allResults.concat(createResults);

    // 2. READ Testing (Naysilla Sifa Aprilianissa - Backend)
    const readResults = await runReadTests();
    allResults = allResults.concat(readResults);

    // 3. UPDATE Testing (Nayla Putri Romdoni - Frontend)
    const updateResults = await runUpdateTests();
    allResults = allResults.concat(updateResults);

    // 4. DELETE Testing (Meila Fitri - QA)
    const deleteResults = await runDeleteTests();
    allResults = allResults.concat(deleteResults);

  } catch (err) {
    console.error(`\n[ERROR] Kesalahan fatal saat eksekusi uji: ${err.message}`);
  } finally {
    const totalDuration = Date.now() - startTime;

    console.log(`\n================================================================================`);
    console.log(`📊 REKAPITULASI HASIL PENGUJIAN CRUD LINTAS ANGGOTA KELOMPOK`);
    console.log(`================================================================================`);
    console.log(`| Test ID  | Operasi | Kontributor                   | Latency | Status  |`);
    console.log(`|----------|---------|-------------------------------|---------|---------|`);

    let passedCount = 0;
    let failedCount = 0;

    for (const r of allResults) {
      if (r.status === 'PASSED') passedCount++;
      else failedCount++;

      const id = r.test_id.padEnd(8);
      const op = r.operation.padEnd(7);
      const author = r.author.padEnd(29).slice(0, 29);
      const lat = (r.latency || '0ms').padEnd(7);
      const stat = r.status === 'PASSED' ? '✅ PASS ' : '❌ FAIL ';

      console.log(`| ${id} | ${op} | ${author} | ${lat} | ${stat}|`);
    }

    console.log(`================================================================================`);
    console.log(`Total Pengujian : ${allResults.length} Test Cases`);
    console.log(`Lulus (PASSED)  : ${passedCount} (${((passedCount / (allResults.length || 1)) * 100).toFixed(1)}%)`);
    console.log(`Gagal (FAILED)  : ${failedCount}`);
    console.log(`Total Waktu Uji : ${totalDuration} ms`);
    console.log(`Kesimpulan Akhir: ${failedCount === 0 ? '🎉 SEMUA OPERASI CRUD & CONSTRAINT DATABASE LULUS 100%' : '⚠️ BEBERAPA UJI GAGAL, PERIKSA LOG DI ATAS'}`);
    console.log(`================================================================================\n`);

    // Tutup pool agar proses exit bersih
    await pool.end();
    process.exit(failedCount === 0 ? 0 : 1);
  }
}

main();
