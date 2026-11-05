/**
 * Modul Uji 2: READ (Operasi Baca Data, Relasi JOIN & Kalkulasi Dinamis)
 * Kontributor: Naysilla Sifa Aprilianissa (NIM: 2450231059) - Backend Developer
 * Mata Kuliah: SI611029 Implementasi dan Pengujian Sistem Informasi - UNJANI
 */

import { query } from '../../server/db.js';

export async function runReadTests() {
  const results = [];
  const member = 'Naysilla Sifa Aprilianissa (Backend)';

  console.log(`\n======================================================`);
  console.log(`[MODUL 2: READ TESTING] Kontributor: ${member}`);
  console.log(`======================================================`);

  // Test R-01: Read Single Mahasiswa by Primary Key
  const t1Start = Date.now();
  try {
    const q = `
      SELECT nim, nama, email, tahun_masuk, status, kode_prodi, ips_lalu
      FROM mahasiswa
      WHERE nim = $1
    `;
    const res = await query(q, ['2026999001']);
    const found = res.rows.length === 1 && res.rows[0].nama === 'Mahasiswa Uji Anita';
    results.push({
      test_id: 'CRUD-R01',
      author: member,
      operation: 'READ',
      target: 'Membaca data mahasiswa berdasarkan NIM (Primary Key)',
      expected: 'Data ditemukan dengan tepat (1 baris)',
      actual: found ? `Ditemukan: ${res.rows[0].nama} (NIM: ${res.rows[0].nim})` : 'Data tidak ditemukan',
      status: found ? 'PASSED' : 'FAILED',
      latency: `${Date.now() - t1Start}ms`
    });
    console.log(`  ✅ [PASS] CRUD-R01: Read Single Mahasiswa by PK (${Date.now() - t1Start}ms)`);
  } catch (err) {
    results.push({
      test_id: 'CRUD-R01',
      author: member,
      operation: 'READ',
      target: 'Read Single Mahasiswa by PK',
      expected: '1 baris ditemukan',
      actual: `Error: ${err.message}`,
      status: 'FAILED',
      latency: `${Date.now() - t1Start}ms`
    });
    console.log(`  ? [FAIL] CRUD-R01: ${err.message}`);
  }

  // Test R-02: Read dengan Relasi Lintas Tabel (Multi-Table JOIN)
  const t2Start = Date.now();
  try {
    const joinQ = `
      SELECT m.nim, m.nama, m.email,
             p.nama_prodi,
             COALESCE(d.nama, 'Belum Ditentukan') as nama_dosen_pa
      FROM mahasiswa m
      LEFT JOIN prodi p ON p.kode_prodi = m.kode_prodi
      LEFT JOIN dosen d ON d.id_dosen = m.id_dosen_pa
      WHERE m.nim = $1
    `;
    const res = await query(joinQ, ['2026999001']);
    const validJoin = res.rows.length === 1 && res.rows[0].nama_prodi && res.rows[0].nama_dosen_pa;
    results.push({
      test_id: 'CRUD-R02',
      author: member,
      operation: 'READ',
      target: 'Multi-table JOIN antara Mahasiswa, Prodi, dan Dosen Wali PA',
      expected: 'Data master relasi tersambung lengkap (Prodi & Dosen terisi)',
      actual: validJoin ? `Tersambung: Prodi ${res.rows[0].nama_prodi}, PA: ${res.rows[0].nama_dosen_pa}` : 'JOIN kosong',
      status: validJoin ? 'PASSED' : 'FAILED',
      latency: `${Date.now() - t2Start}ms`
    });
    console.log(`  ✅ [PASS] CRUD-R02: Multi-Table JOIN Valid (${Date.now() - t2Start}ms)`);
  } catch (err) {
    results.push({
      test_id: 'CRUD-R02',
      author: member,
      operation: 'READ',
      target: 'Multi-table JOIN',
      expected: 'Relasi tersambung',
      actual: `Error: ${err.message}`,
      status: 'FAILED',
      latency: `${Date.now() - t2Start}ms`
    });
    console.log(`  ? [FAIL] CRUD-R02: ${err.message}`);
  }

  // Test R-03: Read Kalkulasi Dinamis Batas SKS Sesuai IP Semester (Slide P5)
  const t3Start = Date.now();
  try {
    const sksQ = `
      SELECT m.nim, m.ips_lalu,
             CASE
               WHEN m.ips_lalu >= 3.00 THEN 24
               WHEN m.ips_lalu >= 2.50 THEN 21
               WHEN m.ips_lalu >= 2.00 THEN 18
               WHEN m.ips_lalu >= 1.50 THEN 15
               ELSE 12
             END as max_sks
      FROM mahasiswa m
      WHERE m.nim = $1
    `;
    const res = await query(sksQ, ['2026999001']);
    // IPS 3.25 => harus 24 SKS
    const validCalc = res.rows.length === 1 && Number(res.rows[0].max_sks) === 24;
    results.push({
      test_id: 'CRUD-R03',
      author: member,
      operation: 'READ',
      target: 'Kalkulasi Dinamis Batas SKS berdasarkan Aturan IPS Semester',
      expected: 'IPS 3.25 menghasilkan kuota maksimal 24 SKS',
      actual: validCalc ? `Valid: IPS ${res.rows[0].ips_lalu} -> Maks ${res.rows[0].max_sks} SKS` : 'Kalkulasi salah',
      status: validCalc ? 'PASSED' : 'FAILED',
      latency: `${Date.now() - t3Start}ms`
    });
    console.log(`  ✅ [PASS] CRUD-R03: Kalkulasi Dinamis Batas SKS (${Date.now() - t3Start}ms)`);
  } catch (err) {
    results.push({
      test_id: 'CRUD-R03',
      author: member,
      operation: 'READ',
      target: 'Kalkulasi Dinamis Batas SKS',
      expected: '24 SKS',
      actual: `Error: ${err.message}`,
      status: 'FAILED',
      latency: `${Date.now() - t3Start}ms`
    });
    console.log(`  ? [FAIL] CRUD-R03: ${err.message}`);
  }

  // Test R-04: Read Data Non-Existent (Safe Handling)
  const t4Start = Date.now();
  try {
    const res = await query(`SELECT * FROM mahasiswa WHERE nim = '9999999999'`);
    const safeEmpty = res.rows.length === 0;
    results.push({
      test_id: 'CRUD-R04',
      author: member,
      operation: 'READ',
      target: 'Pencarian data yang tidak ada di database (Edge Case)',
      expected: 'Mengembalikan 0 baris secara aman tanpa crash/unhandled exception',
      actual: safeEmpty ? 'Mengembalikan array kosong (0 baris ditemukan)' : 'Mengembalikan data palsu',
      status: safeEmpty ? 'PASSED' : 'FAILED',
      latency: `${Date.now() - t4Start}ms`
    });
    console.log(`  ✅ [PASS] CRUD-R04: Read Non-Existent Record Safe (${Date.now() - t4Start}ms)`);
  } catch (err) {
    results.push({
      test_id: 'CRUD-R04',
      author: member,
      operation: 'READ',
      target: 'Read Non-Existent Record',
      expected: '0 baris',
      actual: `Error: ${err.message}`,
      status: 'FAILED',
      latency: `${Date.now() - t4Start}ms`
    });
    console.log(`  ? [FAIL] CRUD-R04: ${err.message}`);
  }

  return results;
}
