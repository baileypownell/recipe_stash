CREATE TABLE files(
  id serial,
  aws_download_url text,
  recipe_id integer, 
  key UUID,
  user_id integer
);

ALTER TABLE files ADD COLUMN IF NOT EXISTS key UUID;