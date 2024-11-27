ALTER TABLE "currencies" DROP CONSTRAINT "unique_ticker";--> statement-breakpoint
ALTER TABLE "currencies" DROP CONSTRAINT "crypto_must_have_coin_id";--> statement-breakpoint
ALTER TABLE "currencies" ADD CONSTRAINT "currencies_unique_ticker" UNIQUE("ticker");--> statement-breakpoint
ALTER TABLE "currencies" ADD CONSTRAINT "currencies_crypto_must_have_coin_id" CHECK ((NOT "is_crypto" OR "coin_id" IS NOT NULL));