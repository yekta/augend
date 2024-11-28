CREATE INDEX IF NOT EXISTS "card_type_inputs_created_at_idx" ON "card_type_inputs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_type_inputs_updated_at_idx" ON "card_type_inputs" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_type_inputs_deleted_at_idx" ON "card_type_inputs" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_types_created_at_idx" ON "card_types" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_types_updated_at_idx" ON "card_types" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_types_deleted_at_idx" ON "card_types" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_values_created_at_idx" ON "card_values" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_values_updated_at_idx" ON "card_values" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_values_deleted_at_idx" ON "card_values" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cards_created_at_idx" ON "cards" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cards_updated_at_idx" ON "cards" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cards_deleted_at_idx" ON "cards" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "currencies_created_at_idx" ON "currencies" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "currencies_updated_at_idx" ON "currencies" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "currencies_deleted_at_idx" ON "currencies" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboards_created_at_idx" ON "dashboards" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboards_updated_at_idx" ON "dashboards" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboards_deleted_at_idx" ON "dashboards" USING btree ("deleted_at");