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

-- adding user_uuid column
-- https://www.postgresqltutorial.com/postgresql-uuid/
ALTER TABLE users ADD COLUMN user_uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4 ();

-- the "uuid" column will be a primary key used by other tables to establish a foreign key relationships
-- https://starkandwayne.com/blog/uuid-primary-keys-in-postgresql/


-- delete the id column 
ALTER TABLE users DROP COLUMN id;