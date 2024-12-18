ALTER TABLE "cache"."cmc_crypto_info_quotes" RENAME TO "cmc_crypto_quotes";--> statement-breakpoint
ALTER TABLE "cache"."cmc_crypto_quotes" DROP CONSTRAINT "cmc_crypto_info_quotes_info_id_cmc_crypto_infos_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "cmc_crypto_info_quotes_info_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "cmc_crypto_info_quotes_currency_ticker_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "cmc_crypto_info_quotes_last_updated_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "cmc_crypto_info_quotes_created_at_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "cmc_crypto_info_quotes_updated_at_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "cmc_crypto_info_quotes_deleted_at_idx";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cache"."cmc_crypto_quotes" ADD CONSTRAINT "cmc_crypto_quotes_info_id_cmc_crypto_infos_id_fk" FOREIGN KEY ("info_id") REFERENCES "cache"."cmc_crypto_infos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_quotes_info_id_idx" ON "cache"."cmc_crypto_quotes" USING btree ("info_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_quotes_currency_ticker_idx" ON "cache"."cmc_crypto_quotes" USING btree ("currency_ticker");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_quotes_last_updated_idx" ON "cache"."cmc_crypto_quotes" USING btree ("last_updated");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_quotes_created_at_idx" ON "cache"."cmc_crypto_quotes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_quotes_updated_at_idx" ON "cache"."cmc_crypto_quotes" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_quotes_deleted_at_idx" ON "cache"."cmc_crypto_quotes" USING btree ("deleted_at");