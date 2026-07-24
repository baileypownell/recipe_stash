#!/bin/sh

set -eu

if [ -z "${MIGRATION_TEST_DATABASE_URL:-}" ]; then
  echo "MIGRATION_TEST_DATABASE_URL is required." >&2
  exit 1
fi

database_name="$(psql "$MIGRATION_TEST_DATABASE_URL" --tuples-only --no-align \
  --command 'SELECT current_database();')"

if [ "$database_name" != "recipe_stash_migration_test" ]; then
  echo "Refusing to reset database '$database_name'." >&2
  exit 1
fi

psql "$MIGRATION_TEST_DATABASE_URL" \
  --set ON_ERROR_STOP=1 \
  --file test/migrations/legacy-schema.sql

DATABASE_URL="$MIGRATION_TEST_DATABASE_URL" pnpm migrate:prod

psql "$MIGRATION_TEST_DATABASE_URL" \
  --set ON_ERROR_STOP=1 \
  --file test/migrations/assertions.sql

migration_count_before="$(psql "$MIGRATION_TEST_DATABASE_URL" \
  --tuples-only --no-align \
  --command 'SELECT COUNT(*) FROM pgmigrations;')"

DATABASE_URL="$MIGRATION_TEST_DATABASE_URL" pnpm migrate:prod

migration_count_after="$(psql "$MIGRATION_TEST_DATABASE_URL" \
  --tuples-only --no-align \
  --command 'SELECT COUNT(*) FROM pgmigrations;')"

if [ "$migration_count_before" != "$migration_count_after" ]; then
  echo "A second migration run changed the migration history." >&2
  exit 1
fi
