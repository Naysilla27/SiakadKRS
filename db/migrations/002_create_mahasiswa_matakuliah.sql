-- Migration 002: Create Periode, Mata Kuliah, and Mahasiswa
-- migrate:up
CREATE TABLE IF NOT EXISTS periode (
    id_periode VARCHAR(5) PRIMARY KEY,
    nama_periode VARCHAR(30) NOT NULL,
    tgl_mulai DATE NOT NULL,
    tgl_selesai DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS mata_kuliah (
    kode_mk VARCHAR(10) PRIMARY KEY,
    nama_mk VARCHAR(100) NOT NULL,
    sks SMALLINT NOT NULL CHECK (sks > 0 AND sks <= 6),
    semester_ke SMALLINT NOT NULL CHECK (semester_ke BETWEEN 1 AND 8)
);

CREATE TABLE IF NOT EXISTS mahasiswa (
    nim VARCHAR(12) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    tahun_masuk SMALLINT NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'aktif',
    kode_prodi VARCHAR(10) NOT NULL,
    id_dosen_pa INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_mahasiswa_email UNIQUE (email),
    CONSTRAINT ck_mahasiswa_nim CHECK (nim ~ '^[0-9]{8,12}$'),
    CONSTRAINT ck_mahasiswa_tahun CHECK (tahun_masuk BETWEEN 2000 AND 2100),
    CONSTRAINT ck_mahasiswa_status CHECK (status IN ('aktif', 'cuti', 'lulus', 'drop out')),
    CONSTRAINT fk_mahasiswa_prodi FOREIGN KEY (kode_prodi)
        REFERENCES prodi (kode_prodi)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_mahasiswa_dosen_pa FOREIGN KEY (id_dosen_pa)
        REFERENCES dosen (id_dosen)
        ON DELETE SET NULL
);

-- migrate:down
DROP TABLE IF EXISTS mahasiswa CASCADE;
DROP TABLE IF EXISTS mata_kuliah CASCADE;
DROP TABLE IF EXISTS periode CASCADE;
