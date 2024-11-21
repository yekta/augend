ALTER TABLE "currencies" ADD COLUMN "coin_id" text;--> statement-breakpoint
ALTER TABLE "currencies" ADD CONSTRAINT "crypto_must_have_coin_id" CHECK ((NOT "is_crypto" OR "coin_id" IS NOT NULL));