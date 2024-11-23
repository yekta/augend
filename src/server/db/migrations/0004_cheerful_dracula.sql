ALTER TABLE "users" RENAME TO "users_old";--> statement-breakpoint
ALTER TABLE "users_old" DROP CONSTRAINT "users_dev_id_unique";--> statement-breakpoint
ALTER TABLE "users_old" DROP CONSTRAINT "users_username_unique";--> statement-breakpoint
ALTER TABLE "dashboards" DROP CONSTRAINT "dashboards_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users_old" DROP CONSTRAINT "users_primary_currency_id_currencies_id_fk";
--> statement-breakpoint
ALTER TABLE "users_old" DROP CONSTRAINT "users_secondary_currency_id_currencies_id_fk";
--> statement-breakpoint
ALTER TABLE "users_old" DROP CONSTRAINT "users_tertiary_currency_id_currencies_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_user_id_users_old_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_old"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_old" ADD CONSTRAINT "users_old_primary_currency_id_currencies_id_fk" FOREIGN KEY ("primary_currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_old" ADD CONSTRAINT "users_old_secondary_currency_id_currencies_id_fk" FOREIGN KEY ("secondary_currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_old" ADD CONSTRAINT "users_old_tertiary_currency_id_currencies_id_fk" FOREIGN KEY ("tertiary_currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users_old" ADD CONSTRAINT "users_old_dev_id_unique" UNIQUE("dev_id");--> statement-breakpoint
ALTER TABLE "users_old" ADD CONSTRAINT "users_old_username_unique" UNIQUE("username");