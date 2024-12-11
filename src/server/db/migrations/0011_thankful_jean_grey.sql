ALTER TABLE "currencies" ADD COLUMN "x_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "currencies_ticker_idx" ON "currencies" USING btree ("ticker");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "currencies_name_idx" ON "currencies" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "currencies_symbol_idx" ON "currencies" USING btree ("symbol");