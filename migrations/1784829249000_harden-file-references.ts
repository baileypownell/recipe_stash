import type { MigrationBuilder } from 'node-pg-migrate';

export const up = (pgm: MigrationBuilder) => {
  pgm.sql(`
    DELETE FROM files duplicate
    USING files original
    WHERE duplicate.key = original.key
    AND duplicate.file_uuid > original.file_uuid;

    UPDATE files
    SET user_uuid = recipes.user_uuid
    FROM recipes
    WHERE files.recipe_uuid = recipes.recipe_uuid
    AND files.user_uuid IS DISTINCT FROM recipes.user_uuid;

    DELETE FROM files
    WHERE key IS NULL
    OR recipe_uuid IS NULL
    OR user_uuid IS NULL;

    UPDATE recipes
    SET default_tile_image_key = NULL
    WHERE default_tile_image_key IS NOT NULL
    AND default_tile_image_key !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

    UPDATE recipes
    SET default_tile_image_key = NULL
    WHERE default_tile_image_key IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM files
      WHERE files.recipe_uuid = recipes.recipe_uuid
      AND files.key = recipes.default_tile_image_key::uuid
    );

    ALTER TABLE files
      ALTER COLUMN key SET NOT NULL,
      ALTER COLUMN recipe_uuid SET NOT NULL,
      ALTER COLUMN user_uuid SET NOT NULL,
      DROP COLUMN aws_download_url;

    ALTER TABLE recipes
      DROP COLUMN has_images,
      ALTER COLUMN default_tile_image_key TYPE uuid
        USING default_tile_image_key::uuid;

    ALTER TABLE files
      ADD CONSTRAINT files_key_unique UNIQUE (key),
      ADD CONSTRAINT files_recipe_key_unique UNIQUE (recipe_uuid, key);

    ALTER TABLE recipes
      ADD CONSTRAINT recipes_recipe_user_unique
      UNIQUE (recipe_uuid, user_uuid);

    ALTER TABLE files
      ADD CONSTRAINT files_recipe_user_fkey
      FOREIGN KEY (recipe_uuid, user_uuid)
      REFERENCES recipes (recipe_uuid, user_uuid)
      ON DELETE CASCADE;

    ALTER TABLE recipes
      ADD CONSTRAINT recipes_default_tile_image_fkey
      FOREIGN KEY (recipe_uuid, default_tile_image_key)
      REFERENCES files (recipe_uuid, key)
      ON DELETE SET NULL (default_tile_image_key);
  `);
};

export const down = (pgm: MigrationBuilder) => {
  pgm.sql(`
    ALTER TABLE recipes
      DROP CONSTRAINT recipes_default_tile_image_fkey;

    ALTER TABLE files
      DROP CONSTRAINT files_recipe_user_fkey,
      DROP CONSTRAINT files_recipe_key_unique,
      DROP CONSTRAINT files_key_unique;

    ALTER TABLE recipes
      DROP CONSTRAINT recipes_recipe_user_unique,
      ALTER COLUMN default_tile_image_key TYPE varchar(50)
        USING default_tile_image_key::text,
      ADD COLUMN has_images boolean;

    ALTER TABLE files
      ADD COLUMN aws_download_url text,
      ALTER COLUMN key DROP NOT NULL,
      ALTER COLUMN recipe_uuid DROP NOT NULL,
      ALTER COLUMN user_uuid DROP NOT NULL;
  `);
};
