/**
 * Modul Uji 1: CREATE (Operasi Tambah Data & Validasi Integritas)
 * Kontributor: Anita Nurhayati (NIM: 2450231046) - Database Administrator (DBA)
 * Mata Kuliah: SI611029 Implementasi dan Pengujian Sistem Informasi - UNJANI
 */

import { query } from '../../server/db.js';

export async function runCreateTests() {
  const results = [];
  const member = 'Anita Nurhayati (DBA)';

  console.log(`\n======================================================`);
  console.log(`[MODUL 1: CREATE TESTING] Kontributor: ${member}`);
  console.log(`======================================================`);

  // Pastikan data dummy bersih sebelum mulai
  await query(`DELETE FROM mahasiswa WHERE nim IN ('2026999001', '2026999002')`).catch(() => {});

  // Test C-01: Insert Mahasiswa Baru Valid
  const t1Start = Date.now();
  try {
    const insertQ = `
      INSERT INTO mahasiswa (nim, nama, email, tahun_masuk, status, kode_prodi, id_dosen_pa, ips_lalu)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING nim, nama, email, status, ips_lalu
    `;
    const res = await query(insertQ, [
      '2026999001',
      'Mahasiswa Uji Anita',
      'uji.anita@si.unjani.ac.id',
      2024,
      'aktif',
      'SIF',
      1,
      3.25
    ]);
    const success = res.rows.length === 1 && res.rows[0].nim === '2026999001';
    results.push({
      test_id: 'CRUD-C01',
      author: member,
      operation: 'CREATE',
      target: 'Insert Mahasiswa Baru dengan Data Valid',
      expected: 'Baris baru berhasil disimpan di database (Status 201)',
      actual: `Berhasil disimpan: NIM ${res.rows[0].nim} (${res.rows[0].nama})`,
      status: success ? 'PASSED' : 'FAILED',
      latency: `${Date.now() - t1Start}ms`
    });
    console.log(`  ${success ? '✅ [PASS]' : '❌ [FAIL]'} CRUD-C01: Insert Mahasiswa Baru Valid (${Date.now() - t1Start}ms)`);
  } catch (err) {
    results.push({
      test_id: 'CRUD-C01',
      author: member,
      operation: 'CREATE',
      target: 'Insert Mahasiswa Baru Valid',
      expected: 'Berhasil disimpan',
      actual: `Error: ${err.message}`,
      status: 'FAILED',
      latency: `${Date.now() - t1Start}ms`
    });
    console.log(`  ❌ [FAIL] CRUD-C01: ${err.message}`);
  }

  // Test C-02: Constraint Primary Key - NIM Duplikat Ditolak
  const t2Start = Date.now();
  try {
    await query(`
      INSERT INTO mahasiswa (nim, nama, email, tahun_masuk, kode_prodi)
      VALUES ('2026999001', 'Duplikat Anita', 'duplikat@si.unjani.ac.id', 2024, 'SIF')
    `);
    results.push({
      test_id: 'CRUD-C02',
      author: member,
      operation: 'CREATE',
      target: 'Constraint PK: Cegah duplikasi NIM mahasiswa',
      expected: 'Ditolak database dengan kode 23505 (unique_violation)',
      actual: 'Data duplikat lolos (Trigger/Constraint gagal)',
      status: 'FAILED',
      latency: `${Date.now() - t2Start}ms`
    });
    console.log(`  ❌ [FAIL] CRUD-C02: NIM Duplikat tidak ditolak`);
  } catch (err) {
    const isPkError = err.code === '23505';
    results.push({
      test_id: 'CRUD-C02',
      author: member,
      operation: 'CREATE',
      target: 'Constraint PK: Cegah duplikasi NIM mahasiswa',
      expected: 'Ditolak database dengan kode 23505 (unique_violation)',
      actual: `Berhasil ditolak: SQLSTATE ${err.code} (${err.message.split('\n')[0]})`,
      status: isPkError ? 'PASSED' : 'FAILED',
      latency: `${Date.now() - t2Start}ms`
    });
    console.log(`  ${isPkError ? '✅ [PASS]' : '❌ [FAIL]'} CRUD-C02: Constraint PK Duplikat Ditolak (${Date.now() - t2Start}ms)`);
  }

  // Test C-03: Constraint NOT NULL - Nama Wajib Terisi
  const t3Start = Date.now();
  try {
    await query(`
      INSERT INTO mahasiswa (nim, nama, email, tahun_masuk, kode_prodi)
      VALUES ('2026999002', NULL, 'tanpa.nama@si.unjani.ac.id', 2024, 'SIF')
    `);
    results.push({
      test_id: 'CRUD-C03',
      author: member,
      operation: 'CREATE',
      target: 'Constraint NOT NULL: Field nama wajib terisi',
      expected: 'Ditolak database dengan kode 23502 (not_null_violation)',
      actual: 'Data tanpa nama berhasil masuk',
      status: 'FAILED',
      latency: `${Date.now() - t3Start}ms`
    });
    console.log(`  ❌ [FAIL] CRUD-C03: Nama NULL tidak ditolak`);
  } catch (err) {
    const isNotNullError = err.code === '23502';
    results.push({
      test_id: 'CRUD-C03',
      author: member,
      operation: 'CREATE',
      target: 'Constraint NOT NULL: Field nama wajib terisi',
      expected: 'Ditolak database dengan kode 23502 (not_null_violation)',
      actual: `Berhasil ditolak: SQLSTATE ${err.code} (${err.message.split('\n')[0]})`,
      status: isNotNullError ? 'PASSED' : 'FAILED',
      latency: `${Date.now() - t3Start}ms`
    });
    console.log(`  ${isNotNullError ? '✅ [PASS]' : '❌ [FAIL]'} CRUD-C03: Constraint NOT NULL Nama Ditolak (${Date.now() - t3Start}ms)`);
  }

  // Test C-04: Constraint Foreign Key - Kode Prodi Fiktif Ditolak
  const t4Start = Date.now();
  try {
    await query(`
      INSERT INTO mahasiswa (nim, nama, email, tahun_masuk, kode_prodi)
      VALUES ('2026999002', 'Uji FK Anita', 'uji.fk@si.unjani.ac.id', 2024, 'PRODI_GAIB')
    `);
    results.push({
      test_id: 'CRUD-C04',
      author: member,
      operation: 'CREATE',
      target: 'Constraint FK: Validasi kode prodi harus terdaftar di tabel prodi',
      expected: 'Ditolak database dengan kode 23503 (foreign_key_violation)',
      actual: 'Prodi fiktif berhasil disimpan',
      status: 'FAILED',
      latency: `${Date.now() - t4Start}ms`
    });
    console.log(`  ❌ [FAIL] CRUD-C04: FK fiktif tidak ditolak`);
  } catch (err) {
    const isFkError = err.code === '23503';
    results.push({
      test_id: 'CRUD-C04',
      author: member,
      operation: 'CREATE',
      target: 'Constraint FK: Validasi kode prodi harus terdaftar di tabel prodi',
      expected: 'Ditolak database dengan kode 23503 (foreign_key_violation)',
      actual: `Berhasil ditolak: SQLSTATE ${err.code} (${err.message.split('\n')[0]})`,
      status: isFkError ? 'PASSED' : 'FAILED',
      latency: `${Date.now() - t4Start}ms`
    });
    console.log(`  ${isFkError ? '✅ [PASS]' : '❌ [FAIL]'} CRUD-C04: Constraint FK Prodi Fiktif Ditolak (${Date.now() - t4Start}ms)`);
  }

  return results;
}
