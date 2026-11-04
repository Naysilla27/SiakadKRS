-- =====================================================================
-- MIGRATION 007: Batas Maksimal SKS Dinamis Berdasarkan IP Semester
-- Sesuai Tabel Aturan Beban Belajar:
--   0,00 - 1,49 : 12 SKS
--   1,50 - 1,99 : 15 SKS
--   2,00 - 2,49 : 18 SKS
--   2,50 - 2,99 : 21 SKS
--   3,00 - 4,00 : 24 SKS
-- =====================================================================

-- 1. Tambah kolom ips_lalu di tabel mahasiswa jika belum ada
ALTER TABLE mahasiswa 
ADD COLUMN IF NOT EXISTS ips_lalu NUMERIC(3,2) DEFAULT 3.50;

-- Update data mahasiswa yang sudah ada dengan nilai default wajar
UPDATE mahasiswa SET ips_lalu = 3.50 WHERE ips_lalu IS NULL;

-- 2. Update fungsi trigger fn_cek_maks_sks() agar dinamis per mahasiswa
CREATE OR REPLACE FUNCTION fn_cek_maks_sks()
RETURNS TRIGGER AS $$
DECLARE
    v_nim VARCHAR(12);
    v_ips NUMERIC(3,2);
    v_maks INT;
    v_total INT;
    v_sks INT;
BEGIN
    -- Ambil NIM mahasiswa dari KRS
    SELECT nim INTO v_nim FROM krs WHERE id_krs = NEW.id_krs;

    -- Ambil IP Semester lalu dari mahasiswa
    SELECT COALESCE(ips_lalu, 3.00) INTO v_ips FROM mahasiswa WHERE nim = v_nim;

    -- Tentukan batas SKS berdasarkan aturan IP Semester (Tabel Slide Beban SKS)
    IF v_ips >= 3.00 THEN
        v_maks := 24;
    ELSIF v_ips >= 2.50 THEN
        v_maks := 21;
    ELSIF v_ips >= 2.00 THEN
        v_maks := 18;
    ELSIF v_ips >= 1.50 THEN
        v_maks := 15;
    ELSE
        v_maks := 12;
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

    -- Validasi apakah melebihi batas SKS mahasiswa
    IF (v_total + v_sks) > v_maks THEN
        RAISE EXCEPTION 'Total SKS % melebihi batas % SKS (IP Semester: %)', (v_total + v_sks), v_maks, v_ips
        USING ERRCODE = '23514'; -- check_violation
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
