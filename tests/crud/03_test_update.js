/**
 * Modul Uji 3: UPDATE (Operasi Ubah Data, Alur Status Workflow & CHECK Constraint)
 * Kontributor: Nayla Putri Romdoni (NIM: 2450231051) - Frontend Developer
 * Mata Kuliah: SI611029 Implementasi dan Pengujian Sistem Informasi - UNJANI
 */

import { query } from '../../server/db.js';

export async function runUpdateTests() {
  const results = [];
  const member = 'Nayla Putri Romdoni (Frontend)';

  console.log(`\n======================================================`);
  console.log(`[MODUL 3: UPDATE TESTING] Kontributor: ${member}`);
  console.log(`======================================================`);

  // Test U-01: Update Profil & IP Semester Mahasiswa
  const t1Start = Date.now();
  try {
    const updateQ = `
      UPDATE mahasiswa
      SET nama = $1,
          ips_lalu = $2
      WHERE nim = $3
      RETURNING nim, nama, ips_lalu
    `;
    const res = await query(updateQ, ['Mahasiswa Uji Nayla Update', 2.35, '2026999001']);
    const updated = res.rows.length === 1 && res.rows[0].nama === 'Mahasiswa Uji Nayla Update';
    results.push({
      test_id: 'CRUD-U01',
      author: member,
      operation: 'UPDATE',
      target: 'Memperbarui nama dan IP semester lalu mahasiswa',
      expected: 'Data berhasil diperbarui menjadi nama baru dan IPS 2.35',
      actual: updated ? `Telah diubah: ${res.rows[0].nama} (IPS: ${res.rows[0].ips_lalu})` : 'Gagal update',
      status: updated ? 'PASSED' : 'FAILED',
      latency: `${Date.now() - t1Start}ms`
    });
    console.log(`  ${updated ? '✅ [PASS]' : '❌ [FAIL]'} CRUD-U01: Update Profil Mahasiswa Valid (${Date.now() - t1Start}ms)`);
  } catch (err) {
    results.push({
      test_id: 'CRUD-U01',
      author: member,
      operation: 'UPDATE',
      target: 'Update Profil Mahasiswa',
      expected: 'Berhasil diperbarui',
      actual: `Error: ${err.message}`,
      status: 'FAILED',
      latency: `${Date.now() - t1Start}ms`
    });
    console.log(`  ❌ [FAIL] CRUD-U01: ${err.message}`);
  }

  // Test U-02: Verifikasi Perubahan Kuota SKS Otomatis Setelah Update IPS (2.35 -> 18 SKS)
  const t2Start = Date.now();
  try {
    const checkQ = `
      SELECT ips_lalu,
             CASE
               WHEN ips_lalu >= 3.00 THEN 24
               WHEN ips_lalu >= 2.50 THEN 21
               WHEN ips_lalu >= 2.00 THEN 18
               WHEN ips_lalu >= 1.50 THEN 15
               ELSE 12
             END as max_sks
      FROM mahasiswa
      WHERE nim = '2026999001'
    `;
    const res = await query(checkQ);
    const validShift = res.rows.length === 1 && Number(res.rows[0].max_sks) === 18;
    results.push({
      test_id: 'CRUD-U02',
      author: member,
      operation: 'UPDATE',
      target: 'Dampak perubahan IPS terhadap kuota SKS (Slide P5: 2.00-2.49 = 18 SKS)',
      expected: 'Batas SKS mahasiswa otomatis bergeser dari 24 SKS menjadi 18 SKS',
      actual: validShift ? `Valid: IPS 2.35 otomatis terhitung maks 18 SKS` : `Kalkulasi tidak tepat: ${res.rows[0]?.max_sks}`,
      status: validShift ? 'PASSED' : 'FAILED',
      latency: `${Date.now() - t2Start}ms`
    });
    console.log(`  ${validShift ? '✅ [PASS]' : '❌ [FAIL]'} CRUD-U02: Dynamic SKS Shift Post-Update (${Date.now() - t2Start}ms)`);
  } catch (err) {
    results.push({
      test_id: 'CRUD-U02',
      author: member,
      operation: 'UPDATE',
      target: 'Dynamic SKS Shift Post-Update',
      expected: '18 SKS',
      actual: `Error: ${err.message}`,
      status: 'FAILED',
      latency: `${Date.now() - t2Start}ms`
    });
    console.log(`  ❌ [FAIL] CRUD-U02: ${err.message}`);
  }

  // Siapkan data KRS dummy untuk tes workflow
  await query(`DELETE FROM krs WHERE nim = '2026999001'`).catch(() => {});
  const krsInit = await query(`
    INSERT INTO krs (nim, id_periode, status)
    VALUES ('2026999001', '20261', 'draft')
    RETURNING id_krs
  `);
  const idKrs = krsInit.rows[0]?.id_krs;

  // Test U-03: Update Status Alur Perwalian KRS (draft -> diajukan -> disetujui)
  const t3Start = Date.now();
  try {
    const updateKrsQ = `
      UPDATE krs
      SET status = 'disetujui',
          catatan_dosen = 'Disetujui oleh Dosen PA'
      WHERE id_krs = $1
      RETURNING id_krs, status, catatan_dosen
    `;
    const res = await query(updateKrsQ, [idKrs]);
    const success = res.rows.length === 1 && res.rows[0].status === 'disetujui';
    results.push({
      test_id: 'CRUD-U03',
      author: member,
      operation: 'UPDATE',
      target: 'Update status perwalian KRS mahasiswa menjadi disetujui',
      expected: 'Status KRS berhasil berubah menjadi disetujui',
      actual: success ? `Status KRS ID ${res.rows[0].id_krs} berhasil diubah ke: ${res.rows[0].status}` : 'Gagal update status',
      status: success ? 'PASSED' : 'FAILED',
      latency: `${Date.now() - t3Start}ms`
    });
    console.log(`  ${success ? '✅ [PASS]' : '❌ [FAIL]'} CRUD-U03: Update Status Alur KRS Valid (${Date.now() - t3Start}ms)`);
  } catch (err) {
    results.push({
      test_id: 'CRUD-U03',
      author: member,
      operation: 'UPDATE',
      target: 'Update Status Alur KRS',
      expected: 'disetujui',
      actual: `Error: ${err.message}`,
      status: 'FAILED',
      latency: `${Date.now() - t3Start}ms`
    });
    console.log(`  ❌ [FAIL] CRUD-U03: ${err.message}`);
  }

  // Test U-04: Constraint CHECK - Update Status KRS di Luar Domain Ditolak
  const t4Start = Date.now();
  try {
    await query(`
      UPDATE krs
      SET status = 'ilegal'
      WHERE id_krs = $1
    `, [idKrs]);
    results.push({
      test_id: 'CRUD-U04',
      author: member,
      operation: 'UPDATE',
      target: 'Constraint CHECK: Cegah status KRS selain draft, diajukan, disetujui, revisi',
      expected: 'Ditolak database dengan kode 23514 (check_violation)',
      actual: 'Status ilegal berhasil disimpan ke database',
      status: 'FAILED',
      latency: `${Date.now() - t4Start}ms`
    });
    console.log(`  ❌ [FAIL] CRUD-U04: Status ilegal tidak ditolak`);
  } catch (err) {
    const isCheckError = err.code === '23514';
    results.push({
      test_id: 'CRUD-U04',
      author: member,
      operation: 'UPDATE',
      target: 'Constraint CHECK: Cegah status KRS selain draft, diajukan, disetujui, revisi',
      expected: 'Ditolak database dengan kode 23514 (check_violation)',
      actual: `Berhasil ditolak: SQLSTATE ${err.code} (${err.message.split('\n')[0]})`,
      status: isCheckError ? 'PASSED' : 'FAILED',
      latency: `${Date.now() - t4Start}ms`
    });
    console.log(`  ${isCheckError ? '✅ [PASS]' : '❌ [FAIL]'} CRUD-U04: Constraint CHECK Status Ilegal Ditolak (${Date.now() - t4Start}ms)`);
  }

  return results;
}
