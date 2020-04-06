CREATE TABLE recipes(
  id serial PRIMARY KEY,
  title character varying(100),
  category character varying(50),
  user_id integer,
  ingredients text,
  directions text
);

INSERT INTO recipes(title, category, user_id, ingredients, directions) VALUES('Ice Cream', 'Dessert', 1, 'vanilla, salt, sugar, milk, half-and-half', 'you know what to do');
