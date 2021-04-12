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




INSERT INTO recipes(title, category, user_id, ingredients, directions) VALUES('Ice Cream', 'Dessert', 1, 'vanilla, salt, sugar, milk, half-and-half', 'you know what to do');

INSERT INTO recipes(title, category, user_id, ingredients, directions) VALUES('Hot Chocolate', 'Drinks', 1, 'chocolate, milk, sugar', 'boil');

INSERT INTO recipes(title, category, user_id, ingredients, directions) VALUES('Pancakes', 'Breakfast', 1, 'eggs, vanilla, milk, baking powder, flour, sugar, salte', 'you know');

INSERT INTO recipes(title, category, user_id, ingredients, directions) VALUES('Ranch Salad', 'Lunch', 1, 'seasoned ground beef, shredded cheese, tortilla chips, cherry tomatoes, onions, green onions, garlic, corn, spinach', 'toss the salad');

INSERT INTO recipes(title, category, user_id, ingredients, directions) VALUES('Sourdough Bread', 'Other', 1, 'flour, water, salte yeast', 'bake in a Dutch oven');

INSERT INTO recipes(title, category, user_id, ingredients, directions) VALUES('Biscuits', 'Side Dish', 1, 'butter, salte, pepper, garlic, asparagus', 'fry in a cast iron skillet');

INSERT INTO recipes(title, category, user_id, ingredients, directions) VALUES('Zuppa Toscana', 'Dinner', 1, 'ravioli, beans, chicken broth, tomatoes, g arlic, spinach', 'pan');


ALTER TABLE session ADD COLUMN IF NOT EXISTS user_id character varying(50);

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS raw_title character varying(100);

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS has_images BOOLEAN;

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS default_tile_image_key character varying(50);

-- /* scripts to convert using integer ID to UUID */ 

-- /* first, add a column for UUID on recipes and user tables */
-- ALTER TABLE recipes ADD COLUMN uuid UUID;
-- ALTER TABLE users ADD COLUMN uuid UUID;

-- ALTER TABLE users ALTER COLUMN uuid NOT NULL DEFAULT UUID uuid_generate_v1(), CONSTRAINT usersß PRIMARY KEY (uuid);
-- /* give all pre-existing rows a value for this new column */ 

-- /* update the other tables (files) to account for this change */