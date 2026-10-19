-- Migration 004: Add Aturan Akademik & Trigger Batas SKS
-- migrate:up
CREATE TABLE IF NOT EXISTS aturan_akademik (
    kode VARCHAR(30) PRIMARY KEY,
    nilai INT NOT NULL,
    keterangan VARCHAR(200)
);

CREATE OR REPLACE FUNCTION fn_cek_maks_sks()
RETURNS TRIGGER AS $$
DECLARE
    v_total INT;
    v_sks INT;
    v_maks INT;
BEGIN
    SELECT nilai INTO v_maks
    FROM aturan_akademik
    WHERE kode = 'maks_sks';

    IF v_maks IS NULL THEN
        v_maks := 24;
    END IF;

    SELECT mk.sks INTO v_sks
    FROM kelas kl
    JOIN mata_kuliah mk ON mk.kode_mk = kl.kode_mk
    WHERE kl.id_kelas = NEW.id_kelas;

    SELECT COALESCE(SUM(mk.sks), 0) INTO v_total
    FROM krs_detail kd
    JOIN kelas kl ON kl.id_kelas = kd.id_kelas
    JOIN mata_kuliah mk ON mk.kode_mk = kl.kode_mk
    WHERE kd.id_krs = NEW.id_krs
      AND kd.id_kelas <> NEW.id_kelas;

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

-- migrate:down
DROP TRIGGER IF EXISTS trg_krs_detail_maks_sks ON krs_detail;
DROP FUNCTION IF EXISTS fn_cek_maks_sks();
DROP TABLE IF EXISTS aturan_akademik CASCADE;
