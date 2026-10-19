-- Migration 005: evolusi skema (ALTER TABLE mahasiswa add no_hp)
-- migrate:up
ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS no_hp VARCHAR(20);
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_mahasiswa_no_hp'
    ) THEN
        ALTER TABLE mahasiswa ADD CONSTRAINT ck_mahasiswa_no_hp
        CHECK (no_hp IS NULL OR no_hp ~ '^[0-9+]{8,20}$');
    END IF;
END $$;

-- migrate:down
ALTER TABLE mahasiswa DROP CONSTRAINT IF EXISTS ck_mahasiswa_no_hp;
ALTER TABLE mahasiswa DROP COLUMN IF EXISTS no_hp;
