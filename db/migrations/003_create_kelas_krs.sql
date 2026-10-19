-- Migration 003: Create Kelas, KRS, and KRS Detail
-- migrate:up
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

-- migrate:down
DROP TABLE IF EXISTS krs_detail CASCADE;
DROP TABLE IF EXISTS krs CASCADE;
DROP TABLE IF EXISTS kelas CASCADE;
