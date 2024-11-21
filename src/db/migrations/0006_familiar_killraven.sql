CREATE TABLE IF NOT EXISTS "currencies" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"ticker" text NOT NULL,
	"symbol" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "unique_ticker" UNIQUE("ticker")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "primary_currency_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "secondary_currency_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tertiary_currency_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_primary_currency_id_currencies_id_fk" FOREIGN KEY ("primary_currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_secondary_currency_id_currencies_id_fk" FOREIGN KEY ("secondary_currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_tertiary_currency_id_currencies_id_fk" FOREIGN KEY ("tertiary_currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
