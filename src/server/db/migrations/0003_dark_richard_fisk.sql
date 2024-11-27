-- First drop the foreign key constraint from card_values table
ALTER TABLE "card_values"
DROP CONSTRAINT "card_values_card_type_input_id_card_type_inputs_id_fk";


-- Drop the unique constraint
ALTER TABLE "card_type_inputs"
DROP CONSTRAINT "card_type_inputs_unique_slug_per_card_type";


-- Drop the primary key constraint
ALTER TABLE "card_type_inputs"
DROP CONSTRAINT "card_type_inputs_pkey";


-- Change the column types
ALTER TABLE "card_type_inputs"
ALTER COLUMN "id"
SET DATA TYPE text,
ALTER COLUMN "card_type_id"
SET DATA TYPE text;


ALTER TABLE "card_types"
ALTER COLUMN "id"
SET DATA TYPE text;


-- Change the type of the foreign key column in card_values
ALTER TABLE "card_values"
ALTER COLUMN "card_type_input_id"
SET DATA TYPE text;


-- Drop the slug column
ALTER TABLE "card_type_inputs"
DROP COLUMN IF EXISTS "slug";


-- Recreate the primary key constraint
ALTER TABLE "card_type_inputs"
ADD PRIMARY KEY ("id");


-- Recreate the foreign key constraint
ALTER TABLE "card_values"
ADD CONSTRAINT "card_values_card_type_input_id_card_type_inputs_id_fk" FOREIGN KEY ("card_type_input_id") REFERENCES "card_type_inputs" ("id");