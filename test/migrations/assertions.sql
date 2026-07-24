DO $$
DECLARE
  file_count integer;
  distinct_key_count integer;
  recipe_file_count integer;
  tile_count integer;
  mismatched_owner_count integer;
  migration_count integer;
  oversized_upload_rejected boolean := false;
BEGIN
  SELECT COUNT(*), COUNT(DISTINCT key), COUNT(DISTINCT recipe_uuid)
  INTO file_count, distinct_key_count, recipe_file_count
  FROM files;

  IF file_count <> 3
    OR distinct_key_count <> 3
    OR recipe_file_count <> 2
  THEN
    RAISE EXCEPTION
      'Unexpected migrated files: %, distinct keys: %, recipes: %',
      file_count,
      distinct_key_count,
      recipe_file_count;
  END IF;

  SELECT COUNT(*)
  INTO tile_count
  FROM recipes
  WHERE default_tile_image_key IS NOT NULL;

  IF tile_count <> 2 THEN
    RAISE EXCEPTION 'Unexpected tile count: %', tile_count;
  END IF;

  SELECT COUNT(*)
  INTO mismatched_owner_count
  FROM files
  JOIN recipes USING (recipe_uuid)
  WHERE files.user_uuid IS DISTINCT FROM recipes.user_uuid;

  IF mismatched_owner_count <> 0 THEN
    RAISE EXCEPTION
      'Files with incorrect ownership: %',
      mismatched_owner_count;
  END IF;

  SELECT COUNT(*)
  INTO migration_count
  FROM pgmigrations;

  IF migration_count <> 4 THEN
    RAISE EXCEPTION 'Unexpected migration count: %', migration_count;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'files'
    AND column_name = 'thumbnail_key'
  ) THEN
    RAISE EXCEPTION 'files.thumbnail_key was not created';
  END IF;

  INSERT INTO pending_file_uploads(
    key,
    recipe_uuid,
    user_uuid,
    expected_size,
    declared_content_type,
    expires_at
  )
  VALUES (
    '50000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    10485760,
    'image/png',
    NOW() + INTERVAL '10 minutes'
  );

  BEGIN
    INSERT INTO pending_file_uploads(
      key,
      recipe_uuid,
      user_uuid,
      expected_size,
      declared_content_type,
      expires_at
    )
    VALUES (
      '50000000-0000-4000-8000-000000000002',
      '20000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000001',
      10485761,
      'image/png',
      NOW() + INTERVAL '10 minutes'
    );
  EXCEPTION
    WHEN check_violation THEN
      oversized_upload_rejected := true;
  END;

  IF NOT oversized_upload_rejected THEN
    RAISE EXCEPTION 'Oversized pending upload was accepted';
  END IF;
END
$$;
