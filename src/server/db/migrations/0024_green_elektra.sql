ALTER TABLE "cache"."cmc_crypto_definitions" RENAME COLUMN "slug" TO "rank";--> statement-breakpoint
DROP INDEX IF EXISTS "cmc_crypto_definitions_rank_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "cmc_crypto_definitions_cmc_rank_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_definitions_rank_idx" ON "cache"."cmc_crypto_definitions" USING btree ("rank");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_definitions_cmc_rank_idx" ON "cache"."cmc_crypto_definitions" USING btree ("rank");