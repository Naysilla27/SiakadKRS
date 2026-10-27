-- =====================================================================
-- MASTER SCRIPT: DATABASE KRS - SIAKAD UNJANI
-- Mata Kuliah : SI611029 - Implementasi dan Pengujian Sistem Informasi
-- Sesuai ERD & Spesifikasi Pertemuan 3 (PostgreSQL)
-- =====================================================================

-- 1. TABEL ATURAN AKADEMIK (Konfigurasi Batas SKS)
CREATE TABLE IF NOT EXISTS aturan_akademik (
    kode VARCHAR(30) PRIMARY KEY,
    nilai INT NOT NULL,
    keterangan VARCHAR(200)
);

-- 2. TABEL PRODI
CREATE TABLE IF NOT EXISTS prodi (
    kode_prodi VARCHAR(10) PRIMARY KEY,
    nama_prodi VARCHAR(100) NOT NULL,
    jenjang VARCHAR(3) NOT NULL
);

-- 3. TABEL DOSEN
CREATE TABLE IF NOT EXISTS dosen (
    id_dosen INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nidn VARCHAR(10) UNIQUE NOT NULL,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    kode_prodi VARCHAR(10) NOT NULL,
    CONSTRAINT fk_dosen_prodi FOREIGN KEY (kode_prodi)
        REFERENCES prodi (kode_prodi)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 4. TABEL PERIODE
CREATE TABLE IF NOT EXISTS periode (
    id_periode VARCHAR(5) PRIMARY KEY,
    nama_periode VARCHAR(30) NOT NULL,
    tgl_mulai DATE NOT NULL,
    tgl_selesai DATE NOT NULL
);

-- 5. TABEL MATA KULIAH
CREATE TABLE IF NOT EXISTS mata_kuliah (
    kode_mk VARCHAR(10) PRIMARY KEY,
    nama_mk VARCHAR(100) NOT NULL,
    sks SMALLINT NOT NULL CHECK (sks > 0 AND sks <= 6),
    semester_ke SMALLINT NOT NULL CHECK (semester_ke BETWEEN 1 AND 8)
);

-- 6. TABEL MAHASISWA
CREATE TABLE IF NOT EXISTS mahasiswa (
    nim VARCHAR(12) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    tahun_masuk SMALLINT NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'aktif',
    kode_prodi VARCHAR(10) NOT NULL,
    id_dosen_pa INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    no_hp VARCHAR(20),
    CONSTRAINT uq_mahasiswa_email UNIQUE (email),
    CONSTRAINT ck_mahasiswa_nim CHECK (nim ~ '^[0-9]{8,12}$'),
    CONSTRAINT ck_mahasiswa_tahun CHECK (tahun_masuk BETWEEN 2000 AND 2100),
    CONSTRAINT ck_mahasiswa_status CHECK (status IN ('aktif', 'cuti', 'lulus', 'drop out')),
    CONSTRAINT ck_mahasiswa_no_hp CHECK (no_hp IS NULL OR no_hp ~ '^[0-9+]{8,20}$'),
    CONSTRAINT fk_mahasiswa_prodi FOREIGN KEY (kode_prodi)
        REFERENCES prodi (kode_prodi)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_mahasiswa_dosen_pa FOREIGN KEY (id_dosen_pa)
        REFERENCES dosen (id_dosen)
        ON DELETE SET NULL
);

-- 7. TABEL KELAS
CREATE TABLE IF NOT EXISTS kelas (
    id_kelas INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    kode_mk VARCHAR(10) NOT NULL,
    id_periode VARCHAR(5) NOT NULL,
    id_dosen INT NOT NULL,
    nama_kelas VARCHAR(5) NOT NULL,
    kuota SMALLINT NOT NULL DEFAULT 40 CHECK (kuota >= 0),
    CONSTRAINT fk_kelas_mk FOREIGN KEY (kode_mk)
        REFERENCES mata_kuliah (kode_mk)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_kelas_periode FOREIGN KEY (id_periode)
        REFERENCES periode (id_periode)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_kelas_dosen FOREIGN KEY (id_dosen)
        REFERENCES dosen (id_dosen)
        ON DELETE RESTRICT,
    CONSTRAINT uq_kelas UNIQUE (kode_mk, id_periode, nama_kelas)
);

-- 8. TABEL KRS
CREATE TABLE IF NOT EXISTS krs (
    id_krs INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nim VARCHAR(12) NOT NULL,
    id_periode VARCHAR(5) NOT NULL,
    tgl_isi DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(10) NOT NULL DEFAULT 'draft',
    CONSTRAINT ck_krs_status CHECK (status IN ('draft', 'diajukan', 'disetujui', 'revisi')),
    CONSTRAINT uq_krs_mahasiswa_periode UNIQUE (nim, id_periode),
    CONSTRAINT fk_krs_mahasiswa FOREIGN KEY (nim)
        REFERENCES mahasiswa (nim)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_krs_periode FOREIGN KEY (id_periode)
        REFERENCES periode (id_periode)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 9. TABEL KRS_DETAIL (Tabel Asosiatif Many-to-Many dengan Composite PK)
CREATE TABLE IF NOT EXISTS krs_detail (
    id_krs INT NOT NULL,
    id_kelas INT NOT NULL,
    nilai_huruf VARCHAR(2),
    PRIMARY KEY (id_krs, id_kelas),
    CONSTRAINT fk_krs_detail_krs FOREIGN KEY (id_krs)
        REFERENCES krs (id_krs)
        ON DELETE CASCADE,
    CONSTRAINT fk_krs_detail_kelas FOREIGN KEY (id_kelas)
        REFERENCES kelas (id_kelas)
        ON DELETE RESTRICT
);

-- =====================================================================
-- INDEX OPTIMASI (Sesuai Slide 20 & 21)
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_mahasiswa_nama ON mahasiswa (nama);
CREATE INDEX IF NOT EXISTS idx_mahasiswa_prodi ON mahasiswa (kode_prodi);
CREATE INDEX IF NOT EXISTS idx_kelas_mk ON kelas (kode_mk);
CREATE INDEX IF NOT EXISTS idx_krs_detail_kelas ON krs_detail (id_kelas);

-- =====================================================================
-- TRIGGER ATURAN BISNIS: BATAS MAKSIMUM SKS (Sesuai Slide 15)
-- =====================================================================
CREATE OR REPLACE FUNCTION fn_cek_maks_sks()
RETURNS TRIGGER AS $$
DECLARE
    v_total INT;
    v_sks INT;
    v_maks INT;
BEGIN
    -- Ambil batas SKS dari tabel konfigurasi aturan_akademik
    SELECT nilai INTO v_maks
    FROM aturan_akademik
    WHERE kode = 'maks_sks';

    -- Bila belum disetting, default ke 24 SKS
    IF v_maks IS NULL THEN
        v_maks := 24;
    END IF;

    -- Hitung SKS mata kuliah yang hendak ditambahkan
    SELECT mk.sks INTO v_sks
    FROM kelas kl
    JOIN mata_kuliah mk ON mk.kode_mk = kl.kode_mk
    WHERE kl.id_kelas = NEW.id_kelas;

    -- Hitung total SKS yang sudah ada di KRS ini
    SELECT COALESCE(SUM(mk.sks), 0) INTO v_total
    FROM krs_detail kd
    JOIN kelas kl ON kl.id_kelas = kd.id_kelas
    JOIN mata_kuliah mk ON mk.kode_mk = kl.kode_mk
    WHERE kd.id_krs = NEW.id_krs
      AND kd.id_kelas <> NEW.id_kelas;

    -- Validasi apakah melebihi batas SKS
    IF (v_total + v_sks) > v_maks THEN
        RAISE EXCEPTION 'Total SKS % melebihi batas % SKS', (v_total + v_sks), v_maks
        USING ERRCODE = '23514'; -- check_violation
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_krs_detail_maks_sks ON krs_detail;
CREATE TRIGGER trg_krs_detail_maks_sks
BEFORE INSERT OR UPDATE OF id_krs, id_kelas
ON krs_detail
FOR EACH ROW
EXECUTE FUNCTION fn_cek_maks_sks();

-- =====================================================================
-- SEED DATA AWAL (Data Referensi & Contoh Nyata Sesuai Slide)
-- =====================================================================

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
('SI611032', 'Data Warehouse & Business Intelligence', 3, 5),
('SI611035', 'Kecerdasan Buatan & Machine Learning', 3, 5),
('SI611036', 'Cloud Computing & DevOps', 3, 5),
('SI611037', 'Pengujian & Jaminan Mutu Perangkat Lunak', 3, 5),
('SI611038', 'Manajemen Layanan TI (ITSM / ITIL)', 3, 5),
('SI611039', 'Rekayasa Sistem Berbasis Komponen', 3, 5)
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
('SI611032', '20261', 2, 'SI-A', 35),
('SI611035', '20261', 1, 'SI-A', 40),
('SI611036', '20261', 2, 'SI-A', 40),
('SI611037', '20261', 1, 'SI-A', 40),
('SI611038', '20261', 3, 'SI-A', 40),
('SI611039', '20261', 2, 'SI-A', 40)
ON CONFLICT (kode_mk, id_periode, nama_kelas) DO NOTHING;

-- KRS Mahasiswa
INSERT INTO krs (nim, id_periode, tgl_isi, status) VALUES
('2023900001', '20261', '2026-09-02', 'disetujui'),
('2023900002', '20261', '2026-09-03', 'diajukan'),
('2023900004', '20261', '2026-09-04', 'draft')
ON CONFLICT (nim, id_periode) DO NOTHING;

-- KRS Detail (Mata kuliah yang diambil)
-- Andi Pratama (id_krs 1): Mengambil 4 MK (total 11/12 SKS)
INSERT INTO krs_detail (id_krs, id_kelas) VALUES
(1, 1), -- SI611029 (3 SKS)
(1, 3), -- SI611027 (3 SKS)
(1, 4), -- SI611028 (2 SKS)
(1, 6)  -- SI611021 (3 SKS)
ON CONFLICT (id_krs, id_kelas) DO NOTHING;

-- Bunga Lestari (id_krs 2): Mengambil 3 MK (8 SKS)
INSERT INTO krs_detail (id_krs, id_kelas) VALUES
(2, 2), -- SI611029 (3 SKS)
(2, 3), -- SI611027 (3 SKS)
(2, 4)  -- SI611028 (2 SKS)
ON CONFLICT (id_krs, id_kelas) DO NOTHING;

-- Dimas Saputra (id_krs 3): Mengambil 2 MK (6 SKS)
INSERT INTO krs_detail (id_krs, id_kelas) VALUES
(3, 1), -- SI611029 (3 SKS)
(3, 3)  -- SI611027 (3 SKS)
ON CONFLICT (id_krs, id_kelas) DO NOTHING;
