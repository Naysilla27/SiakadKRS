-- Migration 006: Add Indexes for performance optimization (Slide 20 & 21)
-- migrate:up
CREATE INDEX IF NOT EXISTS idx_mahasiswa_nama ON mahasiswa (nama);
CREATE INDEX IF NOT EXISTS idx_mahasiswa_prodi ON mahasiswa (kode_prodi);
CREATE INDEX IF NOT EXISTS idx_kelas_mk ON kelas (kode_mk);
CREATE INDEX IF NOT EXISTS idx_krs_detail_kelas ON krs_detail (id_kelas);

-- migrate:down
DROP INDEX IF EXISTS idx_krs_detail_kelas;
DROP INDEX IF EXISTS idx_kelas_mk;
DROP INDEX IF EXISTS idx_mahasiswa_prodi;
DROP INDEX IF EXISTS idx_mahasiswa_nama;
