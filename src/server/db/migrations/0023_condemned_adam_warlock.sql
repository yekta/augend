ALTER TABLE "cache"."cmc_cryptos" RENAME TO "cmc_crypto_definitions";--> statement-breakpoint
DROP INDEX IF EXISTS "cmc_cryptos_name_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "cmc_cryptos_symbol_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "cmc_cryptos_rank_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "cmc_cryptos_cmc_rank_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "cmc_cryptos_created_at_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "cmc_cryptos_updated_at_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "cmc_cryptos_deleted_at_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_definitions_name_idx" ON "cache"."cmc_crypto_definitions" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_definitions_symbol_idx" ON "cache"."cmc_crypto_definitions" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_definitions_rank_idx" ON "cache"."cmc_crypto_definitions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_definitions_cmc_rank_idx" ON "cache"."cmc_crypto_definitions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_definitions_created_at_idx" ON "cache"."cmc_crypto_definitions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_definitions_updated_at_idx" ON "cache"."cmc_crypto_definitions" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_definitions_deleted_at_idx" ON "cache"."cmc_crypto_definitions" USING btree ("deleted_at");