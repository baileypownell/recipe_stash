import type { MigrationBuilder } from 'node-pg-migrate';

export const up = (pgm: MigrationBuilder) => {
  pgm.sql(`
    ALTER TABLE pending_file_uploads
      DROP CONSTRAINT pending_file_uploads_expected_size_check,
      ADD CONSTRAINT pending_file_uploads_expected_size_check
      CHECK (expected_size > 0 AND expected_size <= 10485760);
  `);
};

export const down = (pgm: MigrationBuilder) => {
  pgm.sql(`
    DELETE FROM pending_file_uploads
    WHERE expected_size > 5242880;

    ALTER TABLE pending_file_uploads
      DROP CONSTRAINT pending_file_uploads_expected_size_check,
      ADD CONSTRAINT pending_file_uploads_expected_size_check
      CHECK (expected_size > 0 AND expected_size <= 5242880);
  `);
};
