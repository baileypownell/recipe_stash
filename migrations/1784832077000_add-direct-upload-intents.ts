import type { MigrationBuilder } from 'node-pg-migrate';

export const up = (pgm: MigrationBuilder) => {
  pgm.sql(`
    ALTER TABLE files
      ADD COLUMN content_type varchar(50),
      ADD COLUMN size_bytes integer;

    CREATE TABLE pending_file_uploads (
      key uuid PRIMARY KEY,
      recipe_uuid uuid NOT NULL,
      user_uuid uuid NOT NULL,
      expected_size integer NOT NULL CHECK (
        expected_size > 0
        AND expected_size <= 5242880
      ),
      declared_content_type varchar(50) NOT NULL CHECK (
        declared_content_type IN ('image/jpeg', 'image/png')
      ),
      created_at timestamptz NOT NULL DEFAULT NOW(),
      expires_at timestamptz NOT NULL,
      CONSTRAINT pending_file_uploads_recipe_user_fkey
        FOREIGN KEY (recipe_uuid, user_uuid)
        REFERENCES recipes (recipe_uuid, user_uuid)
        ON DELETE CASCADE
    );

    CREATE INDEX pending_file_uploads_expires_at_idx
      ON pending_file_uploads (expires_at);
  `);
};

export const down = (pgm: MigrationBuilder) => {
  pgm.sql(`
    DROP TABLE pending_file_uploads;

    ALTER TABLE files
      DROP COLUMN content_type,
      DROP COLUMN size_bytes;
  `);
};
