# Database migrations

Production migrations run automatically through the Heroku release phase:

```text
release: pnpm migrate:prod
```

Heroku supplies the production `DATABASE_URL`. A failed migration must exit
nonzero so Heroku keeps the current application release running.

## Creating a migration

```sh
pnpm migrate:create descriptive-name
```

Review both `up` and `down` operations. Once a migration has run in production,
never edit, reorder, or delete it.

## Deployment sequence

Use expand-and-contract changes across separate deployments:

1. Add nullable columns, new tables, or compatible indexes.
2. Deploy code that works with both the old and new schema.
3. Run data backfills or corrections separately with `heroku run`.
4. Verify the backfill and application behavior.
5. Add constraints or remove old schema in a later deployment.

Release migrations must be short, transactional, repeatable, and compatible
with both the currently running application and the incoming release.

Do not put large backfills, destructive data cleanup, and schema removal in the
same release migration. Take a verified backup before any destructive database
operation.

## Local development

Apply pending development migrations:

```sh
pnpm migrate:dev
```

Roll back the most recent development migration:

```sh
pnpm migrate:down:dev
```

## Migration integration test

The migration chain begins from the application's legacy schema rather than an
empty database. The integration test loads a non-sensitive legacy fixture,
applies every migration, verifies data and constraints, and confirms a second
run is a no-op.

The test refuses to run unless the target database is named
`recipe_stash_migration_test`.

```sh
MIGRATION_TEST_DATABASE_URL=postgresql://localhost/recipe_stash_migration_test \
  pnpm test:migrations
```

## Failed Heroku releases

Check release status and output:

```sh
heroku releases --app recipe-stash-1
heroku releases:output RELEASE_NUMBER --app recipe-stash-1
```

Retry a transient release failure:

```sh
heroku releases:retry RELEASE_NUMBER --app recipe-stash-1
```

Resolve failed releases immediately. Heroku code rollbacks do not reverse
database migrations, so rollback compatibility must be designed into each
schema change.
