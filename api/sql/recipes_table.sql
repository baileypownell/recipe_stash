CREATE TABLE recipes(
  id serial PRIMARY KEY,
  title character varying(100),
  category character varying(50),
  user_id integer,
  ingredients text,
  directions text
);

INSERT INTO recipes(title, category, user_id, ingredients, directions) VALUES('Ice Cream', 'Dessert', 1, 'vanilla, salt, sugar, milk, half-and-half', 'you know what to do');

INSERT INTO recipes(title, category, user_id, ingredients, directions) VALUES('Hot Chocolate', 'Drinks', 1, 'chocolate, milk, sugar', 'boil');

INSERT INTO recipes(title, category, user_id, ingredients, directions) VALUES('Pancakes', 'Breakfast', 1, 'eggs, vanilla, milk, baking powder, flour, sugar, salte', 'you know');

INSERT INTO recipes(title, category, user_id, ingredients, directions) VALUES('Ranch Salad', 'Lunch', 1, 'seasoned ground beef, shredded cheese, tortilla chips, cherry tomatoes, onions, green onions, garlic, corn, spinach', 'toss the salad');

INSERT INTO recipes(title, category, user_id, ingredients, directions) VALUES('Sourdough Bread', 'Other', 1, 'flour, water, salte yeast', 'bake in a Dutch oven');

INSERT INTO recipes(title, category, user_id, ingredients, directions) VALUES('Biscuits', 'Side Dish', 1, 'butter, salte, pepper, garlic, asparagus', 'fry in a cast iron skillet');

INSERT INTO recipes(title, category, user_id, ingredients, directions) VALUES('Zuppa Toscana', 'Dinner', 1, 'ravioli, beans, chicken broth, tomatoes, g arlic, spinach', 'pan');
