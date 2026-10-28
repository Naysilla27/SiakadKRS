-- =====================================================================
-- SINKRONISASI DATA MAHASISWA & DOSEN BARU KE POSTGRESQL (krs_dev)
-- Jalankan skrip ini di DBeaver atau pgAdmin 4 jika database PostgreSQL Anda
-- belum memiliki data mahasiswa baru: Naysilla, Meila, Anita, dan Nayla.
-- =====================================================================

-- 1. Pastikan Dosen Terdaftar
INSERT INTO dosen (nidn, nama, email, kode_prodi) VALUES
('0415088001', 'Dr. Ir. Sigit Anggoro, S.T., M.T., IPM', 'sigit.anggoro@lecturer.unjani.ac.id', 'SIF'),
('0422118502', 'Irma Santikarama, S.Kom., M.T', 'irma.santikarama@lecturer.unjani.ac.id', 'SIF'),
('0410027501', 'Dea Destiani', 'Dea.Destiani@lecturer.unjani.ac.id', 'SIF')
ON CONFLICT (nidn) DO UPDATE SET 
  nama = EXCLUDED.nama, 
  email = EXCLUDED.email;

-- 2. Masukkan / Perbarui Data Mahasiswa
INSERT INTO mahasiswa (nim, nama, email, tahun_masuk, status, kode_prodi, id_dosen_pa, no_hp) VALUES
('2450231059', 'Naysilla Sifa Aprilianissa', 'nssa.24@si.unjani.ac.id', 2024, 'aktif', 'SIF', 2, '081234567890'),
('2450231054', 'Meila Fitri', 'mfi.24@si.unjani.ac.id', 2023, 'aktif', 'SIF', 2, '081298765432'),
('2450231046', 'Anita Nurhayati', 'ani.24@si.unjani.ac.id', 2024, 'aktif', 'SIF', 1, '081377889900'),
('2450231051', 'Nayla Putri Romdoni', 'npr.24@si.unjani.ac.id', 2024, 'aktif', 'SIF', 1, '081455667788')
ON CONFLICT (nim) DO UPDATE SET 
  nama = EXCLUDED.nama, 
  email = EXCLUDED.email, 
  tahun_masuk = EXCLUDED.tahun_masuk, 
  id_dosen_pa = EXCLUDED.id_dosen_pa;

-- 3. Inisialisasi KRS
INSERT INTO krs (nim, id_periode, tgl_isi, status, catatan_dosen) VALUES
('2450231059', '20261', '2026-10-20', 'disetujui', 'Acc Silahkan Cek Jadwal yang Sudah Ada'),
('2450231054', '20261', '2026-10-21', 'diajukan', 'Menunggu review Dosen PA.'),
('2450231046', '20261', '2026-10-22', 'draft', ''),
('2450231051', '20261', '2026-10-23', 'draft', '')
ON CONFLICT (nim, id_periode) DO UPDATE SET
  status = EXCLUDED.status,
  catatan_dosen = EXCLUDED.catatan_dosen;
