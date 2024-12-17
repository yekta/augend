CREATE TABLE IF NOT EXISTS "cache"."cmc_cryptos" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_cryptos_name_idx" ON "cache"."cmc_cryptos" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_cryptos_symbol_idx" ON "cache"."cmc_cryptos" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_cryptos_rank_idx" ON "cache"."cmc_cryptos" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_cryptos_cmc_rank_idx" ON "cache"."cmc_cryptos" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_cryptos_created_at_idx" ON "cache"."cmc_cryptos" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_cryptos_updated_at_idx" ON "cache"."cmc_cryptos" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmc_cryptos_deleted_at_idx" ON "cache"."cmc_cryptos" USING btree ("deleted_at");