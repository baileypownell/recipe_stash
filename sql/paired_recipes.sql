CREATE TABLE paired_recipes(
  member_one_uuid UUID,
  member_two_uuid UUID
);

ALTER TABLE paired_recipes ADD COLUMN id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
ALTER TABLE paired_recipes ADD COLUMN member_one JSON NOT NULL;
ALTER TABLE paired_recipes ADD COLUMN member_two JSON NOT NULL;
