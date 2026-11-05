/**
 * Modul Uji 4: DELETE (Operasi Hapus, Integritas Relasional CASCADE/RESTRICT & Cleanup)
 * Kontributor: Meila Fitri (NIM: 2450231054) - Quality Assurance (QA / Tester)
 * Mata Kuliah: SI611029 Implementasi dan Pengujian Sistem Informasi - UNJANI
 */

import { query } from '../../server/db.js';

export async function runDeleteTests() {
  const results = [];
  const member = 'Meila Fitri (QA / Tester)';

  console.log(`\n======================================================`);
  console.log(`[MODUL 4: DELETE TESTING] Kontributor: ${member}`);
  console.log(`======================================================`);

  // Dapatkan ID KRS mahasiswa uji jika ada
  const krsRes = await query(`SELECT id_krs FROM krs WHERE nim = '2026999001'`);
  let idKrs = krsRes.rows[0]?.id_krs;

  if (!idKrs) {
    const newKrs = await query(`
      INSERT INTO krs (nim, id_periode, status)
      VALUES ('2026999001', '20261', 'draft')
      RETURNING id_krs
    `);
    idKrs = newKrs.rows[0].id_krs;
  }

  // Tambahkan 1 item detail ke krs_detail untuk tes cascade & delete
  const kelasRes = await query(`SELECT id_kelas FROM kelas LIMIT 1`);
  const idKelas = kelasRes.rows[0]?.id_kelas || 1;

  await query(`DELETE FROM krs_detail WHERE id_krs = $1`, [idKrs]).catch(() => {});
  await query(`
    INSERT INTO krs_detail (id_krs, id_kelas)
    VALUES ($1, $2)
  `, [idKrs, idKelas]).catch(() => {});

  // Test D-01: Delete Single Item KRS Detail
  const t1Start = Date.now();
  try {
    const delRes = await query(`
      DELETE FROM krs_detail
      WHERE id_krs = $1 AND id_kelas = $2
    `, [idKrs, idKelas]);
    const deleted = delRes.rowCount === 1;
    results.push({
      test_id: 'CRUD-D01',
      author: member,
      operation: 'DELETE',
      target: 'Menghapus satu mata kuliah dari kartu krs_detail',
      expected: 'Data baris krs_detail berhasil terhapus (rowCount = 1)',
      actual: deleted ? '1 baris rincian KRS berhasil dihapus' : 'Gagal menghapus baris',
      status: deleted ? 'PASSED' : 'FAILED',
      latency: `${Date.now() - t1Start}ms`
    });
    console.log(`  ${deleted ? '✅ [PASS]' : '❌ [FAIL]'} CRUD-D01: Delete Single Item KRS Detail (${Date.now() - t1Start}ms)`);
  } catch (err) {
    results.push({
      test_id: 'CRUD-D01',
      author: member,
      operation: 'DELETE',
      target: 'Delete Single Item KRS Detail',
      expected: 'rowCount = 1',
      actual: `Error: ${err.message}`,
      status: 'FAILED',
      latency: `${Date.now() - t1Start}ms`
    });
    console.log(`  ❌ [FAIL] CRUD-D01: ${err.message}`);
  }

  // Masukkan kembali krs_detail untuk menguji ON DELETE CASCADE
  await query(`
    INSERT INTO krs_detail (id_krs, id_kelas)
    VALUES ($1, $2)
  `, [idKrs, idKelas]).catch(() => {});

  // Test D-02: Constraint ON DELETE CASCADE (Menghapus KRS otomatis menghapus rincian krs_detail)
  const t2Start = Date.now();
  try {
    await query(`DELETE FROM krs WHERE id_krs = $1`, [idKrs]);
    const orphanCheck = await query(`SELECT * FROM krs_detail WHERE id_krs = $1`, [idKrs]);
    const cascadeSuccess = orphanCheck.rows.length === 0;
    results.push({
      test_id: 'CRUD-D02',
      author: member,
      operation: 'DELETE',
      target: 'Integritas Relasi: ON DELETE CASCADE krs -> krs_detail',
      expected: 'Menghapus induk KRS otomatis membersihkan semua baris krs_detail anak',
      actual: cascadeSuccess ? 'KRS terhapus & 0 baris anak yatim piatu tersisa (Cascade Bersih)' : 'Rincian anak tertinggal',
      status: cascadeSuccess ? 'PASSED' : 'FAILED',
      latency: `${Date.now() - t2Start}ms`
    });
    console.log(`  ${cascadeSuccess ? '✅ [PASS]' : '❌ [FAIL]'} CRUD-D02: Constraint ON DELETE CASCADE Valid (${Date.now() - t2Start}ms)`);
  } catch (err) {
    results.push({
      test_id: 'CRUD-D02',
      author: member,
      operation: 'DELETE',
      target: 'Integritas Relasi: ON DELETE CASCADE',
      expected: 'Cascade terhapus',
      actual: `Error: ${err.message}`,
      status: 'FAILED',
      latency: `${Date.now() - t2Start}ms`
    });
    console.log(`  ❌ [FAIL] CRUD-D02: ${err.message}`);
  }

  // Test D-03: Constraint ON DELETE RESTRICT (Tolak penghapusan Prodi yang sedang aktif digunakan)
  const t3Start = Date.now();
  try {
    await query(`DELETE FROM prodi WHERE kode_prodi = 'SIF'`);
    results.push({
      test_id: 'CRUD-D03',
      author: member,
      operation: 'DELETE',
      target: 'Integritas Relasi: ON DELETE RESTRICT pada data master Prodi SIF',
      expected: 'Ditolak database dengan kode 23001/23503 (restrict/foreign_key_violation)',
      actual: 'Data master prodi yang terpakai berhasil terhapus (Kritis!)',
      status: 'FAILED',
      latency: `${Date.now() - t3Start}ms`
    });
    console.log(`  ❌ [FAIL] CRUD-D03: RESTRICT tidak bekerja`);
  } catch (err) {
    const isRestrictError = err.code === '23001' || err.code === '23503';
    results.push({
      test_id: 'CRUD-D03',
      author: member,
      operation: 'DELETE',
      target: 'Integritas Relasi: ON DELETE RESTRICT pada data master Prodi SIF',
      expected: 'Ditolak database dengan kode 23001/23503 (restrict/foreign_key_violation)',
      actual: `Berhasil ditolak: SQLSTATE ${err.code} (${err.message.split('\n')[0]})`,
      status: isRestrictError ? 'PASSED' : 'FAILED',
      latency: `${Date.now() - t3Start}ms`
    });
    console.log(`  ${isRestrictError ? '✅ [PASS]' : '❌ [FAIL]'} CRUD-D03: Constraint ON DELETE RESTRICT Valid (${Date.now() - t3Start}ms)`);
  }

  // Test D-04: Cleanup Data Uji Mahasiswa (Sanitasi Lingkungan Uji)
  const t4Start = Date.now();
  try {
    const delMhs = await query(`DELETE FROM mahasiswa WHERE nim = '2026999001'`);
    const clean = delMhs.rowCount >= 1;
    results.push({
      test_id: 'CRUD-D04',
      author: member,
      operation: 'DELETE',
      target: 'Sanitasi Database: Hapus mahasiswa uji setelah rangkaian test selesai',
      expected: 'Database kembali bersih ke state semula',
      actual: clean ? 'Data mahasiswa uji 2026999001 telah dibersihkan' : 'Data sudah bersih sebelumnya',
      status: 'PASSED',
      latency: `${Date.now() - t4Start}ms`
    });
    console.log(`  ✅ [PASS] CRUD-D04: Sanitasi Database Cleanup Selesai (${Date.now() - t4Start}ms)`);
  } catch (err) {
    results.push({
      test_id: 'CRUD-D04',
      author: member,
      operation: 'DELETE',
      target: 'Sanitasi Database',
      expected: 'Data dibersihkan',
      actual: `Error: ${err.message}`,
      status: 'FAILED',
      latency: `${Date.now() - t4Start}ms`
    });
    console.log(`  ❌ [FAIL] CRUD-D04: ${err.message}`);
  }

  return results;
}
