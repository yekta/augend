ALTER TABLE "cache"."cmc_crypto_definitions"
ALTER COLUMN "rank" TYPE integer USING "rank"::integer;