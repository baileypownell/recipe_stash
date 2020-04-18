CREATE TABLE users(
  id serial,
  first_name character varying(50),
  last_name character varying(50),
  password character varying(200),
  email character varying(50),
  reset_password_expires bigint,
  reset_password_token text
);

INSERT INTO users(first_name, last_name, email) VALUES
('Bailey', 'Pownell', 'bailey.pownell@gmail.com');
