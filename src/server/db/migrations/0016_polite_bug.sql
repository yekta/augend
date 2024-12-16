CREATE SCHEMA "cache";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cache"."cmc_crypto_info_quotes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"info_id" uuid NOT NULL,
	"currency_ticker" text NOT NULL,
	"price" integer NOT NULL,
	"volume_24h" integer NOT NULL,
	"volume_change_24h" integer NOT NULL,
	"percent_change_1h" integer NOT NULL,
	"percent_change_24h" integer NOT NULL,
	"percent_change_7d" integer NOT NULL,
	"percent_change_30d" integer NOT NULL,
	"percent_change_60d" integer NOT NULL,
	"percent_change_90d" integer NOT NULL,
	"market_cap" integer NOT NULL,
	"market_cap_dominance" integer NOT NULL,
	"fully_diluted_market_cap" integer NOT NULL,
	"last_updated" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cache"."cmc_crypto_infos" (
	"id" uuid PRIMARY KEY NOT NULL,
	"coin_id" text NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"slug" text NOT NULL,
	"circulating_supply" integer NOT NULL,
	"cmc_rank" integer NOT NULL,
	"max_supply" integer NOT NULL,
	"total_supply" integer NOT NULL,
	"last_updated" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cache"."cmc_crypto_info_quotes" ADD CONSTRAINT "cmc_crypto_info_quotes_info_id_cmc_crypto_infos_id_fk" FOREIGN KEY ("info_id") REFERENCES "cache"."cmc_crypto_infos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_info_quotes_info_id_idx" ON "cache"."cmc_crypto_info_quotes" USING btree ("info_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_info_quotes_currency_ticker_idx" ON "cache"."cmc_crypto_info_quotes" USING btree ("currency_ticker");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_info_quotes_last_updated_idx" ON "cache"."cmc_crypto_info_quotes" USING btree ("last_updated");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_info_quotes_created_at_idx" ON "cache"."cmc_crypto_info_quotes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_info_quotes_updated_at_idx" ON "cache"."cmc_crypto_info_quotes" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_info_quotes_deleted_at_idx" ON "cache"."cmc_crypto_info_quotes" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_infos_coin_id_idx" ON "cache"."cmc_crypto_infos" USING btree ("coin_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_infos_name_idx" ON "cache"."cmc_crypto_infos" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_infos_symbol_idx" ON "cache"."cmc_crypto_infos" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_infos_slug_idx" ON "cache"."cmc_crypto_infos" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_infos_cmc_rank_idx" ON "cache"."cmc_crypto_infos" USING btree ("cmc_rank");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_infos_last_updated_idx" ON "cache"."cmc_crypto_infos" USING btree ("last_updated");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_infos_created_at_idx" ON "cache"."cmc_crypto_infos" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_infos_updated_at_idx" ON "cache"."cmc_crypto_infos" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_crypto_infos_deleted_at_idx" ON "cache"."cmc_crypto_infos" USING btree ("deleted_at");