-- Seed Data Referensi & Demo Sesuai Pertemuan 3 UNJANI
-- Aturan Batas SKS
INSERT INTO aturan_akademik (kode, nilai, keterangan)
VALUES ('maks_sks', 24, 'Batas maksimum SKS per semester')
ON CONFLICT (kode) DO UPDATE SET nilai = EXCLUDED.nilai;

-- Prodi
INSERT INTO prodi (kode_prodi, nama_prodi, jenjang) VALUES
('SIF', 'Sistem Informasi', 'S1'),
('INF', 'Informatika', 'S1'),
('IND', 'Teknik Industri', 'S1')
ON CONFLICT (kode_prodi) DO NOTHING;

-- Dosen
INSERT INTO dosen (nidn, nama, email, kode_prodi) VALUES
('0415088001', 'Dr. Ir. Sigit Anggoro, S.T., M.T., IPM', 'sigit.anggoro@unjani.ac.id', 'SIF'),
('0422118502', 'Irma Santikarama, S.Kom., M.T', 'irma.santikarama@unjani.ac.id', 'SIF'),
('0410027501', 'Dra. Aisyah Rahmawati, M.T.', 'aisyah@unjani.ac.id', 'SIF')
ON CONFLICT (nidn) DO NOTHING;

-- Periode
INSERT INTO periode (id_periode, nama_periode, tgl_mulai, tgl_selesai) VALUES
('20261', 'Semester Ganjil 2026/2027', '2026-09-01', '2027-01-31'),
('20262', 'Semester Genap 2026/2027', '2027-02-01', '2027-06-30')
ON CONFLICT (id_periode) DO NOTHING;

-- Mata Kuliah
INSERT INTO mata_kuliah (kode_mk, nama_mk, sks, semester_ke) VALUES
('SI611029', 'Implementasi dan Pengujian Sistem Informasi', 3, 5),
('SI611027', 'Manajemen Proyek TI', 3, 5),
('SI611028', 'Arsitektur Enterprise', 2, 5),
('SI611020', 'Basis Data Lanjut', 3, 3),
('SI611021', 'Pemrograman Web Modern', 3, 3),
('SI611015', 'Algoritma & Struktur Data', 4, 2),
('SI611030', 'Etika Profesi & Tata Kelola IT', 2, 5),
('SI611031', 'Keamanan Sistem Informasi', 3, 5),
('SI611032', 'Data Warehouse & Business Intelligence', 3, 5)
ON CONFLICT (kode_mk) DO NOTHING;

-- Mahasiswa
INSERT INTO mahasiswa (nim, nama, email, tahun_masuk, status, kode_prodi, id_dosen_pa, no_hp) VALUES
('2023900001', 'Andi Pratama', 'andi.pratama@student.unjani.ac.id', 2023, 'aktif', 'SIF', 1, '081234567890'),
('2023900002', 'Bunga Lestari', 'bunga.lestari@student.unjani.ac.id', 2023, 'aktif', 'SIF', 2, '081298765432'),
('2023900003', 'Citra Dewi', 'citra.dewi@student.unjani.ac.id', 2023, 'aktif', 'SIF', 1, '081377889900'),
('2023900004', 'Dimas Saputra', 'dimas.saputra@student.unjani.ac.id', 2023, 'aktif', 'SIF', 2, '081455667788')
ON CONFLICT (nim) DO NOTHING;

-- Kelas
INSERT INTO kelas (kode_mk, id_periode, id_dosen, nama_kelas, kuota) VALUES
('SI611029', '20261', 1, 'SI-A', 40),
('SI611029', '20261', 2, 'SI-B', 40),
('SI611027', '20261', 2, 'SI-A', 40),
('SI611028', '20261', 1, 'SI-A', 35),
('SI611020', '20261', 3, 'SI-A', 40),
('SI611021', '20261', 1, 'SI-A', 40),
('SI611030', '20261', 3, 'SI-A', 45),
('SI611031', '20261', 1, 'SI-A', 40),
('SI611032', '20261', 2, 'SI-A', 35)
ON CONFLICT (kode_mk, id_periode, nama_kelas) DO NOTHING;

-- KRS Mahasiswa (Andi Pratama: Disetujui, Bunga: Diajukan, Dimas: Draft)
INSERT INTO krs (nim, id_periode, tgl_isi, status) VALUES
('2023900001', '20261', '2026-09-02', 'disetujui'),
('2023900002', '20261', '2026-09-03', 'diajukan'),
('2023900004', '20261', '2026-09-04', 'draft')
ON CONFLICT (nim, id_periode) DO NOTHING;

-- KRS Detail
INSERT INTO krs_detail (id_krs, id_kelas) VALUES
(1, 1),
(1, 3),
(1, 4),
(1, 6),
(2, 2),
(2, 3),
(2, 4),
(3, 1),
(3, 3)
ON CONFLICT (id_krs, id_kelas) DO NOTHING;
