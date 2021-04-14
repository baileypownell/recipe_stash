CREATE TABLE "session" (
    "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

-- changes for migration 
-- not bothering to update sessions; users can reauthenticate 

ALTER TABLE session DROP COLUMN user_id;
ALTER TABLE session ADD COLUMN user_uuid UUID REFERENCES users(user_uuid) ON DELETE SET NULL;