ALTER TABLE "dashboards" ADD COLUMN "primary_currency_id" uuid DEFAULT '81260265-7335-4d20-9064-0357e75690d6' NOT NULL;--> statement-breakpoint
ALTER TABLE "dashboards" ADD COLUMN "secondary_currency_id" uuid DEFAULT 'd11e7514-5c8e-423d-bc94-efa24bf0f423' NOT NULL;--> statement-breakpoint
ALTER TABLE "dashboards" ADD COLUMN "tertiary_currency_id" uuid DEFAULT '9710ede3-9d6e-4c3f-8c1f-3664263e4a8e' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_primary_currency_id_currencies_id_fk" FOREIGN KEY ("primary_currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_secondary_currency_id_currencies_id_fk" FOREIGN KEY ("secondary_currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_tertiary_currency_id_currencies_id_fk" FOREIGN KEY ("tertiary_currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
