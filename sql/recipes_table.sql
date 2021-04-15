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












-- needs to ultimately be a primary key... 
ALTER TABLE recipes ADD COLUMN recipe_uuid UUID DEFAULT uuid_generate_v4 ();

-- create the user_uuid column to replace the user_id column 
ALTER TABLE recipes ADD COLUMN user_uuid UUID REFERENCES users(user_uuid) ON DELETE CASCADE;

-- script to get and set the user_uuid from the recipes table 
UPDATE recipes SET user_uuid = users.user_uuid FROM users WHERE recipes.user_id = users.id;

-- make the recipes.user_uuid column primary 
ALTER TABLE recipes ALTER COLUMN user_uuid CONSTRAINT PRIMARY KEY;

-- delete old columns 
ALTER TABLE recipes DROP COLUMN id;
ALTER TABLE recipes DROP COLUMN user_id;

-- make recipe_uuid unique 
ALTER TABLE recipes ADD CONSTRAINT recipe_unique UNIQUE (recipe_uuid);

ALTER TABLE recipes
    ADD CONSTRAINT unique_recipe PRIMARY KEY (recipe_uuid);





--- NOT FOR PRODUCTION!!
-- at this point, I should have specified on delete behavior, so I had to drop the constraint and re-add it:
ALTER TABLE recipes DROP CONSTRAINT recipes_user_uuid_fkey;

-- now DROP the column 
ALTER TABLE recipes DROP COLUMN user_uuid;
-- now re-add the column 
ALTER TABLE recipes ADD COLUMN user_uuid UUID REFERENCES users(user_uuid) ON DELETE CASCADE;
-- now update again... 
UPDATE recipes SET user_uuid = users.user_uuid FROM users WHERE recipes.user_id = users.id;
