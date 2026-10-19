-- Migration 001: Create Prodi and Dosen
-- migrate:up
CREATE TABLE IF NOT EXISTS prodi (
    kode_prodi VARCHAR(10) PRIMARY KEY,
    nama_prodi VARCHAR(100) NOT NULL,
    jenjang VARCHAR(3) NOT NULL
);

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

-- migrate:down
DROP TABLE IF EXISTS dosen CASCADE;
DROP TABLE IF EXISTS prodi CASCADE;
