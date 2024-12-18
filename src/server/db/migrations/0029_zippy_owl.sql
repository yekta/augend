ALTER TABLE "currencies"
ALTER COLUMN "coin_id"
SET DATA TYPE integer USING "coin_id"::integer;