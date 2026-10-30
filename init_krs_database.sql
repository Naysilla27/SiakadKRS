-- =====================================================================
-- MASTER SCRIPT: DATABASE KRS - SIAKAD UNJANI
-- Mata Kuliah : SI611029 - Implementasi dan Pengujian Sistem Informasi
-- Sesuai ERD & Spesifikasi Pertemuan 3 (PostgreSQL / DBeaver)
-- Mahasiswa   : Naysilla Sifa Aprilianissa (2450231059) & Tim
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
    hari VARCHAR(20) DEFAULT 'Senin',
    jam VARCHAR(20) DEFAULT '08:00 - 10:30',
    ruang VARCHAR(30) DEFAULT 'R.301',
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
    catatan_dosen TEXT DEFAULT '',
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

-- 10. TABEL DEFECTS (Quality Assurance & Testing Hub - SI611029)
CREATE TABLE IF NOT EXISTS defects (
    id VARCHAR(20) PRIMARY KEY,
    module VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    error_type VARCHAR(50),
    fault TEXT,
    defect TEXT,
    status VARCHAR(50) DEFAULT 'Open',
    severity VARCHAR(20) DEFAULT 'Medium',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- AUTO-MIGRATIONS (Safe Alter if tables already exist)
ALTER TABLE kelas ADD COLUMN IF NOT EXISTS hari VARCHAR(20) DEFAULT 'Senin';
ALTER TABLE kelas ADD COLUMN IF NOT EXISTS jam VARCHAR(20) DEFAULT '08:00 - 10:30';
ALTER TABLE kelas ADD COLUMN IF NOT EXISTS ruang VARCHAR(30) DEFAULT 'R.301';
ALTER TABLE krs ADD COLUMN IF NOT EXISTS catatan_dosen TEXT DEFAULT '';

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
-- SEED DATA AWAL (Data Referensi & Data Nyata Mahasiswa)
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
('0415088001', 'Dr. Ir. Sigit Anggoro, S.T., M.T., IPM', 'sigit.anggoro@lecturer.unjani.ac.id', 'SIF'),
('0422118502', 'Irma Santikarama, S.Kom., M.T', 'irma.santikarama@lecturer.unjani.ac.id', 'SIF'),
('0410027501', 'Dea Destiani', 'Dea.Destiani@lecturer.unjani.ac.id', 'SIF')
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

-- Mahasiswa (Mahasiswa Utama S1 Sistem Informasi UNJANI)
INSERT INTO mahasiswa (nim, nama, email, tahun_masuk, status, kode_prodi, id_dosen_pa, no_hp) VALUES
('2450231059', 'Naysilla Sifa Aprilianissa', 'nssa.24@si.unjani.ac.id', 2024, 'aktif', 'SIF', 2, '081234567890'),
('2450231054', 'Meila Fitri', 'mfi.24@si.unjani.ac.id', 2023, 'aktif', 'SIF', 2, '081298765432'),
('2450231046', 'Anita Nurhayati', 'ani.24@si.unjani.ac.id', 2024, 'aktif', 'SIF', 1, '081377889900'),
('2450231051', 'Nayla Putri Romdoni', 'npr.24@si.unjani.ac.id', 2024, 'aktif', 'SIF', 1, '081455667788')
ON CONFLICT (nim) DO UPDATE SET
    nama = EXCLUDED.nama,
    email = EXCLUDED.email,
    id_dosen_pa = EXCLUDED.id_dosen_pa;

-- Kelas Perkuliahan (Jadwal & Ruang)
INSERT INTO kelas (kode_mk, id_periode, id_dosen, nama_kelas, kuota, hari, jam, ruang) VALUES
('SI611029', '20261', 1, 'SI-A', 40, 'Senin', '08:00 - 10:30', 'R.301'),
('SI611029', '20261', 2, 'SI-B', 40, 'Selasa', '13:00 - 15:30', 'R.302'),
('SI611027', '20261', 2, 'SI-A', 40, 'Rabu', '08:00 - 10:30', 'R.301'),
('SI611028', '20261', 1, 'SI-A', 35, 'Kamis', '10:30 - 12:10', 'R.204'),
('SI611020', '20261', 3, 'SI-A', 40, 'Jumat', '08:00 - 10:30', 'Lab. Komputer 2'),
('SI611021', '20261', 1, 'SI-A', 40, 'Selasa', '08:00 - 10:30', 'Lab. Web'),
('SI611030', '20261', 3, 'SI-A', 45, 'Rabu', '13:00 - 14:40', 'R.105'),
('SI611031', '20261', 1, 'SI-A', 40, 'Kamis', '13:00 - 15:30', 'R.301'),
('SI611032', '20261', 2, 'SI-A', 35, 'Jumat', '13:30 - 16:00', 'Lab. Data'),
('SI611035', '20261', 1, 'SI-A', 40, 'Rabu', '10:30 - 13:00', 'R.302'),
('SI611036', '20261', 2, 'SI-A', 40, 'Kamis', '08:00 - 10:30', 'Lab. Cloud'),
('SI611037', '20261', 1, 'SI-A', 40, 'Jumat', '09:00 - 11:30', 'R.205'),
('SI611038', '20261', 3, 'SI-A', 40, 'Senin', '13:00 - 15:30', 'R.201'),
('SI611039', '20261', 2, 'SI-A', 40, 'Selasa', '10:30 - 13:00', 'R.202')
ON CONFLICT (kode_mk, id_periode, nama_kelas) DO NOTHING;

-- KRS Mahasiswa
INSERT INTO krs (nim, id_periode, tgl_isi, status, catatan_dosen) VALUES
('2450231059', '20261', '2026-10-20', 'disetujui', 'Acc Silahkan Cek Jadwal yang Sudah Ada'),
('2450231054', '20261', '2026-10-21', 'diajukan', 'Menunggu review Dosen PA.'),
('2450231046', '20261', '2026-10-22', 'draft', ''),
('2450231051', '20261', '2026-10-23', 'draft', '')
ON CONFLICT (nim, id_periode) DO UPDATE SET
    status = EXCLUDED.status,
    catatan_dosen = EXCLUDED.catatan_dosen;

-- KRS Detail (Mata Kuliah yang Diambil Mahasiswa)
-- Naysilla Sifa Aprilianissa (id_krs 1): Mengambil 4 MK
INSERT INTO krs_detail (id_krs, id_kelas) VALUES
(1, 1), -- SI611029 (3 SKS)
(1, 3), -- SI611027 (3 SKS)
(1, 4), -- SI611028 (2 SKS)
(1, 6)  -- SI611021 (3 SKS)
ON CONFLICT (id_krs, id_kelas) DO NOTHING;

-- Meila Fitri (id_krs 2): Mengambil 3 MK (8 SKS)
INSERT INTO krs_detail (id_krs, id_kelas) VALUES
(2, 2), -- SI611029 (3 SKS)
(2, 3), -- SI611027 (3 SKS)
(2, 4)  -- SI611028 (2 SKS)
ON CONFLICT (id_krs, id_kelas) DO NOTHING;

-- Defect Tracking Seed (Quality Hub - Slide 16)
INSERT INTO defects (id, module, title, error_type, fault, defect, status, severity) VALUES
('DEF-001', 'Validasi KRS', 'Sistem menolak KRS dengan 25 SKS (Trigger Test)', 'Human Error', 'Kondisi program batas SKS', 'Total SKS 25 melebihi batas 24', 'Verified Fixed', 'Critical'),
('DEF-002', 'Autentikasi', 'Validasi password sesuai spesifikasi', 'Fault', 'Password length check', 'Password < 8 karakter', 'Closed', 'Medium')
ON CONFLICT (id) DO NOTHING;
