DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

CREATE TABLE users (
  first_name varchar(50),
  last_name varchar(50),
  password varchar(200),
  email varchar(50),
  reset_password_expires bigint,
  reset_password_token text,
  user_uuid uuid DEFAULT uuid_generate_v4() PRIMARY KEY
);

CREATE UNIQUE INDEX users_email_lower_unique
  ON users (LOWER(email::text));

CREATE TABLE recipes (
  title varchar(100),
  category varchar(50),
  ingredients text,
  directions text,
  no_bake boolean,
  easy boolean,
  healthy boolean,
  sugar_free boolean,
  gluten_free boolean,
  dairy_free boolean,
  vegetarian boolean,
  vegan boolean,
  keto boolean,
  raw_title varchar(100),
  has_images boolean,
  default_tile_image_key varchar(50),
  recipe_uuid uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_uuid uuid REFERENCES users(user_uuid) ON DELETE CASCADE,
  high_protein boolean
);

CREATE TABLE files (
  aws_download_url text,
  key uuid,
  user_uuid uuid REFERENCES users(user_uuid) ON DELETE CASCADE,
  file_uuid uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_uuid uuid REFERENCES recipes(recipe_uuid) ON DELETE CASCADE
);

CREATE TABLE session (
  sid varchar PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) without time zone NOT NULL,
  user_uuid uuid REFERENCES users(user_uuid) ON DELETE SET NULL
);

CREATE INDEX "IDX_session_expire" ON session (expire);

INSERT INTO users(first_name, last_name, email, user_uuid)
VALUES
  (
    'Migration',
    'Owner',
    'owner@example.test',
    '10000000-0000-4000-8000-000000000001'
  ),
  (
    'Second',
    'Owner',
    'second@example.test',
    '10000000-0000-4000-8000-000000000002'
  );

INSERT INTO recipes(
  title,
  default_tile_image_key,
  recipe_uuid,
  user_uuid
)
VALUES
  (
    'First recipe',
    '30000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001'
  ),
  (
    'Second recipe',
    '30000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002'
  ),
  (
    'Invalid legacy tile',
    'not-a-uuid',
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001'
  );

INSERT INTO files(key, user_uuid, file_uuid, recipe_uuid)
VALUES
  (
    '30000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001'
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    NULL,
    '40000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001'
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    NULL,
    '40000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000002'
  ),
  (
    '30000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000004',
    NULL
  ),
  (
    '30000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000005',
    '20000000-0000-4000-8000-000000000001'
  ),
  (
    NULL,
    '10000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000006',
    '20000000-0000-4000-8000-000000000001'
  );

INSERT INTO session(sid, sess, expire, user_uuid)
VALUES (
  'migration-test-session',
  '{"cookie":{}}',
  NOW() + INTERVAL '1 hour',
  '10000000-0000-4000-8000-000000000001'
);
