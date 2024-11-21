CREATE INDEX IF NOT EXISTS "dashboard_id_idx" ON "cards" USING btree ("dashboard_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_type_id_idx" ON "cards" USING btree ("card_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "dashboards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dev_id_idx" ON "users" USING btree ("dev_id");