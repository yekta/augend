ALTER TABLE "cache"."cmc_crypto_infos"
ALTER COLUMN "coin_id"
SET DATA TYPE integer USING "coin_id"::integer;