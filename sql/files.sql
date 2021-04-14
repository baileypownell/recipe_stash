CREATE TABLE files(
  id serial,
  aws_download_url text,
  recipe_id integer, 
  key UUID,
  user_id integer
);

-- create the user_uuid column to replace the user_id column 
ALTER TABLE files ADD COLUMN user_uuid UUID REFERENCES users(user_uuid) ON DELETE CASCADE;

-- script to get and set the user_uuid in from the users table 
UPDATE files SET user_uuid = users.user_uuid FROM users WHERE files.user_id = users.id;

-- same process, but for recipe_id 
-- note that this should be a foreign key relationship eventually 
-- create the recipe_uuid column to replace the recipe_id column 
ALTER TABLE files ADD COLUMN recipe_uuid UUID;

-- script to get and set the recipe_uuid from the recipes table 
UPDATE files SET recipe_uuid = recipes.recipe_uuid FROM recipes WHERE files.recipe_id = recipes.id;

-- TO-DO: delete the id, user_id, and recipe_id columsn; establish primary key relationship







-- NOT FOR PRODUCTION 
ALTER TABLE files DROP CONSTRAINT files_user_uuid_fkey;
ALTER TABLE files DROP COLUMN user_uuid; 
ALTER TABLE FILES ADD COLUMN user_uuid UUID REFERENCES users(user_uuid) ON DELETE CASCADE; 
-- script to get and set the user_uuid in from the users table 
UPDATE files SET user_uuid = users.user_uuid FROM users WHERE files.user_id = users.id;