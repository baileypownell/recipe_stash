CREATE USER node_user WITH CREATEDB;

-- configure password for the node_user

CREATE DATABASE visual_cookbook WITH OWNER = node_user;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION pgcrypto;

CREATE TABLE "session" (
    "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

ALTER TABLE session ADD COLUMN user_uuid UUID;

CREATE TABLE users(
  first_name character varying(50),
  last_name character varying(50),
  password character varying(200),
  email character varying(50),
  reset_password_expires bigint,
  reset_password_token text
);
ALTER TABLE users ADD COLUMN user_uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4 ();



CREATE TABLE recipes(
  id serial PRIMARY KEY,
  title character varying(100),
  category character varying(50),
  user_id integer,
  ingredients text,
  directions text
);

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS no_bake boolean;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS easy boolean;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS healthy boolean;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS sugar_free boolean;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS gluten_free boolean;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS dairy_free boolean;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS vegetarian boolean;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS vegan boolean;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS keto boolean;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS high_protein boolean;

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS raw_title character varying(100);

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS has_images BOOLEAN;

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS default_tile_image_key character varying(50);


/* files */

CREATE TABLE files(
  aws_download_url text,
  recipe_id integer,
  key UUID
);

-- create the user_uuid column to replace the user_id column
ALTER TABLE files ADD COLUMN user_uuid UUID REFERENCES users(user_uuid) ON DELETE CASCADE;

-- script to get and set the user_uuid in from the users table
-- UPDATE files SET user_uuid = users.user_uuid FROM users WHERE files.user_id = users.id;

-- same process, but for recipe_id
-- note that this should be a foreign key relationship eventually
-- create the recipe_uuid column to replace the recipe_id column
ALTER TABLE files ADD COLUMN recipe_uuid UUID;

-- script to get and set the recipe_uuid from the recipes table
-- UPDATE files SET recipe_uuid = recipes.recipe_uuid FROM recipes WHERE files.recipe_id = recipes.id;

-- delete the id, user_id, and recipe_id columsn
-- ALTER TABLE files DROP COLUMN user_id;
-- ALTER TABLE files DROP COLUMN recipe_id;
-- ALTER TABLE files DROP COLUMN id;

-- make the recipe_uuid column reference the recipes table
ALTER TABLE files ADD CONSTRAINT fk_file_recipe_uuid FOREIGN KEY (recipe_uuid) REFERENCES recipes (recipe_uuid);
ALTER TABLE FILES DROP CONSTRAINT fk_file_recipe_uuid;
ALTER TABLE files ADD CONSTRAINT fk_file_recipe_uuid FOREIGN KEY (recipe_uuid) REFERENCES recipes (recipe_uuid) ON DELETE CASCADE;

-- add a file_uuid column, make it primary key
ALTER TABLE files ADD COLUMN file_uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4();


-- NOT FOR PRODUCTION
-- ALTER TABLE files DROP CONSTRAINT files_user_uuid_fkey;
-- ALTER TABLE files DROP COLUMN user_uuid;
-- ALTER TABLE FILES ADD COLUMN user_uuid UUID REFERENCES users(user_uuid) ON DELETE CASCADE;
-- -- script to get and set the user_uuid in from the users table
-- UPDATE files SET user_uuid = users.user_uuid FROM users WHERE files.user_id = users.id;

