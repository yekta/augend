CREATE INDEX IF NOT EXISTS "slug_idx" ON "dashboards" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_and_slug_idx" ON "dashboards" USING btree ("user_id","slug");